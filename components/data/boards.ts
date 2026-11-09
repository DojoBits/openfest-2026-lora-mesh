// Slide „Хардуер под 30 €“: one board per use, not two near-identical Heltecs.
// Prices re-checked 2026-10-22, incl. VAT: Hexaspot (NL) for Heltec V4 and the
// RAK kit (RAK is 44 € at OpenELab), OpenELab (DE) for the XIAO kit, Heltec's
// own store for the T114 ($24.90 + 20 % BG VAT ≈ 27 €, plus shipping; EU shops
// charge 32–35 €). Battery: typical Meshtastic client on a 2000–3000 mAh cell
// (Heltec V4 wiki test ~95 mA; nRF52 boards ~10–12 mA, community measurements).
// All four run Meshtastic, MeshCore and RNode (markqvist firmware 1.86).
// Images: public/boards/ (sources and licenses in public/boards/CREDITS.md).
import type { Tone } from './tones'

export type Mcu = 'ESP32-S3' | 'nRF52840'

export interface Board {
  id: string
  name: string
  mcu: Mcu
  price: string
  /** What the board is for, in plain words. */
  use: string
  /** Rough battery life as a phone-paired client. */
  battery: string
  img?: string
}

export const BOARDS: Board[] = [
  { id: 'heltec-v4', name: 'Heltec V4', mcu: 'ESP32-S3', price: '23–25 €', use: 'с екран, за начало', battery: '~1 ден', img: '/boards/heltec-v4.webp' },
  { id: 'xiao-s3', name: 'XIAO S3 kit', mcu: 'ESP32-S3', price: '14–17 €', use: 'най-малка и най-евтина', battery: '~1 ден', img: '/boards/xiao-s3.webp' },
  { id: 'heltec-t114', name: 'Heltec T114', mcu: 'nRF52840', price: '~27 €', use: 'с екран, пести батерия', battery: 'седмица+', img: '/boards/heltec-t114.webp' },
  { id: 'rak4631', name: 'RAK4631 kit', mcu: 'nRF52840', price: '~28 €', use: 'за покрива, на слънце', battery: 'седмици', img: '/boards/rak4631.webp' },
]

/** ESP32 is the ordinary baseline (slate); nRF52 the battery-friendly pick (emerald). */
export const MCU_META: Record<Mcu, { tone: Tone }> = {
  'ESP32-S3': { tone: 'slate' },
  'nRF52840': { tone: 'emerald' },
}

export function board(id: string): Board {
  const b = BOARDS.find(x => x.id === id)
  if (!b)
    throw new Error(`unknown board ${id}`)
  return b
}
