// A tiny, deterministic discrete-event flood simulator on the shared Sofia map.
// It is NOT a radio model: it encodes just enough of each project's relay rule
// to make the routing slides count transmissions consistently.
//
//  - Meshtastic „managed flooding“: every node may rebroadcast. A receiver waits
//    before relaying, shorter if the link was weak (far), because far nodes
//    extend coverage most. Routers wait in an earlier window than any client.
//    A client cancels its pending relay if it hears another node rebroadcast
//    the same packet first, a router never cancels. Hop limit 3.
//    Firmware 2.7: RadioInterface::getTxDelayMsecWeighted (SNR window, router
//    window first), FloodingRouter::roleAllowsCancelingDupe (ROUTER keeps).
//  - MeshCore: only repeaters relay, each exactly once; clients never relay.
//  - Reticulum announce: only transport nodes relay, once, over any medium
//    (LoRa and TCP alike).
import type { Medium, MeshLink, NodeId } from './sofia'
import { NODE_IDS, linkBetween, neighbours, node } from './sofia'

export interface TxEvent {
  node: NodeId
  /** 1-based transmission order (the number drawn on the slide). */
  seq: number
  /** Relay depth: 0 for the source, 1 for its first relays, … */
  hop: number
  /** Simulated time unit at which it transmitted. */
  time: number
  /** Nodes that heard the packet for the first time from this transmission. */
  reachedNew: NodeId[]
  /** True when the transmission reached nobody new (pure airtime cost). */
  wasted: boolean
}

export interface HeardInfo {
  from: NodeId
  hop: number
  time: number
  /** The first copy came over a far (weak, low SNR) link. */
  far: boolean
  /** Wait before relaying, in sim time units, or null when it may not relay. */
  delay: number | null
}

/** A pending relay dropped because the node overheard someone else's. */
export interface Cancelled { node: NodeId, by: NodeId }

export interface SimResult {
  source: NodeId
  dest?: NodeId
  tx: TxEvent[]
  heard: Partial<Record<NodeId, HeardInfo>>
  /** Heard the packet but never transmitted it. */
  silent: NodeId[]
  delivered: boolean
  count: number
  wasted: NodeId[]
  cancelled: Cancelled[]
}

export interface FloodOptions {
  source: NodeId
  /** Unicast destination: it receives but never relays. */
  dest?: NodeId
  canRelay: (id: NodeId) => boolean
  /** 'managed': cancel a pending relay on hearing another; 'once': always relay once. */
  policy: 'managed' | 'once'
  /** Never cancels a pending relay, even under 'managed' (Meshtastic ROUTER). */
  keepsRelay?: (id: NodeId) => boolean
  media: Medium[]
  hopLimit?: number
  /** Delay before a receiver relays, given the link it heard on and who it is. */
  delay: (link: MeshLink, id: NodeId) => number
}

interface Pending { node: NodeId, time: number, hop: number, hopLimit: number, order: number }

export function simulateFlood(o: FloodOptions): SimResult {
  const heard: Partial<Record<NodeId, HeardInfo>> = {}
  const sent = new Set<NodeId>()
  const tx: TxEvent[] = []
  const cancelled: Cancelled[] = []
  let pending: Pending[] = [{ node: o.source, time: 0, hop: 0, hopLimit: o.hopLimit ?? Number.POSITIVE_INFINITY, order: 0 }]
  let order = 1

  while (pending.length) {
    // Process every relay due at the earliest time as one simultaneous batch.
    // Ties keep the order in which they were scheduled, which is deterministic.
    const now = Math.min(...pending.map(p => p.time))
    const batch = pending.filter(p => p.time === now).sort((a, b) => a.order - b.order)
    pending = pending.filter(p => p.time !== now)
    const firing = new Set(batch.map(b => b.node))

    for (const b of batch) {
      sent.add(b.node)
      const ev: TxEvent = { node: b.node, seq: tx.length + 1, hop: b.hop, time: now, reachedNew: [], wasted: false }
      tx.push(ev)

      for (const n of neighbours(b.node, o.media)) {
        // Managed flooding: overhearing someone else's relay cancels ours,
        // unless this node keeps its relay regardless (a router).
        if (o.policy === 'managed' && !firing.has(n) && !o.keepsRelay?.(n) && pending.some(p => p.node === n)) {
          pending = pending.filter(p => p.node !== n)
          cancelled.push({ node: n, by: b.node })
        }

        if (n === o.source || heard[n])
          continue
        const link = linkBetween(b.node, n)!
        heard[n] = { from: b.node, hop: b.hop + 1, time: now, far: link.far, delay: null }
        ev.reachedNew.push(n)

        // The packet carries b.hopLimit; a receiver may relay only while it is
        // above zero, and relays with one less.
        const mayRelay = o.canRelay(n) && n !== o.dest && !sent.has(n) && b.hopLimit > 0
        if (mayRelay) {
          const d = o.delay(link, n)
          heard[n]!.delay = d
          pending.push({ node: n, time: now + d, hop: b.hop + 1, hopLimit: b.hopLimit - 1, order: order++ })
        }
      }
      ev.wasted = ev.reachedNew.length === 0
    }
  }

  const silent = NODE_IDS.filter(id => heard[id] && !sent.has(id) && id !== o.dest)
  return {
    source: o.source,
    dest: o.dest,
    tx,
    heard,
    silent,
    delivered: o.dest === undefined ? true : heard[o.dest] !== undefined,
    count: tx.length,
    wasted: tx.filter(t => t.wasted).map(t => t.node),
    cancelled,
  }
}

// Meshtastic: weak (far) links rebroadcast sooner, the SNR-based contention
// window. Routers draw from [0, 2·CW), clients from after the routers' longest
// wait, 2·CWmax + [0, 2^CW). Modelled as two windows of two slots each.
const isRouter = (id: NodeId): boolean => node(id).kind === 'infra'
const CLIENT_OFFSET = 3
const snrDelay = (l: MeshLink, id: NodeId): number => (isRouter(id) ? 0 : CLIENT_OFFSET) + (l.far ? 1 : 2)
const evenDelay = (): number => 1

export const meshtasticBroadcast = (): SimResult => simulateFlood({
  source: 'me', canRelay: id => !node(id).reticulumOnly, keepsRelay: isRouter, policy: 'managed', media: ['lora'], hopLimit: 3, delay: snrDelay,
})

/** First DM to an unknown destination floods too; the destination does not relay. */
export const meshtasticDm = (): SimResult => simulateFlood({
  source: 'me', dest: 'pes', canRelay: id => !node(id).reticulumOnly, keepsRelay: isRouter, policy: 'managed', media: ['lora'], hopLimit: 3, delay: snrDelay,
})

export const meshcoreFlood = (): SimResult => simulateFlood({
  source: 'me', canRelay: id => node(id).kind === 'infra' && !node(id).reticulumOnly, policy: 'once', media: ['lora'], delay: evenDelay,
})

/**
 * The elf's ACK to the first DM. The elf has no next-hop for the hobbit yet,
 * so NextHopRouter::getNextHop gives no preference and the ACK floods like
 * the DM did. NextHopRouter::sniffReceived then sets next_hop on each relay
 * that carried both the DM and the ACK.
 */
export const meshtasticAck = (): SimResult => simulateFlood({
  source: 'pes', dest: 'me', canRelay: id => !node(id).reticulumOnly, keepsRelay: isRouter, policy: 'managed', media: ['lora'], hopLimit: 3, delay: snrDelay,
})

/**
 * MeshCore reply to a flooded message: createPathReturn carries the path the
 * message collected (each repeater appends its hash as it floods, Mesh.cpp)
 * and is sent with sendFloodScoped, so it floods back through the repeaters
 * (BaseChatMesh.cpp, onPeerDataRecv).
 */
export const meshcoreReply = (): SimResult => simulateFlood({
  source: 'pes', dest: 'me', canRelay: id => node(id).kind === 'infra' && !node(id).reticulumOnly, policy: 'once', media: ['lora'], delay: evenDelay,
})

const TRANSPORT: NodeId[] = ['rVit', 'rMla', 'rLul']
export const isTransport = (id: NodeId): boolean => TRANSPORT.includes(id)

export const reticulumAnnounce = (): SimResult => simulateFlood({
  source: 'pes', canRelay: isTransport, policy: 'once', media: ['lora', 'tcp'], delay: evenDelay,
})

/** The first-heard parent chain from the source to `target` (the learned route). */
export function pathTo(r: SimResult, target: NodeId): NodeId[] {
  const path: NodeId[] = [target]
  let cur = target
  while (cur !== r.source) {
    const h = r.heard[cur]
    if (!h)
      return []
    cur = h.from
    path.unshift(cur)
  }
  return path
}
