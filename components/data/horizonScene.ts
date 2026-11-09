// Gallery only (was a deck slide; replaced by LineOfSight, numbers moved to its notes): three heights side by side
// (ръка, покрив, Черни връх), each standing on its own slice of the Earth arc
// with its own line to the horizon. Schematic: drawn heights are exaggerated
// and the curvature is not to scale; the km labels are the real values from
// MASTS. All coordinates are in the component's SVG viewBox (HORIZON_W × HORIZON_H).
import type { Mast } from './radio'

export const HORIZON_W = 1000
export const HORIZON_H = 400

/** Ground level at each observer (the top of its arc). */
const SURFACE = 200
/** Earth radius of every slice, px. Small, so the curve shows in a narrow column. */
const R = 380
/** Drawn height per glyph, px. */
const DRAWN: Record<Mast['glyph'], number> = { person: 24, roof: 64, mountain: 110 }
/** Half the glyph's width (left of the observer) and room for the km label (right of the horizon point). */
const LEFT_PAD: Record<Mast['glyph'], number> = { person: 20, roof: 40, mountain: 90 }
const LABEL_PAD = 75
/** Observer x per column, left to right in reveal order. */
const OBSERVER_X = [50, 305, 680]

export interface HorizonScene {
  mast: Mast
  /** Observer x and the top of its glyph. */
  x: number
  top: number
  /** Centre and radius of this slice's Earth circle. */
  cx: number
  cy: number
  r: number
  /** Where the sight line touches the Earth: the radio horizon. */
  tx: number
  ty: number
  /** Horizontal extent of the column (glyph to label). */
  xMin: number
  xMax: number
  /** SVG path of the Earth slice, filled down to the bottom edge. */
  ground: string
  /** SVG path of the arc alone (the surface line). */
  arc: string
  /** Glyph outline sitting on the arc (empty for the person, drawn as lines). */
  glyph: string
}

/** Half-width of the mountain and the house, px. */
const MOUNTAIN_HALF = 80
const HOUSE_HALF = 22

export function horizonScenes(masts: readonly Mast[]): HorizonScene[] {
  return masts.map((mast, i) => {
    const h = DRAWN[mast.glyph]
    const x = OBSERVER_X[i] ?? OBSERVER_X[OBSERVER_X.length - 1]
    const cx = x
    const cy = SURFACE + R
    // A tangent from a point at distance R+h from the centre touches the
    // circle at angle α = acos(R / (R+h)) from the observer's radius.
    const a = Math.acos(R / (R + h))
    const tx = cx + R * Math.sin(a)
    const ty = cy - R * Math.cos(a)
    const xMin = x - LEFT_PAD[mast.glyph]
    const xMax = tx + LABEL_PAD
    // Sample the arc between the column edges (angles from the observer's radius).
    const a0 = Math.asin((xMin - cx) / R)
    const a1 = Math.asin((xMax - cx) / R)
    const pts: string[] = []
    for (let k = 0; k <= 40; k++) {
      const t = a0 + ((a1 - a0) * k) / 40
      pts.push(`${(cx + R * Math.sin(t)).toFixed(1)},${(cy - R * Math.cos(t)).toFixed(1)}`)
    }
    const arc = `M${pts.join('L')}`
    const ground = `${arc} L${xMax.toFixed(1)},${HORIZON_H} L${xMin.toFixed(1)},${HORIZON_H} Z`
    // Glyph base follows the arc: endpoints on the circle, a quadratic through
    // the observer's ground point (control y = 2·SURFACE − baseY).
    const base = (half: number): { y: number, c: number } => {
      const y = cy - Math.sqrt(R * R - half * half)
      return { y, c: 2 * SURFACE - y }
    }
    const top = SURFACE - h
    let glyph = ''
    if (mast.glyph === 'mountain') {
      const b = base(MOUNTAIN_HALF)
      glyph = `M${x - MOUNTAIN_HALF},${b.y} L${x},${top} L${x + MOUNTAIN_HALF},${b.y} Q${x},${b.c} ${x - MOUNTAIN_HALF},${b.y} Z`
    }
    else if (mast.glyph === 'roof') {
      const b = base(HOUSE_HALF)
      const roofY = top + 18
      glyph = `M${x - HOUSE_HALF},${b.y} V${roofY} H${x + HOUSE_HALF} V${b.y} Q${x},${b.c} ${x - HOUSE_HALF},${b.y} Z`
    }
    return { mast, x, top, cx, cy, r: R, tx, ty, xMin, xMax, ground, arc, glyph }
  })
}
