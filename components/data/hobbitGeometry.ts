// Geometry shared by Hobbit.vue and the scenes that place hobbits (HookSwitch).
// A hobbit is drawn in local units around its anchor: x = body centre,
// y = ground under the feet, facing right (+x). The figure is ~130 units tall
// at scale 1 (≈3.4 heads). `flip` mirrors it to face left; `scale` sizes it
// (smaller = further away). Whatever the figure holds is placed through these
// helpers, so a scene can attach links to the phone without knowing the drawing.

export type HobbitPhone = 'hand' | 'pocket'

/** Phone body at k = 1 (same box HookSwitch draws). */
export const PHONE_BOX = { w: 34, h: 56 } as const

/**
 * Where the phone sits, in local units (facing right, unscaled):
 * `dx` = phone centre from the body centre, `top` = phone top edge from the
 * ground (negative = up), `k` = phone drawing scale.
 *   hand   — hand-sized phone raised beside the face on the near side; the
 *            hand grips its lower inner corner (Hobbit.vue: hand at (31, -77));
 *   pocket — a small phone, only its top third out of the patch pocket on the
 *            near thigh (Hobbit.vue: pocket x 4..17, y -50..-38).
 */
export const HOBBIT_PHONE: Record<HobbitPhone, { dx: number, top: number, k: number }> = {
  hand: { dx: 34, top: -106, k: 0.55 },
  pocket: { dx: 10.5, top: -56, k: 0.3 },
}

export interface HobbitPlace { x: number, y: number, scale?: number, phone: HobbitPhone, flip?: boolean }

/**
 * Backpack, local units (facing right): carried on the far side (−x, the back
 * when the figure looks right), wider than the torso edge (x −23) so it
 * shows beside the body, top above the shoulders (−84) but left of the ear
 * tip (x −21.5), so the pack never covers the face. `x0..x1` horizontal
 * extent, `top..bottom` vertical. The rim band (top..top + 6) is drawn in
 * front of whatever pokes out of the pack.
 */
export const HOBBIT_PACK = { x0: -50, x1: -19, top: -102, bottom: -54 } as const

/**
 * Walking staff, local units: a straight pole held upright in the far hand
 * (the hand at (x, hand)), from the ground (y 2) to `top`, well above the
 * hair (≈ −125), so something tied to its top stands clear of the head.
 */
export const HOBBIT_STAFF = { x: -36, hand: -64, top: -158 } as const

/** A local point of a placed hobbit, in scene units (mirrored when `flip`). */
export function hobbitPoint(h: Omit<HobbitPlace, 'phone'>, lx: number, ly: number): { x: number, y: number } {
  const s = h.scale ?? 1
  return { x: h.x + (h.flip ? -1 : 1) * s * lx, y: h.y + s * ly }
}

/** Phone of a placed hobbit, in scene units: centre `x`, top edge `y`, drawing scale `k`. */
export function hobbitPhone(h: HobbitPlace): { x: number, y: number, k: number } {
  const s = h.scale ?? 1
  const dir = h.flip ? -1 : 1
  const slot = HOBBIT_PHONE[h.phone]
  return { x: h.x + dir * s * slot.dx, y: h.y + s * slot.top, k: s * slot.k }
}
