// Scene data for slide 37 „Какво е MeshCore“ (MeshCoreStory.vue):
// a city scene for someone who has never heard of MeshCore, built per click.
// Verified 2026-11-04:
//  - github.com/meshcore-dev/MeshCore license.txt: „MIT License, Copyright (c)
//    2025 Scott Powell / rippleradios.com“. First commit „Initial commit“
//    2025-01-13 by Scott Powell, repo created 2025-01-19 (GitHub API).
//    Top contributor: ripplebiz (Scott's handle, buymeacoffee.com/ripplebiz in the FAQ).
//  - README: „balances simplicity with scalability“, „Nodes use fixed roles
//    where "Companion" nodes are not repeating messages at all“.
//  - docs/faq.md §1.1: „Scott at Ripple Radios, the creator of MeshCore“, the
//    mobile app is by Liam Cottle. §5.2: „MeshCore clients do not repeat. This
//    is the core of MeshCore's messaging-first design. This is to avoid devices
//    flooding the airwaves and create endless collisions“. Only repeaters and
//    room servers repeat. §5.4: first message floods, then a learned path.
// Name rule (CLAUDE.md): this file must not share a name with a component.

export type McStationId = 'problem' | 'philosophy' | 'relay' | 'origin'

export interface McStation {
  id: McStationId
  /** Click step at which the station lights up (0 = on screen from the start). */
  at: number
  title: string
  sub: string
}

export const MC_ORIGIN = {
  year: 2025,
  founder: 'Scott Powell',
  company: 'Ripple Radios',
  licence: 'MIT',
  /** Author of the official mobile app (FAQ §1.1). */
  app: 'Liam Cottle',
} as const

/** Phone and radio bodies in person units: the radio is never drawn larger than the phone. */
export const MC_PHONE = { w: 9, h: 15 } as const
export const MC_RADIO = { w: 8, h: 11, whip: 10 } as const

export const MC_STATIONS: readonly McStation[] = [
  // titles are plain category labels (no slogans), the fact is underneath
  // U+2011 non-breaking hyphen keeps „repeater‑и“ in one piece
  { id: 'problem', at: 0, title: 'Проблем', sub: 'претоварен ефир' },
  { id: 'philosophy', at: 1, title: 'Философия', sub: 'клиентът не препраща' },
  { id: 'relay', at: 2, title: 'Как работи', sub: 'през repeater‑и' },
  { id: 'origin', at: 3, title: 'Създаден', sub: `през януари ${MC_ORIGIN.year}` },
]

export const MC_STORY_CLICKS = MC_STATIONS[MC_STATIONS.length - 1].at

/** The message hop on click 2: A's companion → roof repeater r1 → roof repeater r2 → B. */
export const MC_RELAY_PATH = ['a', 'r1', 'r2', 'b'] as const
