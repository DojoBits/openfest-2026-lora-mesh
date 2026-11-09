// Slide 17 „Различни ленти по света“: which sub-GHz band each region allows for
// LoRa, plus the 2,4 GHz band that is the same everywhere. Band edges:
//   - Europe (EU_868, EU_433): ETSI EN 300 220-2 / КРС, research/T1-radio-lora.md §4.
//     (Meshtastic itself uses only the 869,4–869,65 slice of EU868; slide in 02-lora.)
//   - all other rows: Meshtastic firmware 2.7.26 region table
//     (src/mesh/RadioInterface.cpp, RDEF rows), checked 2026-10-27.
// `code` is the Meshtastic region name you pick in the app. `at` is the click.
// (File name differs from the component on purpose: name-clash trap in CLAUDE.md.)
import { fmt } from './format'

export interface RegionBand {
  region: string
  mhz: readonly [number, number]
  code: string
  /** Our band (Bulgaria): drawn in the accent colour. */
  home?: boolean
  at: number
}

export const REGION_BANDS: readonly RegionBand[] = [
  { region: 'Европа, вкл. България', mhz: [863, 870], code: 'EU_868', home: true, at: 1 },
  { region: 'Европа, втора лента', mhz: [433.05, 434.79], code: 'EU_433', at: 1 },
  { region: 'САЩ', mhz: [902, 928], code: 'US', at: 2 },
  { region: 'Австралия, Нова Зеландия', mhz: [915, 928], code: 'ANZ', at: 2 },
  { region: 'Япония', mhz: [920.5, 923.5], code: 'JP', at: 3 },
  { region: 'Корея', mhz: [920, 923], code: 'KR', at: 3 },
  { region: 'Индия', mhz: [865, 867], code: 'IN', at: 3 },
  { region: 'Китай', mhz: [470, 510], code: 'CN', at: 3 },
]

/** Last click: 2,4 GHz LoRa (Semtech SX1280), allowed everywhere, shorter reach. */
export const LORA_24 = { region: 'Навсякъде', mhz: [2400, 2483.5] as const, code: 'LORA_24', chip: 'SX1280', at: 4 }

export const REGION_CLICKS = LORA_24.at

// ── Broken axis ──
// Nothing sits between 520 and 840 MHz, so the axis is two 100 MHz pieces with
// a gap. Same MHz per % on both sides, so bar widths stay comparable.
export interface AxisSegment { from: number, to: number, /** % of the track */ start: number, width: number, ticks: number[] }

/** % of the track left empty between the pieces, for the „//“ mark. */
export const AXIS_GAP = 10
const PIECE = (100 - AXIS_GAP) / 2
const step20 = (from: number, to: number) => Array.from({ length: (to - from) / 20 + 1 }, (_, i) => from + i * 20)
export const AXIS_SEGMENTS: readonly AxisSegment[] = [
  { from: 420, to: 520, start: 0, width: PIECE, ticks: step20(420, 520) },
  { from: 840, to: 940, start: PIECE + AXIS_GAP, width: PIECE, ticks: step20(840, 940) },
]

/** Position of a frequency on the broken axis, 0–100 % of the track. */
export function axisPct(mhz: number): number {
  const g = AXIS_SEGMENTS.find(x => mhz <= x.to) ?? AXIS_SEGMENTS[AXIS_SEGMENTS.length - 1]
  return g.start + ((mhz - g.from) / (g.to - g.from)) * g.width
}

/** „863–870 MHz“: decimal comma, en dash, only the decimals the edge has. */
export const bandLabel = ([lo, hi]: readonly [number, number], unit = true): string => {
  const f = (n: number) => fmt(n, Number.isInteger(n) ? 0 : String(n).split('.')[1].length)
  return `${f(lo)}–${f(hi)}${unit ? ' MHz' : ''}`
}
