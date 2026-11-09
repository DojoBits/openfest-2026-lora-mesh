// Slide 5 (agenda) as a quest trail: a winding trail over hills, from an inked
// start mark through four question stops to the summit, one stop per click. Each stop is a plain
// question with no sub-labels: which sections answer it is said aloud (notes).
//
// Geometry is in px of a fixed JOURNEY_W × JOURNEY_H canvas; the component
// draws an SVG with the same viewBox, so these numbers are the drawing.
// The strip above the stops is open sky, where the dragons fly (perilPlacement.ts).

export interface Point {
  x: number
  y: number
}

export interface JourneyStop extends Point {
  question: string
}

export const JOURNEY_W = 860
export const JOURNEY_H = 420
/** Marker radius (px). */
export const MARKER_R = 36

/** Where the trail starts, drawn as a small inked circle with a dot. */
export const TRAIL_START: Point = { x: 55, y: 300 }
/** Radius (px) of that start mark. */
export const START_R = 11

// Valley, peak, valley, summit: the trail climbs to the last stop.
export const JOURNEY_STOPS: readonly JourneyStop[] = [
  { question: 'Какво е LoRa?', x: 235, y: 330 },
  { question: 'Как работи?', x: 420, y: 225 },
  { question: 'Как да започна?', x: 600, y: 330 },
  { question: 'Как да се свържем?', x: 780, y: 195 },
]

export const JOURNEY_CLICKS = JOURNEY_STOPS.length

/**
 * Medallion art per stop, in talk order (JourneyIcons.vue kinds): what LoRa is,
 * how it reaches far, how to begin, how to connect. Shared by the slide-5 map
 * and the section-slide band so both show the same glyph at each stop.
 */
export const JOURNEY_ICONS = ['scroll', 'beacon', 'wizard', 'signpost'] as const

const clampStep = (step: number): number => Math.min(Math.max(Math.trunc(step), 0), JOURNEY_CLICKS)

/** Point the trail has reached after `step` clicks: 0 = start, k = stop k. Clamped. */
export function trailPoint(step: number): Point {
  const s = clampStep(step)
  const p = s === 0 ? TRAIL_START : JOURNEY_STOPS[s - 1]
  return { x: p.x, y: p.y }
}

/**
 * Leg `i` runs from trailPoint(i) to trailPoint(i + 1) as a cubic bezier with
 * horizontal tangents at both ends, so the trail rolls over each hill instead
 * of zig-zagging. Control points sit halfway across, at each end's height.
 */
function legControls(i: number): [Point, Point, Point, Point] {
  const a = trailPoint(i)
  const b = trailPoint(i + 1)
  const dx = (b.x - a.x) / 2
  return [a, { x: a.x + dx, y: a.y }, { x: b.x - dx, y: b.y }, b]
}

/** SVG path data for leg `i`. */
export function legPath(i: number): string {
  const [a, c1, c2, b] = legControls(i)
  return `M${a.x} ${a.y} C${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`
}

/** Point at parameter t ∈ [0, 1] along leg `i` (used by tests to keep labels off the trail). */
export function legPoint(i: number, t: number): Point {
  const [a, c1, c2, b] = legControls(i)
  const u = 1 - t
  const w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t]
  return {
    x: w[0] * a.x + w[1] * c1.x + w[2] * c2.x + w[3] * b.x,
    y: w[0] * a.y + w[1] * c1.y + w[2] * c2.y + w[3] * b.y,
  }
}

/**
 * A stop higher than both neighbours is a peak: its label goes above, where
 * the trail falls away on both sides. Every other stop is a valley and its
 * label goes below. The last stop has no next neighbour, so it is a peak when
 * it is above the previous one (the summit).
 */
export function labelSide(i: number): 'above' | 'below' {
  const prev = trailPoint(i).y
  const next = i + 1 < JOURNEY_CLICKS ? JOURNEY_STOPS[i + 1].y : Infinity
  const y = JOURNEY_STOPS[i].y
  return y < prev && y < next ? 'above' : 'below'
}

/** Label text box estimate at text-3xl bold: ~18 px per character, 40 px tall. */
const CHAR_W = 18
const LABEL_H = 40
const LABEL_GAP = 10

/** Box of stop `i`'s label, centred on the stop and kept inside the canvas. */
export function labelBox(i: number): { x0: number, y0: number, x1: number, y1: number } {
  const s = JOURNEY_STOPS[i]
  const w = s.question.length * CHAR_W
  const x0 = Math.min(Math.max(s.x - w / 2, 0), JOURNEY_W - w)
  const y0 = labelSide(i) === 'above' ? s.y - MARKER_R - LABEL_GAP - LABEL_H : s.y + MARKER_R + LABEL_GAP
  return { x0, y0, x1: x0 + w, y1: y0 + LABEL_H }
}
