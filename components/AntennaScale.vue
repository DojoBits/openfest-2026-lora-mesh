<script setup lang="ts">
// Gallery only (the deck slide is AntennaTypes): quarter-wave whips at ONE shared scale
// (px per cm), base-aligned on a ground line. Anything taller than
// `clipAboveCm` is cut with a break mark and its true length printed („75 cm ↑“).
import { computed } from 'vue'
import type { AntennaItem } from './data/radio'
import { ANTENNAS } from './data/radio'
import { INK, TONE } from './data/tones'
import { fmt, maxAt, vis } from './data/format'
import { useStep } from './data/useStep'

const props = withDefaults(defineProps<{
  items?: AntennaItem[]
  pxPerCm?: number
  clipAboveCm?: number
  finger?: boolean
  step?: number
  startAt?: number
}>(), { items: () => ANTENNAS, pxPerCm: 18, clipAboveCm: 19, finger: true })

const s = useStep(maxAt(...props.items.map(i => i.at)), () => props.step, () => props.startAt ?? 0)

const GROUND = 400
const FINGER_CM = { length: 8, width: 1.8 } // an adult index finger, same scale
const cols = computed(() => props.items.map((it, i) => {
  const x = 150 + i * 220
  const clipped = it.cm > props.clipAboveCm
  const h = Math.min(it.cm, props.clipAboveCm) * props.pxPerCm
  return { it, x, h, top: GROUND - h, clipped }
}))
</script>

<template>
  <svg class="lora-viz w-full" viewBox="0 0 1000 500" role="img" aria-label="Четвъртвълнови антени в един мащаб">
    <line x1="40" x2="960" :y1="GROUND" :y2="GROUND" :class="INK.line" stroke-width="3" />
    <g v-for="c in cols" :key="c.it.label" class="transition-opacity duration-500" :class="vis(s, c.it.at)">
      <!-- radio box at the base -->
      <rect :x="c.x - 30" :y="GROUND - 4" width="60" height="22" rx="4" :class="INK.text" opacity="0.35" />
      <line :x1="c.x" :x2="c.x" :y1="GROUND - 4" :y2="c.top" :class="TONE[c.it.tone].stroke" stroke-width="9" stroke-linecap="round" />
      <!-- break mark + true length for a clipped whip -->
      <template v-if="c.clipped">
        <path :d="`M${c.x - 22},${c.top + 26} l44,-12 M${c.x - 22},${c.top + 40} l44,-12`" :class="INK.halo" stroke-width="7" />
        <path :d="`M${c.x - 22},${c.top + 26} l44,-12 M${c.x - 22},${c.top + 40} l44,-12`" :class="INK.line" stroke-width="3" />
        <text :x="c.x + 18" :y="c.top + 6" style="font-size: 24px" font-weight="600" :class="TONE[c.it.tone].label">{{ fmt(c.it.cm, 0) }} cm ↑</text>
      </template>
      <!-- finger silhouette beside the 868 MHz whip -->
      <g v-if="finger && c.it.finger">
        <rect
          :x="c.x + 34" :y="GROUND - FINGER_CM.length * pxPerCm" :width="FINGER_CM.width * pxPerCm" :height="FINGER_CM.length * pxPerCm"
          :rx="FINGER_CM.width * pxPerCm / 2" class="fill-none stroke-stone dark:stroke-stone-deep" stroke-width="3" stroke-dasharray="6 5"
        />
        <text :x="c.x + 34 + FINGER_CM.width * pxPerCm + 10" :y="GROUND - 60" style="font-size: 20px" :class="INK.muted">пръст</text>
      </g>
      <text :x="c.x" :y="GROUND + 50" text-anchor="middle" style="font-size: 26px" font-weight="600" :class="TONE[c.it.tone].label">{{ c.it.label }}</text>
      <text :x="c.x" :y="GROUND + 80" text-anchor="middle" style="font-size: 22px" :class="INK.text">λ/4 = {{ fmt(c.it.cm, 1) }} cm</text>
    </g>
  </svg>
</template>
