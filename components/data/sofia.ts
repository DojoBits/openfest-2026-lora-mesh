// The one shared map topology (storyboard §1 "The same map"), set in the
// same Middle-earth world as the intro and the slide-5 journey map.
// Every routing slide imports this unchanged, so the audience compares the
// three projects on identical shapes. Nodes never move between slides.
// viewBox is 1000 × 560. Illustrative only — not real coverage.

export type NodeId =
  | 'me' | 'mla' | 'cen' | 'nad' | 'dru' | 'pes'
  | 'rMla' | 'rVit' | 'rLul' | 'plo'

export type NodeKind = 'client' | 'infra'
export type Medium = 'lora' | 'tcp'
/** Where the label sits relative to the node. */
export type LabelSide = 'above' | 'below' | 'left' | 'right'

export interface MeshNode {
  id: NodeId
  label: string
  /** Short label for the ⅓-scale mini map. */
  short: string
  kind: NodeKind
  x: number
  y: number
  labelSide: LabelSide
  /** Draw the mountain glyph behind the node (Сигнален връх). */
  mountain?: boolean
  /** Map glyph drawn behind or beside the node, in slide-5 map ink. */
  glyph?: 'forest' | 'peak' | 'tower' | 'beacon'
  /** Intro figure standing beside the node (the sender and the receiver). */
  figure?: 'hobbit' | 'elf'
  /** Only exists in the Reticulum story; ghosted elsewhere. */
  reticulumOnly?: boolean
}

export interface MeshLink {
  a: NodeId
  b: NodeId
  /** Long, weak (low-SNR) link: drawn long-dashed; relays first in Meshtastic. */
  far: boolean
  medium: Medium
}

export interface Topology { nodes: MeshNode[], links: MeshLink[] }

// Order matters: it is the deterministic tie-break when two nodes act in the
// same simulated instant (rVit before rMla gives the storyboard numbering).
const nodes: MeshNode[] = [
  { id: 'me', label: 'Хобит', short: 'Хобит', kind: 'client', x: 600, y: 360, labelSide: 'below', figure: 'hobbit' },
  { id: 'mla', label: 'Ферма', short: '', kind: 'client', x: 790, y: 330, labelSide: 'below' },
  { id: 'cen', label: 'Човек', short: '', kind: 'client', x: 470, y: 150, labelSide: 'left' },
  { id: 'nad', label: 'Магьосник', short: '', kind: 'client', x: 430, y: 80, labelSide: 'left' },
  { id: 'dru', label: 'Джудже', short: '', kind: 'client', x: 880, y: 170, labelSide: 'below' },
  { id: 'pes', label: 'Елф', short: 'Елф', kind: 'client', x: 110, y: 200, labelSide: 'above', glyph: 'forest', figure: 'elf' },
  { id: 'rVit', label: 'Сигнален връх', short: '', kind: 'infra', x: 520, y: 500, labelSide: 'left', mountain: true, glyph: 'peak' },
  { id: 'rMla', label: 'Каменна кула', short: '', kind: 'infra', x: 720, y: 190, labelSide: 'above', glyph: 'tower' },
  { id: 'rLul', label: 'Огън на хълма', short: '', kind: 'infra', x: 250, y: 300, labelSide: 'below', glyph: 'beacon' },
  { id: 'plo', label: 'Град', short: '', kind: 'infra', x: 930, y: 500, labelSide: 'above', reticulumOnly: true },
]

const L = (a: NodeId, b: NodeId, far: boolean, medium: Medium = 'lora'): MeshLink => ({ a, b, far, medium })

const links: MeshLink[] = [
  // near
  L('me', 'mla', false), L('me', 'cen', false), L('mla', 'rMla', false),
  L('cen', 'nad', false), L('rMla', 'dru', false), L('rLul', 'pes', false),
  // far (weak, low SNR)
  L('me', 'rMla', true), L('mla', 'rVit', true),
  L('cen', 'rMla', true), L('cen', 'rLul', true), L('rMla', 'nad', true),
  L('rVit', 'rLul', true), L('rMla', 'rLul', true),
  // Reticulum only: the beacon hill also has an Internet uplink to the far city
  L('rLul', 'plo', false, 'tcp'),
]

export const SOFIA: Topology = { nodes, links }

export const NODE_IDS = nodes.map(n => n.id)

/** Text label drawn? The hobbit and the elf (their figures), the tower, the
 * beacon fire and the peak are told by their picture alone. Everyone else
 * keeps a name. */
export const textLabel = (n: MeshNode): boolean => !n.figure && (!n.glyph || n.glyph === 'forest')

export function node(id: NodeId): MeshNode {
  const n = nodes.find(x => x.id === id)
  if (!n)
    throw new Error(`unknown node ${id}`)
  return n
}

export function linkBetween(a: NodeId, b: NodeId): MeshLink | undefined {
  return links.find(l => (l.a === a && l.b === b) || (l.a === b && l.b === a))
}

/** Neighbours of `id` over the given media, in topology order (deterministic). */
export function neighbours(id: NodeId, media: Medium[] = ['lora']): NodeId[] {
  return NODE_IDS.filter((other) => {
    const l = linkBetween(id, other)
    return l !== undefined && media.includes(l.medium)
  })
}
