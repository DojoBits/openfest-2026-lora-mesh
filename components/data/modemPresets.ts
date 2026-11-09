// Meshtastic modem presets for <PresetTable> (slide 32 „Какво е preset“).
//
// A preset is a name for three LoRa settings: spreading factor (SF),
// bandwidth (BW) and coding rate (CR). Every node in one mesh must use the
// same preset, or the radios cannot decode each other.
//
// Sources (checked 2026-11-04, firmware v2.7.26, commit 54e0d8d):
//  - src/mesh/MeshRadio.h modemPresetToParams: SF / BW / CR per preset
//    (narrow-band branch, wideLora = false, which is every sub-GHz region).
//  - src/mesh/RadioInterface.cpp: RDEF(EU_868, 869.4f, 869.65f, …), a 250 kHz
//    span. A preset wider than the region span falls back to LONG_FAST.
//  - src/mesh/RadioInterface.h: preambleLength = 16.
//  - protobufs config.proto (6b1ded4) ModemPreset: LITE_FAST/SLOW and
//    NARROW_FAST/SLOW exist, but modemPresetToParams has no case for them, so
//    they hit `default` and run as LONG_FAST. There is no TINY preset.
//  - Semtech SX1276 datasheet Table 13: demodulator SNR limit per SF.
//  - mesh.motaba.net „Modem Presets by City“ for the Bulgarian tags.
import { bitrateBps, timeOnAirMs } from './airtime'
import { fmt } from './format'
import { RX_NF_DB, thermalNoiseDbm } from './radio'

/** EU_868 band in Meshtastic: 869.4 to 869.65 MHz. */
export const EU868_SPAN_KHZ = Math.round((869.65 - 869.4) * 1000)

/** SX1276 Table 13: lowest SNR (dB) the demodulator still decodes, per SF. */
const SNR_LIMIT_DB: Record<number, number> = { 7: -7.5, 8: -10, 9: -12.5, 10: -15, 11: -17.5, 12: -20 }

/**
 * One generic packet for the airtime bars: 16-byte Meshtastic header plus 16
 * bytes of data. Only the ratio between rows is shown, so the size barely
 * matters. Preamble 16 symbols as in the firmware.
 */
const PACKET = { payload: 32, preamble: 16 }

/** Clicks: 1 the three knobs, 2 the preset rows, 3 what they change, 4 Sofia. */
export const PRESET_STEPS = { knobs: 1, rows: 2, effects: 3, sofia: 4, total: 4 } as const

type PresetKey = 'SHORT_FAST' | 'SHORT_SLOW' | 'MEDIUM_FAST' | 'MEDIUM_SLOW' | 'LONG_FAST' | 'LONG_MODERATE'

interface PresetDef {
  key: PresetKey
  /** Name as the app and the screen show it (DisplayFormatters.cpp). */
  name: string
  sf: number
  bwKHz: number
  /** Coding rate 4/crDenom, 5 to 8. */
  crDenom: number
  cities?: string[]
  /** The row the slide lands on: Sofia's preset. */
  highlight?: boolean
}

export interface ModemPreset extends PresetDef {
  kbps: number
  kbpsLabel: string
  /** Time on air relative to the first row (ShortFast = 1). */
  airtimeX: number
  airtimeLabel: string
  /** Thermal noise in BW + receiver noise figure + SNR limit. */
  sensitivityDbm: number
  sensitivityLabel: string
}

const DEFS: PresetDef[] = [
  { key: 'SHORT_FAST', name: 'ShortFast', sf: 7, bwKHz: 250, crDenom: 5, cities: ['София'], highlight: true },
  { key: 'SHORT_SLOW', name: 'ShortSlow', sf: 8, bwKHz: 250, crDenom: 5 },
  { key: 'MEDIUM_FAST', name: 'MediumFast', sf: 9, bwKHz: 250, crDenom: 5, cities: ['Варна', 'Русе', 'В. Търново'] },
  { key: 'MEDIUM_SLOW', name: 'MediumSlow', sf: 10, bwKHz: 250, crDenom: 5 },
  { key: 'LONG_FAST', name: 'LongFast', sf: 11, bwKHz: 250, crDenom: 5, cities: ['Бургас', 'Пловдив'] },
  { key: 'LONG_MODERATE', name: 'LongModerate', sf: 11, bwKHz: 125, crDenom: 8 },
]

const airtimeMs = (d: PresetDef): number =>
  // airtime.ts takes the CR index (1 = 4/5 … 4 = 4/8).
  timeOnAirMs({ ...PACKET, sf: d.sf, bwHz: d.bwKHz * 1000, cr: d.crDenom - 4 })

const baseMs = airtimeMs(DEFS[0])

export const MODEM_PRESETS: ModemPreset[] = DEFS.map((d) => {
  const kbps = bitrateBps(d.sf, d.bwKHz * 1000, d.crDenom - 4) / 1000
  const airtimeX = airtimeMs(d) / baseMs
  const sensitivityDbm = thermalNoiseDbm(d.bwKHz * 1000) + RX_NF_DB + SNR_LIMIT_DB[d.sf]
  return {
    ...d,
    kbps,
    kbpsLabel: fmt(kbps, kbps < 10 ? (kbps < 1 ? 2 : 1) : 1),
    airtimeX,
    airtimeLabel: `${fmt(airtimeX, airtimeX < 10 && airtimeX !== 1 ? 1 : 0)}×`,
    sensitivityDbm,
    // U+2212 minus, as typeset elsewhere in the deck.
    sensitivityLabel: `−${fmt(Math.abs(sensitivityDbm), 0)}`,
  }
})

/** Presets in config.proto that the table leaves out, and why. */
export const SKIPPED_PRESETS: { key: string, reason: string }[] = [
  { key: 'SHORT_TURBO', reason: '500 kHz, wider than the 250 kHz EU_868 band, firmware falls back to LONG_FAST' },
  { key: 'LONG_TURBO', reason: '500 kHz, wider than the 250 kHz EU_868 band, firmware falls back to LONG_FAST' },
  { key: 'LITE_FAST', reason: 'in the enum, no parameters in v2.7.26, runs as LONG_FAST' },
  { key: 'LITE_SLOW', reason: 'in the enum, no parameters in v2.7.26, runs as LONG_FAST' },
  { key: 'NARROW_FAST', reason: 'in the enum, no parameters in v2.7.26, runs as LONG_FAST' },
  { key: 'NARROW_SLOW', reason: 'in the enum, no parameters in v2.7.26, runs as LONG_FAST' },
]
