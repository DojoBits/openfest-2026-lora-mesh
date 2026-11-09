// Slide 13 „Chirp модулация“ (ChirpSpread.vue, tested in tests/chirpSpread.test.ts).
// Named `chirpSignal`, not `chirpSpread`: a data file must never share a name
// with a component (CLAUDE.md name-clash trap).
//
// The picture is the siren in traffic, drawn the way LoRa is usually shown:
// frequency (up) over time (right), so a chirp is a diagonal ramp.
//   click 1  up-chirp ramps across one channel, the last one wraps (data);
//            an inset right of the plot shows the first ramp as a wave
//            (amplitude over time) whose wiggles tighten left → right;
//   click 2  seeded grey speckles everywhere, denser than the ramp, ramp fades;
//   click 3  a dashed template with the same slope lands on the ramps, they
//            light up; the speckles stay scattered (no diagonal to match);
//   click 4  what SF means: a toy SF2 carries 2 bits per chirp, so it has
//            4 start frequencies (00 01 10 11), each the same chirp cyclically
//            shifted. SF7 has 2^7 = 128 start frequencies, SF12 4096;
//   click 5  SF7 vs SF12 to true scale over the same bandwidth, with a
//            bracket, a time axis in ms, bits per chirp, symbol time and the
//            sweep rate (bandwidth / symbol time) for each.
//
// Sources:
//   - Semtech SX1276/77/78/79 datasheet, Table 13 „Range of Spreading Factors“:
//     LoRa demodulator SNR SF7 −7,5 dB … SF12 −20 dB, 2,5 dB per step;
//   - Semtech AN1200.22 „LoRa Modulation Basics“: symbol = 2^SF chips,
//     symbol time 2^SF / BW, data = cyclic shift of the chirp,
//     SF bits per symbol, so 2^SF possible start frequencies.

import { fmt } from './format'

/** Click plan: chirp → noise → the receiver matches the shape → longer chirp. */
export const CHIRP_STEPS = { chirp: 1, noise: 2, match: 3, bits: 4, longer: 5 } as const
export const CHIRP_CLICKS = 5

/** The usual LoRa bandwidth (Meshtastic and MeshCore presets use 125 kHz or narrower). */
export const BW_HZ = 125_000

/** SX1276 Table 13: the lowest SNR at which each spreading factor still decodes. */
export const DEMOD_SNR: readonly { sf: number, snrDb: number }[] = [
  { sf: 7, snrDb: -7.5 },
  { sf: 8, snrDb: -10 },
  { sf: 9, snrDb: -12.5 },
  { sf: 10, snrDb: -15 },
  { sf: 11, snrDb: -17.5 },
  { sf: 12, snrDb: -20 },
]
/** Each SF step decodes 2,5 dB deeper under the noise. */
export const SNR_STEP_DB = 2.5

/** Chips in one chirp symbol: 2^SF. SF7 128, SF12 4096. */
export const chips = (sf: number): number => 2 ** sf

/** One symbol lasts 2^SF chips of 1/BW each: every SF step doubles the chirp. */
export const symbolMs = (sf: number, bwHz: number = BW_HZ): number => (chips(sf) / bwHz) * 1000

/**
 * Sweep rate in kHz per ms: the chirp crosses the whole bandwidth in one
 * symbol, so rate = BW / symbol time = BW² / 2^SF. Halves with every SF step.
 */
export const sweepKHzPerMs = (sf: number, bwHz: number = BW_HZ): number => (bwHz / 1000) / symbolMs(sf, bwHz)

// ── Geometry (SVG units, viewBox 0 0 VIEW.w VIEW.h) ──

export const VIEW = { w: 900, h: 385 } as const

/**
 * The main plot. x0/x1: time axis ends; fHi/fLo: top/bottom of the one
 * channel (SVG y grows down, so the high frequency has the smaller y);
 * base: y of the time axis, under the channel.
 */
export const PLOT = { x0: 64, x1: 650, fHi: 104, fLo: 312, base: 340 } as const

/** One chirp symbol on the main plot: SYMBOL.w wide, preamble starts at x0. */
export const SYMBOL = { x0: 96, w: 120, preamble: 3, shift: 0.4 } as const

export interface Segment { x1: number, y1: number, x2: number, y2: number }

/** Rise per unit of time (positive = up-chirp, since SVG y points down). */
export const slope = (s: Segment): number => (s.y1 - s.y2) / (s.x2 - s.x1)

/**
 * Ramp segments: `preamble` plain up-chirps (bottom → top), then one data
 * symbol, which is the same chirp cyclically shifted: it starts `shift` of
 * the way up the band, climbs to the top, wraps to the bottom and climbs back
 * to where it started. Every segment has the same slope, which is why one
 * template fits them all.
 */
export function rampSegments(): Segment[] {
  const { x0, w, preamble, shift } = SYMBOL
  const band = PLOT.fLo - PLOT.fHi
  const segs: Segment[] = []
  for (let i = 0; i < preamble; i++)
    segs.push({ x1: x0 + i * w, y1: PLOT.fLo, x2: x0 + (i + 1) * w, y2: PLOT.fHi })
  const start = x0 + preamble * w
  const yStart = PLOT.fLo - shift * band
  const xTop = start + (1 - shift) * w // time left until the top of the band
  segs.push({ x1: start, y1: yStart, x2: xTop, y2: PLOT.fHi })
  segs.push({ x1: xTop, y1: PLOT.fLo, x2: start + w, y2: yStart })
  return segs
}

/** SVG path for a set of segments (one M…L per segment). */
export const segmentsPath = (segs: Segment[]): string =>
  segs.map(s => `M${s.x1} ${s.y1} L${s.x2} ${s.y2}`).join(' ')

// ── Inset (clicks 1–3): one chirp as a time-domain wave ──

/** Which ramp the inset explains: the first chirp. */
export const LINKED_RAMP = 0

/** The framed card right of the plot, vertically centred on the channel. */
export const INSET = { x: 676, y: 158, w: 214, h: 100 } as const

/** A wave from x0 to x1 around y, period p0 at the start shrinking to p1. */
export interface WaveSpec { x0: number, x1: number, y: number, amp: number, p0: number, p1: number }

export const INSET_WAVE: WaveSpec = { x0: INSET.x + 14, x1: INSET.x + INSET.w - 14, y: INSET.y + INSET.h / 2, amp: 34, p0: 46, p1: 14 }

/**
 * Phase in cycles at distance u from the start. The frequency rises linearly
 * from f0 = 1/p0 to f1 = 1/p1 over the length L (a linear up-chirp), so the
 * phase is its integral: φ(u) = f0·u + (f1 − f0)·u² / (2L).
 */
const phase = (w: WaveSpec, u: number): number => {
  const L = w.x1 - w.x0
  return u / w.p0 + (1 / w.p1 - 1 / w.p0) * u * u / (2 * L)
}

/** Sampled points of the wave (SVG y down: a positive sine goes up). */
export function chirpPoints(w: WaveSpec, dx = 1): [number, number][] {
  const pts: [number, number][] = []
  for (let x = w.x0; x <= w.x1 + 1e-9; x += dx)
    pts.push([x, w.y - w.amp * Math.sin(2 * Math.PI * phase(w, x - w.x0))])
  return pts
}

export const chirpPath = (w: WaveSpec): string =>
  chirpPoints(w).map(([x, y], i) => `${i ? 'L' : 'M'}${+x.toFixed(2)} ${+y.toFixed(2)}`).join(' ')

/**
 * x of every zero crossing: φ(u) = k/2. With a = (f1 − f0)/(2L) that is the
 * quadratic a·u² + f0·u − k/2 = 0, positive root.
 */
export function zeroCrossings(w: WaveSpec): number[] {
  const L = w.x1 - w.x0
  const f0 = 1 / w.p0
  const a = (1 / w.p1 - f0) / (2 * L)
  const out: number[] = []
  for (let k = 0; ; k++) {
    const u = (-f0 + Math.sqrt(f0 * f0 + 2 * a * k)) / (2 * a)
    if (u > L + 1e-9) break
    out.push(w.x0 + u)
  }
  return out
}

/** Gaps between neighbouring zero crossings: shrink as the tone rises. */
export function wiggleSpacing(w: WaveSpec): number[] {
  const z = zeroCrossings(w)
  return z.slice(1).map((x, i) => x - z[i])
}

/** Seeded PRNG (mulberry32): the same noise on every render (never an unseeded random). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface Speckle { x: number, y: number, w: number, h: number }

/** Noise grid: one short blob per cell, jittered inside the cell. */
export const NOISE = { cols: 20, rows: 9, seed: 11 } as const

/**
 * Seeded speckles over the whole plot. One jittered blob per grid cell keeps
 * them evenly spread (every part of the plot gets noise) and random-looking,
 * so they never line up into a diagonal the template could match.
 */
export function speckles(seed: number = NOISE.seed): Speckle[] {
  const rnd = seededRandom(seed)
  const left = PLOT.x0 + 8
  const right = PLOT.x1 - 34
  const top = PLOT.fHi - 12
  const bottom = PLOT.base - 14
  const cw = (right - left) / NOISE.cols
  const ch = (bottom - top) / NOISE.rows
  const out: Speckle[] = []
  for (let r = 0; r < NOISE.rows; r++) {
    for (let c = 0; c < NOISE.cols; c++) {
      const w = 14 + rnd() * 18
      const h = 7 + rnd() * 5
      out.push({
        x: left + c * cw + rnd() * Math.max(0, cw - w),
        y: top + r * ch + rnd() * Math.max(0, ch - h),
        w,
        h,
      })
    }
  }
  return out
}

// ── Click 4: a toy SF2, what SF means ──

/**
 * Four small panels side by side, one per 2-bit pattern. Each shows the same
 * chirp started at k/4 of the band (k = the bits as a number): it climbs to
 * the top, wraps to the bottom and climbs back to where it started.
 */
const TOY_W = 180
export const TOY = {
  sf: 2,
  w: TOY_W,
  fHi: 100,
  fLo: 262,
  panels: [0, 1, 2, 3].map(k => ({ k, bits: k.toString(2).padStart(2, '0'), x0: 92 + k * 202 })),
} as const

/** The chirp of panel k, cyclically shifted by k/4 of the band. */
export function toySegments(k: number): Segment[] {
  const { w, fHi, fLo } = TOY
  const n = 2 ** TOY.sf
  const x0 = TOY.panels[k].x0
  const band = fLo - fHi
  const shift = k / n
  const yStart = fLo - shift * band
  if (k === 0) return [{ x1: x0, y1: fLo, x2: x0 + w, y2: fHi }]
  const xTop = x0 + (1 - shift) * w
  return [
    { x1: x0, y1: yStart, x2: xTop, y2: fHi },
    { x1: xTop, y1: fLo, x2: x0 + w, y2: yStart },
  ]
}

// ── Click 5: SF7 vs SF12 to true scale ──

/** Time scale of click 5: the SF12 symbol (32,768 ms) spans 570 px. */
export const PX_PER_MS = 570 / symbolMs(12)

/** Ticks of the click-5 time axis, in ms. */
export const TIME_TICKS_MS: readonly number[] = [0, 10, 20, 30]

/** The band size, written on the kHz bracket of each row. */
export const BW_LABEL = `${fmt(BW_HZ / 1000)} kHz`

/** Click 5 rows: one band height for both, width = symbol time to scale. */
export interface ChirpRow {
  id: 'short' | 'long'
  sf: 7 | 12
  /** symbol time, „1 ms“ */
  time: string
  /** sweep rate, „122 kHz/ms“ */
  sweep: string
  x0: number
  w: number
  fHi: number
  fLo: number
  seg: Segment
}

// Three significant figures: 122 kHz/ms, 3,8 kHz/ms.
const sweepLabel = (sf: number): string => {
  const v = sweepKHzPerMs(sf)
  return `${fmt(v, v >= 10 ? 0 : 1)} kHz/ms`
}

const row = (id: ChirpRow['id'], sf: ChirpRow['sf'], fHi: number): ChirpRow => {
  const x0 = 300
  const fLo = fHi + 72
  const w = symbolMs(sf) * PX_PER_MS
  return {
    id, sf, x0, w, fHi, fLo,
    time: `${fmt(symbolMs(sf))} ms`,
    sweep: sweepLabel(sf),
    seg: { x1: x0, y1: fLo, x2: x0 + w, y2: fHi },
  }
}

export const ROWS: readonly ChirpRow[] = [
  row('short', 7, 112),
  row('long', 12, 248),
]

/** y of the click-5 time axis, under the long row. */
export const TIME_AXIS_Y = 336
