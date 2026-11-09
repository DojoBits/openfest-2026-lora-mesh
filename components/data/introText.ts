// Intro slide after the MeshCore and Reticulum section heroes (ProjectIntro.vue): what the
// project is, which problem it solves, its main philosophy. Wording follows the
// project's own description (source per project, also cited in the notes):
//  - MeshCore: „lightweight, portable C++ library … multi-hop packet routing“,
//    „balances simplicity with scalability“, „Companion nodes are not
//    repeating messages at all“.
//  - Reticulum: „cryptography-based networking stack“, works under „extremely
//    low bandwidth and very high latency“, networks „without any need for
//    hierarchical or bureaucratic structures“, communities keep „full
//    sovereignty over their own network segments“.
import type { Project } from './tones'

/** Meshtastic has its own scene instead (MeshtasticStory.vue, data/meshtasticScene.ts). */
export type IntroProject = Exclude<Project, 'meshtastic'>

export type IntroKey = 'what' | 'problem' | 'philosophy'

export const INTRO_ROWS: ReadonlyArray<{ key: IntroKey, label: string }> = [
  { key: 'what', label: 'Какво е' },
  { key: 'problem', label: 'Какъв проблем решава' },
  { key: 'philosophy', label: 'Философия' },
]

export type ProjectIntro = Record<IntroKey, string> & { source: string }

export const PROJECT_INTRO: Record<IntroProject, ProjectIntro> = {
  meshcore: {
    what: 'Лек фърмуер за маршрути през много скока',
    problem: 'Голяма градска мрежа без претоварен ефир',
    // U+2011 non-breaking hyphen keeps „repeater‑ите“ on one line
    philosophy: 'Телефоните не препращат, само repeater‑ите',
    source: 'https://github.com/meshcore-dev/MeshCore',
  },
  reticulum: {
    what: 'Мрежов стек, изграден върху криптография',
    problem: 'Връзка по всякаква среда, дори много бавна',
    philosophy: 'Без център: всяка общност държи своята мрежа',
    source: 'https://reticulum.network/manual/whatis.html',
  },
}
