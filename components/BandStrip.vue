<script setup lang="ts">
// Slides 19 (EU868 sub-bands) and 7 (LTE 800 vs SRD). Real DOM: every block is
// absolutely positioned with an inline left/width in %, so the click-driven
// zoom is a plain CSS transition of those two values (no scaling transform).
import { computed } from 'vue'
import type { BandPreset } from './data/bands'
import { BAND_PRESETS } from './data/bands'
import { TONE, PROJECT_COLOUR } from './data/tones'
import { fmt, isShown, maxAt, vis } from './data/format'
import { useStep } from './data/useStep'

const props = withDefaults(defineProps<{
  preset?: 'eu868' | 'lte'
  step?: number
  startAt?: number
}>(), { preset: 'eu868' })

const p = computed<BandPreset>(() => BAND_PRESETS[props.preset])
const total = maxAt(
  ...BAND_PRESETS[props.preset].bands.flatMap(b => [b.at, b.highlightAt]),
  ...BAND_PRESETS[props.preset].pins.map(x => x.at),
  ...BAND_PRESETS[props.preset].gaps.map(x => x.at),
  BAND_PRESETS[props.preset].zoom?.at,
  BAND_PRESETS[props.preset].chip?.at,
)
const s = useStep(total, () => props.step, () => props.startAt ?? 0)

const zoomed = computed(() => p.value.zoom !== undefined && s.value >= p.value.zoom.at)
const domain = computed(() => zoomed.value && p.value.zoom ? [p.value.zoom.from, p.value.zoom.to] : [p.value.from, p.value.to])
const pct = (f: number): number => ((f - domain.value[0]) / (domain.value[1] - domain.value[0])) * 100
// On-screen width (%) of a band; blocks running off the strip edge are clipped.
const shown = (b: { from: number, to: number }): number => Math.min(100, pct(b.to)) - Math.max(0, pct(b.from))
const pos = (from: number, to: number): Record<string, string> => ({ left: `${pct(from)}%`, width: `${pct(to) - pct(from)}%` })

const ticks = computed(() => p.value.axisTicks.filter(t => t >= domain.value[0] && t <= domain.value[1]))
const tickLabel = (f: number): string => fmt(f, Number.isInteger(f) ? 0 : 2)
const lit = (at: number | undefined): boolean => isShown(s.value, at)

// Project rings around the (blue) pins. Literal classes, see tones.ts.
const RING = { cyan: 'border-verdigris dark:border-verdigris', indigo: 'border-dusk dark:border-dusk', fuchsia: 'border-wine dark:border-wine' } as const
</script>

<template>
  <div class="lora-viz relative mx-auto h-[330px] w-full select-none">
    <!-- top chip (duty cycle) -->
    <div v-if="p.chip" class="absolute right-0 top-0 transition-opacity duration-500" :class="vis(s, p.chip.at)">
      <span class="inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xl font-semibold" :class="[TONE.amber.soft, TONE.amber.text, TONE.amber.border]">
        <carbon-timer /> {{ p.chip.text }}
      </span>
    </div>

    <!-- strip -->
    <div class="absolute inset-x-0 top-[120px] h-[110px] overflow-hidden">
      <!-- Wide blocks carry pins in their middle, so their text is left-aligned. -->
      <div
        v-for="b in p.bands" :key="b.label"
        class="absolute bottom-0 flex flex-col items-center justify-center overflow-hidden rounded-md border text-center transition-all duration-700"
        :class="[
          lit(b.highlightAt) && b.highlightAt ? [TONE[b.highlightTone ?? 'amber'].soft, TONE[b.highlightTone ?? 'amber'].border, 'h-[110px]'] : [TONE[b.tone].soft, TONE[b.tone].border, 'h-[70px]'],
          vis(s, b.at),
          shown(b) > 20 ? '!items-start px-4 !text-left' : '',
        ]"
        :style="pos(b.from, b.to)"
      >
        <span class="text-xl font-bold" :class="lit(b.highlightAt) && b.highlightAt ? TONE[b.highlightTone ?? 'amber'].text : TONE[b.tone].text">{{ b.label }}</span>
        <span v-if="shown(b) > 20 && (b.detail || (lit(b.highlightAt) && b.highlightLabel))" class="whitespace-nowrap text-lg" :class="TONE[b.tone].text">
          {{ lit(b.highlightAt) && b.highlightLabel ? b.highlightLabel : b.detail }}
        </span>
      </div>
    </div>

    <!-- callout above a narrow highlighted block (before zoom) -->
    <template v-for="b in p.bands" :key="`c-${b.label}`">
      <div
        v-if="b.highlightAt && b.highlightLabel"
        class="absolute top-[64px] -translate-x-1/2 whitespace-nowrap text-xl font-semibold transition-all duration-700"
        :class="[TONE[b.highlightTone ?? 'amber'].text, lit(b.highlightAt) && shown(b) <= 20 ? 'opacity-100' : 'opacity-0']"
        :style="{ left: `${Math.min(88, pct((b.from + b.to) / 2))}%` }"
      >
        {{ b.highlightLabel }} ↓
      </div>
    </template>

    <!-- gap brackets -->
    <div
      v-for="g in p.gaps" :key="g.label"
      class="absolute top-[86px] h-[150px] border-x-4 border-gold transition-opacity duration-500 dark:border-gold"
      :class="vis(s, g.at)" :style="pos(g.from, g.to)"
    >
      <span class="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-2xl font-bold text-gold-deep dark:text-gold-deep">{{ g.label }}</span>
    </div>

    <!-- pins: blue heads with a project-coloured ring, staggered heights -->
    <div
      v-for="(pin, i) in p.pins" :key="pin.label"
      class="absolute top-[40px] flex -translate-x-1/2 flex-col items-center transition-all duration-700"
      :class="vis(s, pin.at)" :style="{ left: `${pct(pin.f)}%` }"
    >
      <span class="whitespace-nowrap text-xl font-semibold" :class="[PROJECT_COLOUR[pin.ring].text, i % 2 ? 'mt-[44px]' : 'mt-0']">{{ pin.label }}</span>
      <span class="mt-1 h-6 w-6 rounded-full border-4 bg-water dark:bg-water" :class="RING[pin.ring]" />
      <span class="w-1 bg-water dark:bg-water" :class="i % 2 ? 'h-[100px]' : 'h-[144px]'" />
    </div>

    <!-- axis -->
    <div class="absolute inset-x-0 top-[236px] h-[3px] bg-stone dark:bg-stone" />
    <div
      v-for="t in ticks" :key="t"
      class="absolute top-[236px] flex -translate-x-1/2 flex-col items-center transition-all duration-700"
      :style="{ left: `${pct(t)}%` }"
    >
      <span class="h-3 w-[3px] bg-stone dark:bg-stone" />
      <span class="whitespace-nowrap text-lg text-stone-deep dark:text-stone-deep">{{ tickLabel(t) }}</span>
    </div>
    <div class="absolute bottom-0 right-0 text-lg text-stone-deep dark:text-stone-deep">MHz</div>
  </div>
</template>
