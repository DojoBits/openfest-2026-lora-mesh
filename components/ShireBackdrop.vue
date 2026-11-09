<script setup lang="ts">
// Slide-2 hook scenery (HookSwitch, viewBox 900 × 400): a hobbit village.
// Original flat drawing, no images or fonts. Everything is muted (pale in
// light mode, near-background in dark mode) so the links, radios and labels
// drawn on top stay readable. Positions avoid the label slots in HookSwitch:
// the message bubbles (top left / top right, y 120–190), „LoRa · 868 MHz“
// (centre, y ≈ 190–212).
// The land is clipped to a rounded rectangle so the hills end in soft corners
// instead of hard slide-wide box edges. SVG ids are document-global and the
// scene can be on the page twice (slide 2 + gallery), hence useId().
import { useId } from 'vue'
import { BACK_HILL_D, SHIRE_DOORS, SHIRE_TRAIL_D } from './data/shireTerrain'

// `smoke` = false fades the chimney smoke out (HookSwitch does it once the
// LoRa links and message bubbles are drawn: the smoke sits right under them).
withDefaults(defineProps<{ smoke?: boolean }>(), { smoke: true })

const clip = `shire-clip-${useId()}`
</script>

<template>
  <g class="shire-backdrop" aria-hidden="true" :clip-path="`url(#${clip})`">
    <defs>
      <clipPath :id="clip"><rect x="0" y="0" width="900" height="400" rx="36" /></clipPath>
    </defs>
    <!-- ── far ridge on the horizon: the dark tower stands on it ── -->
    <path d="M340 140 L372 122 L392 130 L418 110 L436 118 L450 104 L466 118 L486 112 L508 128 L530 120 L562 140 Z" class="fill-stone-300 dark:fill-stone-800" />

    <!-- ── back hill: long rolling crest across the slide ── -->
    <path class="shire-hill fill-lime-100 dark:fill-green-950/70" :d="BACK_HILL_D" />

    <!-- ── hobbit holes dug into the back hill (ShireDoor): round door in a stone
         ring, brass knob, round window with flowers, a fence, chimney + smoke
         on the crest above. Mid-distance, under the crest: green door left
         (crest ≈ y 188 at x 250), yellow door right (crest ≈ y 190 at x 676).
         Positions in shireTerrain.ts, where the hook tests check that no
         figure stands on them. ── -->
    <g class="hobbit-doors">
      <ShireDoor v-for="d in SHIRE_DOORS" :key="d.tone" :cx="d.cx" :cy="d.cy" :tone="d.tone" :side="d.side" :smoke="smoke" />
    </g>

    <!-- one round tree on the crest right of centre -->
    <rect x="606" y="150" width="7" height="22" class="fill-amber-800/40 dark:fill-amber-950" />
    <circle cx="609" cy="140" r="20" class="fill-green-300/70 dark:fill-green-900/60" />
    <circle cx="596" cy="150" r="12" class="fill-green-300/70 dark:fill-green-900/60" />
    <circle cx="623" cy="150" r="12" class="fill-green-300/70 dark:fill-green-900/60" />

    <!-- ── front hill: the outer hobbits stand on its shoulders (feet at y 330) ── -->
    <path class="shire-hill fill-lime-200/70 dark:fill-green-900/40" d="M0 318 Q70 300 170 330 Q300 368 450 360 Q600 352 730 330 Q830 300 900 318 L900 400 L0 400 Z" />

    <!-- winding path from the bottom edge up to the right-hand door -->
    <path class="shire-path fill-amber-100/90 dark:fill-stone-800/70" d="M420 400 C450 340 560 290 668 234 L684 236 C590 300 510 350 474 400 Z" />
    <!-- same kind of path up to the left-hand (green) door; the hobbit stands on it (shape in shireTerrain.ts) -->
    <path class="shire-path shire-trail fill-amber-100/90 dark:fill-stone-800/70" :d="SHIRE_TRAIL_D" />
  </g>
</template>
