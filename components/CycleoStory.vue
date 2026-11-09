<script setup lang="ts">
// Slide „История на LoRa“: the origin story as a trail on a
// parchment map, one station per click, the trail inking itself from one
// station to the next (same trick as the slide-5 journey map):
//   click 1  2009, „идеята“: two figures, founders (named in the notes); the Alps and
//            „Гренобъл“ are on the map from the start;
//   click 2  „chirp от радара“: a radar dish sends a rising chirp that keeps
//            sweeping (the only loop on the slide);
//   click 3  „Cycleo“: a chip marked LoRa; the third founder joins (Sforza);
//   click 4  2012, „Semtech“: a deed with a wax seal (the acquisition);
//   click 5  „до 10 години“: a field sensor, its battery still full, while a
//            ring of ten year-marks fills one by one (Semtech's own claim).
// Ghosted stations (opacity) show the whole road before the story starts.
// Facts: data/loraOrigin.ts (sources there and on the slide). Print/PDF and a
// pinned `step` get the finished picture: no loop, no staggered fill.
import { useNav } from '@slidev/client'
import { FOUNDERS, ORIGIN, STATIONS, STORY_CLICKS } from './data/loraOrigin'
import { useStep } from './data/useStep'
import MapGlyphs from './MapGlyphs.vue'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(STORY_CLICKS, () => props.step, () => props.startAt ?? 0)
const { isPrintMode } = useNav()
const still = props.step !== undefined || isPrintMode.value

// Stations evenly spaced on one line; the legs sag between them so the trail
// reads as a path. Labels alternate between two rows (even stations just under
// the medallion, odd ones lower) because neighbouring titles are wider than
// the 172-unit spacing.
const X0 = 96
const DX = 172
// Label geometry, relative to the station centre. Upper-row sub-labels sit
// right above the lower-row titles, so LY_LOW is chosen to leave >= 18 units
// between the sub-label baseline and the lower title's cap top (tested).
const LY_UP = 86
const LY_LOW = 156
const SUB_DY = 32 // title baseline -> first sub-label baseline
const SUB_SIZE = 20 // px, same for every sub-label
const TITLE_CAP = 20 // approx cap height of the 28px italic serif title
const pos = STATIONS.map((st, i) => ({ ...st, x: X0 + i * DX, y: 186, ly: i % 2 ? LY_LOW : LY_UP }))
const R = 46
// Legs between neighbouring stations as quadratic curves that sag between them.
const legs = pos.slice(1).map((b, i) => {
  const a = pos[i]
  return `M${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${(a.y + b.y) / 2 + 26} ${b.x} ${b.y}`
})
// Sub-label under each station title (founders come from the data module).
// Each value is a list of single-line labels, all at the same size. The 2009
// station names both founders on one line, „Sornin и Seller“; the sub-label
// sits above the lower „chirp от радара“ title, so it must stay one line.
const SUB: Record<string, readonly string[]> = {
  idea: ['Sornin и Seller'],
  chirp: ['в евтин чип'],
  cycleo: [`+ ${FOUNDERS[2].split(' ')[1]}`],
  semtech: ['купува Cycleo'],
  sensor: ['на батерия'],
}
const shown = (at: number) => (s.value >= at ? 'opacity-100' : 'opacity-0')
const lit = (at: number) => (s.value >= at ? 'opacity-100' : 'opacity-25')

// Chirp inside the radar station: a sine whose frequency rises linearly from
// left to right (phase grows with t²), 70 px wide, sampled every 1 px.
const chirp = (() => {
  const pts: string[] = []
  for (let i = 0; i <= 70; i++) {
    const t = i / 70
    pts.push(`${(-22 + i).toFixed(1)} ${(-12 * Math.sin(2 * Math.PI * (1 * t + 3 * t * t))).toFixed(1)}`)
  }
  return `M${pts.join(' L')}`
})()
// Ten year-marks on an arc over the sensor medallion, from 200° to 340°
// (left to right across the top), each lighting 160 ms after the previous.
const YEARS = Array.from({ length: ORIGIN.batteryYears }, (_, i) => {
  const a = ((200 + (140 * i) / (ORIGIN.batteryYears - 1)) * Math.PI) / 180
  return { x: (R + 14) * Math.cos(a), y: (R + 14) * Math.sin(a), delay: `${0.5 + i * 0.16}s` }
})
</script>

<template>
  <div class="lora-viz w-full select-none" :class="{ 'story-still': still }">
    <svg viewBox="0 0 900 400" class="w-full" role="img" aria-label="Пътят на LoRa: идеята 2009, chirp от радара, Cycleo в Гренобъл, Semtech 2012, сензор с батерия за години">
      <!-- parchment sheet with a double ink border -->
      <rect x="4" y="4" width="892" height="392" rx="14" class="fill-parchment dark:fill-parchment" />
      <g class="stroke-ink dark:stroke-ink" fill="none" style="opacity: 0.7">
        <rect x="9" y="9" width="882" height="382" rx="10" style="stroke-width: 2" />
        <rect x="14" y="14" width="872" height="372" rx="7" style="stroke-width: 1" />
      </g>

      <!-- Grenoble in the Alps, top left, on the map from the start -->
      <MapGlyphs kind="mountains" :x="176" :y="98" :pts="[{ dx: -36, dy: 4, s: 0.8 }, { dx: 0, dy: 0, s: 1.1 }, { dx: 34, dy: 6, s: 0.9 }, { dx: 300, dy: 8, s: 0.8 }, { dx: 330, dy: 4, s: 1 }]" />
      <text
        x="176" y="58" text-anchor="middle" class="fill-ink-strong dark:fill-ink-strong"
        style="font-size: 26px; font-style: italic; font-family: Georgia, 'Palatino Linotype', Palatino, serif"
      >{{ ORIGIN.city }}</text>
      <MapGlyphs kind="forest" :x="736" :y="96" :pts="[{ dx: 0, dy: 0 }, { dx: 20, dy: 4 }, { dx: 40, dy: -2 }, { dx: 60, dy: 3 }]" />
      <MapGlyphs kind="compass" :x="846" :y="84" :s="0.75" />

      <!-- the road: dashed red ink, then each walked leg inked solid -->
      <path v-for="d in legs" :key="`g${d}`" :d="d" fill="none" class="stroke-trail dark:stroke-trail" style="stroke-width: 3.5; stroke-dasharray: 11 9; stroke-linecap: round; opacity: 0.55" />
      <path
        v-for="(d, i) in legs" :key="`w${d}`" :d="d" fill="none" pathLength="1" class="stroke-trail dark:stroke-trail"
        :style="{ strokeWidth: 5, strokeLinecap: 'round', strokeDasharray: 1, strokeDashoffset: s >= i + 2 ? 0 : 1, transition: 'stroke-dashoffset 0.8s ease-in-out' }"
      />

      <!-- ── Stations ── -->
      <g v-for="st in pos" :key="st.id" :transform="`translate(${st.x} ${st.y})`">
        <!-- opaque disc so the dashed road never shows through; ring and art fade -->
        <circle :r="R" class="fill-parchment-hi dark:fill-parchment-hi" />
        <g class="transition-opacity duration-500" :class="lit(st.at)">
          <!-- ring: accent edge; the station the story has just reached is the focus -->
          <circle :r="R" fill="none" :class="s === st.at ? 'stroke-focus dark:stroke-focus' : 'stroke-edge dark:stroke-edge'" :style="{ strokeWidth: s >= st.at ? 4 : 2.5 }" />

          <!-- idea: two figures side by side and a spark between them -->
          <g v-if="st.id === 'idea'" class="fill-parchment stroke-ink dark:fill-parchment dark:stroke-ink" style="stroke-width: 3">
            <circle cx="-14" cy="-10" r="9" />
            <path d="M-30 22 Q -14 0 2 22 Z" />
            <circle cx="15" cy="-10" r="9" />
            <path d="M-1 22 Q 15 0 31 22 Z" />
            <path d="M0 -36 L3 -28 L0 -24 L-3 -28 Z" class="fill-gold stroke-gold-deep dark:fill-gold dark:stroke-gold-deep" style="stroke-width: 1.5" />
          </g>

          <!-- radar dish (top left) and the rising chirp it sends -->
          <g v-else-if="st.id === 'chirp'">
            <g transform="translate(-26 -14)" class="stroke-ink dark:stroke-ink" fill="none" style="stroke-width: 3; stroke-linecap: round">
              <path d="M-10 -12 Q -2 6 14 10" />
              <path d="M2 0 L10 -8 M2 0 L-2 14 L6 14" />
            </g>
            <path :d="chirp" fill="none" class="stroke-focus dark:stroke-focus" style="stroke-width: 3" transform="translate(-14 16)" />
            <path v-if="s >= st.at && !still" :d="chirp" fill="none" pathLength="1" class="story-sweep stroke-gold dark:stroke-gold" style="stroke-width: 5; stroke-linecap: round" transform="translate(-14 16)" />
          </g>

          <!-- Cycleo: a chip marked LoRa -->
          <g v-else-if="st.id === 'cycleo'">
            <g class="stroke-ink dark:stroke-ink" style="stroke-width: 3; stroke-linecap: round">
              <path v-for="k in 4" :key="k" :d="`M${-21 + k * 8.5} -26 V-20 M${-21 + k * 8.5} 20 V26 M-26 ${-21 + k * 8.5} H-20 M20 ${-21 + k * 8.5} H26`" />
            </g>
            <rect x="-20" y="-20" width="40" height="40" rx="4" class="fill-earth/40 stroke-ink dark:fill-earth/40 dark:stroke-ink" style="stroke-width: 3" />
            <text y="6" text-anchor="middle" class="fill-ink-strong dark:fill-ink-strong" style="font-size: 14px; font-weight: 800">LoRa</text>
          </g>

          <!-- Semtech: a rolled deed with a wax seal -->
          <g v-else-if="st.id === 'semtech'">
            <path d="M-24 -22 H18 Q 26 -22 26 -14 V22 H-16 Q -24 22 -24 14 Z" class="fill-parchment stroke-ink dark:fill-parchment dark:stroke-ink" style="stroke-width: 3" />
            <path d="M-16 -10 H16 M-16 -1 H16 M-16 8 H4" class="stroke-ink dark:stroke-ink" style="stroke-width: 2; opacity: 0.7" />
            <circle cx="14" cy="16" r="11" class="fill-trail dark:fill-trail" />
            <circle cx="14" cy="16" r="6" fill="none" class="stroke-page dark:stroke-page" style="stroke-width: 1.5; opacity: 0.8" />
          </g>

          <!-- sensor in the field with a full battery beside it -->
          <g v-else>
            <line x1="-8" y1="26" x2="-8" y2="-2" class="stroke-ink dark:stroke-ink" style="stroke-width: 3.5" />
            <rect x="-22" y="-24" width="28" height="24" rx="4" class="fill-water stroke-ink dark:fill-water dark:stroke-ink" style="stroke-width: 3" />
            <line x1="0" y1="-24" x2="0" y2="-38" class="stroke-water dark:stroke-water" style="stroke-width: 3; stroke-linecap: round" />
            <path d="M-30 26 H30" class="stroke-edge dark:stroke-edge" style="stroke-width: 3" />
            <g transform="translate(18 2)">
              <rect x="-7" y="-14" width="14" height="26" rx="3" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 2.5" />
              <rect x="-3" y="-17" width="6" height="3" class="fill-ink dark:fill-ink" />
              <rect x="-4" y="-10" width="8" height="19" rx="1" class="fill-moss dark:fill-moss" />
            </g>
          </g>
        </g>

        <!-- year seal above the station (2009, 2012) -->
        <g v-if="st.year" class="transition-opacity duration-500" :class="shown(st.at)" :transform="`translate(0 ${-R - 26})`">
          <rect x="-40" y="-18" width="80" height="34" rx="17" class="fill-trail dark:fill-trail" />
          <text y="9" text-anchor="middle" class="fill-parchment-hi dark:fill-parchment-hi" style="font-size: 24px; font-weight: 800">{{ st.year }}</text>
        </g>
        <!-- ten year-marks over the sensor, filling one by one -->
        <g v-if="st.id === 'sensor'">
          <circle
            v-for="(y, i) in YEARS" :key="i" :cx="y.x" :cy="y.y" r="6"
            class="fill-moss stroke-ink transition-opacity duration-300 dark:fill-moss dark:stroke-ink"
            :class="s >= st.at ? 'opacity-100' : 'opacity-0'"
            :style="{ strokeWidth: 1.5, transitionDelay: s >= st.at && !still ? y.delay : '0s' }"
          />
        </g>

        <!-- title and sub-label -->
        <text
          :y="st.ly" text-anchor="middle" class="fill-ink-strong transition-opacity duration-500 dark:fill-ink-strong" :class="shown(st.at)"
          style="font-size: 28px; font-weight: 700; font-style: italic; font-family: Georgia, 'Palatino Linotype', Palatino, serif"
        >{{ st.title }}</text>
        <text
          v-for="(line, li) in SUB[st.id]" :key="line"
          :y="st.ly + SUB_DY + li * SUB_SIZE" text-anchor="middle" class="fill-stone-deep transition-opacity duration-500 dark:fill-stone-deep" :class="shown(st.at)"
          :style="{ fontSize: `${SUB_SIZE}px`, fontWeight: 600 }"
        >{{ line }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
/* The chirp sweep: a short gold segment runs along the rising chirp, left to
   right, then starts again. Frozen by the global .lora-viz reduced-motion
   rule; not rendered at all when still. */
.story-sweep {
  stroke-dasharray: 0.18 0.82;
  stroke-dashoffset: 0.18;
  animation: story-sweep 1.6s ease-in infinite;
}
@keyframes story-sweep {
  to { stroke-dashoffset: -0.82; }
}
.story-still * {
  transition: none !important;
}
</style>
