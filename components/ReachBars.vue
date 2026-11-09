<script setup lang="ts">
// Slide „Честота, обхват и мощност“: three identical radios send the same power. Beside
// each radio a wave shows its frequency (tight at 2,4 GHz, long at 433 MHz);
// the arrow after it is the reach and the bulb at the right the power needed
// for the same received signal at 10 km. Both are multiples of 868 MHz (the
// one baseline: 1× reach, 1× power); bigger bulb = more power. Click order is
// the story (868, 2,4 GHz, 433), rows stay in frequency order. The last click
// adds the European limit as a tag next to each bulb and dims the bands the
// networks do not use.
// Data: data/radio.ts REACH_BARS (tested).
import { computed } from 'vue'
import { REACH_BARS, WAVE_BOX } from './data/radio'
import { TONE } from './data/tones'
import { fmt, isShown, maxAt } from './data/format'
import { useStep } from './data/useStep'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(maxAt(...REACH_BARS.flatMap(b => [b.at, b.limitAt])), () => props.step, () => props.startAt ?? 0)

const maxRel = Math.max(...REACH_BARS.map(b => b.relative))
// The longest arrow fills 29 % of the track, leaving room for its label; the
// power bulbs sit in their own column at the right edge.
const SPAN = 29
// Arrow length as % of the track; hidden arrows sit at 0 so they grow in.
const len = (rel: number, at: number): string => `${isShown(s.value, at) ? (rel / maxRel) * SPAN : 0}%`
// After the limits click, glyph, arrow and name of the bands not in use fade
// back; their power bulb and limit tag stay readable.
const limitsOn = computed(() => isShown(s.value, maxAt(...REACH_BARS.map(b => b.limitAt))))
const dim = (highlight?: boolean): string => (limitsOn.value && !highlight ? 'opacity-40' : '')
// Ruler ticks every half multiple of the 868 MHz reach (0, 0,5×, 1× … up to the longest arrow).
const ticks = Array.from({ length: Math.floor(maxRel / 0.5) + 1 }, (_, i) => i * 0.5)
const tickLeft = (v: number): string => `${(v / maxRel) * SPAN}%`
const tickLabel = (v: number): string => (v === 0 ? '0' : `${fmt(v, Number.isInteger(v) ? 0 : 1)}×`)
</script>

<template>
  <div class="lora-viz w-full select-none">
    <!-- column header over the bulbs -->
    <div class="flex gap-4">
      <div class="w-[60px] shrink-0" />
      <div :style="{ width: `${WAVE_BOX.width}px` }" class="shrink-0" />
      <div class="relative h-[44px] flex-1">
        <div
          class="absolute right-0 top-0 w-[340px] text-base leading-tight opacity-0 transition-opacity duration-700"
          :class="isShown(s, 1) ? '!opacity-60' : ''"
        >мощност за същия сигнал<br>като 868 MHz</div>
      </div>
    </div>
    <div v-for="b in REACH_BARS" :key="b.label" class="mb-1 flex items-center gap-4">
      <!-- LoRa node, same glyph as LinkChain / HookSwitch: board, screen, stub antenna -->
      <div class="flex w-[60px] shrink-0 justify-center transition-opacity duration-700" :class="dim(b.highlight)">
        <svg viewBox="0 0 66 96" width="38" height="56" role="img" aria-label="LoRa радио">
          <line x1="56" y1="40" x2="56" y2="5" class="stroke-water dark:stroke-water" stroke-width="6" stroke-linecap="round" />
          <rect x="2" y="40" width="62" height="56" rx="7" class="fill-water dark:fill-water" />
          <rect x="13" y="52" width="24" height="18" rx="2" class="fill-page/80 dark:fill-page/80" />
        </svg>
      </div>
      <!-- wave: wavelength proportional to the real one, same colour as the arrow -->
      <svg
        :width="WAVE_BOX.width" :height="WAVE_BOX.amp * 2 + 6" :viewBox="`0 ${-WAVE_BOX.amp - 3} ${WAVE_BOX.width} ${WAVE_BOX.amp * 2 + 6}`"
        class="shrink-0 transition-opacity duration-700" :class="dim(b.highlight)" aria-hidden="true"
      >
        <path :d="b.wavePath" fill="none" :class="TONE[b.tone].stroke" style="stroke-width: 3.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <div class="relative h-[96px] flex-1">
        <div
          class="absolute left-0 top-1/2 flex h-[14px] -translate-y-1/2 items-center rounded-l-full transition-all duration-1000 ease-out"
          :class="[TONE[b.tone].bg, dim(b.highlight)]"
          :style="{ width: len(b.relative, b.at) }"
        >
          <!-- arrow head -->
          <div
            class="absolute -right-[18px] top-1/2 h-0 w-0 -translate-y-1/2 border-y-[16px] border-l-[22px] border-y-transparent"
            :class="b.tone === 'blue' ? 'border-l-water' : 'border-l-stone'"
          />
        </div>
        <div
          class="absolute top-1/2 -translate-y-1/2 whitespace-nowrap pl-8 transition-all duration-1000 ease-out"
          :class="isShown(s, b.at) ? 'opacity-100' : 'opacity-0'"
          :style="{ left: len(b.relative, b.at) }"
        >
          <div class="flex items-center gap-3">
            <div>
              <div class="transition-opacity duration-700" :class="dim(b.highlight)">
                <div class="text-3xl font-bold" :class="TONE[b.tone].text">{{ b.label }}</div>
                <div class="text-2xl font-semibold opacity-70">{{ b.multiple }}</div>
              </div>
            </div>
          </div>
        </div>
        <!-- needed power: bulb size follows power; the European limit tag joins on the last click -->
        <div
          class="absolute right-0 top-1/2 flex w-[340px] -translate-y-1/2 items-center gap-2 transition-opacity duration-700"
          :class="[isShown(s, b.at) ? 'opacity-100' : 'opacity-0']"
        >
          <svg width="64" height="64" viewBox="-32 -32 64 64" class="shrink-0 overflow-visible" :class="dim(b.highlight)" aria-hidden="true">
            <circle :r="8 + b.bulbScale * 18" class="fill-gold/40 dark:fill-gold-deep/20" />
            <g :transform="`scale(${b.bulbScale})`">
              <circle cy="-6" r="16" class="fill-gold/40 stroke-gold dark:fill-gold-deep dark:stroke-gold" style="stroke-width: 2" />
              <rect x="-7" y="9" width="14" height="12" rx="2" class="fill-stone dark:fill-stone" />
            </g>
          </svg>
          <div class="whitespace-nowrap">
            <div class="text-2xl font-bold transition-opacity duration-700" :class="dim(b.highlight)">{{ b.powerLabel }}</div>
            <div
              class="mt-1 rounded-md border border-edge/40 px-2 dark:border-edge/40 text-base font-semibold opacity-0 transition-opacity duration-700"
              :class="isShown(s, b.limitAt) ? '!opacity-60' : ''"
            >{{ b.limitLabel }}</div>
            <!-- narrow sub-band with a higher limit: the highlighted second line (may wrap before its range) -->
            <div
              v-if="b.subBand"
              class="mt-1 whitespace-normal rounded-md border border-gold bg-gold/20 px-2 text-sm font-semibold opacity-0 transition-opacity duration-700 dark:border-gold dark:bg-gold/20"
              :class="[TONE.amber.text, isShown(s, b.limitAt) ? '!opacity-100' : '']"
            >{{ b.subBand.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ruler: multiples of the 868 MHz reach -->
    <div class="flex items-start gap-4">
      <div class="w-[60px] shrink-0" />
      <div :style="{ width: `${WAVE_BOX.width}px` }" class="shrink-0" />
      <div class="relative h-[64px] flex-1">
        <!-- axis line ends at the longest arrow (2×), not under the bulbs -->
        <div class="absolute left-0 top-0 border-t-2 border-stone dark:border-stone" :style="{ width: `${SPAN}%` }" />
        <div v-for="i in ticks" :key="i" class="absolute top-0 -translate-x-1/2 text-center" :style="{ left: tickLeft(i) }">
          <div class="mx-auto h-[10px] w-0 border-l-2 border-stone dark:border-stone" />
          <div class="text-lg opacity-60">{{ tickLabel(i) }}</div>
        </div>
        <div class="absolute left-0 top-[34px] text-lg opacity-60" :style="{ width: `${SPAN}%` }">
          <span class="block whitespace-nowrap text-center">обхват спрямо 868 MHz</span>
        </div>
      </div>
    </div>
  </div>
</template>
