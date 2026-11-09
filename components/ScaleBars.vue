<script setup lang="ts">
// Range bars (no longer on a slide; was slide 18 before RangeZones): horizontal bars on a log (or linear)
// distance scale, one per click. Bars grow by animating width (no scaling).
import { computed } from 'vue'
import type { ScaleItem } from './data/radio'
import { RANGE_RECORDS } from './data/radio'
import { TONE } from './data/tones'
import { isShown, maxAt, vis } from './data/format'
import { useStep } from './data/useStep'
import Badge from './Badge.vue'

const props = withDefaults(defineProps<{
  items?: ScaleItem[]
  scale?: 'linear' | 'log'
  min?: number
  max?: number
  ticks?: { value: number, label: string }[]
  step?: number
  startAt?: number
}>(), {
  items: () => RANGE_RECORDS,
  scale: 'log',
  min: 0.01,
  max: 2000,
  ticks: () => [{ value: 0.01, label: '10 m' }, { value: 1, label: '1 km' }, { value: 100, label: '100 km' }, { value: 1000, label: '1000 km' }],
})

const s = useStep(maxAt(...props.items.map(i => i.at)), () => props.step, () => props.startAt ?? 0)
const pct = (v: number): number => props.scale === 'log'
  ? (Math.log(v / props.min) / Math.log(props.max / props.min)) * 100
  : (v / props.max) * 100
const rows = computed(() => props.items.map(it => ({
  it,
  left: it.from !== undefined ? pct(it.from) : 0,
  right: pct(it.value),
})))
</script>

<template>
  <div class="lora-viz flex w-full flex-col gap-7">
    <div v-for="r in rows" :key="r.it.label" class="transition-opacity duration-500" :class="vis(s, r.it.at)">
      <div class="mb-1 flex items-center gap-3 text-xl">
        <span class="font-semibold">{{ r.it.label }}</span>
        <Badge v-if="r.it.tag" :text="r.it.tag" tone="amber" />
      </div>
      <div class="relative h-10">
        <div class="absolute inset-y-0 left-0 right-0 rounded bg-parchment dark:bg-parchment" />
        <div
          class="absolute inset-y-0 rounded transition-all duration-1000 ease-out" :class="TONE[r.it.tone].bg"
          :style="{ left: `${r.left}%`, width: `${isShown(s, r.it.at) ? r.right - r.left : 0}%` }"
        />
        <span
          class="absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-xl font-bold"
          :class="r.right > 80 ? '-translate-x-full pr-3 text-page' : ['pl-3', TONE[r.it.tone].text]"
          :style="{ left: `${r.right}%` }"
        >{{ r.it.valueLabel }}</span>
      </div>
    </div>
    <!-- axis -->
    <div class="relative mt-2 h-8 border-t-2 border-stone dark:border-stone">
      <span
        v-for="t in ticks" :key="t.value" class="absolute top-1 -translate-x-1/2 whitespace-nowrap text-lg text-stone-deep dark:text-stone-deep"
        :style="{ left: `${pct(t.value)}%` }"
      >{{ t.label }}</span>
    </div>
  </div>
</template>
