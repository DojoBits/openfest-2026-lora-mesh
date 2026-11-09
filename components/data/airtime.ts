// LoRa time-on-air (Semtech AN1200.13 / SX127x datasheet §4.1.1.7).
// Assumptions match research/T1-radio-lora.md §3.5: explicit header, CRC on,
// low-data-rate optimisation (DE) switched on when a symbol exceeds 16 ms.
import type { Tone } from './tones'
import { fmtMs, fmt } from './format'

export interface LoraParams {
  sf: number
  bwHz: number
  /** Coding rate index: 1 = 4/5 … 4 = 4/8. */
  cr: number
  preamble: number
  payload: number
  crc?: boolean
  implicitHeader?: boolean
}

export function timeOnAirMs(p: LoraParams): number {
  const tSym = (2 ** p.sf) / p.bwHz * 1000 // ms per symbol
  const de = tSym > 16 ? 1 : 0
  const ih = p.implicitHeader ? 1 : 0
  const crc = p.crc === false ? 0 : 1
  const tPreamble = (p.preamble + 4.25) * tSym
  // Payload symbols: 8 + max(ceil((8PL − 4SF + 28 + 16CRC − 20IH) / (4(SF − 2DE))) · (CR + 4), 0)
  const num = 8 * p.payload - 4 * p.sf + 28 + 16 * crc - 20 * ih
  const payloadSymbols = 8 + Math.max(Math.ceil(num / (4 * (p.sf - 2 * de))) * (p.cr + 4), 0)
  return tPreamble + payloadSymbols * tSym
}

/** Raw LoRa bit rate: SF · (BW / 2^SF) · 4 / (4 + CR). */
export const bitrateBps = (sf: number, bwHz: number, cr: number): number =>
  sf * (bwHz / 2 ** sf) * (4 / (4 + cr))

/**
 * Seconds needed just to clock out the payload bits, ignoring preamble and
 * header. This is how T1 derives "160-byte SMS ≈ 4,4 s at SF12"; real
 * time-on-air is longer, so the slide must read it as a lower bound.
 */
export const rawBitsSeconds = (bytes: number, sf: number, bwHz: number, cr: number): number =>
  (bytes * 8) / bitrateBps(sf, bwHz, cr)

export interface AirtimeRow { sf: number, ms: number, label: string, tone: Tone, at?: number }

const BASE = { bwHz: 125_000, cr: 1, preamble: 8, payload: 20 }

// AirtimeBars variant sf (gallery only): 20 bytes, 125 kHz. SF8 is skipped on purpose (storyboard).
export const AIRTIME_ROWS: AirtimeRow[] = [
  { sf: 7, at: 1, tone: 'blue' as Tone },
  { sf: 9, at: 2, tone: 'blue' as Tone },
  { sf: 10, at: 2, tone: 'blue' as Tone },
  { sf: 11, at: 2, tone: 'blue' as Tone },
  { sf: 12, at: 3, tone: 'red' as Tone },
].map((r) => {
  const ms = timeOnAirMs({ ...BASE, sf: r.sf })
  return { ...r, ms, label: fmtMs(ms) }
})

const sf7 = AIRTIME_ROWS[0].ms
const sf12 = AIRTIME_ROWS[AIRTIME_ROWS.length - 1].ms
export const AIRTIME_RATIO = { label: `${fmt(sf12 / sf7, 0)}× по-бавно`, at: 4 }
export const AIRTIME_GAIN = { label: '+2,5 dB / стъпка', at: 4 }

// „Къде не стават“: one 160-byte message at SF12/125 kHz, real time-on-air
// (CR 4/5, preamble 8, same formula as the sf variant). Raw bits alone give 4,4 s.
const SMS_MS = timeOnAirMs({ ...BASE, sf: 12, payload: 160 })
export const SMS_ROW = {
  bytes: 160,
  sf: 12,
  seconds: SMS_MS / 1000,
  label: `${fmt(SMS_MS / 1000, 1)} s`,
}
