<script setup lang="ts">
// Gallery only (was a deck slide „Електромагнитният спектър“, replaced by EmSpectrum): a log frequency axis with markers, and
// below it one lane per marker whose sine wave is drawn to a shared scale —
// the wave period on screen is proportional to the real wavelength.
import { computed } from 'vue'
import type { SpectrumMarker } from './data/radio'
import { SPECTRUM_MARKERS, wavelengthCm } from './data/radio'
import { TONE, INK } from './data/tones'
import { maxAt, vis } from './data/format'
import { useStep } from './data/useStep'

const props = withDefaults(defineProps<{
  markers?: SpectrumMarker[]
  min?: number
  max?: number
  showWaves?: boolean
  step?: number
  startAt?: number
}>(), { markers: () => SPECTRUM_MARKERS, min: 80, max: 3000, showWaves: true })

const s = useStep(maxAt(...props.markers.map(m => m.at)), () => props.step, () => props.startAt ?? 0)

const X0 = 60
const X1 = 940
const AXIS_Y = 110
const fx = (mhz: number): number =>
  X0 + (Math.log(mhz / props.min) / Math.log(props.max / props.min)) * (X1 - X0)

const TICKS = [100, 300, 1000, 3000]
const tickLabel = (f: number): string => (f >= 1000 ? `${f / 1000} GHz` : `${f} MHz`)

// Wave lanes: period in px = λ(cm) × PX_PER_CM, identical for every lane.
const LANE_X0 = 400
const LANE_X1 = 960
const PX_PER_CM = 1.6
const lanes = computed(() => props.markers.map((m, i) => {
  const y = 200 + i * 62
  const period = wavelengthCm(m.mhz) * PX_PER_CM
  const amp = 18
  const pts: string[] = []
  for (let x = LANE_X0; x <= LANE_X1; x += 1.5)
    pts.push(`${x.toFixed(1)},${(y - amp * Math.sin(((x - LANE_X0) / period) * 2 * Math.PI)).toFixed(1)}`)
  return { m, y, d: `M${pts.join('L')}` }
}))
</script>

<template>
  <svg class="lora-viz w-full" viewBox="0 0 1000 440" role="img" aria-label="Честотна скала с дължини на вълната">
    <!-- log axis -->
    <line :x1="X0" :y1="AXIS_Y" :x2="X1" :y2="AXIS_Y" :class="INK.line" stroke-width="3" />
    <g v-for="t in TICKS" :key="t">
      <line :x1="fx(t)" :x2="fx(t)" :y1="AXIS_Y" :y2="AXIS_Y + 10" :class="INK.line" stroke-width="2" />
      <text :x="fx(t)" :y="AXIS_Y + 34" text-anchor="middle" style="font-size: 20px" :class="INK.muted">{{ tickLabel(t) }}</text>
    </g>

    <!-- markers -->
    <g v-for="m in markers" :key="m.mhz" class="transition-opacity duration-500" :class="vis(s, m.at)">
      <line :x1="fx(m.mhz)" :x2="fx(m.mhz)" :y1="AXIS_Y - 40" :y2="AXIS_Y" :class="TONE[m.tone].stroke" stroke-width="5" stroke-linecap="round" />
      <circle :cx="fx(m.mhz)" :cy="AXIS_Y" r="8" :class="TONE[m.tone].fill" />
      <text :x="fx(m.mhz)" :y="AXIS_Y - 52" text-anchor="middle" style="font-size: 24px" font-weight="600" :class="TONE[m.tone].label">{{ m.label }}</text>
    </g>

    <!-- wave lanes, one shared px-per-cm scale -->
    <g v-if="showWaves">
      <g v-for="l in lanes" :key="l.m.mhz" class="transition-opacity duration-500" :class="vis(s, l.m.at)">
        <text :x="X0" :y="l.y - 4" style="font-size: 24px" font-weight="600" :class="TONE[l.m.tone].label">{{ l.m.label }}</text>
        <text :x="X0" :y="l.y + 24" style="font-size: 22px" :class="INK.text">λ = {{ l.m.lambdaLabel }}</text>
        <path
          :d="l.d" fill="none" :class="TONE[l.m.tone].stroke" stroke-width="4" stroke-linecap="round"
          pathLength="1" stroke-dasharray="1"
          class="transition-[stroke-dashoffset] duration-1000 ease-out"
          :style="{ strokeDashoffset: s >= (l.m.at ?? 0) ? 0 : 1 }"
        />
      </g>
    </g>
  </svg>
</template>
