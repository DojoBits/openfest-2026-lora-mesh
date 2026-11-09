// Scene data for slide 44 „Какво е Reticulum“ (ReticulumStory.vue): who made
// it, the problem it answers and its philosophy, built per click.
// Verified 2026-11-04:
//  - github.com/markqvist/Reticulum README: „The vision of Reticulum is to allow
//    anyone to be their own network operator“, networks „without kill-switches,
//    surveillance, censorship and control“ that „require no central oversight“.
//  - reticulum.network/manual/whatis.html (docs/source/whatis.rst): reference
//    implementation „maintained by Mark Qvist“, „The Reticulum Protocol was
//    dedicated to the Public Domain in 2016“, „without any need for hierarchical
//    or bureaucratic structures to control or manage them“.
//  - Zen of Reticulum.md (repo root): „Uncentralizability“, „designed with no
//    privileged nodes“, „Encryption Is Not A Feature … It is not optional“.
//  - GitHub API: first commit 9a9630c „Initial commit“ by Mark Qvist on
//    2016-05-29. LICENSE history: added 2018-04-27 as „MIT License“ (2c12deb),
//    replaced 2025-04-15 by the „Reticulum License“ (e7dacee): MIT text plus a
//    no-harm-to-humans clause and a no-AI/ML-training-dataset clause. GitHub
//    reports it as NOASSERTION.
// Name rule (CLAUDE.md): this file must not share a name with a component.

export type RnsStationId = 'problem' | 'philosophy' | 'crypto' | 'origin'

export interface RnsStation {
  id: RnsStationId
  /** Click step at which the station lights up (0 = on screen from the start). */
  at: number
  title: string
  sub: string
}

export const RNS_ORIGIN = {
  year: 2016,
  founder: 'Mark Qvist',
  firstCommit: '2016-05-29',
  licence: 'Reticulum License',
  licenceBefore: 'MIT',
  licenceChanged: 2025,
  // Two labelled lines so the licence and public domain never blur: the
  // protocol is public domain, the reference code is under the Reticulum License.
  protocol: 'протокол: public domain',
  codeLicence: 'код: Reticulum License',
} as const

/** Phone and radio bodies in hiker units: the radio is never drawn larger than the phone. */
export const RNS_PHONE = { w: 9, h: 15 } as const
export const RNS_RADIO = { w: 8, h: 11, whip: 10 } as const

export const RNS_STATIONS: readonly RnsStation[] = [
  // titles are plain category labels (no slogans), the fact is underneath
  { id: 'problem', at: 0, title: 'Проблем', sub: 'зависи от оператор' },
  { id: 'philosophy', at: 1, title: 'Философия', sub: 'без централен възел' },
  { id: 'crypto', at: 2, title: 'Криптиране', sub: 'винаги включено' },
  { id: 'origin', at: 3, title: 'Създател', sub: `${RNS_ORIGIN.year} · ${RNS_ORIGIN.founder}` },
]

export const RNS_STORY_CLICKS = RNS_STATIONS[RNS_STATIONS.length - 1].at

/** Click 1: with the hub gone the message goes radio to radio, A → left hill → right hill → B. */
export const RNS_PEER_PATH = ['a', 'p1', 'p2', 'b'] as const
