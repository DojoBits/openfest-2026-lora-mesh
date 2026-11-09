<script setup lang="ts">
// One small LoRa radio (slide-2 hook scene), the same device everywhere it is
// mounted: blue board, light screen, thin whip antenna. Drawn at k = 1 as
// HOOK_RADIO (body 44 × 40, whip 28 tall at x 34 from the left edge), then
// placed with its body top-left at (x, y), scaled by k and mirrored when
// ant = −1 so the whip stands near the left edge instead (outer side).
// Mount hardware (mast, lashing, pack) is drawn by whoever mounts it.
import { computed } from 'vue'
import { HOOK_RADIO } from './data/hookFrames'

const props = withDefaults(defineProps<{ x: number, y: number, k: number, ant?: 1 | -1 }>(), { ant: 1 })
const transform = computed(() => `translate(${props.ant === 1 ? props.x : props.x + HOOK_RADIO.w * props.k} ${props.y}) scale(${props.ant * props.k} ${props.k})`)
</script>

<template>
  <g class="mesh-radio" :transform="transform">
    <line x1="34" y1="0" :x2="34" :y2="-HOOK_RADIO.antenna" class="stroke-water dark:stroke-water" stroke-width="3.5" stroke-linecap="round" />
    <rect x="0" y="0" :width="HOOK_RADIO.w" :height="HOOK_RADIO.h" rx="6" class="fill-water stroke-ink dark:fill-water dark:stroke-ink" stroke-width="3" />
    <rect x="7" y="8" width="18" height="13" rx="2" class="fill-page/80 dark:fill-page/80" />
  </g>
</template>
