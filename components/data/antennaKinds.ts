// Slide 14 „Какви антени ползваме“: the four antenna types a LoRa user meets,
// small to big. Gains are typical datasheet ranges for 868 MHz parts, not
// one product. `pattern` picks the animated radiation shape in AntennaTypes.vue:
//   round = all directions, about equal (low gain);
//   flat  = squashed to the horizon, reaches further sideways (more gain).
// No Yagi: it hears one direction only, so it is rare in a mesh.
// Photos and their licences: public/antennas/CREDITS.md.
// (File name differs from the component on purpose: see the name-clash trap in CLAUDE.md.)
import { fmt } from './format'
import { quarterWaveCm } from './radio'

export type AntennaPattern = 'round' | 'flat' | 'beam'

export interface AntennaKind {
  id: 'whip' | 'pcb' | 'gp' | 'omni'
  name: string
  /** Where you meet it, in a few words. */
  where: string
  gain: string
  /** Top of the gain range, for ordering and pattern size. */
  dbiMax: number
  pattern: AntennaPattern
  img: string
}

export const ANTENNA_KINDS: readonly AntennaKind[] = [
  { id: 'whip', name: 'Камшична', where: 'идва с платката', gain: '2–3 dBi', dbiMax: 3, pattern: 'round', img: '/antennas/whip.webp' },
  { id: 'pcb', name: 'Печатна антена', where: 'вътре в кутията', gain: 'до 2 dBi', dbiMax: 2, pattern: 'round', img: '/antennas/pcb.webp' },
  { id: 'gp', name: 'GP антена', where: 'направи си сам', gain: '2–3 dBi', dbiMax: 3, pattern: 'round', img: '/antennas/gp.webp' },
  { id: 'omni', name: 'Стъклопластова', where: 'на покрива', gain: '5–8 dBi', dbiMax: 8, pattern: 'flat', img: '/antennas/omni.webp' },
]

/** One-line photo credit shown under the cards: author + licence of each photo. */
export const PHOTO_CREDIT = 'Снимки: Chiffre01 (CC0, Wikimedia Commons) · © RAKwireless, M0AWS (All rights reserved)'

/** The quarter-wave length slide 11's notes promise („Запомнете 34,5“). */
export const WHIP_NOTE = `¼ вълна ≈ ${fmt(quarterWaveCm(868), 1)} cm`
