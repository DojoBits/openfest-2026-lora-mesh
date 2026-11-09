<script setup lang="ts">
// Slide 13 „Chirp модулация“: the siren in traffic, drawn as LoRa's
// frequency-over-time picture. Geometry and numbers live in data/chirpSignal.ts.
//   click 0  empty axes: „честота“ up, „време“ right, one channel band;
//   click 1  up-chirp ramps drawn left to right (the tone slides up), the last
//            one wraps top → bottom (that shift is the data); ambulance icon;
//            (ambulance hidden again from click 4)
//            an inset right of the plot shows the first ramp as a wave whose
//            wiggles tighten (rising diagonal = faster wave), kept to click 3,
//            where it doubles as the shape the receiver knows;
//   click 2  grey speckles all over the plot, the ramp fades (still ≥ 0,6);
//   click 3  a dashed template with the same slope lands on the ramps, then
//            a lit copy of the ramps is drawn over the speckles;
//   click 4  the plot gives way to what SF means: a toy SF2, four panels
//            (00 01 10 11), the same chirp started from 4 frequencies (a dot
//            marks the start), then the real counts: SF7 128, SF12 4096;
//   click 5  SF7 vs SF12 drawn to true scale (32×): same bandwidth (bracket
//            on each row), one time axis in ms, dotted drop lines from each
//            ramp end to the axis, and per row bits per chirp, symbol time
//            and sweep rate (bandwidth / symbol time).
// Projector contrast: signal = moss at full opacity, stroke ≥ 4; noise = stone;
// nothing the room must read under 0,6 opacity; labels ≥ 24 px.
// Every SVG font-size sits in style="" (attributify trap).
import { computed } from 'vue'
import { BW_LABEL, CHIRP_CLICKS, CHIRP_STEPS as S, INSET, INSET_WAVE, LINKED_RAMP, PLOT, PX_PER_MS, ROWS, TIME_AXIS_Y, TIME_TICKS_MS, TOY, VIEW, chips, chirpPath, rampSegments, segmentsPath, speckles, toySegments } from './data/chirpSignal'
import { vis } from './data/format'
import { useStep } from './data/useStep'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(CHIRP_CLICKS, () => props.step, () => props.startAt ?? 0)

const segs = rampSegments()
const ramp = segmentsPath(segs)

// Inset (clicks 1–3): the first ramp as a wave. A gold halo marks the ramp, a gold
// connector arcs over the plot from its top end to the gold-framed card.
const linked = segs[LINKED_RAMP]
const linkedPath = segmentsPath([linked])
const wave = chirpPath(INSET_WAVE)
const cardMid = { x: INSET.x + INSET.w / 2, y: INSET.y + INSET.h / 2 }
// The arc peaks around y 84: under the label line, over the plot and the noise.
const connector = `M${linked.x2 + 4} ${linked.y2 - 8} C${linked.x2 + 120} ${PLOT.fHi - 44} ${INSET.x - 60} ${PLOT.fHi - 24} ${INSET.x - 6} ${INSET.y - 4}`
// Arrowhead at the connector's end, pointing down-right into the card corner.
const arrowHead = `M${INSET.x - 22} ${INSET.y - 8} L${INSET.x - 6} ${INSET.y - 4} L${INSET.x - 12} ${INSET.y - 20}`
const noise = speckles()
// Click 4: the toy panels, each with its chirp, its start dot and the
// three dotted levels that split the band into 4 start frequencies.
const toy = TOY.panels.map(p => {
  const segs = toySegments(p.k)
  return { ...p, d: segmentsPath(segs), start: { x: segs[0].x1, y: segs[0].y1 } }
})
const toyLevels = [1, 2, 3].map(i => TOY.fLo - (i / 4) * (TOY.fLo - TOY.fHi))

const rows = ROWS.map(r => ({ ...r, d: segmentsPath([r.seg]) }))
// Click 5: both rows share x0 and one time scale, so the band spans the
// widest ramp and the time axis lines up with every ramp end.
const t0 = ROWS[0].x0
const bandW = Math.max(...rows.map(r => r.w)) + 12
const tickX = (ms: number) => t0 + ms * PX_PER_MS
const axisEnd = t0 + bandW
// The time label sits by the ramp's end: right of the short ramp's top,
// low in the band under the long ramp's end (clear of the line).
// Row headers start right of the SF7 drop line.
const timeTag = (r: typeof rows[number]) => (r.id === 'short'
  ? { x: r.x0 + r.w + 12, y: r.fHi + 26, anchor: 'start' }
  : { x: r.x0 + r.w - 10, y: r.fHi + 60, anchor: 'end' })
const rowTags = rows.map(r => ({ ...r, tag: timeTag(r) }))
// kHz bracket left of each band: a vertical bar with end ticks.
const bracketX = t0 - 14
const bracket = (r: typeof rows[number]) =>
  `M${bracketX - 7} ${r.fHi} H${bracketX + 7} M${bracketX} ${r.fHi} V${r.fLo} M${bracketX - 7} ${r.fLo} H${bracketX + 7}`

// Clicks 0–3 share one plot; click 4 swaps it for the toy, click 5 for the rows.
const mainOn = computed(() => s.value < S.bits)
const only = (at: number): string => (s.value === at ? 'opacity-100' : 'opacity-0')

// The ramp under the speckles: bold on its own, faded (not gone) in the noise.
const rampStyle = computed(() => (s.value >= S.noise
  ? { 'opacity': 0.65, 'stroke-width': '6px' }
  : { 'opacity': 1, 'stroke-width': '8px' }))

// Labels sit on one line above the plot, clear of the corner icon.
const label = { x: PLOT.x0 - 34, y: 44 }
// Arrowheads for the two axes.
const yArrow = `M${PLOT.x0 - 9} ${PLOT.fHi - 10} L${PLOT.x0} ${PLOT.fHi - 28} L${PLOT.x0 + 9} ${PLOT.fHi - 10}`
const xArrow = `M${PLOT.x1 - 18} ${PLOT.base - 9} L${PLOT.x1} ${PLOT.base} L${PLOT.x1 - 18} ${PLOT.base + 9}`
</script>

<template>
  <div class="lora-viz w-full select-none">
    <svg :viewBox="`0 0 ${VIEW.w} ${VIEW.h}`" class="w-full h-auto overflow-visible">
      <!-- clicks 0–3: frequency over time -->
      <g class="transition-opacity duration-500" :class="mainOn ? 'opacity-100' : 'opacity-0'">
        <!-- the one channel: a parchment band between low and high frequency -->
        <rect :x="PLOT.x0 + 4" :y="PLOT.fHi" :width="PLOT.x1 - PLOT.x0 - 30" :height="PLOT.fLo - PLOT.fHi" class="fill-parchment dark:fill-parchment" />
        <!-- axes with arrows and plain names -->
        <path :d="`M${PLOT.x0} ${PLOT.base} V${PLOT.fHi - 26} M${PLOT.x0} ${PLOT.base} H${PLOT.x1 - 2}`" fill="none" stroke-width="4" stroke-linecap="round" class="stroke-ink dark:stroke-ink" />
        <path :d="yArrow + ' ' + xArrow" fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="stroke-ink dark:stroke-ink" />
        <text :x="PLOT.x0 - 18" :y="(PLOT.fHi + PLOT.fLo) / 2" text-anchor="middle" :transform="`rotate(-90 ${PLOT.x0 - 18} ${(PLOT.fHi + PLOT.fLo) / 2})`" class="fill-ink-strong dark:fill-ink-strong font-semibold" style="font-size: 26px">честота</text>
        <text :x="PLOT.x1" :y="PLOT.base + 34" text-anchor="end" class="fill-ink-strong dark:fill-ink-strong font-semibold" style="font-size: 26px">време</text>

        <!-- click 1: gold halo under the first ramp, the one the inset explains -->
        <path v-if="s >= S.chirp" :d="linkedPath" fill="none" stroke-width="24" stroke-linecap="round" class="halo stroke-gold dark:stroke-gold" />
        <!-- click 1: the ramps, drawn left to right -->
        <path v-if="s >= S.chirp" :d="ramp" pathLength="1" fill="none" stroke-linecap="round" class="chirp draw stroke-moss dark:stroke-moss" :style="rampStyle" />
        <!-- click 2: seeded grey speckles over everything, ramp included -->
        <g class="transition-opacity duration-500" :class="vis(s, S.noise)">
          <rect v-for="(p, i) in noise" :key="i" :x="p.x" :y="p.y" :width="p.w" :height="p.h" rx="3" class="fill-stone dark:fill-stone" />
        </g>
        <!-- click 3: the template lands, then the ramps light up over the noise -->
        <g v-if="s >= S.match">
          <!-- the halo again, now over the noise -->
          <path :d="linkedPath" fill="none" stroke-width="24" stroke-linecap="round" class="halo-lit stroke-gold dark:stroke-gold" />
          <path :d="ramp" pathLength="1" fill="none" stroke-width="10" stroke-linecap="round" class="lit draw stroke-moss dark:stroke-moss" />
          <g class="template">
            <path :d="ramp" fill="none" stroke-width="4" stroke-linecap="round" class="dashed stroke-ink-strong dark:stroke-ink-strong" />
          </g>
        </g>
        <!-- clicks 1–3: the same chirp as a wave (amplitude over time), wiggles tightening -->
        <g v-if="s >= S.chirp" class="inset">
          <path :d="connector + ' ' + arrowHead" fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="stroke-gold dark:stroke-gold" />
          <rect :x="INSET.x" :y="INSET.y" :width="INSET.w" :height="INSET.h" rx="10" stroke-width="4" class="fill-page stroke-gold dark:fill-page dark:stroke-gold" />
          <line :x1="INSET_WAVE.x0" :y1="INSET_WAVE.y" :x2="INSET_WAVE.x1" :y2="INSET_WAVE.y" stroke-width="4" class="stroke-stone dark:stroke-stone" style="opacity: 0.6" />
          <path :d="wave" pathLength="1" fill="none" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" class="wave draw stroke-moss dark:stroke-moss" />
          <text :x="cardMid.x" :y="INSET.y + INSET.h + 34" text-anchor="middle" class="fill-ink-strong dark:fill-ink-strong font-semibold" style="font-size: 24px">същият chirp</text>
          <text :x="cardMid.x" :y="INSET.y + INSET.h + 64" text-anchor="middle" class="fill-ink-strong dark:fill-ink-strong font-semibold" style="font-size: 24px">като вълна</text>
        </g>
      </g>

      <!-- one label per click, all on the same line -->
      <text :x="label.x" :y="label.y" class="transition-opacity duration-500 fill-ink-strong dark:fill-ink-strong font-semibold" :class="only(S.chirp)" style="font-size: 32px">тонът се плъзга нагоре</text>
      <text :x="label.x" :y="label.y" class="transition-opacity duration-500 fill-ink-strong dark:fill-ink-strong font-semibold" :class="only(S.noise)" style="font-size: 32px">шумът е по-силен от сигнала</text>
      <g class="transition-opacity duration-500" :class="only(S.match)">
        <text :x="label.x + 52" :y="label.y" class="fill-ink-strong dark:fill-ink-strong font-semibold" style="font-size: 32px">приемникът знае формата</text>
        <path :d="`M${label.x + 4} ${label.y - 12} l10 11 l20 -24`" fill="none" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" class="stroke-moss dark:stroke-moss" />
      </g>
      <text :x="label.x" :y="label.y" class="transition-opacity duration-500 fill-ink-strong dark:fill-ink-strong font-semibold" :class="only(S.bits)" style="font-size: 32px">SF{{ TOY.sf }}: {{ TOY.sf }} бита в един chirp</text>
      <text :x="label.x" :y="label.y" class="transition-opacity duration-500 fill-ink-strong dark:fill-ink-strong font-semibold" :class="only(S.longer)" style="font-size: 32px">Spreading factor: SF7 и SF12</text>

      <!-- click 4: a toy SF2, the same chirp from 4 start frequencies -->
      <g class="transition-opacity duration-500" :class="only(S.bits)">
        <text :x="TOY.panels[0].x0 - 22" :y="(TOY.fHi + TOY.fLo) / 2" text-anchor="middle" :transform="`rotate(-90 ${TOY.panels[0].x0 - 22} ${(TOY.fHi + TOY.fLo) / 2})`" class="fill-ink-strong dark:fill-ink-strong font-semibold" style="font-size: 26px">честота</text>
        <g v-for="p in toy" :key="p.k">
          <rect :x="p.x0" :y="TOY.fHi" :width="TOY.w" :height="TOY.fLo - TOY.fHi" class="fill-parchment dark:fill-parchment" />
          <!-- 4 start frequencies: the band split in quarters -->
          <line v-for="y in toyLevels" :key="y" :x1="p.x0" :x2="p.x0 + TOY.w" :y1="y" :y2="y" stroke-width="4" stroke-linecap="round" class="dotted stroke-stone dark:stroke-stone" />
          <path :d="p.d" fill="none" stroke-width="7" stroke-linecap="round" class="stroke-moss dark:stroke-moss" />
          <circle :cx="p.start.x" :cy="p.start.y" r="11" stroke-width="4" class="fill-gold stroke-ink dark:fill-gold dark:stroke-ink" />
          <text :x="p.x0 + TOY.w / 2" :y="TOY.fLo + 46" text-anchor="middle" class="fill-ink-strong dark:fill-ink-strong font-bold" style="font-size: 38px; font-family: var(--slidev-code-font-family, monospace)">{{ p.bits }}</text>
        </g>
        <text x="450" :y="TOY.fLo + 104" text-anchor="middle" class="fill-ink-strong dark:fill-ink-strong" style="font-size: 28px"><tspan class="font-bold">SF7</tspan>: {{ chips(7) }} начални честоти, <tspan class="font-bold">SF12</tspan>: {{ chips(12) }}</text>
      </g>

      <!-- click 5: SF7 above SF12, true scale, same band, one time axis -->
      <g class="transition-opacity duration-500" :class="vis(s, S.longer)">
        <g v-for="r in rowTags" :key="r.id">
          <!-- row header: SF name, bits per chirp, sweep rate -->
          <text :x="label.x" :y="r.fHi - 14" class="fill-ink-strong dark:fill-ink-strong font-bold" style="font-size: 32px">SF{{ r.sf }}</text>
          <text :x="t0 + 40" :y="r.fHi - 14" class="fill-ink-strong dark:fill-ink-strong" style="font-size: 26px"><tspan class="font-bold">{{ r.sf }}</tspan> бита в chirp</text>
          <text :x="t0 + 290" :y="r.fHi - 14" class="fill-ink-strong dark:fill-ink-strong" style="font-size: 26px"><tspan class="fill-stone-deep dark:fill-stone-deep">sweep rate </tspan><tspan class="font-bold">{{ r.sweep }}</tspan></text>
          <!-- the band and its size -->
          <rect :x="r.x0" :y="r.fHi" :width="bandW" :height="r.fLo - r.fHi" class="fill-parchment dark:fill-parchment" />
          <path :d="bracket(r)" fill="none" stroke-width="4" stroke-linecap="round" class="stroke-ink dark:stroke-ink" />
          <text :x="bracketX - 14" :y="(r.fHi + r.fLo) / 2 - 6" text-anchor="end" class="fill-stone-deep dark:fill-stone-deep" style="font-size: 24px">bandwidth</text>
          <text :x="bracketX - 14" :y="(r.fHi + r.fLo) / 2 + 24" text-anchor="end" class="fill-ink-strong dark:fill-ink-strong font-semibold" style="font-size: 26px">{{ BW_LABEL }}</text>
          <!-- dotted drop from the ramp's end to the time axis -->
          <line :x1="r.x0 + r.w" :y1="r.fHi" :x2="r.x0 + r.w" :y2="TIME_AXIS_Y" stroke-width="4" stroke-linecap="round" class="dotted stroke-stone-deep dark:stroke-stone-deep" />
          <path :d="r.d" fill="none" stroke-width="8" stroke-linecap="round" class="stroke-moss dark:stroke-moss" />
          <text :x="r.tag.x" :y="r.tag.y" :text-anchor="r.tag.anchor" class="fill-moss dark:fill-moss font-bold" style="font-size: 28px">{{ r.time }}</text>
        </g>
        <!-- one time axis in ms for both rows -->
        <path :d="`M${t0} ${TIME_AXIS_Y} H${axisEnd}`" fill="none" stroke-width="4" stroke-linecap="round" class="stroke-ink dark:stroke-ink" />
        <g v-for="ms in TIME_TICKS_MS" :key="ms">
          <path :d="`M${tickX(ms)} ${TIME_AXIS_Y - 7} V${TIME_AXIS_Y + 7}`" fill="none" stroke-width="4" stroke-linecap="round" class="stroke-ink dark:stroke-ink" />
          <text :x="tickX(ms)" :y="TIME_AXIS_Y + 34" text-anchor="middle" class="fill-ink-strong dark:fill-ink-strong" style="font-size: 24px">{{ ms }}</text>
        </g>
        <text :x="bracketX - 14" :y="TIME_AXIS_Y + 34" text-anchor="end" class="fill-ink-strong dark:fill-ink-strong font-semibold" style="font-size: 26px">време, ms</text>
      </g>

      <!-- analogy icon (top right): an ambulance with its siren on clicks 1–3,
           grey traffic next to it on clicks 2–3, both gone from click 4 -->
      <g class="transition-opacity duration-500" :class="s >= S.chirp && s < S.bits ? 'opacity-100' : 'opacity-0'" transform="translate(772 8)" aria-label="ambulance">
        <path d="M26 12 q14 -12 28 0 M18 6 q22 -18 44 0" fill="none" stroke-width="4" stroke-linecap="round" class="stroke-moss dark:stroke-moss" />
        <rect x="34" y="16" width="12" height="8" rx="2" class="fill-trail dark:fill-trail" />
        <rect x="2" y="24" width="80" height="38" rx="6" stroke-width="4" class="fill-page stroke-ink dark:fill-page dark:stroke-ink" />
        <path d="M82 34 h12 l14 14 v14 h-26 z" stroke-width="4" stroke-linejoin="round" class="fill-page stroke-ink dark:fill-page dark:stroke-ink" />
        <rect x="35" y="33" width="8" height="22" class="fill-trail dark:fill-trail" />
        <rect x="28" y="40" width="22" height="8" class="fill-trail dark:fill-trail" />
        <circle cx="22" cy="64" r="8" class="fill-ink dark:fill-ink" />
        <circle cx="88" cy="64" r="8" class="fill-ink dark:fill-ink" />
      </g>
      <g class="transition-opacity duration-500" :class="s >= S.noise && s < S.bits ? 'opacity-100' : 'opacity-0'" transform="translate(676 38)">
        <g v-for="cx in [0, 46]" :key="cx" :transform="`translate(${cx} 0)`">
          <path d="M2 30 v-12 l8 -10 h20 l8 10 v12 z" class="fill-stone dark:fill-stone" />
          <circle cx="11" cy="31" r="5" class="fill-stone-deep dark:fill-stone-deep" />
          <circle cx="29" cy="31" r="5" class="fill-stone-deep dark:fill-stone-deep" />
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.chirp {
  transition: opacity 0.5s ease, stroke-width 0.5s ease;
}
.dashed {
  stroke-dasharray: 12 9;
}
/* click 4: start-frequency levels, click 5: drop lines to the time axis */
.dotted {
  stroke-dasharray: 0.1 10;
}
/* click 1: the ramps are drawn left to right (pathLength = 1, so dash = whole path) */
.draw {
  stroke-dasharray: 1;
  animation: draw 1.4s ease-out both;
}
/* click 3: the lit ramps wait until the template has landed */
.lit {
  animation-delay: 0.9s;
}
@keyframes draw {
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
}
/* click 1: halo and inset fade in once the ramps are drawn, then the wave
   draws left to right. Click 3: the halo returns over the noise with the lit
   ramps. Resting style = final frame (reduced motion). */
.halo,
.inset {
  animation: appear 0.5s ease-out 1.4s both;
}
.halo-lit {
  animation: appear 0.5s ease-out 0.9s both;
}
.wave {
  animation-delay: 1.8s;
}
@keyframes appear {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* click 3: the dashed template drops from above onto the ramps. The resting
   style is the landed position, so reduced motion shows the final frame. */
.template {
  animation: land 0.9s ease-out both;
}
@keyframes land {
  from { transform: translateY(-120px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
</style>
