// Placement of the summit peak + pennant and the right-edge label nudge on the
// slide-5 map, kept in plain TS so a test can check them against the panel's
// inner border (10 px in from the edge) with a 12 px clearance.
import { JOURNEY_STOPS, JOURNEY_W, labelBox } from './journey'

const summit = JOURNEY_STOPS.at(-1)!

/** Peak: base ±24 px, 44 px high; pole to 72 px; pennant flies 22 px right. */
export const SUMMIT_HALF_W = 24
export const SUMMIT_POLE_H = 72
export const SUMMIT_FLAG_W = 22

/** Origin (base centre) of the summit glyph and its bounding box. */
export function summitBox(): { x: number, y: number, x0: number, x1: number, y0: number, y1: number } {
  const x = summit.x + 32
  const y = summit.y + 95
  return { x, y, x0: x - SUMMIT_HALF_W, x1: x + Math.max(SUMMIT_HALF_W, SUMMIT_FLAG_W), y0: y - SUMMIT_POLE_H, y1: y }
}

/** Panel inner border inset (second rect) plus clearance. */
export const INNER_BORDER = 10
export const CLEARANCE = 12

/** px to move label `i` left so its text stays clear of the inner border. */
export function labelNudge(i: number): number {
  return Math.max(0, labelBox(i).x1 - (JOURNEY_W - INNER_BORDER - CLEARANCE - 2))
}
