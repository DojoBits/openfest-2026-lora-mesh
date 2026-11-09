<script setup lang="ts">
// Q&A slide scene: the slide-5 journey map after the last click. The whole
// trail is inked solid, all four stop medallions are lit, the pennant on the
// summit is raised, and the travellers have made camp at a fire below the peak
// (the beacon medallion art, drawn large). Same geometry as AgendaJourney
// (data/journey.ts), same glyphs (MapGlyphs, JourneyIcons); no text labels.
// The viewBox crops the empty sky off the top of the 860 x 420 journey canvas.
// Only the flame moves; it holds still in print mode and, via `.lora-viz`,
// under prefers-reduced-motion. SVG stroke sizes live in `style` (attributify trap).
import { useNav } from '@slidev/client'
import {
  JOURNEY_H, JOURNEY_ICONS, JOURNEY_STOPS, JOURNEY_W, MARKER_R, START_R, TRAIL_START, legPath, legPoint,
} from './data/journey'
import { summitBox } from './data/summitGlyph'

const { isPrintMode } = useNav()
const TOP = 110
const legs = JOURNEY_STOPS.map((_, i) => legPath(i))
const summitAt = summitBox()
// Sampled route, to keep terrain off the trail.
const route = JOURNEY_STOPS.flatMap((_, leg) => Array.from({ length: 21 }, (_, k) => legPoint(leg, k / 20)))
const CAMP = { x: 735, y: 366, r: 42 }
interface Pt { dx: number, dy: number, s?: number }
function clear(ox: number, oy: number, pts: readonly Pt[]): Pt[] {
  return pts.filter(p => route.every(r => Math.hypot(r.x - (ox + p.dx), r.y - (oy + p.dy)) >= 34)
    && Math.hypot(CAMP.x - (ox + p.dx), CAMP.y - (oy + p.dy)) >= 120)
}
const RANGES = [
  { x: 275, y: 215, pts: clear(275, 215, [{ dx: -22, dy: -6, s: 0.75 }, { dx: 22, dy: -4, s: 0.8 }, { dx: 0, dy: 2 }]) },
  { x: 560, y: 212, pts: clear(560, 212, [{ dx: -20, dy: -4, s: 0.8 }, { dx: 20, dy: -8, s: 0.7 }, { dx: 0, dy: 2 }]) },
]
const FORESTS = [
  { x: 150, y: 250, pts: clear(150, 250, [{ dx: -20, dy: 0 }, { dx: 0, dy: 8 }, { dx: 18, dy: -2 }, { dx: -6, dy: -14 }]) },
  { x: 350, y: 350, pts: clear(350, 350, [{ dx: 0, dy: 0 }, { dx: 16, dy: 10 }, { dx: -14, dy: 12 }, { dx: 8, dy: -12 }]) },
  { x: 480, y: 372, pts: clear(480, 372, [{ dx: 0, dy: 0 }, { dx: 16, dy: -6 }, { dx: 8, dy: 10 }]) },
]
const RIVER = 'M420 288 C398 308, 446 326, 424 348 S396 386, 404 420'
</script>

<template>
  <div class="lora-viz qa-camp mx-auto" :class="{ 'camp-lit': !isPrintMode }" :style="{ width: '780px' }">
    <svg :viewBox="`0 ${TOP} ${JOURNEY_W} ${JOURNEY_H - TOP}`" class="block w-full" aria-hidden="true">
      <rect x="0" :y="TOP" :width="JOURNEY_W" :height="JOURNEY_H - TOP" rx="14" class="fill-parchment dark:fill-parchment" />
      <g class="stroke-ink dark:stroke-ink" fill="none" style="opacity: 0.7">
        <rect x="5" :y="TOP + 5" :width="JOURNEY_W - 10" :height="JOURNEY_H - TOP - 10" rx="10" style="stroke-width: 2" />
        <rect x="10" :y="TOP + 10" :width="JOURNEY_W - 20" :height="JOURNEY_H - TOP - 20" rx="7" style="stroke-width: 1" />
      </g>

      <MapGlyphs kind="river" :d="RIVER" />
      <MapGlyphs v-for="(m, i) in RANGES" :key="`m${i}`" kind="mountains" :x="m.x" :y="m.y" :pts="m.pts" />
      <MapGlyphs v-for="(f, i) in FORESTS" :key="`f${i}`" kind="forest" :x="f.x" :y="f.y" :pts="f.pts" />
      <MapGlyphs kind="summit" :x="summitAt.x" :y="summitAt.y" :reached="true" />

      <!-- the whole route walked: solid trail red -->
      <path
        v-for="d in legs" :key="d" :d="d" fill="none" class="stroke-trail dark:stroke-trail"
        style="stroke-width: 5; stroke-linecap: round"
      />
      <circle
        :cx="TRAIL_START.x" :cy="TRAIL_START.y" :r="START_R"
        class="fill-parchment stroke-ink dark:fill-parchment dark:stroke-ink" style="stroke-width: 2.5"
      />
      <circle :cx="TRAIL_START.x" :cy="TRAIL_START.y" r="3.5" class="fill-ink dark:fill-ink" />

      <!-- the four stops, all lit -->
      <g v-for="(stop, i) in JOURNEY_STOPS" :key="stop.question">
        <circle :cx="stop.x" :cy="stop.y" :r="MARKER_R" class="fill-parchment dark:fill-parchment" />
        <circle :cx="stop.x" :cy="stop.y" :r="MARKER_R" fill="none" class="stroke-trail dark:stroke-trail" style="stroke-width: 5" />
        <JourneyIcons :kind="JOURNEY_ICONS[i]" :size="MARKER_R * 2" :x="stop.x - MARKER_R" :y="stop.y - MARKER_R" />
      </g>

      <!-- camp: the beacon medallion, large, with the travellers beside it -->
      <g class="camp">
        <circle :cx="CAMP.x" :cy="CAMP.y" :r="CAMP.r" class="fill-parchment dark:fill-parchment" />
        <circle :cx="CAMP.x" :cy="CAMP.y" :r="CAMP.r" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 4" />
        <JourneyIcons kind="beacon" :size="CAMP.r * 2" :x="CAMP.x - CAMP.r" :y="CAMP.y - CAMP.r" />
      </g>
      <Hobbit :x="CAMP.x - CAMP.r - 24" :y="CAMP.y + 36" :scale="0.4" phone="pocket" idle />
      <Hobbit :x="CAMP.x + CAMP.r + 24" :y="CAMP.y + 36" :scale="0.4" phone="pocket" idle flip />
    </svg>
  </div>
</template>

<style scoped>
/* The flame breathes: a slight vertical stretch from its base. */
.camp-lit :deep(.beacon-flame) {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: camp-flicker 1.4s ease-in-out infinite;
}
@keyframes camp-flicker {
  0%, 100% { transform: scale(1, 1); }
  35% { transform: scale(0.94, 1.08); }
  70% { transform: scale(1.04, 0.96); }
}
@media (prefers-reduced-motion: reduce) { .camp-lit :deep(.beacon-flame) { animation: none; } }
</style>
