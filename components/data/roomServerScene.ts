// Scene data for slide 39 „Офлайн пощенска кутия“ (RoomServerStory.vue).
// Verified 2026-11-04 in github.com/meshcore-dev/MeshCore docs/faq.md:
//  - §1.2.5: „A room server is a simple BBS server for sharing posts.“ It stores
//    message history and pushes it to users, „more like email servers where you can
//    come back later and get your emails“. With channels a message is missed if the
//    user is out of range. „When a client logs into a room server, the client will
//    receive the previously 32 unseen messages.“ Repeat is possible with
//    `set repeat on` but not recommended: run repeater and room server on separate devices.
//  - §3.3 / §3.4: default admin password `password`, guest password `hello`.
// Not verified, so not on the slide: where the posts are kept (RAM or flash),
// what happens past 32 posts, how packets to the server are routed.
// Name rule (CLAUDE.md): this file must not share a name with a component.

export type RsStationId = 'missed' | 'stored' | 'queue' | 'login'

export interface RsStation {
  id: RsStationId
  /** Click step at which the station lights up (0 = on screen from the start). */
  at: number
  title: string
  sub: string
}

export const RS_FACTS = {
  /** Unseen messages a client receives on login (FAQ §1.2.5). */
  unseenOnLogin: 32,
  guestPassword: 'hello',
} as const

/** Posts waiting for Пешо by click 3 (illustrative, below the 32 the server hands out). */
export const RS_POSTS = 6

export const RS_STATIONS: readonly RsStation[] = [
  // titles are plain category labels (no slogans), the fact is underneath
  { id: 'missed', at: 0, title: 'Канал', sub: 'Пешо го пропуска' },
  { id: 'stored', at: 1, title: 'Room Server', sub: 'пази поста' },
  { id: 'queue', at: 2, title: 'Опашка', sub: `до ${RS_FACTS.unseenOnLogin} непрочетени` },
  { id: 'login', at: 3, title: 'Вход', sub: 'Пешо ги получава' },
]

export const RS_STORY_CLICKS = RS_STATIONS[RS_STATIONS.length - 1].at
