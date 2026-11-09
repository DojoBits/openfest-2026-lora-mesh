<script setup lang="ts">
// Hidden slide „Видимостта е наденица, не лъч“ (between 18 and 19; schematic). Two masts, the first
// Fresnel zone as an ellipse between them. Obstacles rise into it (the parts
// inside the zone turn red); then the masts get taller, the zone lifts clear
// and turns emerald. Motion is a translateY of the zone, nothing scales.
import { computed, useId } from 'vue'
import { FRESNEL } from './data/radio'
import { INK, TONE } from './data/tones'
import { fmt, isShown, maxAt, vis } from './data/format'
import { useStep } from './data/useStep'
import Badge from './Badge.vue'

interface Obstacle { kind: 'tree' | 'block', x: number, h: number, at?: number }

const props = withDefaults(defineProps<{
  distanceKm?: number
  radiusM?: number
  clearM?: number
  obstacles?: Obstacle[]
  raiseAt?: number
  step?: number
  startAt?: number
}>(), {
  distanceKm: FRESNEL.km,
  radiusM: FRESNEL.radiusM,
  clearM: FRESNEL.clearM,
  obstacles: () => [{ kind: 'tree', x: 370, h: 165, at: 1 }, { kind: 'block', x: 610, h: 170, at: 1 }],
  raiseAt: 2,
})

const s = useStep(maxAt(...props.obstacles.map(o => o.at), props.raiseAt), () => props.step, () => props.startAt ?? 0)
const raised = computed(() => isShown(s.value, props.raiseAt))

const GROUND = 380
const LOW = 225 // mast top before raising
const LIFT = 105 // how much the masts grow
const X1 = 120
const X2 = 880
const RX = (X2 - X1) / 2
const RY = 62
const clipId = `fz-${useId()}`

const obstacleShape = (o: Obstacle): string => o.kind === 'tree'
  ? `M${o.x},${GROUND} V${GROUND - o.h + 40} M${o.x - 34},${GROUND - o.h + 70} a34,40 0 1 1 68,0 a34,32 0 1 1 -68,0`
  : `M${o.x - 40},${GROUND} V${GROUND - o.h} H${o.x + 40} V${GROUND} Z`
</script>

<template>
  <div class="lora-viz relative">
    <svg class="w-full" viewBox="0 0 1000 470" role="img" aria-label="Зона на Френел между две мачти">
      <defs>
        <clipPath :id="clipId">
          <ellipse :cx="(X1 + X2) / 2" :cy="LOW" :rx="RX" :ry="RY" />
        </clipPath>
      </defs>
      <line x1="30" x2="970" :y1="GROUND" :y2="GROUND" :class="INK.line" stroke-width="3" />

      <!-- obstacles -->
      <g v-for="(o, i) in obstacles" :key="i" class="transition-opacity duration-500" :class="vis(s, o.at)">
        <path :d="obstacleShape(o)" class="fill-earth/35 stroke-stone dark:fill-stone dark:stroke-stone-deep" stroke-width="3" />
        <path
          :d="obstacleShape(o)" :clip-path="`url(#${clipId})`" :class="TONE.red.fill"
          class="transition-opacity duration-500" :style="{ opacity: raised ? 0 : 1 }"
        />
      </g>

      <!-- masts: fixed lower part + an extension that fades in -->
      <g v-for="x in [X1, X2]" :key="x">
        <line :x1="x" :x2="x" :y1="GROUND" :y2="LOW" :class="INK.line" stroke-width="8" />
        <line :x1="x" :x2="x" :y1="LOW" :y2="LOW - LIFT" :class="INK.line" stroke-width="8" class="transition-opacity duration-700" :style="{ opacity: raised ? 1 : 0 }" />
      </g>

      <!-- the zone, lifted by translateY when raised -->
      <g class="transition-transform duration-700 ease-out" :style="{ transform: `translateY(${raised ? -LIFT : 0}px)` }">
        <ellipse
          :cx="(X1 + X2) / 2" :cy="LOW" :rx="RX" :ry="RY" style="fill-opacity: 0.2" stroke-width="4"
          class="transition-colors duration-500"
          :class="raised ? [TONE.emerald.fill, TONE.emerald.stroke] : [TONE.blue.fill, TONE.blue.stroke]"
        />
        <line :x1="X1" :x2="X2" :y1="LOW" :y2="LOW" :class="INK.line" stroke-width="2" stroke-dasharray="8 8" />
        <circle v-for="x in [X1, X2]" :key="x" :cx="x" :cy="LOW" r="10" :class="TONE.blue.fill" />
        <line :x1="(X1 + X2) / 2" :x2="(X1 + X2) / 2" :y1="LOW" :y2="LOW + RY" :class="INK.text" stroke-width="3" />
        <text :x="(X1 + X2) / 2 + 12" :y="LOW + 38" style="font-size: 22px" :class="INK.text">r ≈ {{ fmt(radiusM, 1) }} m</text>
        <text :x="(X1 + X2) / 2" :y="LOW - RY - 14" text-anchor="middle" style="font-size: 24px" font-weight="600" :class="raised ? TONE.emerald.label : TONE.blue.label">
          {{ raised ? `≥ 60 % (${fmt(clearM, 1)} m) свободни` : `${fmt(distanceKm, 0)} km, 868 MHz` }}
        </text>
      </g>
    </svg>
    <Badge class="absolute right-0 top-0" text="схематично" />
  </div>
</template>
