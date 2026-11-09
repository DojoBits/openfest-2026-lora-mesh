// Geometry of the four slide-2 figures (the Fellowship): hobbit, dwarf, human
// (a ranger) and elf. Same contract as hobbitGeometry.ts, per kind: local
// units, origin = ground under the feet, body centre at x 0, facing right
// (+x), y up = negative. The drawings (Hobbit.vue, and Dwarf/Human/Elf.vue
// through FellowFigure.vue) and the scene that places them (hookFrames.ts)
// both read these numbers, so a phone, pack or staff lands on the same spot
// in the drawing and in the link maths.
//
// Silhouettes are told apart by height and width (back-of-the-hall test):
//   hobbit  127 tall, half-width 23  — small, curly hair, big bare feet
//   dwarf   135 tall, half-width 28  — as short as the hobbit but the broadest
//   human   178 tall, half-width 19  — the tallest, hooded cloak
//   elf     161 tall, half-width 15  — tall and the slenderest, long gown
// (In the books hobbits are about 3.5 ft, dwarves 4.5 ft, men and elves 6 ft;
// the ratio is squeezed so the tall two still fit the 400-unit scene.)

import { HOBBIT_PACK, HOBBIT_PHONE, HOBBIT_STAFF, type HobbitPhone } from './hobbitGeometry'

export type FellowKind = 'hobbit' | 'dwarf' | 'human' | 'elf'

/** Slide-2 cast, left to right. */
export const FELLOW_KINDS: readonly FellowKind[] = ['hobbit', 'dwarf', 'human', 'elf']

type Pt = readonly [number, number]
/** An arm as shoulder → elbow → hand. */
export interface FellowArm { s: Pt, e: Pt, h: Pt }

export interface FellowGeometry {
  /** Ground to the highest point of the figure (hair, helmet, hood). */
  height: number
  /** Widest half-width of the body (coat, mail, gown), without arms. */
  halfWidth: number
  /**
   * Full drawn width, facing right, with arms, cloak, axe and whichever gear
   * the kind carries on slide 2 (pack, staff); measured from the rendered
   * figures (getBBox) and rounded outwards. Used for overlap checks.
   */
  span: { x0: number, x1: number }
  /** Head circle: centre (0, y), radius r. */
  head: { y: number, r: number }
  /** Phone slot: centre `dx` from the body centre, top edge `top`, drawing scale `k`. */
  phone: Record<HobbitPhone, { dx: number, top: number, k: number }>
  /** Patch pocket (or belt pouch) the small phone peeks out of. */
  pocket: { x0: number, x1: number, y0: number, y1: number }
  /** Backpack on the far side (see HOBBIT_PACK): rim band = top..top + 6. */
  pack: { x0: number, x1: number, top: number, bottom: number }
  /** Walking staff in the far hand: pole at x, hand at y `hand`, top at `top`. */
  staff: { x: number, hand: number, top: number }
  /** Belt (dwarf only): where a radio clips on at the phone-side hip, `x` its centre, `top` the belt's top edge. */
  belt?: { x: number, top: number }
  /**
   * Arms. far: the arm away from the phone (hanging or hand on hip); near:
   * raised to the held phone (`hand`, the hand grips the phone's lower inner
   * corner) or hanging beside the pocket (`pocket`); staff: far hand on the pole.
   */
  arms: { far: Record<'relaxed' | 'hip', FellowArm>, near: Record<HobbitPhone, FellowArm>, staff: FellowArm }
}

/**
 * The hobbit's numbers are the ones Hobbit.vue draws (its header lists the
 * landmarks); kept here so the scene treats all four kinds alike.
 */
const HOBBIT: FellowGeometry = {
  height: 127,
  halfWidth: 23,
  span: { x0: -32, x1: 32 },
  head: { y: -104, r: 15 },
  phone: HOBBIT_PHONE,
  pocket: { x0: 4, x1: 17, y0: -50, y1: -38 },
  pack: HOBBIT_PACK,
  staff: HOBBIT_STAFF,
  arms: {
    far: { relaxed: { s: [-15, -84], e: [-21, -66], h: [-21, -49] }, hip: { s: [-14, -84], e: [-29, -69], h: [-21, -56] } },
    near: { hand: { s: [14, -84], e: [22, -64], h: [31, -77] }, pocket: { s: [15, -84], e: [23, -66], h: [27, -48] } },
    staff: { s: [-15, -84], e: [-28, -73], h: [HOBBIT_STAFF.x, HOBBIT_STAFF.hand] },
  },
}

/**
 * Dwarf: hobbit height, broadest body. Landmarks:
 *   boots 0..-14 · legs -12..-34 · mail skirt -46..-30 · belt -52..-46
 *   tunic -92..-52 (half-width 24 → 28 at the hem) · shoulders -88
 *   head centre -104 (r 14) · beard -104..-64, braids to -58
 *   helmet rim -117..-112.5, dome to -131.5, knob to -135 · axe head above the far shoulder
 * The pocket sits on the mail skirt below the belt, clear of the braids.
 */
const DWARF: FellowGeometry = {
  height: 135,
  halfWidth: 28,
  span: { x0: -46, x1: 37 },
  head: { y: -104, r: 14 },
  // held phone beside the beard (beard reaches x ±20, phone starts at x 27.7)
  phone: { hand: { dx: 37, top: -110, k: 0.55 }, pocket: { dx: 13, top: -52, k: 0.3 } },
  pocket: { x0: 6, x1: 20, y0: -46, y1: -34 },
  pack: { x0: -56, x1: -24, top: -108, bottom: -56 },
  staff: { x: -40, hand: -60, top: -160 },
  // belt -52..-46; the radio hangs at the phone-side hip, right of the
  // pocket (x 6..20) and under the near elbow (30, -68)
  belt: { x: 26, top: -52 },
  arms: {
    far: { relaxed: { s: [-22, -88], e: [-29, -70], h: [-30, -52] }, hip: { s: [-21, -88], e: [-38, -72], h: [-28, -58] } },
    near: { hand: { s: [21, -88], e: [30, -68], h: [34, -81] }, pocket: { s: [22, -88], e: [30, -70], h: [31, -51] } },
    staff: { s: [-22, -88], e: [-35, -74], h: [-40, -60] },
  },
}

/**
 * Human (ranger): the tallest, ~7 heads. Landmarks:
 *   tall boots 0..-32 · legs -30..-88 · jerkin -136..-88 (belt -96..-90)
 *   shoulders -134 · head centre -152 (r 13) · hood up, top ≈ -178
 *   cloak from the shoulders to -40 behind · sword on the far hip
 * Pack top -152 is level with the face; its x range (-50..-18) stays left of
 * the hood (x ≥ -19), so a radio poking out of it never covers the face.
 */
const HUMAN: FellowGeometry = {
  height: 178,
  halfWidth: 19,
  span: { x0: -51, x1: 31 },
  head: { y: -152, r: 13 },
  // held phone beside the hood (hood reaches x 18, phone starts at x 22.7)
  phone: { hand: { dx: 32, top: -152, k: 0.55 }, pocket: { dx: 11, top: -86, k: 0.3 } },
  pocket: { x0: 5, x1: 17, y0: -80, y1: -68 },
  pack: { x0: -50, x1: -18, top: -152, bottom: -94 },
  staff: { x: -32, hand: -96, top: -200 },
  arms: {
    far: { relaxed: { s: [-17, -134], e: [-24, -110], h: [-25, -86] }, hip: { s: [-17, -134], e: [-33, -114], h: [-20, -96] } },
    near: { hand: { s: [17, -134], e: [23, -104], h: [29, -123] }, pocket: { s: [17, -134], e: [23, -110], h: [24, -84] } },
    staff: { s: [-17, -134], e: [-29, -114], h: [-32, -96] },
  },
}

/**
 * Elf: tall and the slenderest. Landmarks:
 *   gown from the shoulders to the ground (A-line, hem half-width 28)
 *   sash -108..-102 · shoulders -130 · head centre -146 (r 12.5)
 *   long straight hair behind the shoulders down to -92 · top of hair -161
 *   pointed ears, tips up and out at (±23, -156) · circlet at -153
 * Staff top -172 is just above the hair: a radio tied there sits beside the
 * head on the far side, low enough that the LoRa line to it stays under the
 * message bubbles (hookFrames.ts).
 */
const ELF: FellowGeometry = {
  height: 161,
  halfWidth: 15,
  span: { x0: -40, x1: 32 },
  head: { y: -146, r: 12.5 },
  // held phone below the ear tip (ear tip y -156, phone top -145)
  phone: { hand: { dx: 31, top: -145, k: 0.55 }, pocket: { dx: 10, top: -104, k: 0.3 } },
  pocket: { x0: 4, x1: 16, y0: -100, y1: -88 },
  pack: { x0: -44, x1: -16, top: -144, bottom: -90 },
  staff: { x: -32, hand: -100, top: -172 },
  arms: {
    far: { relaxed: { s: [-13, -130], e: [-18, -108], h: [-19, -86] }, hip: { s: [-13, -130], e: [-27, -112], h: [-16, -100] } },
    near: { hand: { s: [13, -130], e: [20, -104], h: [28, -116] }, pocket: { s: [13, -130], e: [18, -108], h: [20, -86] } },
    staff: { s: [-13, -130], e: [-27, -114], h: [-32, -100] },
  },
}

export const FELLOW_GEOMETRY: Record<FellowKind, FellowGeometry> = { hobbit: HOBBIT, dwarf: DWARF, human: HUMAN, elf: ELF }

export interface FellowPlace { kind: FellowKind, x: number, y: number, scale?: number, flip?: boolean }

/** A local point of a placed figure, in scene units (mirrored when `flip`). */
export function fellowPoint(h: Omit<FellowPlace, 'kind'>, lx: number, ly: number): { x: number, y: number } {
  const s = h.scale ?? 1
  return { x: h.x + (h.flip ? -1 : 1) * s * lx, y: h.y + s * ly }
}

/** Phone of a placed figure, in scene units: centre `x`, top edge `y`, drawing scale `k`. */
export function fellowPhone(h: FellowPlace & { phone: HobbitPhone }): { x: number, y: number, k: number } {
  const s = h.scale ?? 1
  const dir = h.flip ? -1 : 1
  const slot = FELLOW_GEOMETRY[h.kind].phone[h.phone]
  return { x: h.x + dir * s * slot.dx, y: h.y + s * slot.top, k: s * slot.k }
}
