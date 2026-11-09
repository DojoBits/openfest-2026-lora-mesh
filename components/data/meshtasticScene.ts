// Scene data for slide 27 „Какво е Meshtastic“ (MeshtasticStory.vue):
// a map scene for someone who has never heard of Meshtastic, built per click.
// Verified 2026-11-03:
//  - meshtastic.org/docs/introduction: „inexpensive LoRa radios as a long range
//    off-grid communication platform in areas without existing or reliable
//    communications infrastructure“; „100% community driven and open source“;
//    radios „rebroadcast messages they receive, forming a mesh network“;
//    „no dedicated router required“; paired „with a single phone“.
//  - github.com/meshtastic/firmware: repo created 2020-02-01, GPL-3.0; the
//    first commit (2020-02-01) is by geeksville (GitHub API).
//  - hackaday.io/project/170127-meshtastic (created 2020-02-26), by Kevin
//    Hester: „inexpensive ($30 ish) GPS radios … great for hiking, skiing,
//    paragliding - essentially any hobby where you don't have reliable
//    internet access“.
// Name rule (CLAUDE.md): this file must not share a name with a component.

export type MtStationId = 'problem' | 'device' | 'relay' | 'origin'

export interface MtStation {
  id: MtStationId
  /** Click step at which the station lights up (0 = on screen from the start). */
  at: number
  title: string
  sub: string
}

export const MT_ORIGIN = {
  year: 2020,
  founder: 'Kevin Hester',
  handle: 'geeksville',
  purpose: 'за туризъм, ски, парапланеризъм',
  licence: 'GPL-3.0',
} as const

/** Phone and radio bodies in hiker units: the radio is never drawn larger than the phone. */
export const MT_PHONE = { w: 9, h: 15 } as const
export const MT_RADIO = { w: 8, h: 11, whip: 10 } as const

export const MT_STATIONS: readonly MtStation[] = [
  // titles are plain category labels (no slogans); the fact is underneath
  { id: 'problem', at: 0, title: 'Проблем', sub: 'без мобилно покритие' },
  { id: 'device', at: 1, title: 'Устройство', sub: 'LoRa радио + телефон' },
  { id: 'relay', at: 2, title: 'Как работи', sub: 'от радио на радио' },
  { id: 'origin', at: 3, title: 'Създател', sub: `${MT_ORIGIN.year} · ${MT_ORIGIN.founder}` },
]

export const MT_STORY_CLICKS = MT_STATIONS[MT_STATIONS.length - 1].at

/** The message hop on click 2: hiker A's radio → the radio on the ridge → hiker B. */
export const MT_RELAY_PATH = ['a', 'ridge', 'b'] as const
