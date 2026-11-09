// Slide 2 (hook): per-click state and scene geometry for HookSwitch.vue.
// The story in seven frames: the bare Shire with its four figures (0); each holds
// a ring bound to the dark tower with the eye (1); the eye tower falls and the
// rings lose their power (2); today the same scene with phones and a cell
// tower (3); the cell tower falls and the phones lose signal (4); every phone has its own LoRa radio (clipped to the phone, or
// paired over Bluetooth), a fixed router sits on a hobbit-hole roof, and the
// radios link to each other (5); a message hops radio to radio from the first
// phone to the last (6).
// The demo (slide 35) then does the same thing live.

import { type HobbitPhone, PHONE_BOX } from './hobbitGeometry'
import { FELLOW_GEOMETRY, type FellowKind, fellowPhone, fellowPoint } from './fellowGeometry'
import { type Box, SHIRE_DOORS, backHillY } from './shireTerrain'

/** Click-2 caption: the radios add a link, they do not replace the phones. Plain description, no slogan. */
export const HOOK_SWAP_CAPTION = 'Същите телефони, през Bluetooth към LoRa радиа.'

export const HOOK_CLICKS = 6

/** Face of a figure: happy default, panicked, or calmly confident. */
export type HookMood = 'neutral' | 'panic' | 'calm'

export interface HookFrame {
  /** Mood per figure (HOOK_FIGURES order). */
  moods: readonly HookMood[]
  /** Tower, phones, mobile links and their label visible; false = only the Shire and the figures. */
  network: boolean
  /** What the figures hold and which tower they hang on: rings and the eye tower, or phones and the cell tower. */
  realm: 'ring' | 'phone'
  /** Cell tower state: links solid while up, red/dashed and ghosted once down. */
  tower: 'up' | 'down'
  /** Radios, the roof router, Bluetooth links and LoRa links between radios visible. */
  mesh: boolean
  /** Header caption, one per frame. */
  caption: string
  /** Message travelled along HOOK_PATH and arrived on the last phone. */
  delivered: boolean
}

/**
 * Moods: the dwarf (sender, 0) and the hobbit by the green door (1) are caught
 * out when a tower goes down (steps 2 and 4) and are fine again with phones (3)
 * and radios (5, 6);
 * the ranger with the backpack (2) and the elf with the bow (3) carry their
 * own gear and stay calm.
 */
const HAPPY: readonly HookMood[] = ['neutral', 'neutral', 'calm', 'calm']
const PANIC: readonly HookMood[] = ['panic', 'panic', 'calm', 'calm']

const FRAMES: readonly HookFrame[] = [
  { moods: HAPPY, network: false, realm: 'ring', tower: 'up', mesh: false, caption: 'Джудже, хобит, човек и елф в селото.', delivered: false },
  { moods: HAPPY, network: true, realm: 'ring', tower: 'up', mesh: false, caption: 'Пръстените са вързани към кулата с окото.', delivered: false },
  { moods: PANIC, network: true, realm: 'ring', tower: 'down', mesh: false, caption: 'Без кулата пръстените губят силата си.', delivered: false },
  { moods: HAPPY, network: true, realm: 'phone', tower: 'up', mesh: false, caption: 'Мобилните телефони се свързват към мрежата през кула.', delivered: false },
  { moods: PANIC, network: true, realm: 'phone', tower: 'down', mesh: false, caption: 'Без кулата телефоните губят връзка.', delivered: false },
  { moods: HAPPY, network: true, realm: 'phone', tower: 'down', mesh: true, caption: HOOK_SWAP_CAPTION, delivered: false },
  { moods: HAPPY, network: true, realm: 'phone', tower: 'down', mesh: true, caption: 'Съобщението минава от радио на радио, без кула.', delivered: true },
]

export function hookFrame(step: number): HookFrame {
  const i = Math.min(Math.max(Math.trunc(step), 0), HOOK_CLICKS)
  return FRAMES[i]
}

/**
 * Perspective: the horizon is at y = HOOK_HORIZON; a figure standing with its
 * feet at ground line y is drawn at a scale proportional to its distance below
 * the horizon, 1.15 at the front (y 372). So ground lines higher up the slide
 * are further away and the figure on them smaller: y 356 → 1.09, y 255 → 0.73,
 * y 172 → 0.44.
 */
export const HOOK_HORIZON = 50
export function hookDepthScale(y: number): number {
  return (1.15 * (y - HOOK_HORIZON)) / (372 - HOOK_HORIZON)
}

/**
 * Scene in SVG units (viewBox 900 × 400). The tower stands top centre; the
 * Fellowship is spread over the Shire at four depths (shireTerrain.ts has the
 * hills, doors and tree they stand among):
 *   dwarf (sender)    — nearest, front left, but short (hookStature:
 *                       78 % of a hobbit at the same depth);
 *   hobbit            — mid-distance, on the green door's trail a little
 *                       below the house (y 256, scale ≈ 0.74: shorter than
 *                       the dwarf, larger than the human), right of the green
 *                       hobbit hole (its window side), whose roof carries the
 *                       fixed router;
 *   human (ranger)    — furthest, up on the back hill's highest stretch
 *                       between the tower and the tree, smallest; at
 *                       x 529 the elf's mobile link (frames 1–2) passes just
 *                       over his hood and pack instead of through them
 *                       (x ≥ 531 cuts the hood) and his held phone clears
 *                       the tower's base (x ≤ 527 overlaps it);
 *   elf (receiver)    — front right, a step behind the dwarf.
 * Each scale comes from hookDepthScale(y). `kind` picks the drawing and its geometry (fellowGeometry.ts:
 * the elf and the human are taller than the hobbit and the dwarf at the same
 * scale). `x` = body centre, `y` = ground under the feet. `side` is where the
 * phone and the radio are (towards the middle), so radios fall between
 * figures. `hold`: all four hold the phone up in the hand from click 1 (a
 * pocketed phone is too small to see at the back of the hall); the type keeps
 * 'pocket' for the figure components.
 * `mount`: where that figure's own LoRa radio is. Every figure carries its
 * radio (none lies on the ground); the only one standing apart is the fixed
 * router on the green hobbit hole's roof (HOOK_ROUTER):
 *   phone — clipped to the back of the held phone, like a LoRa phone case
 *           (the hobbit and the elf);
 *   belt  — clipped to the dwarf's belt at the phone-side hip;
 *   pack  — in a backpack, its top and antenna out of the pack.
 */
export type HookMount = 'phone' | 'belt' | 'pack'
export interface HookFigure { kind: FellowKind, x: number, y: number, scale: number, side: 1 | -1, hold: HobbitPhone, mount: HookMount }

const PLACES: readonly Omit<HookFigure, 'scale'>[] = [
  // on the front line, drawn short by hookStature: ≈ 78 % of a hobbit standing there
  { kind: 'dwarf', x: 78, y: 372, side: 1, hold: 'hand', mount: 'belt' }, // sender, front left
  // on the green door's trail (SHIRE_TRAIL), a little below the house; phone (and its radio) on the left,
  // towards the router: the short side link stays clear of his head
  { kind: 'hobbit', x: 335, y: 256, side: -1, hold: 'hand', mount: 'phone' }, // mid-distance, right of the green door
  { kind: 'human', x: 529, y: 172, side: -1, hold: 'hand', mount: 'pack' }, // far, on the crest (≈ y 167 there), just under the elf's mobile link
  { kind: 'elf', x: 822, y: 356, side: -1, hold: 'hand', mount: 'phone' }, // receiver, front right
]

/**
 * Body size of a kind relative to its drawing: 1 for all but the dwarf. A dwarf
 * drawing is a little taller than the hobbit's, but the front dwarf must read as
 * short and stocky: scaled so he is 78 % of a hobbit at the same depth.
 */
export function hookStature(kind: FellowKind): number {
  return kind === 'dwarf' ? (0.78 * FELLOW_GEOMETRY.hobbit.height) / FELLOW_GEOMETRY.dwarf.height : 1
}

export const HOOK_FIGURES: readonly HookFigure[] = PLACES.map(f => ({ ...f, scale: hookDepthScale(f.y) * hookStature(f.kind) }))

/**
 * A phone, derived from its figure (fellowGeometry.ts): `x` centre, `y` top
 * edge, `k` drawing scale of the HOOK_PHONE box (depth × pocket size).
 * `figure` indexes HOOK_FIGURES.
 */
export interface HookPhone { x: number, y: number, k: number, side: 1 | -1, hold: HobbitPhone, mount: HookMount, figure: number }

/** Phone body at k = 1. */
export const HOOK_PHONE = PHONE_BOX

export const HOOK_PHONES: readonly HookPhone[] = HOOK_FIGURES.map((h, i) => ({
  ...fellowPhone({ kind: h.kind, x: h.x, y: h.y, scale: h.scale, phone: h.hold, flip: h.side === -1 }),
  side: h.side,
  hold: h.hold,
  mount: h.mount,
  figure: i,
}))

/** Figure anchor for a phone: kind, body centre `cx`, ground line `gy` (feet), `scale`, local `height`. */
export function hookFigure(p: HookPhone): { kind: FellowKind, cx: number, gy: number, scale: number, height: number } {
  const h = HOOK_FIGURES[p.figure]
  return { kind: h.kind, cx: h.x, gy: h.y, scale: h.scale, height: FELLOW_GEOMETRY[h.kind].height }
}

/**
 * Scene boxes of figure i: body (FELLOW_GEOMETRY span, from the ground up to
 * the hair), its phone and its radio with the whip.
 * Mirrored figures (side −1) flip the span about x.
 */
export function hookFigureBox(i: number): Box[] {
  const f = HOOK_FIGURES[i]
  const g = FELLOW_GEOMETRY[f.kind]
  const p = HOOK_PHONES[i]
  const [a, b] = [f.x + f.side * g.span.x0 * f.scale, f.x + f.side * g.span.x1 * f.scale]
  const r = hookRadio(p)
  return [
    { x0: Math.min(a, b), x1: Math.max(a, b), y0: f.y - g.height * f.scale, y1: f.y },
    { x0: p.x - (PHONE_BOX.w * p.k) / 2, x1: p.x + (PHONE_BOX.w * p.k) / 2, y0: p.y, y1: p.y + PHONE_BOX.h * p.k },
    { x0: r.x, x1: r.x + HOOK_RADIO.w * r.k, y0: r.y - HOOK_RADIO.antenna * r.k, y1: r.y + HOOK_RADIO.h * r.k },
  ]
}

/**
 * The eye tower's drawing (EyeTower): the mast with horns and eye
 * (x ≈ 422–483, down to the far ridge at y 139) and its wider rocky base
 * (x ≈ 392–510, y ≈ 112–140; measured on the rendered slide).
 */
export const HOOK_TOWER_BOXES: readonly Box[] = [
  { x0: 422, y0: 0, x1: 483, y1: 139 },
  { x0: 392, y0: 112, x1: 510, y1: 140 },
]

/** A text label: anchor point (SVG x, baseline y), font size, text-anchor. */
export interface HookLabel { x: number, y: number, size: number, anchor: 'start' | 'middle' | 'end', text: string }

/**
 * Fixed label: „LoRa“ above the long router → backpack hop, left of the
 * tower, in open sky. The tower has no label (removed 2026-11-07).
 */
export const HOOK_LABELS = {
  lora: { x: 362, y: 110, size: 22, anchor: 'middle', text: 'LoRa' },
} as const satisfies Record<string, HookLabel>

/**
 * Approximate box of a label: bold text averages ≈ 0.6 × the font size per
 * character; cap height ≈ 0.8 × size above the baseline, descenders 0.25 below.
 */
export function hookTextBox(l: HookLabel): Box {
  const w = 0.6 * l.size * l.text.length
  const x0 = l.anchor === 'start' ? l.x : l.anchor === 'middle' ? l.x - w / 2 : l.x - w
  return { x0, x1: x0 + w, y0: l.y - 0.8 * l.size, y1: l.y + 0.25 * l.size }
}

/** Radio drawing at k = 1 (board 44 × 40, whip antenna 28 above it, at x 34 from the left edge). */
export const HOOK_RADIO = { w: 44, h: 40, antenna: 28 } as const

/**
 * Personal radios are drawn at 55 % of their own phone's height (so they
 * shrink with depth like the phone); the roof router is drawn larger.
 */
const RADIO_TO_PHONE = 0.55

/**
 * Radios with a Bluetooth line to their phone: every one that is not clipped
 * to the phone itself (belt, backpack), so each figure visibly pairs its
 * phone with its own radio. The phone-case radios need no line.
 */
export const HOOK_BLE: readonly number[] = HOOK_PHONES.flatMap((p, i) => (p.mount === 'phone' ? [] : [i]))

export interface HookRadioBox { x: number, y: number, k: number, ant: 1 | -1 }

/**
 * Radio for a phone: body top-left `x, y`, drawing scale `k` and antenna
 * side `ant` (+1 = whip near the right edge, −1 = mirrored, near the left),
 * always on the outer side, away from heads and bubbles.
 *   phone — body behind the phone, its inner edge 0.2 × its width inside the
 *           phone's edge on the figure side, top half its height above the phone's top: the radio
 *           peeks out above the phone and past its outer edge, whip up from
 *           its outer corner (away from the body);
 *   belt  — centred on the kind's belt point, the belt running across the
 *           body's upper third (clipped on), whip on the body side, clear
 *           of the held phone and hand above the radio;
 *   pack  — centred over the pack, ~2/3 of the body above the pack top
 *           (the kind's pack box), the rest hidden behind the rim.
 */
export function hookRadio(p: HookPhone): HookRadioBox {
  const h = HOOK_FIGURES[p.figure]
  const g = FELLOW_GEOMETRY[h.kind]
  const k = (RADIO_TO_PHONE * PHONE_BOX.h * p.k) / HOOK_RADIO.h
  const w = HOOK_RADIO.w * k
  const rh = HOOK_RADIO.h * k
  const place = { x: h.x, y: h.y, scale: h.scale, flip: h.side === -1 }
  switch (h.mount) {
    case 'phone': {
      const pw = PHONE_BOX.w * p.k
      // side +1: left edge 0.2·w inside the phone's left edge; side −1 mirrored
      const inset = 0.2 * w
      const x = h.side === 1 ? p.x - pw / 2 + inset : p.x + pw / 2 - inset - w
      return { x, y: p.y - 0.5 * rh, k, ant: h.side }
    }
    case 'belt': {
      // only the dwarf wears a belt radio; any other kind clips it on its pocket
      const b = g.belt ?? { x: (g.pocket.x0 + g.pocket.x1) / 2, top: g.pocket.y0 }
      const c = fellowPoint(place, b.x, b.top)
      // whip on the body side (−side): on the phone side it would run up
      // into the held phone and hand just above the radio
      return { x: c.x - w / 2, y: c.y - rh * 0.3, k, ant: -h.side as 1 | -1 }
    }
    case 'pack': {
      // the outer side, away from the body: opposite the phone side
      const c = fellowPoint(place, (g.pack.x0 + g.pack.x1) / 2, g.pack.top)
      return { x: c.x - w / 2, y: c.y - rh * 0.68, k, ant: (-h.side) as 1 | -1 }
    }
  }
}

/** Antenna tip of a radio box: the whip stands 34 in from its left edge (ant +1) or mirrored. */
function radioTip(r: HookRadioBox): { x: number, y: number, base: number } {
  const x = r.x + (r.ant === 1 ? 34 : HOOK_RADIO.w - 34) * r.k
  return { x, y: r.y - HOOK_RADIO.antenna * r.k, base: r.y }
}

/** Antenna tip, where LoRa links attach: the whip stands on the radio's outer side. */
export function hookRadioTip(p: HookPhone): { x: number, y: number, base: number } {
  return radioTip(hookRadio(p))
}

/**
 * The fixed Meshtastic „router“ on the green hobbit hole: a radio on a short
 * mast (ROUTER_MAST high) planted in the turf roof, `x` 10 from the door's
 * centre towards the window (the chimney is on the other side), `y` the roof surface there (the back
 * hill's crest, 1 unit down so the mast foot sits in the grass). It is the
 * only radio no figure carries and the mesh's hub: linked to the dwarf, the
 * hobbit beside the house and the ranger.
 */
const GREEN_DOOR = SHIRE_DOORS.find(d => d.tone === 'green')!
const ROUTER_X = GREEN_DOOR.cx + GREEN_DOOR.side * 10
export const HOOK_ROUTER = { x: ROUTER_X, y: backHillY(ROUTER_X) + 1 } as const
// 18 high so the steep dwarf → router hop (from his belt, low in front)
// rises over the chimney's top-left corner (x ≈ 228, y 166).
export const ROUTER_MAST = 18
const ROUTER_SCALE = 0.5

/** Router radio box: centred on the mast top, whip on the left (towards the dwarf: on the right the dwarf's hop would clip the chimney). */
export function hookRouterRadio(): HookRadioBox {
  const w = HOOK_RADIO.w * ROUTER_SCALE
  const rh = HOOK_RADIO.h * ROUTER_SCALE
  return { x: HOOK_ROUTER.x - w / 2, y: HOOK_ROUTER.y - ROUTER_MAST - rh, k: ROUTER_SCALE, ant: -1 }
}

/**
 * Small solar panel on the router mast, below the radio and above the roof
 * turf: a tilted parallelogram (HookSwitch draws it) inside this box. It
 * straddles the mast, stays right of the chimney (x ≤ 240) and left of the
 * window (x ≥ 280), and lies below every LoRa hop, which all leave the
 * antenna tip above the radio.
 */
export const HOOK_SOLAR: Box = { x0: HOOK_ROUTER.x - 13, x1: HOOK_ROUTER.x + 11, y0: HOOK_ROUTER.y - 14, y1: HOOK_ROUTER.y - 5 }

/**
 * Mesh nodes, in hop order: every figure's radio plus the roof router.
 * `figure` indexes HOOK_FIGURES / HOOK_PHONES.
 */
export type HookNode = { kind: 'figure', figure: number } | { kind: 'router' }
export const HOOK_NODES: readonly HookNode[] = [
  { kind: 'figure', figure: 0 }, // dwarf, belt
  { kind: 'router' }, // roof of the green hobbit hole
  { kind: 'figure', figure: 1 }, // hobbit, phone case
  { kind: 'figure', figure: 2 }, // ranger, backpack
  { kind: 'figure', figure: 3 }, // elf, phone case
]

/** Radio box of node i. */
export function hookNodeRadio(i: number): HookRadioBox {
  const n = HOOK_NODES[i]
  return n.kind === 'router' ? hookRouterRadio() : hookRadio(HOOK_PHONES[n.figure])
}

/** Antenna tip of node i, where its LoRa links attach. */
export function hookNodeTip(i: number): { x: number, y: number, base: number } {
  return radioTip(hookNodeRadio(i))
}

/**
 * Where a tower link ends on a phone: centred above the phone's top edge.
 * Held phones leave 6 units of air; a pocket phone peeks out of the pocket,
 * so its link stops 3 above the visible top edge (HookSwitch draws the pocket
 * links in front of the figure, so they reach the phone instead of
 * disappearing behind the body).
 */
export function hookLinkEnd(p: HookPhone): { x: number, y: number } {
  return { x: p.x, y: p.y - (p.hold === 'pocket' ? 3 : 6) }
}

/** Tower antenna point the mobile links aim from. */
export const HOOK_TOWER = { x: 450, y: 60 } as const
/** Links start this far out from HOOK_TOWER, so they never run behind the mast. */
export const HOOK_TOWER_CLEAR = 62

/** A phone's mobile link: straight from HOOK_TOWER_CLEAR out of the tower to hookLinkEnd. */
export function hookTowerLink(p: HookPhone): { from: { x: number, y: number }, end: { x: number, y: number } } {
  const end = hookLinkEnd(p)
  const dx = end.x - HOOK_TOWER.x
  const dy = end.y - HOOK_TOWER.y
  const k = HOOK_TOWER_CLEAR / Math.hypot(dx, dy)
  return { from: { x: HOOK_TOWER.x + dx * k, y: HOOK_TOWER.y + dy * k }, end }
}

/**
 * LoRa links (edges) between radios, by HOOK_NODES index. The roof router
 * is the hub: dwarf–router, router–hobbit (a short side link, the hobbit
 * stays in the mesh), router–ranger, ranger–elf. No hobbit–ranger link: the
 * ranger hears the router on the roof, not the hobbit's radio below it.
 */
export const HOOK_MESH: readonly (readonly [number, number])[] = [[0, 1], [1, 2], [1, 3], [3, 4]]

/**
 * Message bubbles (frame 3), scene units. Width 208 fits the 20 px text.
 * `sender` is centred over the first phone at y 120–160, close above the
 * dwarf's head (its status line ends ≈ y 185, the hair starts at y 220); the
 * first LoRa hop runs under it. `receiver` is right-aligned 12 in from the
 * slide edge in the top row (y 40–80): lower down, the hop from the ranger's
 * backpack (antenna tip y ≈ 81) down to the elf's phone would cross it.
 */
export const HOOK_BUBBLE = { y: 40, h: 40, w: 208 } as const
export const HOOK_BUBBLES = {
  sender: { ...HOOK_BUBBLE, x: HOOK_PHONES[0].x - 104, y: 120 },
  receiver: { ...HOOK_BUBBLE, x: 900 - 12 - HOOK_BUBBLE.w },
} as const

/** Route of the message in frame 3, by HOOK_NODES index: dwarf → router → ranger → elf, left to right (3 hops; the hobbit's side link lights with the mesh but carries no hop). */
export const HOOK_PATH: readonly number[] = [0, 1, 3, 4]
