// Slide „Ограничения“: two blocks, six points, one click each.
// Airtime numbers come from airtime.ts and bands.ts so the slide, the
// airtime bars and the notes always agree (5,9 s, 360 s, 10 %).
import { SMS_ROW } from './airtime'
import { dutySecondsPerHour } from './bands'
import { fmt } from './format'

/** Does a limit apply to a project: fully or only partly. */
export type Applies = 'full' | 'partly'
/** Project order is fixed everywhere: Meshtastic, MeshCore, Reticulum. */
export const LIMIT_PROJECTS = ['meshtastic', 'meshcore', 'reticulum'] as const
export type LimitProject = typeof LIMIT_PROJECTS[number]
export const LIMIT_PROJECT_NAMES: Record<LimitProject, string> = {
  meshtastic: 'Meshtastic',
  meshcore: 'MeshCore',
  reticulum: 'Reticulum',
}
export const LEGEND_FULL = 'важи'
export const LEGEND_PARTLY = 'частично'

export interface LimitItem {
  /** Click on which the item appears (1 to 6). */
  at: number
  label: string
  /** Per project, in LIMIT_PROJECTS order. */
  applies: [Applies, Applies, Applies]
}

export const AIR_HEADING = 'Ефир'
export const LEGAL_HEADING = 'Закон и поверителност'

export const AIR_ITEMS: LimitItem[] = [
  { at: 1, label: 'Само текст, не глас и снимки', applies: ['full', 'full', 'partly'] },
  { at: 2, label: 'Най-много 6 минути на час', applies: ['full', 'full', 'partly'] },
  { at: 3, label: 'Шумен възел пречи на всички', applies: ['full', 'partly', 'partly'] },
]

export const LEGAL_ITEMS: LimitItem[] = [
  { at: 4, label: 'Вижда се кой с кого говори', applies: ['full', 'partly', 'partly'] },
  { at: 5, label: 'Мощност + антена: до 500 mW ERP (излъчена мощност)', applies: ['full', 'full', 'full'] },
  { at: 6, label: 'Радиолюбители: без криптиране', applies: ['full', 'full', 'full'] },
]

export const LIMITS_CLICKS = 6

/** The usable slice of one hour: the 10 % band, 360 s, 6 minutes. */
const DUTY_PCT = 10
export const HOUR = {
  dutyPct: DUTY_PCT,
  sliceSeconds: dutySecondsPerHour(DUTY_PCT),
  sliceLabel: `${fmt(dutySecondsPerHour(DUTY_PCT) / 60)} мин`,
  hourLabel: '60 мин',
  smsLabel: `SMS ${SMS_ROW.bytes} B = ${SMS_ROW.label}`,
  /** How many SMS fit into the slice when one noisy node fills it. */
  smsPerSlice: Math.floor(dutySecondsPerHour(DUTY_PCT) / SMS_ROW.seconds),
}
