<script setup lang="ts">
// Slide 11 „Електромагнитният спектър“: the electromagnetic spectrum as one
// coloured arrow with a white wave that gets shorter left to right, an
// everyday icon + one-line label per band (alternating above and below the
// arrow so every name fits whole). Clicks 1–7 reveal the bands long to short,
// click 8 marks where LoRa sits.
// Geometry and text come from data/spectrumArrow.ts (tested); the SVG viewBox is
// 1000 wide, so band x / 10 is the % position used by the HTML overlays.
//
// Motion (user-requested, replays every time the slide opens):
//   - entrance: the arrow wipes in left to right, then the direction hints;
//   - loop: the wave flows along the arrow (phase shift per animation frame).
// Reduced motion and PDF export get the finished, still picture.
import { onUnmounted, ref, watch } from 'vue'
import { useIsSlideActive, useNav } from '@slidev/client'
import { useStep } from './data/useStep'
import { EM_BANDS, EM_CLICKS, LORA_CLICK, LORA_MARK, WAVE_X1, bandClick, wavePath } from './data/spectrumArrow'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(EM_CLICKS, () => props.step, () => props.startAt ?? 0)

const active = useIsSlideActive()
const { isPrintMode } = useNav()
const still = isPrintMode.value || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

// One wave cycle every 1.5 s at every point of the arrow.
const CYCLE_MS = 1500
const wave = ref(wavePath())
let raf = 0
let t0 = 0
function frame(t: number) {
  if (!t0) t0 = t
  wave.value = wavePath(0.5, (2 * Math.PI * (t - t0)) / CYCLE_MS)
  raf = requestAnimationFrame(frame)
}
function stop() {
  cancelAnimationFrame(raf)
  raf = 0
  t0 = 0
}
watch(active, (on) => {
  if (on && !still && !raf) raf = requestAnimationFrame(frame)
  else if (!on) stop()
}, { immediate: true })
onUnmounted(stop)

// Band i rises in on its click; hidden bands keep their space.
const shown = (i: number) => s.value >= bandClick(i) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
const centre = (i: number): number => (EM_BANDS[i].x0 + EM_BANDS[i].x1) / 20
const arrow = `0,10 ${WAVE_X1},10 ${WAVE_X1},0 1000,40 ${WAVE_X1},80 ${WAVE_X1},70 0,70`
const above = EM_BANDS.map((b, i) => ({ b, i })).filter(x => x.b.row === 'above')
const below = EM_BANDS.map((b, i) => ({ b, i })).filter(x => x.b.row === 'below')

// Radiation trefoil for gamma (no such icon in the installed sets): a centre
// dot and three 60° blades, one pointing down and two up-left / up-right.
const R_IN = 3.2
const R_OUT = 11
const pt = (r: number, deg: number) => `${(r * Math.cos(deg * Math.PI / 180)).toFixed(2)} ${(r * Math.sin(deg * Math.PI / 180)).toFixed(2)}`
const trefoil = [90, 210, 330].map(c =>
  `M${pt(R_IN, c - 30)} L${pt(R_OUT, c - 30)} A${R_OUT} ${R_OUT} 0 0 1 ${pt(R_OUT, c + 30)} L${pt(R_IN, c + 30)} A${R_IN} ${R_IN} 0 0 0 ${pt(R_IN, c - 30)} Z`).join(' ')
</script>

<template>
  <div class="lora-viz relative w-full select-none" :class="{ 'em-in': active && !still }">
    <!-- direction of the scale -->
    <div class="em-rise mb-1" style="animation-delay: 0.6s">
      <div class="flex justify-between text-lg opacity-60">
        <span>← дълги вълни</span>
        <span>къси вълни →</span>
      </div>
    </div>

    <!-- icon + label: even bands above the arrow -->
    <div class="relative h-[88px]">
      <div
        v-for="{ b, i } in above"
        :key="b.label"
        class="absolute bottom-1 -translate-x-1/2"
        :style="{ left: `${centre(i)}%` }"
      >
        <div class="flex flex-col items-center transition duration-500" :class="shown(i)">
        <div class="text-5xl opacity-80">
          <carbon-radio v-if="i === 0" />
          <carbon-temperature-hot v-else-if="i === 2" />
          <carbon-sun v-else-if="i === 4" />
          <svg v-else viewBox="-12 -12 24 24" width="1em" height="1em" role="img" aria-label="радиация">
            <circle r="2.2" fill="currentColor" />
            <path :d="trefoil" fill="currentColor" />
          </svg>
        </div>
        <div class="whitespace-nowrap text-xl font-semibold leading-tight">{{ b.label }}</div>
        </div>
      </div>
    </div>

    <!-- the arrow, with the shrinking wave inside -->
    <div class="em-wipe relative">
      <svg viewBox="0 0 1000 80" class="block w-full">
        <defs>
          <linearGradient id="em-spectrum-fill" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1000" y2="0">
            <stop offset="0" stop-color="#1d4ed8" />
            <stop offset="0.16" stop-color="#4338ca" />
            <stop offset="0.30" stop-color="#9f1239" />
            <stop offset="0.44" stop-color="#ef4444" />
            <stop offset="0.46" stop-color="#f97316" />
            <stop offset="0.48" stop-color="#facc15" />
            <stop offset="0.50" stop-color="#22c55e" />
            <stop offset="0.52" stop-color="#3b82f6" />
            <stop offset="0.54" stop-color="#7c3aed" />
            <stop offset="0.68" stop-color="#6d28d9" />
            <stop offset="0.81" stop-color="#0f766e" />
            <stop offset="1" stop-color="#15803d" />
          </linearGradient>
        </defs>
        <polygon :points="arrow" fill="url(#em-spectrum-fill)" />
        <path :d="wave" fill="none" stroke="white" stroke-width="3" stroke-linejoin="round" />
        <!-- LoRa: a ring on the arrow at its place in the radio band -->
        <circle
          :cx="LORA_MARK.x" cy="40" r="24" fill="none" stroke="#10b981" stroke-width="6"
          class="transition-opacity duration-500" :class="s >= LORA_CLICK ? 'opacity-100' : 'opacity-0'"
        />
      </svg>
    </div>

    <!-- icon + label: odd bands below the arrow; LoRa stem runs past them on the left -->
    <div class="relative h-[88px]">
      <div
        v-for="{ b, i } in below"
        :key="b.label"
        class="absolute top-1 -translate-x-1/2"
        :style="{ left: `${centre(i)}%` }"
      >
        <div class="flex flex-col items-center transition duration-500" :class="shown(i)">
        <div class="text-5xl opacity-80">
          <carbon-wifi v-if="i === 1" />
          <carbon-idea v-else-if="i === 3" />
          <carbon-user-x-ray v-else />
        </div>
        <div class="whitespace-nowrap text-xl font-semibold leading-tight">{{ b.label }}</div>
        </div>
      </div>
      <!-- LoRa callout (last click) -->
      <div
        class="absolute top-0 transition-opacity duration-500"
        :class="s >= LORA_CLICK ? 'opacity-100' : 'opacity-0'"
        :style="{ left: `${LORA_MARK.x / 10}%` }"
      >
        <div class="h-[100px] w-0 border-l-4 border-moss" />
        <div class="-ml-[60px] whitespace-nowrap rounded-xl border-4 border-moss bg-page px-4 py-1 dark:bg-page">
          <div class="text-2xl font-bold text-moss dark:text-moss">{{ LORA_MARK.label }}</div>
          <div class="text-lg opacity-70">{{ LORA_MARK.detail }}</div>
        </div>
      </div>
    </div>
    <div class="h-[90px]" />
  </div>
</template>

<style scoped>
/* Entrance runs only while .em-in is set (slide active, motion allowed);
   without it everything shows at rest, so export and reduced motion see the
   final picture. The global .lora-viz reduced-motion rule also applies. */
.em-in .em-wipe {
  animation: em-wipe 0.8s ease-out both;
}
.em-in .em-rise {
  animation: em-rise 0.5s ease-out both;
}
@keyframes em-wipe {
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0 0 0 0); }
}
@keyframes em-rise {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
