<script setup lang="ts">
// Slide 24 „Батерии: химия и напрежение“: a horizontal voltage ruler (2,5–9 V)
// with the board's battery window as a green band, in a framed parchment card.
// One bar per click (values: data/batteryWindow.ts, from research/T10, tested):
//   1 Li-ion / LiPo cell — inside the band, ✓
//   2 LiFePO4 cell       — inside the band, ✓, but a red dashed arrow to 4,2 V:
//                          the board charger fills it to 4,2 V → overcharge
//   3 2S pack (series) — far right of the band, red, ✗ (its glyph stays left)
//   4 solar-panel card under the ruler (not on it): 5 V panels
// A small cell glyph sits just left of each bar (18650 + pouch, LiFePO4 cylinder in
// water blue, two cells for 2S). Map tokens only, each class with its dark:
// twin; every SVG font-size, stroke width and opacity lives in style=""
// (attributify trap).
import { TONE } from './data/tones'
import { fmt, vis } from './data/format'
import { useStep } from './data/useStep'
import { BATTERY_BARS, BOARD_WINDOW, BV_H, BV_RULER, BV_TICKS, BV_W, SOLAR_CARD, vx } from './data/batteryWindow'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(SOLAR_CARD.at, () => props.step, () => props.startAt ?? 0)

const w = (n: number) => `stroke-width: ${n}`
const OL = 'stroke-ink dark:stroke-ink'
const INK_FILL = 'fill-ink-strong dark:fill-ink-strong'
const HALO = 'stroke-parchment-hi dark:stroke-parchment-hi'
const TEXT_STYLE = (size: number) => `font-size: ${size}px; font-weight: 700; paint-order: stroke; stroke-width: 7px; stroke-linejoin: round`

const BAR_H = 30
const R = BV_RULER
const W = BOARD_WINDOW
// Band geometry: solid part to 4,3 V, paler strip from 4,3 to 4,4 V.
const band = {
  x: vx(W.from),
  xSolid: vx(W.solidTo),
  xTo: vx(W.to),
  top: W.top,
  h: R.y - W.top,
}

// Each bar in SVG units, plus where its ✓ / ✗ sits (inside the bar's right end).
const bars = BATTERY_BARS.map(b => ({
  b,
  x: vx(b.from),
  w: vx(b.to) - vx(b.from),
  y: b.y - BAR_H / 2,
  markX: vx(b.to) - 20,
  // Glyph column: just left of the bar, except 2S, whose bar sits far right —
  // its cells stay aligned under the Li-ion glyph so the left column reads as one list.
  glyphX: b.id === '2s' ? vx(BOARD_WINDOW.from) - 128 : vx(b.from) - 134, // +6: 2S cells start at x 14, Li-ion at 20
  // LiFePO4 only: the stretch the board charger adds on top of the 3,65 V full
  over: b.overchargeTo === undefined ? undefined : { x1: vx(b.to), x2: vx(b.overchargeTo) },
}))
</script>

<template>
  <div class="lora-viz flex w-full select-none flex-col gap-3">
    <div class="overflow-hidden rounded-[10px] border-2 border-ink/70 dark:border-ink/70 shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
      <svg class="block w-full" :viewBox="`0 0 ${BV_W} ${BV_H}`" role="img" aria-label="Линийка на напрежението: прозорец на входа за батерия и три вида батерии">
        <rect x="0" y="0" :width="BV_W" :height="BV_H" class="fill-parchment-hi dark:fill-parchment-hi" />

        <!-- board window: solid green band to 4,3 V, paler strip to 4,4 V, label on top -->
        <rect :x="band.x" :y="band.top" :width="band.xSolid - band.x" :height="band.h" class="fill-moss/20 dark:fill-moss/20" />
        <rect :x="band.xSolid" :y="band.top" :width="band.xTo - band.xSolid" :height="band.h" class="fill-moss/10 dark:fill-moss/10" />
        <line :x1="band.xSolid" :x2="band.xSolid" :y1="band.top" :y2="R.y" class="stroke-moss dark:stroke-moss" :style="w(3)" />
        <line :x1="band.xTo" :x2="band.xTo" :y1="band.top" :y2="R.y" stroke-dasharray="6 5" class="stroke-moss dark:stroke-moss" :style="w(2)" />
        <text :x="(band.x + band.xTo) / 2" :y="band.top - 12" text-anchor="middle" :class="[TONE.emerald.label, HALO]" :style="TEXT_STYLE(26)">{{ W.label }}</text>

        <!-- ruler: axis, a tick every 0,5 V, whole volts labelled -->
        <line :x1="R.x0" :x2="R.x1" :y1="R.y" :y2="R.y" :class="OL" :style="w(3)" />
        <g v-for="t in BV_TICKS" :key="t.v">
          <line :x1="vx(t.v)" :x2="vx(t.v)" :y1="R.y" :y2="R.y + (t.major ? 14 : 8)" :class="OL" :style="w(t.major ? 3 : 2)" />
          <text v-if="t.major" :x="vx(t.v)" :y="R.y + 40" text-anchor="middle" :class="INK_FILL" style="font-size: 26px; font-weight: 700">{{ fmt(t.v) }}</text>
        </g>
        <text :x="R.x1 + 22" :y="R.y + 40" text-anchor="middle" :class="INK_FILL" style="font-size: 26px; font-weight: 700">V</text>

        <!-- one bar per click: cell glyph, bar, ✓ / ✗, label -->
        <g v-for="r in bars" :key="r.b.id" class="transition-opacity duration-500" :class="vis(s, r.b.at)">
          <!-- cell glyph (drawn at x ≈ 20–122), shifted to sit just left of its bar;
               the 2S glyph stays in the same left column as the other cells -->
          <g :transform="`translate(${r.glyphX} ${r.b.y})`" :class="OL" :style="w(2)">
            <template v-if="r.b.id === 'liion'">
              <!-- 18650 cylinder with its + nub, and a flat LiPo pouch with two tabs -->
              <rect x="20" y="-14" width="58" height="28" rx="7" :class="TONE.amber.fill" />
              <rect x="78" y="-6" width="6" height="12" rx="1.5" class="fill-stone dark:fill-stone" />
              <rect x="94" y="-18" width="28" height="36" rx="4" class="fill-stone/50 dark:fill-stone/70" />
              <rect x="100" y="-24" width="5" height="7" class="fill-stone dark:fill-stone" />
              <rect x="111" y="-24" width="5" height="7" class="fill-stone dark:fill-stone" />
            </template>
            <template v-else-if="r.b.id === 'lifepo4'">
              <!-- LiFePO4 cylinder in a different wrap colour -->
              <rect x="30" y="-14" width="66" height="28" rx="7" :class="TONE.blue.fill" />
              <rect x="96" y="-6" width="6" height="12" rx="1.5" class="fill-stone dark:fill-stone" />
            </template>
            <template v-else>
              <!-- 2S: two cells end to end, + of the first touching − of the second,
                   so it reads as a series string (parallel would be fine: same voltage) -->
              <rect x="14" y="-12" width="44" height="24" rx="6" :class="TONE.amber.fill" />
              <rect x="58" y="-5" width="5" height="10" rx="1.5" class="fill-stone dark:fill-stone" />
              <rect x="63" y="-12" width="44" height="24" rx="6" :class="TONE.amber.fill" />
              <rect x="107" y="-5" width="5" height="10" rx="1.5" class="fill-stone dark:fill-stone" />
            </template>
          </g>

          <!-- the bar: green when it fits, red when it does not -->
          <rect
            :x="r.x" :y="r.y" :width="r.w" :height="BAR_H" rx="8"
            :class="[r.b.fits ? TONE.emerald.fill : TONE.red.fill, OL]" :style="w(2)"
          />
          <!-- ✓ / ✗ inside the right end of the bar -->
          <path
            v-if="r.b.fits" :d="`M ${r.markX - 9},${r.b.y} l 7,8 l 13,-15`" fill="none"
            class="stroke-parchment-hi dark:stroke-page" :style="w(5)" stroke-linecap="round" stroke-linejoin="round"
          />
          <path
            v-else :d="`M ${r.markX - 8},${r.b.y - 8} l 16,16 m 0,-16 l -16,16`" fill="none"
            class="stroke-parchment-hi dark:stroke-page" :style="w(5)" stroke-linecap="round"
          />

          <!-- LiFePO4: dashed red overcharge stretch from 3,65 V to 4,2 V, arrow head and marker -->
          <g v-if="r.over">
            <rect :x="r.over.x1" :y="r.y + 4" :width="r.over.x2 - r.over.x1 - 6" :height="BAR_H - 8" stroke-dasharray="6 4" fill="none" :class="TONE.red.stroke" :style="w(3)" />
            <path :d="`M ${r.over.x2 + 6},${r.b.y} l -14,-9 v 18 Z`" :class="TONE.red.fill" />
            <line :x1="r.over.x2 + 6" :x2="r.over.x2 + 6" :y1="r.y - 8" :y2="r.y + BAR_H + 8" :class="TONE.red.stroke" :style="w(3)" />
          </g>

          <text
            :x="r.b.labelX" :y="r.b.labelY" :text-anchor="r.b.labelAnchor"
            :class="[r.b.fits ? INK_FILL : TONE.red.label, HALO]" :style="TEXT_STYLE(r.b.size)"
          >{{ r.b.label }}</text>
          <text
            v-for="(ln, k) in r.b.warn ?? []" :key="ln"
            :x="r.b.labelX" :y="r.b.labelY + 32 + k * 30"
            :class="[TONE.red.label, HALO]" :style="TEXT_STYLE(24)"
          >{{ ln }}</text>
        </g>
      </svg>
    </div>

    <!-- click 4: solar panel, a separate card (not a bar on the ruler) -->
    <div class="card-surface flex items-center gap-5 rounded-xl border px-5 py-2 transition-opacity duration-500" :class="vis(s, SOLAR_CARD.at)">
      <svg width="72" height="48" viewBox="0 0 72 48" aria-hidden="true" class="shrink-0">
        <path d="M 6,40 L 20,6 L 66,6 L 56,40 Z" :class="[TONE.blue.fill, OL]" :style="w(2.5)" stroke-linejoin="round" />
        <path d="M 13,23 H 61 M 27,6 L 22,40 M 43,6 L 39,40" fill="none" class="stroke-parchment-hi dark:stroke-page" :style="w(2)" />
      </svg>
      <div class="whitespace-nowrap text-2xl font-bold">{{ SOLAR_CARD.title }}</div>
      <div class="flex flex-col leading-tight">
        <span class="whitespace-nowrap text-xl">{{ SOLAR_CARD.lines[0] }}</span>
        <span class="whitespace-nowrap text-xl font-semibold" :class="TONE.red.text">{{ SOLAR_CARD.lines[1] }}</span>
      </div>
    </div>
  </div>
</template>
