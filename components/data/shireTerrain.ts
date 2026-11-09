// Slide 2 (hook) terrain: the Shire landmarks in scene units (viewBox 900 × 400),
// shared by ShireBackdrop.vue (drawing) and the hook tests (placement checks:
// feet on the ground, figures clear of the houses and the tree).

export interface Box { x0: number, y0: number, x1: number, y1: number }

/** One quadratic Bézier segment: start, control, end. */
type Quad = readonly [readonly [number, number], readonly [number, number], readonly [number, number]]

/**
 * Back hill crest, left to right: a long rolling line with a dip at the green
 * door (x ≈ 260–360), a peak right of the tower (x ≈ 560) and a dip at the
 * yellow door (x ≈ 680–800).
 */
const BACK_HILL: readonly Quad[] = [
  [[0, 205], [120, 150], [260, 188]],
  [[260, 188], [360, 214], [450, 182]],
  [[450, 182], [560, 146], [680, 190]],
  [[680, 190], [800, 226], [900, 172]],
]

/** SVG path of the back hill, closed along the bottom edge. */
export const BACK_HILL_D = `M${BACK_HILL[0][0].join(' ')} ${BACK_HILL.map(([, c, e]) => `Q${c.join(' ')} ${e.join(' ')}`).join(' ')} L900 400 L0 400 Z`

/**
 * Crest height (y) at x. Each segment's x(t) = (1−t)²·x0 + 2t(1−t)·cx + t²·x1
 * is solved for t (a quadratic in t), then y(t) is evaluated at that t.
 */
export function backHillY(x: number): number {
  const seg = BACK_HILL.find(([s, , e]) => x >= s[0] && x <= e[0]) ?? BACK_HILL[x < 0 ? 0 : BACK_HILL.length - 1]
  const [[x0, y0], [cx, cy], [x1, y1]] = seg
  // x(t) = a·t² + b·t + x0 with a = x0 − 2cx + x1, b = 2(cx − x0)
  const a = x0 - 2 * cx + x1
  const b = 2 * (cx - x0)
  const c = x0 - x
  const t = Math.abs(a) < 1e-9 ? -c / b : (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a)
  const k = Math.min(1, Math.max(0, t))
  return (1 - k) ** 2 * y0 + 2 * k * (1 - k) * cy + k ** 2 * y1
}

/**
 * Hobbit holes (ShireDoor props). `side` = which side the window is on. The
 * green one sits on the back hill left of the tower, window towards the
 * hobbit on its right; its turf roof carries the fixed router (hookFrames.ts).
 */
export interface ShireDoorSpot { cx: number, cy: number, tone: 'green' | 'yellow', side: 1 | -1 }
export const SHIRE_DOORS: readonly ShireDoorSpot[] = [
  { cx: 250, cy: 212, tone: 'green', side: 1 },
  { cx: 676, cy: 214, tone: 'yellow', side: -1 },
]

/** ShireDoor draws at this scale about (cx, cy). */
const DOOR_SCALE = 1.15

/**
 * Drawn parts of a hobbit hole in scene units, from ShireDoor's local shapes:
 * stone ring (r 22) with its step, round window (r 8 at x side·36, y −4, flower
 * box down to y 14), fence (x −side·30…−side·54, y 3–16), chimney
 * (x −side·14 ± 5.5, y −40…−20) with its smoke column (up to y −70, drifting
 * towards the window side). The turf between them is open hill, so these are
 * separate boxes, not one big rectangle.
 */
export function doorParts(d: ShireDoorSpot): Box[] {
  const s = d.side
  const box = (ax: number, ay: number, bx: number, by: number): Box => ({
    x0: d.cx + Math.min(ax, bx) * DOOR_SCALE,
    x1: d.cx + Math.max(ax, bx) * DOOR_SCALE,
    y0: d.cy + Math.min(ay, by) * DOOR_SCALE,
    y1: d.cy + Math.max(ay, by) * DOOR_SCALE,
  })
  return [
    box(-22, -22, 22, 19), // ring + step
    box(s * 36 - 10, -12, s * 36 + 10, 14), // window + flower box
    box(-s * 30, 3, -s * 54, 16), // fence
    box(-s * 14 - 5.5, -40, -s * 14 + 5.5, -20), // chimney
    box(-s * 14, -70, -s * 14 + s * 22, -42), // smoke puffs
  ]
}

/** The round tree on the crest right of the tower: crown circles and trunk. */
export const SHIRE_TREE: Box = { x0: 584, y0: 120, x1: 635, y1: 172 }

/**
 * Footpath to the green door, drawn like the yellow door's path: a cubic
 * centreline from the bottom edge (t 0) up to the door's step (t 1), wide in
 * front and narrowing with distance. It swings right first (round the front
 * hill's dip), then back left along the slope to the door; the hobbit stands
 * on it (hookFrames.ts), a little below the house.
 */
export const SHIRE_TRAIL = { p0: [300, 404], p1: [450, 300], p2: [360, 240], p3: [251, 236], w0: 27, w1: 7 } as const

/** Point on the trail's centreline at t ∈ [0, 1]. */
export function trailPoint(t: number): { x: number, y: number } {
  const { p0, p1, p2, p3 } = SHIRE_TRAIL
  const u = 1 - t
  const b = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t]
  return {
    x: b[0] * p0[0] + b[1] * p1[0] + b[2] * p2[0] + b[3] * p3[0],
    y: b[0] * p0[1] + b[1] * p1[1] + b[2] * p2[1] + b[3] * p3[1],
  }
}

/** Half-width of the trail at t: linear from w0 at the bottom edge to w1 at the door. */
export function trailHalfWidth(t: number): number {
  return SHIRE_TRAIL.w0 + (SHIRE_TRAIL.w1 - SHIRE_TRAIL.w0) * t
}

/**
 * Trail outline: centreline samples pushed out by the half-width along the
 * normal on one side, then back down the other side, closed.
 */
export const SHIRE_TRAIL_D = (() => {
  const n = 40
  const left: string[] = []
  const right: string[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const a = trailPoint(Math.max(0, t - 0.005))
    const b = trailPoint(Math.min(1, t + 0.005))
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    // unit normal (perpendicular to the tangent)
    const nx = -(b.y - a.y) / len
    const ny = (b.x - a.x) / len
    const c = trailPoint(t)
    const w = trailHalfWidth(t)
    left.push(`${(c.x + nx * w).toFixed(1)} ${(c.y + ny * w).toFixed(1)}`)
    right.push(`${(c.x - nx * w).toFixed(1)} ${(c.y - ny * w).toFixed(1)}`)
  }
  return `M${left.join(' L')} L${right.reverse().join(' L')} Z`
})()
