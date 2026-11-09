// Click-by-click frames for <MeshMap>. Each mode is an array where index = the
// slide's click step (0 = before the first click), so frames.length - 1 is the
// number of clicks the component registers. All counts and paths come from
// meshsim.ts, never typed by hand.
import type { NodeId } from './sofia'
import type { Project, ProjectColour, Tone } from './tones'
import type { SimResult } from './meshsim'
import { NODE_IDS, SOFIA, neighbours } from './sofia'
import { isTransport, meshcoreFlood, meshcoreReply, meshtasticAck, meshtasticBroadcast, meshtasticDm, pathTo, reticulumAnnounce } from './meshsim'

export const MESH_MODES = ['static', 'meshtastic', 'meshcore', 'transport', 'trace', 'mini'] as const
export type MeshMode = typeof MESH_MODES[number]

export interface MeshChip {
  node: NodeId
  text: string
  tone: Tone
  /** Where the chip sits; default is the side opposite the node's label. */
  side?: 'above' | 'below' | 'left' | 'right'
  /** Extra vertical nudge in map units (e.g. to clear the node's own label). */
  dy?: number
  /** Extra horizontal nudge in map units (side 'left'/'right' only). */
  dx?: number
  /** Pin to the free bottom-left corner of the map instead of a node. */
  corner?: 'bottom-left'
}
/**
 * Managed-flooding clue next to a node that heard the first copy (slide 28):
 * signal bars (weak = far, low SNR), then a timer filled by how long it waits
 * before relaying, then a cross when it hears another relay first.
 */
export interface WaitMark {
  node: NodeId
  /** Heard over a weak (far, low SNR) link: one bar instead of four. */
  weak: boolean
  /** Share of the longest wait in this wave, 0..1, or null = no timer yet. */
  timer: number | null
  cancelled: boolean
  /** Offset of the mark's left edge from the node centre, in map units. */
  dx: number
  dy: number
}
export interface MeshRing { node: NodeId, colour: ProjectColour, label?: string }
export type Edge = [NodeId, NodeId]

export interface MeshFrame {
  /** Transmitting on this step: drawn solid with static concentric rings. */
  active: NodeId[]
  /** Transmitted on an earlier step. */
  done: NodeId[]
  /** Sequence number badge per transmitting node (storyboard numbering). */
  seq: Partial<Record<NodeId, number>>
  /** Has received the packet. */
  heard: NodeId[]
  /** Transmission that reached nobody new (red). */
  wasted: NodeId[]
  delivered: NodeId[]
  /** Faded to opacity-20 (ghost, never a colour swap). */
  ghost: NodeId[]
  /** Links carrying the packet on this step. */
  edges: Edge[]
  /** Edges are directed (from, to): draw an arrowhead on each. */
  arrows: boolean
  /** Hide (not fade) links that carry nothing while the frame is busy. */
  hideIdle: boolean
  /** Reticulum legend under the map: transport ring, heard ring. */
  transportLegend: boolean
  /** Role legend under the map (ROLE_LEGENDS), or none. */
  roleLegend: RoleLegendKey | null
  /** Fade the whole flood layer (used as a „before“ backdrop). */
  floodFaded: boolean
  path: NodeId[]
  pathTone: Tone
  /** Dashed return path (ACK / announce direction). */
  ack: NodeId[]
  /** Draw an arrowhead on each hop of the return path. */
  ackArrows: boolean
  count: number | null
  /** Faint comparison counter (e.g. Meshtastic's 7 next to MeshCore's 4). */
  countGhost: number | null
  chips: MeshChip[]
  rings: MeshRing[]
  /** Highlight the Internet (TCP) link. */
  tcp: boolean
  caption: string | null
  captionTone: Tone
  legend: boolean
  bubble: boolean
  badges: boolean
  mailbox: NodeId | null
  csv: boolean
  /** Show the „препраща / мълчи“ legend (Meshtastic group flood steps). */
  floodLegend: boolean
  /** Only these nodes get a name label; null = every node. */
  labels: NodeId[] | null
  /** Sender / receiver marked with a ring (null = none). */
  from: NodeId | null
  to: NodeId | null
  /** Dim every node and link that is not on `path`. */
  focus: boolean
  /** SNR / timer / cancel marks (Meshtastic managed flooding). */
  waits: WaitMark[]
}

const BASE: MeshFrame = {
  active: [], done: [], seq: {}, heard: [], wasted: [], delivered: [], ghost: [],
  edges: [], arrows: false, hideIdle: false, transportLegend: false, roleLegend: null, floodFaded: false, path: [], pathTone: 'blue', ack: [], ackArrows: false, count: null, countGhost: null,
  chips: [], rings: [], tcp: false, caption: null, captionTone: 'slate',
  legend: false, bubble: false, badges: false, mailbox: null, csv: false,
  floodLegend: false, labels: null, from: null, to: null, focus: false, waits: [],
}

const f = (p: Partial<MeshFrame>): MeshFrame => ({ ...BASE, ...p })

/** One entry of a role legend: the node shape and what it does. */
export interface RoleLegendEntry {
  /** Same shape as on the map: client = circle, infra = square. */
  shape: 'client' | 'infra'
  role: string
  desc: string
  /** Project ring the map draws around this shape, if any (also colours the role name). */
  ring: ProjectColour | null
}

export type RoleLegendKey = 'meshtastic' | 'meshcore' | 'reticulum'

/**
 * Role legends under the routing maps, one per project:
 *  - meshtastic (slide 28): data/meshtasticRoles.ts, CLIENT rebroadcasts when
 *    no other node has, ROUTER always rebroadcasts once. No ring on that map.
 *  - meshcore (slide 38): FAQ §5.2, companions never relay.
 *  - reticulum (slide 45): only transport nodes forward (manual, 1.5.5).
 */
export const ROLE_LEGENDS: Record<RoleLegendKey, RoleLegendEntry[]> = {
  meshtastic: [
    { shape: 'client', role: 'CLIENT', desc: 'телефон + радио, препраща при нужда', ring: null },
    { shape: 'infra', role: 'ROUTER', desc: 'покрив или връх, винаги препраща', ring: null },
  ],
  meshcore: [
    { shape: 'client', role: 'Companion', desc: 'телефон + радио, не препраща', ring: null },
    { shape: 'infra', role: 'Repeater', desc: 'покрив или връх, препраща', ring: 'indigo' },
  ],
  reticulum: [
    { shape: 'client', role: 'Възел', desc: 'телефон или лаптоп, не препраща', ring: null },
    { shape: 'infra', role: 'Транспортен възел', desc: 'препраща', ring: 'fuchsia' },
  ],
}

/** Nodes that only exist in the Reticulum story stay ghosted elsewhere. */
const RET_ONLY = SOFIA.nodes.filter(n => n.reticulumOnly).map(n => n.id)

/** The state of a simulated flood after hop wave `k` has transmitted. */
function wave(r: SimResult, k: number, media: ('lora' | 'tcp')[] = ['lora']): Partial<MeshFrame> {
  const upTo = r.tx.filter(t => t.hop <= k)
  const active = r.tx.filter(t => t.hop === k).map(t => t.node)
  const heardIds = NODE_IDS.filter(id => (r.heard[id]?.hop ?? 99) <= k + 1)
  return {
    active,
    done: upTo.filter(t => t.hop < k).map(t => t.node),
    seq: Object.fromEntries(upTo.map(t => [t.node, t.seq])),
    heard: heardIds,
    wasted: upTo.filter(t => t.wasted).map(t => t.node),
    delivered: r.dest && heardIds.includes(r.dest) ? [r.dest] : [],
    edges: active.flatMap(a => neighbours(a, media).map(n => [a, n] as Edge)),
    count: upTo.length,
  }
}

/** Whole flood at once (every wave done), for faded backdrops. */
function whole(r: SimResult): Partial<MeshFrame> {
  const last = Math.max(...r.tx.map(t => t.hop))
  const w = wave(r, last)
  return { ...w, active: [], done: r.tx.map(t => t.node), edges: [] }
}

/**
 * Announce state after wave `k`, drawn as a tree: each transmission so far
 * gets one directed edge per node it reached first, so only the hops the
 * announce really took are on the map (no links to nodes that already had it).
 */
function treeWave(r: SimResult, k: number): Partial<MeshFrame> {
  const upTo = r.tx.filter(t => t.hop <= k)
  return {
    active: upTo.filter(t => t.hop === k).map(t => t.node),
    done: upTo.filter(t => t.hop < k).map(t => t.node),
    seq: Object.fromEntries(upTo.map(t => [t.node, t.seq])),
    heard: [r.source, ...upTo.flatMap(t => t.reachedNew)],
    edges: upTo.flatMap(t => t.reachedNew.map(n => [t.node, n] as Edge)),
    arrows: true,
    count: upTo.length,
  }
}

const reverse = (p: NodeId[]): NodeId[] => [...p].reverse()

function build(): Record<MeshMode, MeshFrame[]> {
  const bc = meshtasticBroadcast()
  const dm = meshtasticDm()
  const ackFlood = meshtasticAck()
  const mc = meshcoreFlood()
  const mcReply = meshcoreReply()
  const ann = reticulumAnnounce()
  const route = pathTo(dm, 'pes') // hobbit → stone tower → beacon hill → elf
  const hops = route.length - 1
  const ghost = RET_ONLY

  // Storyboard: only the relays on the learned route get the „next-hop“ badge.
  // Placement keeps chips off node labels and the highlighted route: the beacon
  // hill's chip goes left (open west edge), the tower's right, below
  // the dwarf link.
  const HOP_SIDE: Partial<Record<NodeId, Pick<MeshChip, 'side' | 'dy' | 'dx'>>> = {
    rLul: { side: 'left', dy: -12 },
    rMla: { side: 'right', dy: 40 },
  }
  const routeChips = (tone: Tone): MeshChip[] => route.slice(1, -1).map(id => ({ node: id, text: 'next-hop', tone, ...HOP_SIDE[id] }))
  // MeshCore slides keep clients ghosted (they never relay), except both ends.
  const pathGhost: NodeId[] = [...ghost, ...SOFIA.nodes.filter(n => n.kind === 'client' && n.id !== 'me' && n.id !== 'pes').map(n => n.id)]

  // Traceroute SNR per hop (example values). Placed per node so no chip covers
  // a label or the highlighted route: the tower right, the beacon
  // hill left (empty west edge), the elf above its own label.
  const SNR: Partial<Record<NodeId, Pick<MeshChip, 'side' | 'dy' | 'dx'>>> = {
    ...HOP_SIDE,
    pes: { side: 'above', dy: -34 },
  }
  // Meshtastic slide: fixed labels and no per-node flood annotations (they
  // come last so wave()/whole() cannot put them back).
  const KEY_LABELS: NodeId[] = ['me', 'rVit', 'rMla', 'rLul', 'pes']
  const mt = (p: Partial<MeshFrame>): MeshFrame => f({ ghost, labels: KEY_LABELS, from: 'me', roleLegend: 'meshtastic', ...p, seq: {}, wasted: [] })

  // Wait marks for the hobbit's first receivers, all from the simulation.
  // Placement keeps them off links and labels: the tower's below its fire,
  // right of the shaft, the man's below the link to the tower.
  const WAIT_POS: Partial<Record<NodeId, Pick<WaitMark, 'dx' | 'dy'>>> = {
    mla: { dx: 30, dy: 0 },
    cen: { dx: 44, dy: 45 },
    rMla: { dx: 42, dy: 45 },
  }
  const firstHeard = bc.tx[0].reachedNew
  const longest = Math.max(...firstHeard.map(id => bc.heard[id]?.delay ?? 0))
  const cancelledIds = bc.cancelled.map(c => c.node)
  type WaitStage = 'snr' | 'timer' | 'cancel'
  const waitMarks = (stage: WaitStage): WaitMark[] => firstHeard
    // On the cancel step only the nodes that cancelled keep a mark: the
    // tower is transmitting and its rings would cover its own mark.
    .filter(id => stage !== 'cancel' || cancelledIds.includes(id))
    .map(id => ({
      node: id,
      weak: bc.heard[id]!.far,
      timer: stage === 'snr' ? null : (bc.heard[id]!.delay ?? 0) / longest,
      cancelled: stage === 'cancel',
      dx: WAIT_POS[id]?.dx ?? 30,
      dy: WAIT_POS[id]?.dy ?? 0,
    }))
  const w0 = wave(bc, 0)
  // MeshCore: the same light map plus the role legend under it on every click.
  // The elf keeps the receiver ring all along, so start and goal stay visible.
  const mc1 = (p: Partial<MeshFrame>): MeshFrame => mt({ ...p, roleLegend: 'meshcore', to: 'pes' })
  // MeshCore repeaters: every rooftop node that is not Reticulum-only.
  const repeaterRings: MeshRing[] = SOFIA.nodes.filter(n => n.kind === 'infra' && !n.reticulumOnly).map(n => ({ node: n.id, colour: 'indigo' as ProjectColour, label: 'Repeater' }))
  // Every Reticulum frame: transport rings, idle links hidden, legend under the map.
  const rt = (p: Partial<MeshFrame>): MeshFrame => f({ rings: transportRings(), labels: [], hideIdle: true, transportLegend: true, roleLegend: 'reticulum', captionTone: 'slate', ...p })
  // MeshCore path inside the flooded packet: each repeater appends its own
  // hash as it relays (Mesh.cpp). Chips show the path after relay wave k, on
  // the route's repeaters, and on wave 2 also the path the elf receives.
  const PATH_NAME: Partial<Record<NodeId, string>> = { rMla: 'кула', rLul: 'хълм' }
  const PATH_SIDE: Partial<Record<NodeId, Pick<MeshChip, 'side' | 'dy' | 'dx'>>> = {
    rMla: { side: 'right', dy: 40 },
    rLul: { side: 'below', dy: 30 },
    pes: { side: 'above', dy: -34 },
  }
  const relays = route.slice(1, -1)
  const pathText = (n: number): string => `път: ${relays.slice(0, n).map(id => PATH_NAME[id]).join(' → ')}`
  const mcPathChips = (k: number): MeshChip[] => [
    ...relays.slice(0, k).map((id, i): MeshChip => ({ node: id, text: pathText(i + 1), tone: 'amber', ...PATH_SIDE[id] })),
    ...(k >= relays.length ? [{ node: 'pes' as NodeId, text: pathText(relays.length), tone: 'emerald' as Tone, ...PATH_SIDE.pes }] : []),
  ]
  // Reticulum: every transport node that relayed the announce keeps a path
  // table entry for the elf (Transport.path_table).
  const REMEMBER_SIDE: Partial<Record<NodeId, Pick<MeshChip, 'side' | 'dy' | 'dx'>>> = {
    rLul: { side: 'below', dy: 30 },
    rMla: { side: 'left', dy: -30 },
    rVit: { side: 'left', dy: 0 },
  }
  const rememberChips: MeshChip[] = ann.tx.filter(t => isTransport(t.node)).map(t => ({ node: t.node, text: '→ елф', tone: 'emerald', ...REMEMBER_SIDE[t.node] }))
  const snrChips: MeshChip[] = route.slice(1).map((id, i) => ({ node: id, text: `SNR ${['−12', '−7', '+4'][i]} dB`, tone: 'slate', ...SNR[id] }))

  return {
    static: [
      f({ ghost }),
      f({ ghost, legend: true }),
      f({ ghost, legend: true, bubble: true, chips: [{ node: 'pes', text: 'няма пряка връзка', tone: 'slate', side: 'right', dy: -20 }] }),
      f({ ghost, legend: true, bubble: true, badges: true }),
    ],
    // One slide for both Meshtastic modes, kept light: only the sender, the
    // receiver and the three relays are named, and the flood shows no
    // sequence badges, side notes or red rings (the colours and the
    // „препраща / мълчи“ legend carry it). Clicks: 1 the hobbit sends to the
    // group and each receiver shows its signal, 2 timers (weak signal, short
    // wait), 3 the tower relays first and the near clients cancel, 4 the whole
    // flood (7 transmissions), 5–7 the direct message (flood, ACK back,
    // learned path), 7 a direct message on the learned next-hop path (3): the receiver gets
    // a ring, the path turns emerald with arrows, the rest of the map dims.
    meshtastic: [
      mt({ count: 0 }),
      mt({ ...w0, floodLegend: true, waits: waitMarks('snr'), caption: 'всеки чул мери сигнала (SNR)', captionTone: 'slate' }),
      mt({ ...w0, active: [], done: ['me'], edges: [], floodLegend: true, waits: waitMarks('timer'), caption: 'слаб сигнал: чака по-малко', captionTone: 'amber' }),
      mt({ ...wave(bc, 1), floodLegend: true, waits: waitMarks('cancel'), caption: 'кулата първа, другите спират', captionTone: 'amber' }),
      mt({ ...whole(bc), floodLegend: true, caption: 'стига до всички', captionTone: 'amber' }),
      // Direct message, three clicks: the first DM floods (the elf does not
      // relay it), the elf's ACK floods back (faded, its own counter) and the
      // relays that carried both become next-hops (green, arrows), then later
      // DMs use only that path.
      mt({ ...whole(dm), to: 'pes', delivered: ['pes'], floodLegend: true, caption: 'първото директно: пак flood', captionTone: 'amber' }),
      mt({ ...whole(ackFlood), to: 'pes', delivered: ['pes'], floodFaded: true, ack: reverse(route), ackArrows: true, chips: routeChips('emerald'), caption: 'ACK назад: също flood', captionTone: 'emerald' }),
      mt({ path: route, pathTone: 'emerald', to: 'pes', focus: true, delivered: ['pes'], count: hops, countGhost: bc.count, chips: routeChips('emerald'), caption: 'следващите: само по пътя', captionTone: 'emerald' }),
    ],
    // One slide for MeshCore, the same light map as Meshtastic. Clicks:
    // 1 companions fade (they never relay) and the rooftop repeaters get rings,
    // 2–4 the first message floods through the repeaters only, wave by wave,
    // and each relaying repeater adds itself to the path inside the packet
    // (4 against Meshtastic's 7 in grey), 5 the reply floods back carrying
    // that path, 6 later messages travel only along it (3).
    meshcore: [
      mc1({ count: 0 }),
      mc1({ ghost: pathGhost, rings: repeaterRings, caption: 'Companion: не препраща', captionTone: 'slate' }),
      mc1({ ghost: pathGhost, rings: repeaterRings, ...wave(mc, 0), delivered: [], countGhost: bc.count, caption: 'първото: flood през repeater‑ите', captionTone: 'amber' }),
      mc1({ ghost: pathGhost, rings: repeaterRings, ...wave(mc, 1), delivered: [], countGhost: bc.count, chips: mcPathChips(1), caption: 'всеки repeater добавя себе си', captionTone: 'amber' }),
      mc1({ ghost: pathGhost, rings: repeaterRings, ...whole(mc), delivered: ['pes'], countGhost: bc.count, chips: mcPathChips(2), caption: 'елфът получава и пътя', captionTone: 'amber' }),
      mc1({ ghost: pathGhost, ...whole(mcReply), delivered: ['pes'], floodFaded: true, ack: reverse(route), ackArrows: true, caption: 'отговорът: flood с пътя', captionTone: 'emerald' }),
      mc1({ ghost: pathGhost, path: route, pathTone: 'emerald', to: 'pes', focus: true, delivered: ['pes'], count: hops, countGhost: bc.count, caption: 'следващите: само по пътя', captionTone: 'emerald' }),
    ],
    // Reticulum announce, one click per wave so the order can be followed:
    // 1 the elf sends, 2 the beacon hill relays (LoRa and TCP), 3 the other two
    // transport nodes relay. Ordinary nodes only hear it (amber outline).
    // 4 every node remembers only the next hop toward the elf (path
    // table: neighbour + hop count, never the whole route), the arrows show the way it came, 5 a message uses that path,
    // 6 the delivery proof comes back the same way (reverse table, no flood),
    // 7 the far city reaches the elf over TCP then LoRa. Idle links are
    // hidden, the legend sits under the map.
    transport: [
      rt({ ghost }),
      rt({ ...treeWave(ann, 0), count: null, caption: 'Радиото на Елфа изпраща announce' }),
      rt({ ...treeWave(ann, 1), tcp: true, caption: 'Транспортният възел препраща' }),
      rt({ ...treeWave(ann, 2), tcp: true, caption: 'всички научават за Елфа' }),
      rt({ ack: pathTo(ann, 'me'), ackArrows: true, chips: [...rememberChips, { node: 'me', text: `Елф: ${pathTo(ann, 'me').length - 1} скока`, tone: 'emerald', corner: 'bottom-left' }], caption: 'всеки помни следващия скок' }),
      rt({ path: reverse(pathTo(ann, 'me')), pathTone: 'emerald', delivered: ['pes'], count: pathTo(ann, 'me').length - 1, caption: 'Хобитът пише на елфа' }),
      rt({ ack: pathTo(ann, 'me'), ackArrows: true, delivered: ['pes'], count: pathTo(ann, 'me').length - 1, caption: 'потвърждение: същия път' }),
      rt({ path: reverse(pathTo(ann, 'plo')), pathTone: 'emerald', tcp: true, delivered: ['pes'], count: pathTo(ann, 'plo').length - 1, caption: 'Градът → Елф: TCP + LoRa' }),
    ],
    trace: [
      f({ ghost }),
      f({ ghost, path: route }),
      f({ ghost, path: route, chips: snrChips }),
      f({ ghost, path: route, csv: true, chips: snrChips }),
    ],
    mini: [f({ ghost })],
  }
}

function transportRings(): MeshRing[] {
  return SOFIA.nodes.filter(n => isTransport(n.id)).map(n => ({ node: n.id, colour: 'fuchsia' as ProjectColour, label: 'транспортен възел' }))
}

const FRAMES = build()

export function framesFor(mode: MeshMode): MeshFrame[] {
  return FRAMES[mode]
}

// ── Mini (⅓ scale) summary for the comparison slide ─────────────────────────
export interface MiniSummary {
  /** Transmissions to find the elf the first time (the first flood, or the
   *  announce in Reticulum). */
  discovery: number
  /** Transmissions for a DM once the path is known. */
  dm: number
  /** Nodes allowed to relay: ringed in the project colour on the mini map. */
  relays: NodeId[]
}

/** One bar row under a mini map. */
export interface MiniRow {
  label: string
  value: number
}

export const MINI_SUMMARY: Record<Project, MiniSummary> = (() => {
  const dm = meshtasticDm()
  const mc = meshcoreFlood()
  const ann = reticulumAnnounce()
  const repeaters = SOFIA.nodes.filter(n => n.kind === 'infra' && !n.reticulumOnly).map(n => n.id)
  return {
    // every Meshtastic node may relay (managed flooding), so all are ringed
    meshtastic: { discovery: dm.count, dm: pathTo(dm, 'pes').length - 1, relays: SOFIA.nodes.filter(n => !n.reticulumOnly).map(n => n.id) },
    meshcore: { discovery: mc.count, dm: pathTo(mc, 'pes').length - 1, relays: repeaters },
    reticulum: { discovery: ann.count, dm: pathTo(ann, 'me').length - 1, relays: SOFIA.nodes.map(n => n.id).filter(isTransport) },
  }
})()

/** Bar scale: the biggest number on the slide fills the bar. */
export const MINI_MAX = Math.max(...Object.values(MINI_SUMMARY).flatMap(m => [m.discovery, m.dm]))

export function miniRows(p: Project): MiniRow[] {
  const m = MINI_SUMMARY[p]
  return [
    { label: 'откриване', value: m.discovery },
    { label: 'научен път', value: m.dm },
  ]
}
