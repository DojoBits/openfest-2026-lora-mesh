// The bottom band of every section slide (SectionHero.vue): a mini copy of the
// slide-5 trail (data/journey.ts) on parchment hills, decorated with the same
// map artifacts slide 5 uses (MapGlyphs.vue terrain, MapPerils.vue creatures).
// Plain data so the tests can check every artifact box against the trail, the
// stop circles and the flag. Named trailBand (not after a component) to dodge
// the component/data name-clash trap from CLAUDE.md.
import { JOURNEY_STOPS, TRAIL_START, legPoint, type Point } from './journey'
import { PERIL_BOX, type PerilKind } from './perilBox'
import type { Rect } from './perilPlacement'
import type { SectionId } from './sections'

export type { Rect }

/** Band size in px: full slide width, bottom strip. */
export const BAND_W = 980
export const BAND_H = 140

// The 860 × 420 journey canvas squashed into the band: x shrunk to 62 % and
// shifted right (the left third stays free for artifacts), y to 40 % and lifted
// so the summit sits near the band's top edge.
const SX = 0.62
const SY = 0.4
const OX = 330
const OY = -40

/** Journey-canvas point → band point. */
export const bandPoint = (p: Point): Point => ({ x: OX + p.x * SX, y: OY + p.y * SY })

export const BAND_START: Point = bandPoint(TRAIL_START)
export const BAND_STOPS: readonly Point[] = JOURNEY_STOPS.map(bandPoint)

/** Point at t ∈ [0, 1] along leg `i`, in band coordinates. */
export const bandLeg = (i: number, t: number): Point => bandPoint(legPoint(i, t))

/**
 * Medallion radii drawn in SectionHero: this section's stop, the other stops,
 * the start mark. Each stop medallion holds its JourneyIcons glyph in a box of
 * the medallion's diameter (as slide 5: 72 px icon in a 36 px ring), so 15 px
 * gives a 30 px glyph, the smallest that still reads at band size.
 */
export const CURRENT_R = 22
export const STOP_R = 15
export const START_MARK_R = 8

/**
 * Flag icon (text-2xl = 24 px box) up and right of the summit, just outside
 * the current-size medallion so it clears it whichever section is lit.
 */
const summit = BAND_STOPS[BAND_STOPS.length - 1]
export const FLAG_OFFSET = { dx: CURRENT_R + 2, dy: -CURRENT_R - 14 }
export const BAND_FLAG: Rect = {
  x0: summit.x + FLAG_OFFSET.dx,
  x1: summit.x + FLAG_OFFSET.dx + 24,
  y0: summit.y + FLAG_OFFSET.dy,
  y1: summit.y + FLAG_OFFSET.dy + 24,
}

// ---- horizon ---------------------------------------------------------------

// The near hill's top edge, left to right: flat from the slide edge to the
// start mark (6 px lower, so the start sits on a small rise), then the trail
// itself sampled per leg, then flat from the summit to the right edge. The
// trail legs are cubics with horizontal end tangents between stops of rising
// x, so this polyline is x-monotonic and can be read as a function y(x).
const EDGE_SAMPLES = 24
export const HILL_EDGE: readonly Point[] = [
  { x: 0, y: BAND_START.y + 6 },
  ...JOURNEY_STOPS.flatMap((_, i) => Array.from({ length: EDGE_SAMPLES + 1 }, (_, k) => bandLeg(i, k / EDGE_SAMPLES))),
  { x: BAND_W, y: summit.y },
]

/** Height of the horizon (near hill top) at band x, by linear interpolation on HILL_EDGE. Sky is y < horizonY(x). */
export function horizonY(x: number): number {
  const e = HILL_EDGE
  if (x <= e[0].x) return e[0].y
  for (let k = 1; k < e.length; k++) {
    const a = e[k - 1]
    const b = e[k]
    if (x <= b.x) return b.x === a.x ? Math.min(a.y, b.y) : a.y + (b.y - a.y) * (x - a.x) / (b.x - a.x)
  }
  return e[e.length - 1].y
}

// The far ridge behind the near hill, as the cubic segments SectionHero draws
// (M0 60 C… S…; the S control is the mirror of the previous one). Exported so the
// dragons can be kept clear of it: it often rises above the near hill's edge.
type Bez = readonly [Point, Point, Point, Point]
export const RIDGE: readonly Bez[] = [
  [{ x: 0, y: 60 }, { x: 200, y: 20 }, { x: 380, y: 50 }, { x: 560, y: 30 }],
  [{ x: 560, y: 30 }, { x: 740, y: 10 }, { x: 860, y: 10 }, { x: BAND_W, y: 35 }],
]
/** SVG path of the far ridge, closed to the bottom of the band. */
export const RIDGE_PATH = `M${RIDGE[0][0].x} ${RIDGE[0][0].y} C${RIDGE[0][1].x} ${RIDGE[0][1].y}, ${RIDGE[0][2].x} ${RIDGE[0][2].y}, ${RIDGE[0][3].x} ${RIDGE[0][3].y} `
  + `C${RIDGE[1][1].x} ${RIDGE[1][1].y}, ${RIDGE[1][2].x} ${RIDGE[1][2].y}, ${RIDGE[1][3].x} ${RIDGE[1][3].y} L${BAND_W} ${BAND_H} L0 ${BAND_H} Z`

/** Ridge height at band x (dense sampling of the cubics; x is monotonic along them). */
export function ridgeY(x: number): number {
  let best = Infinity
  for (const [p0, p1, p2, p3] of RIDGE) {
    if (x < p0.x || x > p3.x) continue
    let prev = p0
    for (let k = 1; k <= 200; k++) {
      const t = k / 200, u = 1 - t
      const q = {
        x: u ** 3 * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t ** 3 * p3.x,
        y: u ** 3 * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t ** 3 * p3.y,
      }
      if (x >= prev.x && x <= q.x) best = Math.min(best, q.x === prev.x ? q.y : prev.y + (q.y - prev.y) * (x - prev.x) / (q.x - prev.x))
      prev = q
    }
  }
  return best
}

/** Highest hill point (smallest y) of ridge and near hill over [x0, x1]. */
export function highestHill(x0: number, x1: number): number {
  let top = Infinity
  for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) top = Math.min(top, ridgeY(x), horizonY(x))
  return top
}

/** Clear sky kept under every dragon, band px (about 70 px on a 1920 screen). */
export const DRAGON_GAP = 40

/**
 * A flying dragon whose box bottom clears the highest hill under its x-span by
 * DRAGON_GAP, derived from the curves above so it cannot drift onto a hill.
 * It may sit above the band's top edge: the band svg does not clip.
 */
function flyer(x: number, scale: number, near: boolean): Creature {
  const { w, h } = PERIL_BOX.dragon
  const top = highestHill(x - (w / 2) * scale, x + (w / 2) * scale)
  return { kind: 'peril', peril: 'dragon', x, y: Math.floor(top - DRAGON_GAP - (h / 2) * scale), scale, flip: false, ...(near ? { near } : {}) }
}

// ---- artifacts ------------------------------------------------------------

/** One stamp of a cluster: offset from the cluster origin plus scale (MapGlyphs GlyphPoint). */
export interface BandGlyphPoint { dx: number, dy: number, s: number }

/** Terrain cluster drawn by <MapGlyphs kind="…" :pts>. */
export interface GlyphCluster { kind: 'mountains' | 'forest' | 'hills', x: number, y: number, pts: readonly BandGlyphPoint[] }
/** Compass rose drawn by <MapGlyphs kind="compass" :s>. */
export interface CompassMark { kind: 'compass', x: number, y: number, s: number }
/** Creature drawn by <MapPerils>; `near` marks the section's own creature by its stop. */
export interface Creature { kind: 'peril', peril: PerilKind, x: number, y: number, scale: number, flip: boolean, near?: boolean }

export type BandArtifact = GlyphCluster | CompassMark | Creature

/**
 * Native boxes of the MapGlyphs stamps at scale 1, relative to the stamp's
 * anchor (base centre): a peak is 40 × 36, a tree 16 × 22 (crown r 8 on a
 * 7 px trunk), a hill mound 52 × 11. The compass is ring r 30 plus its north
 * letter, as COMPASS_BOX in perilPlacement.ts.
 */
const STAMP_BOX: Readonly<Record<GlyphCluster['kind'] | 'compass', Rect>> = {
  mountains: { x0: -20, x1: 20, y0: -36, y1: 0 },
  forest: { x0: -8, x1: 8, y0: -22, y1: 0 },
  hills: { x0: -26, x1: 26, y0: -11, y1: 0 },
  compass: { x0: -30, x1: 30, y0: -56, y1: 30 },
}

const scaled = (b: Rect, x: number, y: number, s: number): Rect =>
  ({ x0: x + b.x0 * s, x1: x + b.x1 * s, y0: y + b.y0 * s, y1: y + b.y1 * s })

/** Placed boxes of an artifact: one per stamp for clusters, one for compass / creature. */
export function artifactBoxes(a: BandArtifact): Rect[] {
  if (a.kind === 'compass') return [scaled(STAMP_BOX.compass, a.x, a.y, a.s)]
  if (a.kind === 'peril') {
    const { w, h } = PERIL_BOX[a.peril]
    return [scaled({ x0: -w / 2, x1: w / 2, y0: -h / 2, y1: h / 2 }, a.x, a.y, a.scale)]
  }
  const box = STAMP_BOX[a.kind]
  return a.pts.map(p => scaled(box, a.x + p.dx, a.y + p.dy, p.s))
}

// Where the shared terrain goes (every section). Layout, left to right:
//   - the left third (x 0..350) is where the question label used to be: the
//     near hill's top edge runs flat at y ≈ 86 there, so the compass, a forest
//     and a range of peaks stand on that horizon and a dragon flies over the far
//     ridge above it;
//   - under the stop-2 peak (x ≈ 590) the hill is open below the trail: a copse;
//   - right of the summit flag the hill runs flat at y ≈ 38: a range on that
//     horizon and a forest on the slope below it.
// Stop 1 and 3 dip to y ≈ 92, so nothing sits under them except the section's
// own creature, placed beside its stop.
const BASE: readonly BandArtifact[] = [
  { kind: 'compass', x: 42, y: 112, s: 0.45 },
  flyer(64, 0.42, false),
  { kind: 'forest', x: 112, y: 124, pts: [{ dx: -14, dy: -6, s: 0.75 }, { dx: 12, dy: -8, s: 0.7 }, { dx: 0, dy: 2, s: 0.8 }, { dx: 24, dy: 4, s: 0.75 }] },
  { kind: 'mountains', x: 214, y: 90, pts: [{ dx: -20, dy: -2, s: 0.6 }, { dx: 18, dy: -3, s: 0.55 }, { dx: 0, dy: 2, s: 0.7 }] },
  { kind: 'hills', x: 214, y: 128, pts: [{ dx: 0, dy: 0, s: 0.7 }] },
  { kind: 'forest', x: 300, y: 122, pts: [{ dx: -10, dy: -4, s: 0.7 }, { dx: 8, dy: -2, s: 0.75 }, { dx: -1, dy: 8, s: 0.8 }] },
  { kind: 'forest', x: 590, y: 116, pts: [{ dx: -12, dy: -6, s: 0.7 }, { dx: 10, dy: -8, s: 0.65 }, { dx: 0, dy: 4, s: 0.75 }, { dx: 20, dy: 6, s: 0.7 }] },
  { kind: 'mountains', x: 930, y: 40, pts: [{ dx: -22, dy: -1, s: 0.6 }, { dx: 22, dy: -2, s: 0.55 }, { dx: 0, dy: 1, s: 0.7 }] },
  { kind: 'forest', x: 930, y: 112, pts: [{ dx: -14, dy: -6, s: 0.7 }, { dx: 12, dy: -4, s: 0.75 }, { dx: -2, dy: 6, s: 0.8 }] },
]

// Each section's own creature, beside its stop, so dividers differ. Dragons fly
// in the open sky above the horizon (tested): Радио's heads for the stop-2 peak
// over the rising leg, Meshtastic's circles over the climb from stop 3 to the
// summit. Ground creatures stand on the hill: stop 4 carries four sections, so
// the other three each get a different one in the open hill below the summit
// (x 800..890).
const OWN: Readonly<Record<SectionId, readonly BandArtifact[]>> = {
  lora: [{ kind: 'peril', peril: 'troll', x: 522, y: 120, scale: 0.55, flip: true, near: true }],
  radio: [flyer(530, 0.4, true)],
  start: [{ kind: 'peril', peril: 'warg', x: 748, y: 122, scale: 0.5, flip: true, near: true }],
  meshtastic: [flyer(736, 0.42, true)],
  meshcore: [{ kind: 'peril', peril: 'troll', x: 848, y: 104, scale: 0.6, flip: true, near: true }],
  reticulum: [{ kind: 'peril', peril: 'spider', x: 846, y: 98, scale: 0.55, flip: false, near: true }],
  // stop 4's own divider: a second dragon over the stop-2 → stop-3 dip, heading for the summit
  connect: [flyer(676, 0.42, true)],
  communities: [{ kind: 'peril', peril: 'warg', x: 850, y: 108, scale: 0.55, flip: true, near: true }],
}

/** Every artifact on a section's band: the shared terrain plus that section's creature. */
export function bandArtifacts(id: SectionId): readonly BandArtifact[] {
  return [...BASE, ...OWN[id]]
}
