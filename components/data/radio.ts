// Radio physics helpers + the slide data derived from them.
// Every number on the Радио slides comes from these functions, and
// tests/radio.test.ts pins them to research/T1-radio-lora.md.
import type { Tone } from './tones'
import { fmt } from './format'

const C = 299_792_458 // m/s

export const wavelengthCm = (mhz: number): number => (C / (mhz * 1e6)) * 100
export const quarterWaveCm = (mhz: number): number => wavelengthCm(mhz) / 4

/** Free-space path loss, ITU-R P.525: 20·log10(d km) + 20·log10(f MHz) + 32.44. */
export const fsplDb = (km: number, mhz: number): number =>
  20 * Math.log10(km) + 20 * Math.log10(mhz) + 32.44

/** In free space, every 20·log10(2) ≈ 6 dB of budget doubles the range. */
export const rangeRatioFromDb = (db: number): number => 10 ** (db / 20)

export const dbmToMw = (dbm: number): number => 10 ** (dbm / 10)
export const dbmToWatts = (dbm: number): number => dbmToMw(dbm) / 1000

/** Radio horizon with standard 4/3-Earth refraction: d ≈ 4.12·√h (km, h in m). */
export const horizonKm = (heightM: number): number => 4.12 * Math.sqrt(heightM)

/** First Fresnel zone radius (m) at the midpoint of a `km` link: 17.32·√(d1·d2 / (f·D)). */
export function fresnelRadiusM(km: number, mhz: number, d1Km = km / 2): number {
  const d2 = km - d1Km
  return 17.32 * Math.sqrt((d1Km * d2) / ((mhz / 1000) * km))
}

function lambdaLabel(mhz: number): string {
  const cm = wavelengthCm(mhz)
  return cm >= 100 ? `${fmt(cm / 100, 2)} m` : `${fmt(cm, 1)} cm`
}

// ── SpectrumRuler (gallery only) ─────────────────────────────────────────────────
export interface SpectrumMarker {
  mhz: number
  label: string
  lambdaLabel: string
  tone: Tone
  at?: number
}

// 2,4 GHz uses 2440 MHz (band centre), as in the T1 table: λ = 12,3 cm.
export const SPECTRUM_MARKERS: SpectrumMarker[] = [
  { mhz: 100, label: 'FM 100 MHz', tone: 'slate', at: 1 },
  { mhz: 433.92, label: '433 MHz', tone: 'slate', at: 2 },
  { mhz: 868, label: '868 MHz', tone: 'blue', at: 2 },
  { mhz: 2440, label: '2,4 GHz Wi-Fi', tone: 'slate', at: 3 },
].map(m => ({ ...m, lambdaLabel: lambdaLabel(m.mhz) }) as SpectrumMarker)

// ── AntennaScale (gallery only) ──────────────────────────────────────────────────
export interface AntennaItem {
  mhz: number
  label: string
  cm: number
  tone: Tone
  at?: number
  /** Draw a finger silhouette beside this whip, to the same scale. */
  finger?: boolean
}

export const ANTENNAS: AntennaItem[] = [
  { mhz: 100, label: 'FM', tone: 'slate', at: 1 },
  { mhz: 433.92, label: '433 MHz', tone: 'slate', at: 2 },
  { mhz: 868, label: '868 MHz', tone: 'blue', at: 3, finger: true },
  { mhz: 2440, label: '2,4 GHz', tone: 'slate', at: 4 },
].map(a => ({ ...a, cm: quarterWaveCm(a.mhz) }))

// ── ReachBars (slide 15) ─────────────────────────────────────────────────────
// Same power, same antennas, free space: the free-space loss gap between the
// two frequencies (≈ 9 dB, any distance) turns into a reach ratio (×2,8).
// 433 MHz goes another 6 dB (×2) further, but in the EU it is capped at 10 mW,
// which the notes say; the slide keeps equal power on purpose.
export interface SubBand { mw: number, label: string }
export interface ReachBar {
  label: string
  relative: number
  multiple: string
  /** Free-space path loss at 10 km, dB (same formula as the previous slide). */
  lossDb: number
  lossLabel: string
  /** Wave drawn beside the radio: wavelength in px, proportional to the real one. */
  waveLenPx: number
  wavePath: string
  /** Transmit power (mW) that gives the same received signal at 10 km as 868 MHz at 25 mW (bulb size only). */
  neededMw: number
  /** The same power as a multiple of 868 MHz's, exact (10^(Δloss/10)) and as shown ("8×", "1×", "¼×"). */
  powerRatio: number
  powerLabel: string
  /** Bulb size for the needed power: grows with the fourth root of mW, so 6 mW stays visible and 200 mW stays modest. */
  bulbScale: number
  tone: Tone
  at: number
  /** EU power limit (mW), its tag text and the click it appears on. */
  limitMw: number
  limitLabel: string
  /** Narrow sub-band with a higher limit than limitMw (868 MHz: 500 mW in 869,4–869,65 MHz); shown as a highlighted second tag line. */
  subBand?: SubBand
  limitAt: number
  /** The band the networks use: stays bright when the limits appear. */
  highlight?: boolean
}

// One baseline for the whole slide: 868 MHz (the Meshtastic / MeshCore band in Europe).
// Reach ratio = 10^(Δloss/20): a band that loses less reaches further.
const reachVs868 = (mhz: number): number => rangeRatioFromDb(fsplDb(10, 868) - fsplDb(10, mhz))
const LIMIT_CLICK = 4
// Wave beside each radio: 1 cm of real wavelength = 1,2 px, so 2,4 GHz (12,3 cm)
// is a tight 15 px wave and 433 MHz (69 cm) one long swell in the 100 px box.
export const WAVE_BOX = { width: 100, amp: 13, pxPerCm: 1.2 }
export const wavePathD = (lenPx: number, width: number = WAVE_BOX.width, amp: number = WAVE_BOX.amp): string => {
  const pts: string[] = []
  for (let x = 0; x <= width; x += 2) pts.push(`${x} ${(Math.sin((2 * Math.PI * x) / lenPx) * amp).toFixed(1)}`)
  return `M${pts.join(' L')}`
}
// Reference link: 868 MHz at 25 mW. Any other band needs more or less power
// by the same dB gap as its free-space loss at 10 km (power ratio = 10^(dB/10)).
export const REF_MW = 25
const REF_LOSS_DB = fsplDb(10, 868)
// Round to a figure a speaker can say: whole mW, tens above 100 mW.
const roundMw = (mw: number): number => (mw >= 100 ? Math.round(mw / 10) * 10 : Math.round(mw))
export const neededMwFor = (lossDb: number): number => roundMw(REF_MW * 10 ** ((lossDb - REF_LOSS_DB) / 10))
// Power multiple as a speaker says it: whole number above 1, unit fractions below.
export const powerLabelFor = (ratio: number): string => {
  if (ratio >= 1.5) return `${fmt(Math.round(ratio))}×`
  if (ratio > 0.8) return '1×'
  const n = Math.round(1 / ratio)
  const glyph: Record<number, string> = { 2: '½', 3: '⅓', 4: '¼', 8: '⅛' }
  return `${glyph[n] ?? `1/${n}`}×`
}
const bulbScaleFor = (mw: number): number => 0.75 * (mw / REF_MW) ** 0.25
const bar = (label: string, mhz: number, relative: number, tone: Tone, at: number, limitMw: number, highlight?: boolean, subBand?: SubBand): ReachBar => {
  const lossDb = fsplDb(10, mhz)
  const waveLenPx = wavelengthCm(mhz) * WAVE_BOX.pxPerCm
  const neededMw = neededMwFor(lossDb)
  const powerRatio = 10 ** ((lossDb - REF_LOSS_DB) / 10)
  return {
    label,
    relative,
    // 2 decimals below 1× (0,36×), whole numbers when exact (1×, 2×)
    multiple: `${fmt(relative, Math.abs(relative - Math.round(relative)) < 0.005 ? 0 : 2)}×`,
    lossDb,
    lossLabel: `−${fmt(lossDb, 0)} dB`,
    waveLenPx,
    wavePath: wavePathD(waveLenPx),
    neededMw,
    powerRatio,
    powerLabel: powerLabelFor(powerRatio),
    bulbScale: bulbScaleFor(neededMw),
    tone,
    at,
    limitMw,
    limitLabel: `Европа: до ${limitMw} mW`,
    limitAt: LIMIT_CLICK,
    ...(subBand ? { subBand } : {}),
    ...(highlight ? { highlight } : {}),
  }
}
export const REACH_BARS: ReachBar[] = [
  // Rows go by frequency, clicks by story: 868 (reference) first, then 2,4 GHz, then 433.
  bar('2,4 GHz', 2440, reachVs868(2440), 'slate', 2, 100),
  // 863–870 MHz is 25 mW almost everywhere; 500 mW only in 869,4–869,65 MHz (non-breaking spaces keep value and unit together).
  bar('868 MHz', 868, 1, 'blue', 1, 25, true, { mw: 500, label: 'до 500\u00a0mW в 869,4–869,65\u00a0MHz' }),
  bar('433 MHz', 433.92, reachVs868(433.92), 'slate', 3, 10),
]

// ── DbLadder (gallery only) ─────────────────────────────────────────────────────
export interface DbRung { dbm: number, mw: string, label: string, tone: Tone, at?: number }

export const DB_RUNGS: DbRung[] = [
  // 27 dBm is 501 mW; the regulation states the limit as 500 mW e.r.p.
  { dbm: 27, mw: '500 mW', label: 'лимит в една тясна лента', tone: 'amber', at: 1 },
  { dbm: 22, mw: `${fmt(dbmToMw(22), 0)} mW`, label: 'колкото може чипът', tone: 'slate', at: 2 },
  { dbm: 14, mw: `${fmt(dbmToMw(14), 0)} mW`, label: 'обичайният лимит', tone: 'slate', at: 3 },
]
export const DB_GAP = {
  dbm: -137,
  label: `${fmt(dbmToWatts(-137) * 1e18, 0)} аттовата — чува`,
  /** Link budget SX1262: +22 dBm TX vs −137 dBm sensitivity (SF12, 125 kHz, no antennas). */
  txDbm: 22,
  budget: `${fmt(22 - -137, 0)} dB`,
  budgetSub: 'разликата',
  at: 4,
}
export const DB_PAYOFF = { text: `+6 dB ≈ ${fmt(rangeRatioFromDb(6), 0)}× разстояние`, at: 5 }

// ── HorizonCurve (gallery only) ─────────────────────────────────────────────────
export interface Mast { label: string, heightM: number, km: number, glyph: 'person' | 'roof' | 'mountain', at?: number, kmLabel: string }

// Черни връх: storyboard shows only "≈ 197 km" (4,12·√2290) and no elevation figure.
export const MASTS: Mast[] = [
  { label: 'Ръка, 2 m', heightM: 2, glyph: 'person', at: 1 },
  { label: 'Покрив, 30 m', heightM: 30, glyph: 'roof', at: 2 },
  { label: 'Черни връх', heightM: 2290, glyph: 'mountain', at: 3 },
].map((m) => {
  const km = horizonKm(m.heightM)
  const kmLabel = m.glyph === 'mountain' ? `≈ ${fmt(km, 0)} km` : `${fmt(km, 1)} km`
  return { ...m, km, kmLabel } as Mast
})

// ── FresnelZone (hidden slide) ──────────────────────────────────────────────────
export const FRESNEL = {
  km: 10,
  mhz: 868,
  radiusM: fresnelRadiusM(10, 868),
  clearM: 0.6 * fresnelRadiusM(10, 868),
}

// ── ScaleBars (slide 18): distances, log scale ──────────────────────────────
export interface ScaleItem { label: string, from?: number, value: number, valueLabel: string, tone: Tone, tag?: string, at?: number }

export const RANGE_RECORDS: ScaleItem[] = [
  { label: 'LoRaWAN в град (до гейтуей)', from: 0.025, value: 0.1, valueLabel: '25–100 m', tone: 'slate', at: 1 },
  { label: 'Meshtastic, връх–връх', value: 331, valueLabel: '331 km', tone: 'blue', at: 2 },
  { label: 'LoRaWAN рекорд', value: 1336, valueLabel: '1336 km', tone: 'blue', tag: 'атмосферата помогна', at: 3 },
]

// ── NoiseFloor (gallery only) ───────────────────────────────────────────────────
/** Thermal noise in 125 kHz: −174 + 10·log10(BW). */
export const thermalNoiseDbm = (bwHz: number): number => -174 + 10 * Math.log10(bwHz)
/** Receiver noise figure (SX1262-class); real floor = thermal + NF ≈ −117 dBm. */
export const RX_NF_DB = 6
// −117 + (−20 dB SF12 SNR limit) = −137 dBm, the same sensitivity as DB_GAP (DbLadder, gallery only).
export const NOISE = { noiseDbm: Math.round(thermalNoiseDbm(125_000)) + RX_NF_DB, snrDb: -20 }
