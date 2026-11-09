// Slide 18 „Обхват според терена“ (RangeZones.vue): a side view of a beacon
// tower with a router, the town to its left, forest and open land to its right.
// One signal dome per click: town, forest, open land; click 4 adds the records.
// The scene is NOT to scale: the km labels carry the numbers, the pixels only
// keep the order (town < forest < open). The per-terrain ranges are rough rules
// of thumb from the speaker's brief, not primary-sourced (research/T1-radio-lora.md
// only has „Meshtastic typical 2–5 km“, secondary); records as on the old
// research notes (research/T1-radio-lora.md §5): 331 km Meshtastic peak to
// peak, 832 km LoRaWAN ground to balloon (2020), 1336 km LoRaWAN at sea level
// with tropospheric ducting (2023).
//
// Not named rangeZones.ts: a data file that matches a component name
// case-insensitively breaks the dev server (CLAUDE.md „Name-clash trap“).

/** SVG viewBox and the ground line. */
export const RZ_W = 1000
export const RZ_H = 458
export const RZ_GROUND = 330

/** Router antenna tip: every dome is centred here. About a third in from the left. */
export const ANTENNA = { x: 330, y: 232 } as const
/** Stone beacon tower under the antenna, standing on a small hill. */
export const TOWER = { x: ANTENNA.x, w: 36, top: 256, base: 316 } as const
/** Hill under the tower: foot to foot on the ground, crown at the tower base. */
export const HILL = { from: ANTENNA.x - 78, to: ANTENNA.x + 78, top: TOWER.base } as const

export type ZoneId = 'town' | 'forest' | 'open'

export interface RangeZone {
  id: ZoneId
  /** Small header at the top of the strip. */
  header: string
  /** Big label on the double arrow. */
  label: string
  /** Click that shows this dome. */
  at: number
  /** Which way the arrow runs from the tower. */
  side: 'left' | 'right'
  /** Ground distance (px) from the tower to where the dome touches the ground. */
  reach: number
  /**
   * Height of the double arrow. Arrows run like map dimension lines in the land
   * band under the ground line, from the tower foot to the dome's ground point.
   */
  arrowY: number
}

export const RANGE_ZONES: readonly RangeZone[] = [
  { id: 'town', header: 'град', label: 'град: 1–3 km', at: 1, side: 'left', reach: 250, arrowY: 384 },
  { id: 'forest', header: 'гора', label: 'гора: 2–5 km', at: 2, side: 'right', reach: 300, arrowY: 384 },
  { id: 'open', header: 'открито', label: 'пряка видимост: 10–20+ km', at: 3, side: 'right', reach: 570, arrowY: 440 },
]

/**
 * Click 4: a dashed arrow at antenna height from the open-land dome's edge off
 * the right edge of the scene, and the records tag right above it.
 */
export const RANGE_RECORDS_TAG = {
  at: 4,
  title: 'рекорди',
  lines: [
    '331 km — от връх до връх (Meshtastic)',
    '832 km — до балон',
    '1336 km — над морето, с помощ от атмосферата',
  ],
  // Title row + three lines, 36 units apart; bottom (210) stays above the antenna (232).
  box: { x: 396, y: 48, w: 592, h: 162 },
} as const

export const RANGE_ZONE_CLICKS = 4

// ── Dome geometry ─────────────────────────────────────────────────────────────
// A dome is an ellipse centred on the antenna, a little flatter than a circle
// (ry = SQUASH · rx) so the big ones still read as domes in a wide, short scene.
// The antenna sits DY above the ground, so the ellipse must be wider than the
// reach to touch the ground exactly at (antenna.x ± reach, ground):
//   (reach / rx)² + (DY / ry)² = 1,  ry = SQUASH · rx
//   ⇒ rx² = reach² + (DY / SQUASH)²
// The part below the ground is clipped away by the component.
const SQUASH = 0.5
const DY = RZ_GROUND - ANTENNA.y

export interface Dome { cx: number, cy: number, rx: number, ry: number }

export function dome(z: RangeZone): Dome {
  const rx = Math.hypot(z.reach, DY / SQUASH)
  return { cx: ANTENNA.x, cy: ANTENNA.y, rx, ry: SQUASH * rx }
}

/** x where the dome touches the ground: the end of the zone's double arrow. */
export function arrowEnd(z: RangeZone): number {
  return z.side === 'left' ? ANTENNA.x - z.reach : ANTENNA.x + z.reach
}

/** x on the dome edge at height y (right half), for placing things beyond it. */
export function domeEdgeX(z: RangeZone, y: number): number {
  const d = dome(z)
  // Solve the ellipse for x: x = cx + rx · √(1 − ((y − cy) / ry)²).
  return d.cx + d.rx * Math.sqrt(1 - ((y - d.cy) / d.ry) ** 2)
}

/**
 * Vertical background strips: town from the left edge to the tower, forest from
 * the tower to the forest dome's widest point, open land to the right edge.
 * Each dome is clipped to its own strip.
 */
export function zoneStrips(): { id: ZoneId, x0: number, x1: number }[] {
  const forestEnd = Math.round(ANTENNA.x + dome(RANGE_ZONES[1]).rx)
  return [
    { id: 'town', x0: 0, x1: ANTENNA.x },
    { id: 'forest', x0: ANTENNA.x, x1: forestEnd },
    { id: 'open', x0: forestEnd, x1: RZ_W },
  ]
}

/** Earlier domes stay, slightly dimmed, once a newer dome is shown. */
export const DOME_DIM = 0.55

export function domeOpacity(step: number, at: number): number {
  if (step < at) return 0
  // newest dome on screen at this step (click 4 adds no dome)
  const newest = Math.max(...RANGE_ZONES.filter(z => z.at <= step).map(z => z.at))
  return at === newest ? 1 : DOME_DIM
}

// ── Scenery (map glyphs, placed once here so tests keep them in their strip) ──
export interface House { x: number, w: number, h: number, keep?: boolean }
/** Town houses, left to right, standing on the ground; one small stone keep. */
export const HOUSES: readonly House[] = [
  { x: 86, w: 28, h: 26 },
  { x: 118, w: 24, h: 38, keep: true },
  { x: 148, w: 30, h: 22 },
  { x: 184, w: 26, h: 30 },
  { x: 216, w: 30, h: 20 },
]

/** Forest trees (MapGlyphs forest offsets): a back row and a front row. */
export const FOREST_TREES: readonly { x: number, y: number }[] = [
  ...[420, 458, 496, 534, 572, 610].map(x => ({ x, y: RZ_GROUND - 8 })),
  ...[401, 439, 477, 515, 553, 591, 629].map(x => ({ x, y: RZ_GROUND })),
]

/** Far hilltops at the right edge of the open land (MapGlyphs mountains). */
export const FAR_HILLS: readonly { x: number, s: number }[] = [
  { x: 878, s: 1 },
  { x: 918, s: 1.35 },
  { x: 962, s: 1.1 },
]
