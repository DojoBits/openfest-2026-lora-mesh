// Slide 11 „Електромагнитният спектър“: the whole electromagnetic spectrum as
// one arrow, long waves on the left, short on the right, with a white wave
// drawn inside it that keeps getting shorter. Not to scale (the real range is
// ~20 orders of magnitude); it only shows the order of the bands and where
// LoRa sits. x values are SVG units on a 1000-wide viewBox, so x/10 = % width.
import { fmt } from './format'
import { wavelengthCm } from './radio'

export interface EmBand {
  label: string
  /** Labels alternate above/below the arrow so each fits on one line. */
  row: 'above' | 'below'
  x0: number
  x1: number
}

/** Arrow body ends here; the arrow head runs from WAVE_X1 to 1000. */
export const WAVE_X1 = 940

export const EM_BANDS: readonly EmBand[] = [
  { label: 'Радиовълни', row: 'above', x0: 0, x1: 160 },
  { label: 'Микровълни', row: 'below', x0: 160, x1: 300 },
  { label: 'Инфрачервени', row: 'above', x0: 300, x1: 440 },
  { label: 'Видима светлина', row: 'below', x0: 440, x1: 540 },
  { label: 'Ултравиолетови', row: 'above', x0: 540, x1: 680 },
  { label: 'Рентгенови', row: 'below', x0: 680, x1: 810 },
  { label: 'Гама', row: 'above', x0: 810, x1: WAVE_X1 },
]

/** Click that reveals band `i`: one per band, long waves first. */
export function bandClick(i: number): number {
  return i + 1
}
/** LoRa mark comes after the last band. */
export const LORA_CLICK = EM_BANDS.length + 1
/** Clicks EmSpectrum registers on its slide. */
export const EM_CLICKS = LORA_CLICK

/** Rendered width of the component on the slide (px). */
export const SPECTRUM_W = 900
/** Label width estimate at text-xl semibold (Inter, Cyrillic): px per character. */
export const LABEL_CHAR_W = 13

/** Centre of band `i` in px of the rendered component. */
export function bandCentrePx(i: number): number {
  return ((EM_BANDS[i].x0 + EM_BANDS[i].x1) / 2 / 1000) * SPECTRUM_W
}

/** Estimated label width of band `i` in px. */
export function labelWidthPx(i: number): number {
  return EM_BANDS[i].label.length * LABEL_CHAR_W
}

// 433/868 MHz are UHF: by the textbook split they sit at the short end of the
// radio band, right before microwaves (Wi-Fi at 2,4 GHz is a microwave).
export const LORA_MARK = {
  x: 135,
  label: 'LoRa: 433 и 868 MHz',
  detail: `вълна ${fmt(wavelengthCm(433.92), 1)} cm и ${fmt(wavelengthCm(868), 1)} cm`,
} as const

// Wave period shrinks exponentially from P0 at x=0 to P1 at WAVE_X1.
const P0 = 170
const P1 = 12
const AMP = 16
const MID = 40

export function wavePeriod(x: number): number {
  return P0 * (P1 / P0) ** (x / WAVE_X1)
}

/**
 * SVG path of the wave. Phase is the running sum of dx/period, so each cycle
 * is as long as the local period (a plain sin(k·x) can't change wavelength).
 * Raising `shift` over time makes the wave travel left to right.
 */
export function wavePath(step = 0.5, shift = 0): string {
  const pts: string[] = []
  // `shift` moves the wave along the arrow (flow animation); taken mod 2π so a
  // full turn reproduces the start exactly and the loop never jumps.
  let phase = -(shift % (2 * Math.PI))
  for (let x = 0; x <= WAVE_X1 + 1e-9; x += step) {
    const y = MID - AMP * Math.sin(phase)
    pts.push(`${pts.length ? 'L' : 'M'}${x.toFixed(1).replace(/\.0$/, '')} ${y.toFixed(1)}`)
    phase += (2 * Math.PI * step) / wavePeriod(x)
  }
  return pts.join(' ')
}
