// Where the inked perils sit on the slide-5 journey map. Plain data so a test
// can check every box against labels, markers, trail, summit and compass.
// Named perilPlacement (not mapPerils) to dodge the component/data name-clash
// trap from CLAUDE.md. Native box sizes come from perilBox.ts.
import { PERIL_BOX, type PerilKind } from './perilBox'

export interface Rect { x0: number, y0: number, x1: number, y1: number }

export interface PerilSpot {
  kind: PerilKind
  x: number
  y: number
  scale: number
  flip: boolean
}

/** Compass rose centre and its box: ring r 30, the north letter reaches 56 above the centre. */
export const COMPASS_AT = { x: 62, y: 200 }
export const COMPASS_BOX: Rect = { x0: COMPASS_AT.x - 30, x1: COMPASS_AT.x + 30, y0: COMPASS_AT.y - 56, y1: COMPASS_AT.y + 30 }

/**
 * Two dragons in the open sky above the stops, facing each other (the left one
 * flies right, the right one is flipped and flies left); a troll on the left
 * ground and one on the low ground between the first two stops; a spider
 * hanging above the left forest; a warg prowling the open ground right of the
 * last descent, flipped so it looks back toward the trail.
 */
export const PERIL_PLACEMENT: readonly PerilSpot[] = [
  { kind: 'dragon', x: 250, y: 62, scale: 1, flip: false },
  { kind: 'dragon', x: 640, y: 52, scale: 0.75, flip: true },
  { kind: 'troll', x: 85, y: 360, scale: 1, flip: false },
  { kind: 'troll', x: 255, y: 262, scale: 0.8, flip: true },
  { kind: 'spider', x: 125, y: 200, scale: 1, flip: false },
  { kind: 'warg', x: 735, y: 300, scale: 1, flip: true },
]

/** Bounding box of a placed peril: its native box times `scale`, centred on (x, y). */
export function perilRect(p: PerilSpot): Rect {
  const { w, h } = PERIL_BOX[p.kind]
  const hw = (w * p.scale) / 2
  const hh = (h * p.scale) / 2
  return { x0: p.x - hw, x1: p.x + hw, y0: p.y - hh, y1: p.y + hh }
}
