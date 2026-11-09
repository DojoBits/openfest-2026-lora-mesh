<script setup lang="ts">
// Gallery only (was a deck slide „Chirp: тон, който се плъзга“): frequency-vs-time plot.
//  step 1: one up-chirp sweeps the whole band (drawn left→right).
//  step 2: three symbols; each is the same chirp started at a different cyclic
//          offset (it wraps from the top of the band back to the bottom).
// How the receiver decodes it (de-chirp, one peak) is told in the notes only.
import { computed } from 'vue'
import { INK, TONE } from './data/tones'
import { isShown, vis } from './data/format'
import { useStep } from './data/useStep'

const props = withDefaults(defineProps<{
  /** Cyclic start offsets 0..1 of the three symbols. */
  symbols?: number[]
  /** Which symbol is highlighted (blue). */
  current?: number
  step?: number
  startAt?: number
}>(), { symbols: () => [0.15, 0.6, 0.35], current: 1 })

const s = useStep(2, () => props.step, () => props.startAt ?? 0)

// Plot geometry
const PX0 = 90
const PX1 = 940
const FY_LO = 360 // bottom of the band
const FY_HI = 90 // top of the band
const span = FY_LO - FY_HI
const slotW = (PX1 - PX0) / 3

/** Path of one chirp in a slot that starts at cyclic offset `o`. */
function chirpPath(slot: number, o: number): string {
  const x0 = PX0 + slot * slotW
  const xw = x0 + (1 - o) * slotW // where the sweep hits the top and wraps
  const yStart = FY_LO - o * span
  let d = `M${x0},${yStart} L${xw},${FY_HI}`
  if (o > 0)
    d += ` M${xw},${FY_LO} L${x0 + slotW},${yStart}`
  return d
}
const single = `M${PX0},${FY_LO} L${PX1},${FY_HI}`
const syms = computed(() => props.symbols.map((o, i) => ({ o, i, d: chirpPath(i, o) })))

</script>

<template>
  <svg class="lora-viz w-full" viewBox="0 0 1000 440" role="img" aria-label="LoRa chirp: тон, който се плъзга">
    <!-- axes -->
    <line :x1="PX0" :x2="PX0" :y1="FY_HI - 30" :y2="FY_LO + 10" :class="INK.line" stroke-width="3" />
    <line :x1="PX0" :x2="PX1 + 10" :y1="FY_LO + 10" :y2="FY_LO + 10" :class="INK.line" stroke-width="3" />
    <text :x="PX1" :y="FY_LO + 42" text-anchor="end" style="font-size: 20px" :class="INK.muted">време →</text>
    <line :x1="PX0" :x2="PX1" :y1="FY_HI" :y2="FY_HI" :class="INK.faint" stroke-width="2" stroke-dasharray="6 6" />
    <text :x="PX0 - 22" :y="(FY_HI + FY_LO) / 2" text-anchor="middle" style="font-size: 20px" :class="INK.muted" :transform="`rotate(-90 ${PX0 - 22} ${(FY_HI + FY_LO) / 2})`">честота</text>

    <!-- step 1: one full up-chirp -->
    <path
      :d="single" fill="none" :class="TONE.blue.stroke" stroke-width="5" stroke-linecap="round"
      pathLength="1" stroke-dasharray="1"
      class="transition-all duration-1000 ease-out"
      :style="{ strokeDashoffset: isShown(s, 1) ? 0 : 1, opacity: s === 1 ? 1 : 0 }"
    />

    <!-- step 2+: three symbols -->
    <g class="transition-opacity duration-500" :class="vis(s, 2)">
      <g v-for="sym in syms" :key="sym.i">
        <line v-if="sym.i > 0" :x1="PX0 + sym.i * slotW" :x2="PX0 + sym.i * slotW" :y1="FY_HI - 10" :y2="FY_LO + 10" :class="INK.faint" stroke-width="2" />
        <path :d="sym.d" fill="none" stroke-width="5" stroke-linecap="round" :class="sym.i === current ? TONE.blue.stroke : TONE.slate.stroke" />
        <text :x="PX0 + (sym.i + 0.5) * slotW" :y="FY_HI - 18" text-anchor="middle" style="font-size: 22px" :class="sym.i === current ? TONE.blue.label : INK.text">символ {{ sym.i }}</text>
      </g>
    </g>

  </svg>
</template>
