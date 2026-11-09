<script setup lang="ts">
// Slide 14 „Какви антени ползваме“: four real antennas, small to big, one per
// click. Behind each photo its radiation pattern pulses outward:
//   round = rings in every direction (whip, PCB, ground plane);
//   flat  = rings squashed to the horizon (rooftop omni: more gain sideways).
// Data and gains: data/antennaKinds.ts (tested). Each stage's SVG is 220 × 200
// with the antenna at its centre. Without motion (reduced motion, export) the
// three rings sit at 1/3, 2/3 and full size, so the still picture still reads.
import { withBase } from './data/asset'
import { useStep } from './data/useStep'
import { ANTENNA_KINDS, PHOTO_CREDIT, WHIP_NOTE } from './data/antennaKinds'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(ANTENNA_KINDS.length, () => props.step, () => props.startAt ?? 0)

const CX = 110
const CY = 100
const RINGS = [0, 1, 2]
// Three rings per antenna, staggered over one 2.4 s cycle.
const ring = (k: number) => ({
  animationDelay: `${-0.8 * (2 - k)}s`,
  transform: `scale(${(k + 1) / 3})`,
})
</script>

<template>
  <div class="lora-viz w-full select-none">
    <div class="grid grid-cols-4 gap-2">
      <div
        v-for="(k, i) in ANTENNA_KINDS"
        :key="k.id"
        class="flex flex-col items-center text-center transition duration-500"
        :class="s >= i + 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
      >
        <!-- pattern behind, photo in front -->
        <div class="relative h-[200px] w-[220px]">
          <svg class="absolute inset-0" style="overflow: visible" width="220" height="200" viewBox="0 0 220 200" aria-hidden="true">
            <g class="fill-none stroke-moss dark:stroke-moss" style="stroke-width: 3">
              <template v-if="k.pattern === 'round'">
                <circle v-for="r in RINGS" :key="r" class="ant-pulse" :cx="CX" :cy="CY" r="100" :style="ring(r)" />
              </template>
              <template v-else-if="k.pattern === 'flat'">
                <ellipse v-for="r in RINGS" :key="r" class="ant-pulse" :cx="CX" :cy="CY" rx="108" ry="34" :style="ring(r)" />
              </template>
            </g>
          </svg>
          <div class="absolute left-1/2 top-1/2 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border-2 border-edge/30 shadow-md dark:border-stone">
            <img :src="withBase(k.img)" :alt="k.name" class="h-full w-full object-cover">
          </div>
        </div>

        <div class="mt-1 text-2xl font-bold">{{ k.name }}</div>
        <div class="text-lg leading-snug opacity-75">{{ k.where }}</div>
        <div class="mt-1 text-lg font-semibold text-moss dark:text-moss">{{ k.gain }}</div>
        <div v-if="k.id === 'whip'" class="text-lg font-semibold text-water dark:text-water">{{ WHIP_NOTE }}</div>
      </div>
    </div>
    <div class="mt-4 text-center text-[9px] leading-none opacity-40">{{ PHOTO_CREDIT }}</div>
  </div>
</template>

<style scoped>
/* Pulses grow from the antenna and fade; the global .lora-viz reduced-motion
   rule stops them, leaving each ring at its inline resting size. */
.ant-pulse {
  transform-box: view-box;
  transform-origin: 110px 100px;
  opacity: 0.55;
  animation: ant-pulse 2.4s linear infinite;
}
@keyframes ant-pulse {
  from { transform: scale(0.35); opacity: 0.9; }
  to { transform: scale(1); opacity: 0; }
}
</style>
