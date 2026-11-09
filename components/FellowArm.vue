<script setup lang="ts">
// One arm of a slide-2 figure (FellowFigure), drawn as stacked round-capped
// strokes along shoulder → elbow → hand, in the figure's local units:
//   1. outline: the whole arm, `width` + 4.5 wide, so 2.25 shows each side;
//   2. sleeve: shoulder → elbow → `cuff` of the way down the forearm;
//   3. bare forearm (skin) from there to the hand;
//   4. optional `flare`: the last quarter of the sleeve drawn 3 units wider
//      (outline 7.5 wider), a bell sleeve for the elf's gown;
//   5. the hand, a circle of radius ≈ 0.43 × width (unless `hand` = false,
//      when the parent draws a gripping hand in front of the phone instead).
import { computed } from 'vue'
import type { FellowArm } from './data/fellowGeometry'

const props = withDefaults(defineProps<{
  arm: FellowArm
  /** Stroke class of the sleeve (with its dark: pair). */
  sleeve: string
  /** Stroke and fill classes of the skin. */
  skinStroke: string
  skinFill: string
  /** Outline stroke class. */
  ol: string
  width?: number
  /** Share of the forearm the sleeve covers: 0 = sleeve stops at the elbow, 1 = to the wrist. */
  cuff?: number
  flare?: boolean
  hand?: boolean
}>(), { width: 10, cuff: 0.6, flare: false, hand: true })

type Pt = readonly [number, number]
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const d = (...p: Pt[]) => `M${p.map(q => q.join(' ')).join(' L')}`

const wrist = computed(() => lerp(props.arm.e, props.arm.h, props.cuff))
const flareFrom = computed(() => lerp(props.arm.e, props.arm.h, Math.max(0, props.cuff - 0.3)))
</script>

<template>
  <g class="fellow-arm">
    <path :d="d(arm.s, arm.e, arm.h)" :class="ol" :stroke-width="width + 4.5" fill="none" />
    <path v-if="flare" :d="d(flareFrom, wrist)" :class="ol" :stroke-width="width + 7.5" fill="none" />
    <path :d="d(wrist, arm.h)" :class="skinStroke" :stroke-width="width" fill="none" />
    <path :d="d(arm.s, arm.e, wrist)" :class="sleeve" :stroke-width="width" fill="none" />
    <path v-if="flare" :d="d(flareFrom, wrist)" :class="sleeve" :stroke-width="width + 3" fill="none" />
    <circle v-if="hand" :cx="arm.h[0]" :cy="arm.h[1]" :r="width * 0.43" :class="[skinFill, ol]" stroke-width="2.2" />
  </g>
</template>
