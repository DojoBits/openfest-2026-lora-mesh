<script setup lang="ts">
// A lit beacon fire for the routing map (MeshMap.vue): a stack of crossed
// logs with a two-tone flame, drawn on top of every repeater glyph, like the
// chain of beacons in the film. (x, y) is the base of the woodpile, the
// flame rises about 52 units above it.
const props = withDefaults(defineProps<{ x: number, y: number, scale?: number }>(), { scale: 1 })

// Local units, origin = base of the woodpile, y up = negative.
const LOGS = 'M-16,0 L16,-10 M-16,-10 L16,0 M-12,-4 H12'
const FLAME = 'M0,-52 C18,-34 16,-16 0,-8 C-16,-16 -18,-34 0,-52 Z'
const CORE = 'M0,-32 C7,-24 6,-15 0,-11 C-6,-15 -7,-24 0,-32 Z'
</script>

<template>
  <g data-fire :transform="`translate(${props.x} ${props.y}) scale(${props.scale})`">
    <path :d="LOGS" class="stroke-earth-deep dark:stroke-earth-deep" style="stroke-width: 4; stroke-linecap: round" />
    <path :d="FLAME" class="fill-gold stroke-trail dark:fill-gold dark:stroke-trail" style="stroke-width: 2.5; stroke-linejoin: round" />
    <path :d="CORE" class="fill-trail dark:fill-trail" />
  </g>
</template>
