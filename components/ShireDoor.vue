<script setup lang="ts">
// One hobbit hole for ShireBackdrop (slide 2): a big round door set into the
// hillside. Original flat drawing, muted like the rest of the backdrop.
// Drawn in local coordinates around the door centre (0, 0), placed with
// translate(cx, cy) scale(1.15); door radius 16, everything else fits in
// x ±56, y −70…+19 (before the scale). The chimney runs down to y −20 so it
// disappears into the turf behind the stone ring instead of floating.
//
//   stone ring   r 22 base + dashed r 19.5 stroke = individual stones
//   door         r 16, tone fill, three plank lines, brass knob in the middle
//   step         slab under the door (y 14…19): the door sits on the ground
//   window       round, r 8, on `side` (+1 right / −1 left), cross mullion,
//                sill and a flower box with three blooms under it
//   fence        four pickets + rail on the opposite side
//   chimney      on the hill crest above the door, with three smoke puffs
const props = withDefaults(defineProps<{ cx: number, cy: number, tone: 'green' | 'yellow' | 'red', side?: 1 | -1, smoke?: boolean }>(), { side: 1, smoke: true })

// Literal class strings per tone (UnoCSS extracts from source text only).
const DOOR = {
  green: 'fill-green-600/60 dark:fill-green-800/80',
  yellow: 'fill-yellow-500/60 dark:fill-yellow-700/60',
  red: 'fill-red-500/45 dark:fill-red-900/70',
} as const
const PLANK = {
  green: 'stroke-green-900/25 dark:stroke-green-950/60',
  yellow: 'stroke-yellow-900/20 dark:stroke-yellow-950/60',
  red: 'stroke-red-900/20 dark:stroke-red-950/60',
} as const

const s = props.side
</script>

<template>
  <g class="hobbit-door" :transform="`translate(${cx} ${cy}) scale(1.15)`">
    <!-- chimney out of the turf above, slightly off-centre, smoke drifting away from the window -->
    <rect :x="-s * 14 - 4" y="-38" width="8" height="18" class="fill-stone-400/70 dark:fill-stone-700" />
    <rect :x="-s * 14 - 5.5" y="-40" width="11" height="3" class="fill-stone-500/60 dark:fill-stone-600" />
    <g class="door-smoke fill-stone-300/60 transition-opacity duration-700 dark:fill-stone-600/40" :class="smoke ? 'opacity-100' : 'opacity-0'">
      <circle :cx="-s * 14 + 2 * s" cy="-46" r="4" />
      <circle :cx="-s * 14 + 7 * s" cy="-54" r="5.5" />
      <circle :cx="-s * 14 + 15 * s" cy="-63" r="7" />
    </g>

    <!-- step under the door -->
    <rect x="-21" y="14" width="42" height="5" rx="2" class="fill-stone-300 dark:fill-stone-700" />
    <!-- stone frame: solid ring, then a dashed stroke that splits it into stones -->
    <circle r="22" class="fill-stone-200 dark:fill-stone-700/70" />
    <circle r="19.5" fill="none" class="stroke-stone-400/60 dark:stroke-stone-600" stroke-width="4" stroke-dasharray="6 2" />
    <!-- the round door: planks at x −8, 0, 8 (half-heights from r 16) -->
    <circle r="16" :class="DOOR[tone]" class="stroke-stone-500/50 dark:stroke-stone-900" stroke-width="1.5" />
    <path d="M-8 -13.9 V13.9 M0 -16 V16 M8 -13.9 V13.9" :class="PLANK[tone]" stroke-width="1.5" />
    <!-- brass knob, dead centre -->
    <circle class="door-knob fill-yellow-400 stroke-amber-700/60 dark:fill-yellow-600 dark:stroke-amber-900" r="2.8" stroke-width="1" />

    <!-- round window beside the door, with a cross mullion and a sill -->
    <g :transform="`translate(${s * 36} -4)`">
      <circle r="8" class="door-window fill-sky-100 stroke-stone-400/70 dark:fill-sky-950/60 dark:stroke-stone-600" stroke-width="2.5" />
      <path d="M0 -8 V8 M-8 0 H8" class="stroke-stone-400/70 dark:stroke-stone-600" stroke-width="1.5" />
      <!-- flower box with three blooms -->
      <rect x="-10" y="9" width="20" height="5" rx="1" class="fill-amber-700/40 dark:fill-amber-900/70" />
      <circle cx="-6" cy="8" r="2.2" class="fill-pink-400/70 dark:fill-pink-800" />
      <circle cx="0" cy="7.5" r="2.2" class="fill-yellow-400/80 dark:fill-yellow-700" />
      <circle cx="6" cy="8" r="2.2" class="fill-red-400/70 dark:fill-red-800" />
    </g>

    <!-- little picket fence on the other side: rail + four pickets -->
    <g class="door-fence stroke-amber-800/35 dark:stroke-amber-900/80" stroke-width="2" stroke-linecap="round">
      <path :d="`M${-s * 30} 8 H${-s * 54}`" />
      <path :d="`M${-s * 32} 16 V3 M${-s * 39} 16 V3 M${-s * 46} 16 V3 M${-s * 53} 16 V3`" />
    </g>
  </g>
</template>
