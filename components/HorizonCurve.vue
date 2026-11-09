<script setup lang="ts">
// Gallery only (was a deck slide; replaced by LineOfSight, numbers moved to its notes). Three heights side by side,
// one per click (ръка, покрив, Черни връх), each on its own slice of the Earth
// with its own line to the horizon, so no glyph sits inside another.
// Geometry comes from data/horizonScene.ts (tested); the km labels are the real
// 4,12·√h values from data/radio.ts.
import type { Mast } from './data/radio'
import { MASTS } from './data/radio'
import { HORIZON_H, HORIZON_W, horizonScenes } from './data/horizonScene'
import { INK, TONE } from './data/tones'
import { maxAt, vis } from './data/format'
import { useStep } from './data/useStep'

const props = withDefaults(defineProps<{ masts?: Mast[], step?: number, startAt?: number }>(), { masts: () => MASTS })
const s = useStep(maxAt(...props.masts.map(m => m.at)), () => props.step, () => props.startAt ?? 0)

const scenes = horizonScenes(props.masts)
</script>

<template>
  <div class="lora-viz relative">
    <svg class="w-full" :viewBox="`0 0 ${HORIZON_W} ${HORIZON_H}`" role="img" aria-label="Радиохоризонт при три височини">
      <g v-for="g in scenes" :key="g.mast.label" class="transition-opacity duration-500" :class="vis(s, g.mast.at)">
        <!-- this column's slice of the Earth -->
        <path :d="g.ground" class="fill-parchment dark:fill-earth/20" />
        <path :d="g.arc" fill="none" :class="INK.line" stroke-width="3" />

        <!-- glyph, standing on the top of the arc -->
        <path v-if="g.mast.glyph === 'mountain'" :d="g.glyph" class="fill-earth/35 stroke-stone dark:fill-stone dark:stroke-stone" stroke-width="2" />
        <g v-else-if="g.mast.glyph === 'roof'">
          <path :d="g.glyph" class="fill-stone dark:fill-stone" />
          <line :x1="g.x" :x2="g.x" :y1="g.top" :y2="g.top + 18" class="stroke-stone dark:stroke-stone-deep" stroke-width="4" />
        </g>
        <g v-else class="stroke-stone dark:stroke-stone-deep" stroke-width="3" fill="none">
          <circle :cx="g.x" :cy="g.top + 4" r="4" />
          <path :d="`M${g.x},${g.top + 8} v10 M${g.x - 6},${g.cy - g.r} l6,-8 l6,8`" />
        </g>

        <!-- sight line to the horizon -->
        <line :x1="g.x" :y1="g.top" :x2="g.tx" :y2="g.ty" :class="TONE.blue.stroke" stroke-width="4" stroke-linecap="round" />
        <circle :cx="g.tx" :cy="g.ty" r="7" :class="TONE.blue.fill" />
        <text :x="g.tx" :y="g.ty + 38" text-anchor="middle" style="font-size: 22px" :class="INK.text">{{ g.mast.label }}</text>
        <text :x="g.tx" :y="g.ty + 70" text-anchor="middle" style="font-size: 28px" font-weight="700" :class="TONE.blue.label">{{ g.mast.kmLabel }}</text>
      </g>
    </svg>
  </div>
</template>
