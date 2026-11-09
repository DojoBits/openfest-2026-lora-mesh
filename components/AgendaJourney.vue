<script setup lang="ts">
// Slide 5 (agenda) as a hand-inked journey map on aged parchment: a dashed
// red-ink trail runs from a small inked start mark past mountains and forests,
// one numbered medallion per click, up to a peak with a pennant. The whole
// route is drawn from frame 0 so the room sees the shape of the talk; each
// click inks the next leg solid and lights the next stop. Dragons fly in the
// open sky above the stops; trolls, a spider and a warg lurk on the ground.
// Geometry (stops, legs, label boxes) comes from data/journey.ts and perils from
// data/perilPlacement.ts; both are tested: labels and perils never touch the
// trail. Terrain glyphs live in MapGlyphs.vue and are placed in the free areas
// between labels, stops and trail; placements that land near the trail or a
// peril are dropped (see keepClear). Medallion art is JourneyIcons.vue.
// Classes are literal because UnoCSS only extracts from source text. SVG stroke
// sizes live in `style` (attributify trap).
import { useNav } from '@slidev/client'
import { useStep } from './data/useStep'
import {
  JOURNEY_CLICKS, JOURNEY_H, JOURNEY_ICONS, JOURNEY_STOPS, JOURNEY_W, MARKER_R, START_R, TRAIL_START,
  labelBox, legPath, legPoint,
} from './data/journey'
import { COMPASS_AT, PERIL_PLACEMENT, perilRect, type Rect } from './data/perilPlacement'
import { labelNudge, summitBox } from './data/summitGlyph'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(JOURNEY_CLICKS, () => props.step, () => props.startAt ?? 0)
// Print/export gets a still frame: the dragons' wings do not flap.
const { isPrintMode } = useNav()

/** Icon box: the art is drawn inside r = 0.42 of its box, so 72 px fills a 36 px radius ring (5 px border). */
const ICON_SIZE = 72

const legs = JOURNEY_STOPS.map((_, i) => legPath(i))
const labels = JOURNEY_STOPS.map((_, i) => labelBox(i))
const summitAt = summitBox()

interface Pt { dx: number, dy: number, s?: number }

// Sampled route, for keeping decorations off the trail.
const route = JOURNEY_STOPS.flatMap((_, leg) =>
  Array.from({ length: 21 }, (_, k) => legPoint(leg, k / 20)))

const perilBoxes: readonly Rect[] = PERIL_PLACEMENT.map(perilRect)

/**
 * Drop glyph offsets that would land within `gap` px of the trail, or inside a
 * peril's box grown by 12 px (origin + offset is the glyph's anchor).
 */
function keepClear(ox: number, oy: number, pts: readonly Pt[], gap = 30): Pt[] {
  return pts.filter((p) => {
    const x = ox + p.dx
    const y = oy + p.dy
    const nearPeril = perilBoxes.some(b => x > b.x0 - 12 && x < b.x1 + 12 && y > b.y0 - 12 && y < b.y1 + 12)
    return !nearPeril && route.every(r => Math.hypot(r.x - x, r.y - y) >= gap)
  })
}

// Where the terrain goes: each cluster sits in a pocket the labels, markers and
// bubble lane leave free (checked on screen).
const RANGE_L = { x: 275, y: 215, pts: keepClear(275, 215, [{ dx: -22, dy: -6, s: 0.75 }, { dx: 22, dy: -4, s: 0.8 }, { dx: 0, dy: 2 }]) }
const RANGE_R = { x: 560, y: 212, pts: keepClear(560, 212, [{ dx: -20, dy: -4, s: 0.8 }, { dx: 20, dy: -8, s: 0.7 }, { dx: 0, dy: 2 }]) }
const RANGE_S = { x: 650, y: 205, pts: keepClear(650, 205, [{ dx: -22, dy: -2, s: 0.8 }, { dx: 20, dy: 0, s: 0.85 }, { dx: 0, dy: 6 }]) }
const FORESTS = [
  { x: 160, y: 250, pts: keepClear(160, 250, [{ dx: -20, dy: 0 }, { dx: 0, dy: 8 }, { dx: 18, dy: -2 }, { dx: -6, dy: -14 }]) },
  { x: 350, y: 330, pts: keepClear(350, 330, [{ dx: 0, dy: 0 }, { dx: 16, dy: 10 }, { dx: -14, dy: 12 }, { dx: 8, dy: -12 }]) },
  { x: 476, y: 332, pts: keepClear(476, 332, [{ dx: 0, dy: 0 }, { dx: 16, dy: -6 }, { dx: 8, dy: 10 }, { dx: -4, dy: 12 }]) },
  { x: 780, y: 345, pts: keepClear(780, 345, [{ dx: 0, dy: 0 }, { dx: 18, dy: 10 }, { dx: -18, dy: 8 }, { dx: 8, dy: -14 }, { dx: 34, dy: -2 }]) },
]
const HILLS = [
  { x: 690, y: 335, pts: keepClear(690, 335, [{ dx: -28, dy: 0 }, { dx: 26, dy: 10 }]) },
  { x: 185, y: 160, pts: keepClear(185, 160, [{ dx: -26, dy: 6 }, { dx: 28, dy: -4 }]) },
]
// River: a spring under the middle peak winding down through the gap between the
// two bottom labels (x 334..456) to the bottom edge. Drawn as a double line.
const RIVER = 'M420 288 C398 308, 446 326, 424 348 S396 386, 404 420'
</script>

<template>
  <div class="lora-viz relative mx-auto" :style="{ width: `${JOURNEY_W}px`, height: `${JOURNEY_H}px` }">
    <svg class="absolute inset-0" :width="JOURNEY_W" :height="JOURNEY_H" :viewBox="`0 0 ${JOURNEY_W} ${JOURNEY_H}`" aria-hidden="true">
      <defs>
        <!-- parchment: cream centre falling off to darker, scorched-looking edges -->
        <radialGradient id="journey-parch-l" cx="50%" cy="45%" r="75%">
          <stop offset="0" stop-color="#f6ecd0" />
          <stop offset="0.6" stop-color="#f3e7c9" />
          <stop offset="1" stop-color="#d6bc86" />
        </radialGradient>
        <!-- dark mode: old parchment at night, deep brown leather at the rim -->
        <radialGradient id="journey-parch-d" cx="50%" cy="45%" r="75%">
          <stop offset="0" stop-color="#3a2b1c" />
          <stop offset="0.65" stop-color="#33261a" />
          <stop offset="1" stop-color="#2a1f14" />
        </radialGradient>
      </defs>
      <rect class="dark:hidden" x="0" y="0" :width="JOURNEY_W" :height="JOURNEY_H" rx="14" style="fill: url(#journey-parch-l)" />
      <rect class="hidden dark:block" x="0" y="0" :width="JOURNEY_W" :height="JOURNEY_H" rx="14" style="fill: url(#journey-parch-d)" />
      <!-- thin double-line ink border -->
      <g class="stroke-[#4a3520] dark:stroke-[#e8d5b0]" fill="none" style="opacity: 0.7">
        <rect x="5" y="5" :width="JOURNEY_W - 10" :height="JOURNEY_H - 10" rx="10" style="stroke-width: 2" />
        <rect x="10" y="10" :width="JOURNEY_W - 20" :height="JOURNEY_H - 20" rx="7" style="stroke-width: 1" />
      </g>

      <!-- terrain, behind the trail -->
      <MapGlyphs kind="river" :d="RIVER" />
      <MapGlyphs kind="hills" v-for="(h, i) in HILLS" :key="`h${i}`" :x="h.x" :y="h.y" :pts="h.pts" />
      <MapGlyphs kind="mountains" :x="RANGE_L.x" :y="RANGE_L.y" :pts="RANGE_L.pts" />
      <MapGlyphs kind="mountains" :x="RANGE_R.x" :y="RANGE_R.y" :pts="RANGE_R.pts" />
      <MapGlyphs kind="mountains" :x="RANGE_S.x" :y="RANGE_S.y" :pts="RANGE_S.pts" />
      <MapGlyphs kind="forest" v-for="(f, i) in FORESTS" :key="`f${i}`" :x="f.x" :y="f.y" :pts="f.pts" />
      <MapGlyphs kind="compass" :x="COMPASS_AT.x" :y="COMPASS_AT.y" />
      <!-- summit: a peak with a pennant, right of and below the last stop (summitGlyph.ts) -->
      <MapGlyphs kind="summit" :x="summitAt.x" :y="summitAt.y" :reached="s >= JOURNEY_CLICKS" />

      <!-- the whole route, dashed dark-red ink -->
      <path
        v-for="d in legs" :key="`g${d}`" :d="d" fill="none"
        class="stroke-[#8b1e1e] dark:stroke-[#d9534f]"
        style="stroke-width: 3.5; stroke-dasharray: 11 9; stroke-linecap: round; opacity: 0.8"
      />
      <!-- walked legs: the same line inked solid, drawn on with the dash offset -->
      <path
        v-for="(d, i) in legs" :key="`w${d}`" :d="d" fill="none" pathLength="1"
        class="stroke-[#8b1e1e] dark:stroke-[#d9534f]"
        :style="{ strokeWidth: 5, strokeLinecap: 'round', strokeDasharray: 1, strokeDashoffset: s > i ? 0 : 1, transition: 'stroke-dashoffset 0.7s ease-in-out' }"
      />

      <!-- start mark: a small inked circle with a dot, over the first leg's end -->
      <g class="start-mark">
        <circle
          :cx="TRAIL_START.x" :cy="TRAIL_START.y" :r="START_R"
          class="fill-[#f3e7c9] stroke-[#4a3520] dark:fill-[#33261a] dark:stroke-[#e8d5b0]" style="stroke-width: 2.5"
        />
        <circle :cx="TRAIL_START.x" :cy="TRAIL_START.y" r="3.5" class="fill-[#4a3520] dark:fill-[#e8d5b0]" />
      </g>

      <!-- perils, drawn last so they sit on top of the terrain (none touches the trail) -->
      <MapPerils
        v-for="(p, i) in PERIL_PLACEMENT" :key="`p${i}`"
        :kind="p.kind" :x="p.x" :y="p.y" :scale="p.scale" :flip="p.flip" :static="isPrintMode"
      />
    </svg>

    <!-- numbered stop medallions. Fading is on the ring/icon, never on the disc
         behind it: that stays opaque so the dashed trail can't show through. -->
    <div
      v-for="(stop, i) in JOURNEY_STOPS" :key="stop.question"
      class="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f3e7c9] shadow-[0_2px_6px_rgba(74,53,32,0.4)] dark:bg-[#33261a]"
      :style="{ left: `${stop.x}px`, top: `${stop.y}px` }"
    >
      <div
        class="flex items-center justify-center rounded-full border-[#4a3520] text-[#4a3520] transition-opacity duration-500 dark:border-[#e8d5b0] dark:text-[#e8d5b0]"
        :class="s > i ? 'border-[5px] opacity-100' : 'border-[3px] opacity-50'"
        :style="{ width: `${MARKER_R * 2}px`, height: `${MARKER_R * 2}px` }"
      >
        <JourneyIcons :kind="JOURNEY_ICONS[i]" :size="ICON_SIZE" />
      </div>
      <!-- stop number badge: red wax seal with cream text -->
      <div
        class="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#8b1e1e] text-base font-bold text-[#f6ecd0] transition-opacity duration-500 dark:bg-[#b83a36] dark:text-[#fff6e0]"
        :class="s > i ? 'opacity-100' : 'opacity-60'"
      >{{ i + 1 }}</div>
    </div>

    <!-- stop labels: above peaks, below valleys (boxes from labelBox) -->
    <div
      v-for="(stop, i) in JOURNEY_STOPS" :key="`l${stop.question}`"
      class="absolute whitespace-nowrap text-center text-3xl font-bold italic leading-10 text-[#3a2814] transition-opacity duration-500 dark:text-[#f0e0bd]"
      :class="s > i ? 'opacity-100' : 'opacity-50'"
      :style="{ left: `${labels[i].x0 - labelNudge(i)}px`, top: `${labels[i].y0}px`, width: `${labels[i].x1 - labels[i].x0}px`, fontFamily: 'Georgia, \'Palatino Linotype\', Palatino, serif' }"
    >{{ stop.question }}</div>
  </div>
</template>
