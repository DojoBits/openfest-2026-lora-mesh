// Band edges and limits for BandStrip. Sources: research/T1-radio-lora.md §4
// (ETSI EN 300 220-2 and КРС Приложение 2.1 agree; LTE band 20 from T1 §1).
import type { ProjectColour, Tone } from './tones'
import { fmt } from './format'

export interface SubBand {
  id: string
  from: number
  to: number
  mw: number
  dutyPct: number
}

export const EU868_SUBBANDS: SubBand[] = [
  { id: 'K', from: 863, to: 865, mw: 25, dutyPct: 0.1 },
  { id: 'L', from: 865, to: 868, mw: 25, dutyPct: 1 },
  { id: 'M', from: 868, to: 868.6, mw: 25, dutyPct: 1 },
  { id: 'N', from: 868.7, to: 869.2, mw: 25, dutyPct: 0.1 },
  { id: 'P', from: 869.4, to: 869.65, mw: 500, dutyPct: 10 },
  { id: 'Q', from: 869.7, to: 870, mw: 25, dutyPct: 1 },
]

export const dutySecondsPerHour = (pct: number): number => Math.round(3600 * pct / 100)

/** A block on the strip. `highlightAt`: grows taller and switches to `highlightTone`. */
export interface BandBlock {
  from: number
  to: number
  label: string
  detail?: string
  tone: Tone
  at?: number
  highlightAt?: number
  highlightTone?: Tone
  highlightLabel?: string
}

export interface BandPin { f: number, label: string, ring: ProjectColour, at?: number }
export interface BandGap { from: number, to: number, label: string, at?: number }

export interface BandPreset {
  from: number
  to: number
  bands: BandBlock[]
  pins: BandPin[]
  gaps: BandGap[]
  /** Zoom the axis to this window at step `zoomAt`, so close pins separate. */
  zoom?: { from: number, to: number, at: number }
  chip?: { text: string, at: number }
  axisTicks: number[]
}

export const BAND_PRESETS: Record<'eu868' | 'lte', BandPreset> = {
  // Slide 16: „Правилата: 869,4–869,65 MHz“
  eu868: {
    from: 863,
    to: 870,
    bands: EU868_SUBBANDS.map(b => ({
      from: b.from,
      to: b.to,
      label: b.id,
      detail: `${b.mw} mW · ${fmt(b.dutyPct, b.dutyPct < 1 ? 1 : 0)} %`,
      tone: 'slate' as Tone,
      at: 1,
      ...(b.id === 'P'
        ? { highlightAt: 2, highlightTone: 'amber' as Tone, highlightLabel: '500 mW · 10 %' }
        : {}),
    })),
    pins: [
      { f: 869.525, label: 'Meshtastic 869,525', ring: 'cyan', at: 3 },
      { f: 869.618, label: 'MeshCore 869,618', ring: 'indigo', at: 3 },
    ],
    gaps: [],
    zoom: { from: 869.3, to: 869.75, at: 3 },
    chip: { text: `${dutySecondsPerHour(10)} s ефир / час`, at: 4 },
    axisTicks: [863, 865, 868, 869.4, 869.65, 870],
  },
  // Hidden slide „На 1 MHz от телефона ви“ (CUT candidate, between 12 and 13): LTE 800 uplink vs SRD, 1 MHz apart
  lte: {
    from: 830,
    to: 871,
    bands: [
      { from: 832, to: 862, label: 'LTE 800 uplink', detail: '832–862 MHz', tone: 'slate' },
      { from: 863, to: 870, label: 'SRD', detail: '863–870', tone: 'blue' },
    ],
    pins: [],
    gaps: [{ from: 862, to: 863, label: '1 MHz', at: 1 }],
    axisTicks: [832, 862, 870],
  },
}
