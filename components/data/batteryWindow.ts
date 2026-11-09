// Slide 24 „Батерии: химия и напрежение“: values and geometry of
// BatteryVoltages.vue (tested in tests/batteryVoltages.test.ts). Named
// `batteryWindow`, not `batteryVoltages`: a data file must never share a name
// with a component (CLAUDE.md „Name-clash trap“).
//
// Every number is from research/T10-first-power-batteries.md (verified items):
//   board window  Heltec V4 „3.3–4.4V lithium battery“; RAK19003/19007 battery
//                 must not exceed 4.3 V, range 3.3–3.7–4.3 V, charges to 4.2 V
//   Li-ion/LiPo   one cell, charged to 4.2 V by the board (bar starts at the
//                 boards' 3.3 V lower limit, so it sits inside the window)
//   LiFePO4       Battery University: 3.20 V nominal, 3.65 V full; a regular
//                 Li-ion charger overcharges it
//   2S pack       2 × 4.2 = 8.4 V full, 7.4 V nominal; ~2× the board limits.
//                 Bar 6,6–8,4 V = the Li-ion bar (3,3–4,2 V) doubled, so the
//                 label „до 8,4 V“ names the bar's end like the Li-ion row
//   solar         Heltec V4 4.7–6 V input; RAK19007 5 V panels, max 5.5 V,
//                 12 V „will destroy the charging unit“

/** SVG viewBox. */
export const BV_W = 1000
export const BV_H = 392

/** Voltage ruler: min/max volts mapped onto x0..x1, axis line at y. */
export const BV_RULER = { min: 2.5, max: 9, x0: 150, x1: 960, y: 344 } as const

/** Volts → SVG x on the ruler (linear). */
export function vx(volts: number): number {
  const r = BV_RULER
  return r.x0 + ((volts - r.min) / (r.max - r.min)) * (r.x1 - r.x0)
}

/** Tick marks every 0,5 V; whole volts are labelled. */
export const BV_TICKS: readonly { v: number, major: boolean }[] = Array.from(
  { length: Math.round((BV_RULER.max - BV_RULER.min) * 2) + 1 },
  (_, i) => {
    const v = BV_RULER.min + i * 0.5
    return { v, major: Number.isInteger(v) }
  },
)

/**
 * What the board accepts on its battery input: solid up to 4,3 V (RAK limit),
 * a paler strip to 4,4 V (Heltec V4 limit), hence the „~4,3–4,4“ label.
 */
export const BOARD_WINDOW = {
  from: 3.3,
  solidTo: 4.3,
  to: 4.4,
  label: 'вход за батерия: до ~4,3–4,4 V',
  top: 44,
} as const

export type BatteryId = 'liion' | 'lifepo4' | '2s'

export interface BatteryBar {
  id: BatteryId
  /** Main label (tested, exact). */
  label: string
  from: number
  to: number
  /** Where the board charger pushes this chemistry, if beyond `to`. */
  overchargeTo?: number
  /** Red warning lines under the label (joined = the full sentence). */
  warn?: readonly string[]
  cells: 1 | 2
  /** True when the whole bar sits inside the board window. */
  fits: boolean
  at: number
  /** Bar centre line. */
  y: number
  /** Label font size (SVG units) and anchor point. */
  size: number
  labelX: number
  labelY: number
  labelAnchor: 'start' | 'end'
}

/** One bar per click: what fits, what fits but gets overcharged, what does not. */
export const BATTERY_BARS: readonly BatteryBar[] = [
  {
    id: 'liion',
    label: 'Li-ion / LiPo: 1 клетка, до 4,2 V',
    from: 3.3,
    to: 4.2,
    cells: 1,
    fits: true,
    at: 1,
    y: 86,
    size: 28,
    labelX: 410,
    labelY: 96,
    labelAnchor: 'start',
  },
  {
    id: 'lifepo4',
    label: 'LiFePO4: 3,2 V, пълна при 3,65 V',
    from: 3.2,
    to: 3.65,
    overchargeTo: 4.2,
    warn: ['вграденото зарядно я пълни до 4,2 V', '→ презареждане'],
    cells: 1,
    fits: true,
    at: 2,
    y: 166,
    size: 28,
    labelX: 410,
    labelY: 166,
    labelAnchor: 'start',
  },
  {
    id: '2s',
    label: '2 клетки последователно: до 8,4 V',
    from: 6.6,
    to: 8.4,
    cells: 2,
    fits: false,
    at: 3,
    y: 300,
    size: 28,
    labelX: 410,
    labelY: 268,
    labelAnchor: 'start',
  },
]

/** Click 4: a separate card under the ruler, not a bar on it. */
export const SOLAR_CARD = {
  at: 4,
  title: 'соларен панел: 5 V',
  lines: ['Heltec V4: 4,7–6 V · RAK19007: до 5,5 V', '12 V панел изгаря зарядното (RAK19007)'],
} as const
