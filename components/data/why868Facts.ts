// Slide 16 „Защо в Европа ползваме 868 MHz“: the numbers behind the four cards
// of Why868.vue (tested in tests/why868.test.ts). Named `why868Facts`, not
// `why868`: a data file must never share a name with a component (CLAUDE.md).
//
// Sources (not re-fetched for this slide; the same numbers are on slides 13,
// 14 and 17 and in research/T1, T2):
//   - CEPT ERC Recommendation 70-03, Annex 1: 433,05–434,79 MHz 10 mW e.r.p.;
//     869,4–869,65 MHz 500 mW e.r.p., 10 % duty cycle; 25 mW in most of 863–870;
//   - IARU Region 1 UHF band plan: 70 cm amateur band 430–440 MHz;
//   - LoRa Alliance RP002 Regional Parameters: EU863-870 („EU868“);
//   - Meshtastic EU_868 default 869,525 MHz; MeshCore EU/UK Narrow 869,618 MHz.
import { fmt } from './format'
import { fsplDb, quarterWaveCm } from './radio'

export type Why868Id = 'power' | 'busy' | 'antenna' | 'compat'
export interface Why868Card { id: Why868Id, title: string, at: number }

/** One card per click, in story order. */
export const WHY868_CARDS: readonly Why868Card[] = [
  { id: 'power', title: 'Мощност', at: 1 },
  { id: 'busy', title: 'Заетост на 433', at: 2 },
  { id: 'antenna', title: 'Антена', at: 3 },
  { id: 'compat', title: 'Една лента за всички', at: 4 },
]

const range = (from: number, to: number): string => `${fmt(from, 1)}–${fmt(to, 2)}`

/** The 500 mW sub-band where Meshtastic and MeshCore sit. */
export const SUB_BAND = {
  from: 869.4,
  to: 869.65,
  mw: 500,
  dutyPct: 10,
  label: `${range(869.4, 869.65)} MHz`,
} as const

// Power card arithmetic, all rounded to whole dB as said on stage:
//   power advantage = 10·log10(500 / 10) ≈ 17 dB for 868;
//   path advantage  = free-space loss 868 − 433 ≈ 6 dB for 433;
//   net = 17 − 6 = 11 dB, and every 20 dB is 10× distance → 10^(11/20) ≈ 3,5×.
const SUB_MW = SUB_BAND.mw
const MW_433 = 10
const POWER_DB = Math.round(10 * Math.log10(SUB_MW / MW_433))
const PATH_DB = Math.round(fsplDb(10, 868) - fsplDb(10, 433.92))
const NET_DB = POWER_DB - PATH_DB
export const POWER = {
  subMw: SUB_MW,
  mw433: MW_433,
  powerDb: POWER_DB,
  pathDb: PATH_DB,
  netDb: NET_DB,
  sum: `+${POWER_DB} dB − ${PATH_DB} dB = +${NET_DB} dB`,
  // floor to one decimal: 3,55 is said as „3,5“, never rounded up to 3,6
  reach: `≈ ${fmt(Math.floor(10 ** (NET_DB / 20) * 10) / 10, 1)}× по-далеч`,
} as const

export type DeviceKind = 'key' | 'thermo' | 'garage' | 'ham'
/** 433 MHz is crowded: consumer gadgets plus the radio amateurs' 70 cm band. */
export const BUSY_433 = {
  from: 433.05,
  to: 434.79,
  label: `${fmt(433.05, 2)}–${fmt(434.79, 2)} MHz`,
  ham: { from: 430, to: 440, label: '430–440 MHz' },
  // icon strip, left to right; repeats make it read as crowded
  devices: [
    { kind: 'key', name: 'ключ за кола' },
    { kind: 'thermo', name: 'термометър' },
    { kind: 'garage', name: 'гаражна врата' },
    { kind: 'ham', name: 'радиолюбители' },
    { kind: 'key', name: 'ключ за кола' },
    { kind: 'thermo', name: 'метеостанция' },
  ] as { kind: DeviceKind, name: string }[],
} as const

/** Quarter-wave whips, drawn to scale; 433,92 MHz is the band centre. */
export const ANTENNA_PAIR = [
  { mhz: 868, band: '868 MHz', cm: quarterWaveCm(868), label: `${fmt(quarterWaveCm(868), 1)} cm` },
  { mhz: 433.92, band: '433 MHz', cm: quarterWaveCm(433.92), label: `${fmt(quarterWaveCm(433.92), 0)} cm` },
] as const

export interface Network { name: string, detail: string, mhz?: number }
/** Everyone the audience can talk to in Europe is on 868. */
export const NETWORKS: readonly Network[] = [
  { name: 'LoRaWAN', detail: 'EU868: 863–870 MHz' },
  { name: 'Meshtastic', detail: 'EU_868', mhz: 869.525 },
  { name: 'MeshCore', detail: 'EU', mhz: 869.618 },
]
