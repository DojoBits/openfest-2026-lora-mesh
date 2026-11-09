// Slide 46 „Таблица с пътища“: the path table of one transport node of the
// slide 45 map. Hops, next hop and interface are not typed in. They come from
// the same flood simulation as slide 45, run once per destination that
// announces itself. The hashes, interface names and dates are made up
// (illustrative), the line format is that of `rnpath -t`.
import type { NodeId } from './sofia'
import { linkBetween } from './sofia'
import type { Tone } from './tones'
import { isTransport, simulateFlood } from './meshsim'

/** The node whose table is shown: the beacon hill, it has LoRa and the TCP uplink. */
export const PATH_NODE: NodeId = 'rLul'

/** The command whose output the slide imitates. */
export const PATH_COMMAND = 'rnpath -t'

/** Destinations in the table. rnpath sorts by (interface, hops), the RNode rows come first. */
const DESTS: NodeId[] = ['pes', 'me', 'plo']
/** The row that shows the next hop is not the destination. */
const HIGHLIGHT: NodeId = 'me'

/** Interface names as RNS prints them, str(interface): Class[name] for the RNode, Class[name/host:port] for TCP. Made up. */
const IFACE = {
  lora: 'RNodeInterface[Hill]',
  tcp: 'TCPInterface[Uplink/10.8.0.1:4242]',
} as const

/** Illustrative full 16 byte hashes, 32 hex digits as RNS.prettyhexrep prints them. */
const HASH: Partial<Record<NodeId, string>> = {
  pes: 'a7f3c1e8d95b02467fa1b3c8e92d2d61',
  plo: '3be9047d1c68a5f2e0d4937b86a1c405',
  me: '91d2e5b7403cf68a1d7e29b5c04a7e0a',
  rMla: '5c0e8a3f2b91d47605e8c1f7a3d9b8a4',
}

/** Made up expiry times, in the rnpath format, a week after the talk. */
const EXPIRES: Partial<Record<NodeId, string>> = {
  pes: '2026-11-14 09:41:07',
  me: '2026-11-14 10:03:52',
  plo: '2026-11-14 10:12:55',
}

/** One colour per node that has a hash on the slide. */
export const DOT: Partial<Record<NodeId, Tone>> = { pes: 'blue', me: 'emerald', rMla: 'red', plo: 'amber' }
/** Hash prefix shown beside the icon in the node picture. */
export const hashPrefix = (id: NodeId): string => `${(HASH[id] ?? '').slice(0, 4)}…`

export interface PathRow {
  dest: NodeId
  hash: string
  nextHop: NodeId
  nextHash: string
  /** Colour dot tying the hash to its icon in the node picture. Reticulum has no names, the path table holds hashes only. */
  destTone: Tone
  nextTone: Tone
  /** The next hop is the destination itself (a direct neighbour). */
  direct: boolean
  hops: number
  /** "1 hop" or "2 hops", as rnpath words it. */
  hopsText: string
  iface: 'LoRa' | 'TCP'
  /** str(interface) as in rnpath. */
  ifaceStr: string
  expires: string
  highlight: boolean
}

/** One record exactly as `rnpath -t` prints it (the slide breaks it over lines). */
export function rnpathLine(r: PathRow): string {
  return `<${r.hash}> is ${r.hopsText} away via <${r.nextHash}> on ${r.ifaceStr} expires ${r.expires}`
}

export function pathRowsFromSim(): PathRow[] {
  return DESTS.map((dest) => {
    const sim = simulateFlood({ source: dest, canRelay: isTransport, policy: 'once', media: ['lora', 'tcp'], delay: () => 1 })
    const h = sim.heard[PATH_NODE]
    if (!h)
      throw new Error(`${PATH_NODE} never hears ${dest}`)
    const direct = h.from === dest
    const hash = HASH[dest] ?? ''
    const iface = linkBetween(PATH_NODE, h.from)!.medium === 'tcp' ? 'TCP' : 'LoRa'
    return {
      dest,
      hash,
      nextHop: h.from,
      nextHash: direct ? hash : (HASH[h.from] ?? ''),
      destTone: DOT[dest]!,
      nextTone: DOT[h.from]!,
      direct,
      hops: h.hop,
      hopsText: h.hop === 1 ? '1 hop' : `${h.hop} hops`,
      iface,
      ifaceStr: iface === 'TCP' ? IFACE.tcp : IFACE.lora,
      expires: EXPIRES[dest] ?? '',
      highlight: dest === HIGHLIGHT,
    }
  })
}

export const PATH_ROWS: PathRow[] = pathRowsFromSim()
