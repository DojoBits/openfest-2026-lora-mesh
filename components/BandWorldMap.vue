<script setup lang="ts">
// Slide „Различни ленти по света“: a parchment world map in the slide-5 style.
// Each click lights a group of regions and drops a callout card next to them:
// the Meshtastic region code, the band edges in big type, and a mini spectrum
// strip (the same broken 420–520 | 840–940 MHz axis as before, via axisPct)
// with the band marked where it sits. Bulgaria / EU_868 is in the accent colour.
// The last click wraps a 2,4 GHz ribbon round the map and outlines every coast:
// the one LoRa band allowed everywhere.
// Clicks: 1 Europe, 2 Americas + Pacific, 3 Asia, 4 2,4 GHz (data/regionBands.ts).
// Land outlines: data/worldLand.ts (generated); card placement: data/bandMapLayout.ts.
import { computed } from 'vue'
import { useNav } from '@slidev/client'
import { AXIS_SEGMENTS, LORA_24, REGION_BANDS, REGION_CLICKS, axisPct, bandLabel } from './data/regionBands'
import { BAND_CALLOUTS, BAND_MAP_H, CARD_H, COMPASS_AT, DRAGON_AT, RIBBON, cardEdgePoint, lonLatToXY } from './data/bandMapLayout'
import { LAND_PATH, MAP_H, MAP_W, REGION_PATHS } from './data/worldLand'
import { vis } from './data/format'
import { useStep } from './data/useStep'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(REGION_CLICKS, () => props.step, () => props.startAt ?? 0)
const { isPrintMode } = useNav()

// One entry per band: its data, its card, and the leader line from the card's
// nearest edge to the anchor point on land.
const callouts = computed(() => REGION_BANDS.map((b) => {
  const c = BAND_CALLOUTS[b.code]
  const a = lonLatToXY(...c.anchor)
  const e = cardEdgePoint(c.card, a.x, a.y)
  return { b, c, a, e }
}))

// Region shapes, each lit at the click of its first band. EU and BG both
// belong to Europe (click 1); BG is drawn last so it sits on top of EU.
const REGION_ORDER = ['EU', 'US', 'ANZ', 'JP', 'KR', 'IN', 'CN', 'BG'] as const
const regionAt = (r: string) => Math.min(...REGION_BANDS.filter(b => BAND_CALLOUTS[b.code].region === r).map(b => b.at), r === 'EU' ? 1 : Infinity)

// Mini spectrum strip: narrow bands (EU_433: 1,7 MHz, about 1,5 % of the axis)
// would vanish at true width, so keep a visible minimum.
const MIN_W = 6
const bandStyle = ([lo, hi]: readonly [number, number]) => ({
  left: `${axisPct(lo)}%`,
  width: `${Math.max(axisPct(hi) - axisPct(lo), MIN_W)}%`,
})
</script>

<template>
  <div class="lora-viz relative mx-auto select-none" :style="{ width: `${MAP_W}px`, height: `${BAND_MAP_H}px` }">
    <svg class="absolute left-0 top-0" :width="MAP_W" :height="MAP_H" :viewBox="`0 0 ${MAP_W} ${MAP_H}`" aria-hidden="true">
      <!-- sea, then land in parchment with ink coasts (slide-5 palette) -->
      <rect x="0" y="0" :width="MAP_W" :height="MAP_H" rx="10" class="fill-water/20 dark:fill-water/5" />
      <path :d="LAND_PATH" class="fill-parchment stroke-ink dark:fill-parchment-hi" style="stroke-width: 0.8; stroke-linejoin: round; opacity: 0.95" />

      <!-- highlighted regions: Europe tinted red, Bulgaria solid; the rest water blue -->
      <path
        v-for="r in REGION_ORDER" :key="r" :d="REGION_PATHS[r]"
        class="transition-opacity duration-500"
        :class="[
          r === 'BG' ? 'fill-trail stroke-trail' : r === 'EU' ? 'fill-trail/30 stroke-trail' : 'fill-water/55 stroke-water',
          vis(s, regionAt(r)),
        ]"
        style="stroke-width: 1.2; stroke-linejoin: round"
      />

      <!-- click 4: every coast inked green, the same band everywhere -->
      <path
        :d="LAND_PATH" fill="none" class="stroke-moss transition-opacity duration-500" :class="vis(s, LORA_24.at)"
        style="stroke-width: 2.2; stroke-linejoin: round"
      />

      <!-- ornaments in open sea, off every card -->
      <MapGlyphs kind="compass" :x="COMPASS_AT.x" :y="COMPASS_AT.y" :s="0.8" />
      <MapPerils kind="dragon" :x="DRAGON_AT.x" :y="DRAGON_AT.y" :scale="DRAGON_AT.scale" :flip="true" :static="isPrintMode" />

      <!-- leader lines: card edge to a dot on the region -->
      <g v-for="{ b, a, e } in callouts" :key="`l${b.code}`" class="transition-opacity duration-500" :class="vis(s, b.at)">
        <line :x1="e.x" :y1="e.y" :x2="a.x" :y2="a.y" :class="b.home ? 'stroke-trail' : 'stroke-ink'" style="stroke-width: 1.6" />
        <circle :cx="a.x" :cy="a.y" r="4" :class="b.home ? 'fill-trail stroke-parchment-hi' : 'fill-ink stroke-parchment-hi'" style="stroke-width: 1.5" />
      </g>
    </svg>

    <!-- map frame: thin double ink line, like the slide-5 map -->
    <div class="pointer-events-none absolute left-0 top-0 rounded-[10px] border-2 border-ink/70" :style="{ width: `${MAP_W}px`, height: `${MAP_H}px` }" />

    <!-- callout cards: code + MHz, band edges, mini spectrum strip -->
    <div
      v-for="{ b, c } in callouts" :key="b.code"
      class="absolute rounded-lg border-2 bg-parchment-hi px-2 py-1 shadow-[0_2px_6px_rgba(0,0,0,0.25)] transition-opacity duration-500"
      :class="[b.home ? 'border-trail' : 'border-ink/60', vis(s, b.at)]"
      :style="{ left: `${c.card.x}px`, top: `${c.card.y}px`, width: `${c.card.w}px`, height: `${CARD_H}px` }"
    >
      <div class="flex items-baseline justify-between text-base leading-5">
        <span class="font-mono font-bold" :class="b.home ? 'text-trail' : 'text-ink-strong'">{{ b.code }}</span>
        <span class="text-stone-deep">MHz</span>
      </div>
      <div class="whitespace-nowrap text-xl font-bold leading-7 text-ink-strong">{{ bandLabel(b.mhz, false) }}</div>
      <!-- the broken axis in miniature: two thin pieces, the band as a thick mark -->
      <div class="relative mt-1 h-[10px]">
        <div
          v-for="g in AXIS_SEGMENTS" :key="g.from"
          class="absolute top-[4px] h-[2px] bg-stone"
          :style="{ left: `${g.start}%`, width: `${g.width}%` }"
        />
        <div class="absolute top-0 h-[10px] rounded-sm" :class="b.home ? 'bg-trail' : 'bg-water'" :style="bandStyle(b.mhz)" />
      </div>
    </div>

    <!-- 2,4 GHz: a ribbon wrapped round the whole map -->
    <div
      class="absolute flex items-center justify-center gap-4 rounded-md border-2 border-moss bg-moss/15 text-xl transition-opacity duration-500"
      :class="vis(s, LORA_24.at)"
      :style="{ left: `${RIBBON.x0}px`, top: `${RIBBON.y}px`, width: `${RIBBON.x1 - RIBBON.x0}px`, height: `${RIBBON.h}px` }"
    >
      <span class="font-bold text-ink-strong">{{ LORA_24.region }}</span>
      <span class="font-mono font-bold text-moss">{{ LORA_24.code }}</span>
      <span class="font-bold text-ink-strong">{{ bandLabel(LORA_24.mhz) }}</span>
      <span class="text-ink-strong">чип {{ LORA_24.chip }}</span>
    </div>
  </div>
</template>
