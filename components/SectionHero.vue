<script setup lang="ts">
// Section slide as a trail checkpoint. Wraps the slide's title + subtitle
// (default slot) with:
//   - the section icon in an accent ring with radio arcs around it;
//   - a hill band along the bottom carrying a mini copy of the slide-5 trail
//     (data/journey.ts) in the map's own inks: parchment hills, the route
//     dashed trail-red ahead and solid trail-red walked up to this section's
//     stop; each stop a small copy of its slide-5 medallion (the same
//     JourneyIcons art): passed stops ringed in trail red, this stop bigger
//     with a heavy ink ring and a red wax number badge, stops ahead ghosted;
//   - no words on the band: it is decorated with the slide-5 map artifacts
//     instead (MapGlyphs terrain, MapPerils creatures, the very same
//     components), placed by data/trailBand.ts, which also owns the band
//     mapping. Tests keep every artifact off the trail, stops and flag.
// Section → stop comes from data/sections.ts (tested). Icon + accent pairs are
// the CLAUDE.md table, written literally because UnoCSS only extracts from
// source text. SVG stroke sizes live in `style` (attributify trap).
import { computed } from 'vue'
import { useNav } from '@slidev/client'
import { JOURNEY_CLICKS, JOURNEY_ICONS, JOURNEY_STOPS } from './data/journey'
import { SECTIONS, type SectionId } from './data/sections'
import {
  BAND_H, BAND_START, BAND_STOPS, BAND_W, CURRENT_R, FLAG_OFFSET, HILL_EDGE, START_MARK_R, STOP_R,
  RIDGE_PATH, bandArtifacts, bandLeg,
} from './data/trailBand'

// `compact`: smaller icon block, for a section slide that also carries a diagram.
const props = defineProps<{ section: SectionId, compact?: boolean }>()

// Accents are journey-map tokens (style.css --c-*): the three projects keep
// their identity hues, the other sections take a map colour each. The four
// stop openers (radio, lora, start, connect) take the stop accent that
// slide-bottom.vue + style.css set per slide (--c-accent-ink).
const ACCENT: Record<SectionId, { text: string, ring: string, tint: string, stroke: string }> = {
  radio: { text: 'text-accent-ink dark:text-accent-ink', ring: 'border-accent-ink dark:border-accent-ink', tint: 'bg-parchment dark:bg-parchment', stroke: 'stroke-accent-ink dark:stroke-accent-ink' },
  lora: { text: 'text-accent-ink dark:text-accent-ink', ring: 'border-accent-ink dark:border-accent-ink', tint: 'bg-parchment dark:bg-parchment', stroke: 'stroke-accent-ink dark:stroke-accent-ink' },
  meshtastic: { text: 'text-verdigris dark:text-verdigris', ring: 'border-verdigris dark:border-verdigris', tint: 'bg-parchment dark:bg-parchment', stroke: 'stroke-verdigris dark:stroke-verdigris' },
  meshcore: { text: 'text-dusk dark:text-dusk', ring: 'border-dusk dark:border-dusk', tint: 'bg-parchment dark:bg-parchment', stroke: 'stroke-dusk dark:stroke-dusk' },
  reticulum: { text: 'text-wine dark:text-wine', ring: 'border-wine dark:border-wine', tint: 'bg-parchment dark:bg-parchment', stroke: 'stroke-wine dark:stroke-wine' },
  start: { text: 'text-accent-ink dark:text-accent-ink', ring: 'border-accent-ink dark:border-accent-ink', tint: 'bg-parchment dark:bg-parchment', stroke: 'stroke-accent-ink dark:stroke-accent-ink' },
  communities: { text: 'text-moss dark:text-moss', ring: 'border-moss dark:border-moss', tint: 'bg-parchment dark:bg-parchment', stroke: 'stroke-moss dark:stroke-moss' },
  connect: { text: 'text-accent-ink dark:text-accent-ink', ring: 'border-accent-ink dark:border-accent-ink', tint: 'bg-parchment dark:bg-parchment', stroke: 'stroke-accent-ink dark:stroke-accent-ink' },
}

const a = computed(() => ACCENT[props.section])
const stop = computed(() => SECTIONS[props.section].stop)
const artifacts = computed(() => bandArtifacts(props.section))
// Print/export gets a still frame: the dragons' wings do not flap.
const { isPrintMode } = useNav()

// Mini trail in band coordinates (980 × 140): start mark, then the stops.
const pts = [BAND_START, ...BAND_STOPS]

// Each leg sampled into a polyline in band coordinates.
const SAMPLES = 24
const legPts = JOURNEY_STOPS.map((_, i) =>
  Array.from({ length: SAMPLES + 1 }, (_, k) => bandLeg(i, k / SAMPLES)))
const poly = (ps: { x: number, y: number }[]) => ps.map((p, k) => `${k ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
const legs = legPts.map(poly)
// Near hill: its top edge (the horizon dragons fly above, trailBand.ts) closed to the bottom.
const hill = `${poly(HILL_EDGE)} L${BAND_W} ${BAND_H} L0 ${BAND_H} Z`
const summit = pts.at(-1)!

// Stop medallion radius: this section's stop is the big one (as slide 5's lit stop).
const r = (i: number): number => (i + 1 === stop.value ? CURRENT_R : STOP_R)
// Slide-5 badge: a 28 px seal on a 72 px medallion, its centre ~0.8 r up-left
// of the medallion centre. Same proportions here: radius 0.4 r, offset 0.8 r.
const BADGE_K = 0.4
const BADGE_OFF = 0.8
// Rings show only their left and right sides, so they read as radio waves and
// stay clear of the title underneath.
const ARC = { borderTopColor: 'transparent', borderBottomColor: 'transparent' }
</script>

<template>
  <div class="lora-viz flex flex-col items-center pb-20">
    <!-- icon in an accent ring, radio arcs (( )) spreading out to both sides -->
    <div class="relative flex items-center justify-center" :class="compact ? '-mt-4 -mb-1 h-28 w-28 scale-75' : 'mb-6 h-28 w-28'">
      <div class="absolute left-1/2 top-1/2 h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 opacity-50" :class="a.ring" :style="ARC" />
      <div class="absolute left-1/2 top-1/2 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 opacity-30" :class="a.ring" :style="ARC" />
      <div class="absolute left-1/2 top-1/2 h-[290px] w-[290px] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 opacity-15" :class="a.ring" :style="ARC" />
      <div class="relative flex h-28 w-28 items-center justify-center rounded-full border-4 text-6xl shadow-md" :class="[a.ring, a.tint, a.text]">
        <carbon-radio v-if="section === 'radio'" />
        <carbon-waveform v-else-if="section === 'lora'" />
        <!-- the three projects show their own marks (ProjectLogo, data/projectLogos.ts) -->
        <ProjectLogo v-else-if="section === 'meshtastic'" project="meshtastic" class="w-[76px] translate-y-[2px]" />
        <ProjectLogo v-else-if="section === 'meshcore'" project="meshcore" class="w-[74px]" />
        <ProjectLogo v-else-if="section === 'reticulum'" project="reticulum" class="w-[70px]" />
        <carbon-tool-kit v-else-if="section === 'start'" />
        <carbon-crossroads v-else-if="section === 'connect'" />
        <carbon-user-multiple v-else />
      </div>
    </div>

    <div class="relative">
      <slot />
    </div>

    <!-- bottom band: hills + map artifacts + mini trail with this section's stop lit -->
    <div class="absolute bottom-0 left-0" :style="{ width: `${BAND_W}px`, height: `${BAND_H}px` }">
      <svg class="absolute inset-0 overflow-visible" :width="BAND_W" :height="BAND_H" :viewBox="`0 0 ${BAND_W} ${BAND_H}`" aria-hidden="true">
        <!-- far ridge in the map's scorched-edge tone, near hill in parchment -->
        <path class="fill-parchment-lo dark:fill-parchment-lo" :d="RIDGE_PATH" style="opacity: 0.55" />
        <path class="fill-parchment dark:fill-parchment" :d="hill" />
        <!-- slide-5 map artifacts on the hills, behind the trail (trailBand.ts keeps them clear of it) -->
        <template v-for="(art, i) in artifacts" :key="`a${i}`">
          <!-- dragons ride a slow vertical bob (a CSS transform on the wrapper, still in print) -->
          <g v-if="art.kind === 'peril' && art.peril === 'dragon'" :class="{ 'dragon-bob': !isPrintMode }">
            <MapPerils :kind="art.peril" :x="art.x" :y="art.y" :scale="art.scale" :flip="art.flip" :static="isPrintMode" />
          </g>
          <MapPerils
            v-else-if="art.kind === 'peril'"
            :kind="art.peril" :x="art.x" :y="art.y" :scale="art.scale" :flip="art.flip" :static="isPrintMode"
          />
          <MapGlyphs v-else-if="art.kind === 'compass'" kind="compass" :x="art.x" :y="art.y" :s="art.s" />
          <MapGlyphs v-else :kind="art.kind" :x="art.x" :y="art.y" :pts="art.pts" />
        </template>
        <!-- route as on slide 5: dashed trail-red ahead, solid trail-red once walked -->
        <path
          v-for="(d, i) in legs" :key="d" :d="d" fill="none"
          class="stroke-trail dark:stroke-trail"
          :style="i < stop ? 'stroke-width: 5; stroke-linecap: round' : 'stroke-width: 3; stroke-dasharray: 8 7; stroke-linecap: round; opacity: 0.7'"
        />
        <!-- start: small inked circle with a dot (the slide-5 start mark) -->
        <circle :cx="pts[0].x" :cy="pts[0].y" :r="START_MARK_R" class="fill-parchment stroke-ink dark:fill-parchment dark:stroke-ink" style="stroke-width: 2.5" />
        <circle :cx="pts[0].x" :cy="pts[0].y" r="2.5" class="fill-ink dark:fill-ink" />
        <!-- stops: small copies of the slide-5 medallions, each with its JourneyIcons art.
             The disc is opaque so the dashed trail never shows through; ghosting
             (stops ahead) is on the ring and icon only, as on slide 5. -->
        <g v-for="(p, i) in BAND_STOPS" :key="i">
          <circle
            :cx="p.x" :cy="p.y" :r="r(i)" class="fill-parchment dark:fill-parchment"
            style="filter: drop-shadow(0 1px 2px rgba(74, 53, 32, 0.4))"
          />
          <g :style="i + 1 > stop ? 'opacity: 0.5' : ''">
            <!-- ring: passed = trail red, this stop = heavy ink, ahead = thin ink -->
            <circle
              :cx="p.x" :cy="p.y" :r="r(i)" fill="none"
              :class="i + 1 < stop ? 'stroke-trail dark:stroke-trail' : 'stroke-ink dark:stroke-ink'"
              :style="i + 1 === stop ? 'stroke-width: 3.5' : 'stroke-width: 2.5'"
            />
            <!-- icon box = medallion diameter; x/y fall through to JourneyIcons' root <svg> -->
            <JourneyIcons :kind="JOURNEY_ICONS[i]" :size="2 * r(i)" :x="p.x - r(i)" :y="p.y - r(i)" />
          </g>
          <!-- this stop's number: red wax seal with cream text, up-left as on slide 5,
               in slide 5's badge hexes (the dark seal is a deeper red than the
               trail token, and its text stays cream: parchment-hi goes brown in dark) -->
          <g v-if="i + 1 === stop" class="badge">
            <circle
              :cx="p.x - BADGE_OFF * r(i)" :cy="p.y - BADGE_OFF * r(i)" :r="BADGE_K * r(i)"
              class="fill-[#8b1e1e] stroke-[#f6ecd0] dark:fill-[#b83a36] dark:stroke-[#fff6e0]" style="stroke-width: 1.5"
            />
            <text
              :x="p.x - BADGE_OFF * r(i)" :y="p.y - BADGE_OFF * r(i) + 4" text-anchor="middle"
              class="fill-[#f6ecd0] dark:fill-[#fff6e0]" style="font-size: 12px; font-weight: 700"
            >{{ i + 1 }}</text>
          </g>
        </g>
      </svg>
      <carbon-flag-filled
        class="absolute text-2xl"
        :class="stop === JOURNEY_CLICKS ? 'text-trail dark:text-trail' : 'text-stone dark:text-stone'"
        :style="{ left: `${summit.x + FLAG_OFFSET.dx}px`, top: `${summit.y + FLAG_OFFSET.dy}px` }"
      />
    </div>
  </div>
</template>

<style scoped>
/* gentle float; amplitude 4 px stays well inside the 40 px sky gap tested in sections.test.ts */
.dragon-bob { animation: dragon-bob 4s ease-in-out infinite; }
@keyframes dragon-bob { 0%, 100% { transform: translateY(-3px); } 50% { transform: translateY(3px); } }
@media (prefers-reduced-motion: reduce) { .dragon-bob { animation: none; } }
</style>
