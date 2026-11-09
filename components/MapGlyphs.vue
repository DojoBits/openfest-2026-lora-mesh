<script setup lang="ts">
// Hand-inked map glyphs for the slide-5 journey map, drawn inside the parent
// <svg> (the root is a <g>). Every glyph is built around a local origin and
// placed with translate/scale, so AgendaJourney only lists where things go.
// Ink is dark sepia on parchment; in dark mode light tan on dark leather.
// Class names are literal because UnoCSS only extracts from source text; stroke
// widths live in `style` (attributify trap).
//   mountains / forest / hills: `pts` is a list of offsets from (x, y), drawn in
//   the given order (author lists back to front, so nearer glyphs overlap).
import { computed } from 'vue'

export interface GlyphPoint { dx: number, dy: number, s?: number }

const props = withDefaults(defineProps<{
  kind: 'mountains' | 'forest' | 'hills' | 'compass' | 'river' | 'summit'
  x?: number
  y?: number
  s?: number
  pts?: readonly GlyphPoint[]
  /** river: path data of the centre line. */
  d?: string
  /** summit / pennant: raised once the message has arrived. */
  reached?: boolean
}>(), { x: 0, y: 0, s: 1, pts: () => [], d: '', reached: false })

// A peak is an inverted V, 40 wide and 36 high, base centred on the origin.
// The right (shadow) side is hatched with short diagonals that run from the
// right slope toward the ridge line: at height t (0 base .. 1 apex) the slope
// is at x = 20 (1 - t), y = -36 t, and each stroke steps 8 (1 - t) px inward
// and 5 px down, so the hatches shorten toward the apex like on a real map.
const hatches = [0.14, 0.3, 0.46, 0.62, 0.78].map((t) => {
  const x = 20 * (1 - t)
  const y = -36 * t
  return `M${x.toFixed(1)} ${y.toFixed(1)} L${(x - 9 * (1 - t) - 2).toFixed(1)} ${(y + 5).toFixed(1)}`
})

const at = (p: GlyphPoint): string => `translate(${props.x + p.dx} ${props.y + p.dy}) scale(${p.s ?? 1})`
const root = computed(() => `translate(${props.x} ${props.y}) scale(${props.s})`)
</script>

<template>
  <!-- mountain range: filled peaks (so the nearer ones hide the farther) + shadow hatching -->
  <g
    v-if="kind === 'mountains'"
    class="fill-[#f0e1bb] stroke-[#4a3520] dark:fill-[#34271a] dark:stroke-[#e8d5b0]"
    style="stroke-width: 1.8; stroke-linejoin: round; stroke-linecap: round"
  >
    <g v-for="(p, i) in pts" :key="i" :transform="at(p)">
      <path d="M-20 0 L0 -36 L20 0" />
      <path v-for="h in hatches" :key="h" :d="h" fill="none" style="stroke-width: 1.2" />
    </g>
  </g>

  <!-- forest: round-topped tree stamps on a short trunk -->
  <g
    v-else-if="kind === 'forest'"
    class="fill-[#efe0b8] stroke-[#4a3520] dark:fill-[#34271a] dark:stroke-[#e8d5b0]"
    style="stroke-width: 1.6; stroke-linecap: round"
  >
    <g v-for="(p, i) in pts" :key="i" :transform="at(p)">
      <path d="M0 0 V-7" fill="none" />
      <circle cx="0" cy="-14" r="8" />
      <path d="M-3 -16 Q0 -19 3 -16" fill="none" style="stroke-width: 1" />
    </g>
  </g>

  <!-- hills: wide low downs -->
  <g
    v-else-if="kind === 'hills'"
    class="stroke-[#4a3520] dark:stroke-[#e8d5b0]"
    fill="none"
    style="stroke-width: 1.6; stroke-linecap: round"
  >
    <g v-for="(p, i) in pts" :key="i" :transform="at(p)">
      <!-- low mound on a flat ground line, short hatching down its right flank -->
      <path d="M-26 0 H26" style="stroke-width: 1.2" />
      <path d="M-20 0 C-14 -9, -6 -11, 2 -10 C12 -9, 17 -4, 20 0" />
      <path d="M6 -8 L8 -2 M10 -7 L12 -2 M14 -5 L16 -1" style="stroke-width: 1" />
    </g>
  </g>

  <!-- river: the centre line drawn twice, 3 px apart, = a thin double line -->
  <g
    v-else-if="kind === 'river'"
    class="stroke-[#4a3520] dark:stroke-[#e8d5b0]"
    fill="none"
    style="stroke-width: 1.5; stroke-linecap: round; opacity: 0.75"
  >
    <path :d="d" transform="translate(-3 0)" />
    <path :d="d" transform="translate(3 0)" />
  </g>

  <!-- compass rose, radius 30: ring, four-point star (north point red), small
       diagonal points, and the Bulgarian north letter above -->
  <g v-else-if="kind === 'compass'" :transform="root">
    <g
      class="fill-[#f3e7c9] stroke-[#4a3520] dark:fill-[#33261a] dark:stroke-[#e8d5b0]"
      style="stroke-width: 1.6; stroke-linejoin: round"
    >
      <circle cx="0" cy="0" r="30" />
      <circle cx="0" cy="0" r="25" fill="none" style="stroke-width: 0.8" />
      <path d="M-18 -18 L-3 -3 M18 -18 L3 -3 M18 18 L3 3 M-18 18 L-3 3" fill="none" />
      <path d="M0 -29 L5 -5 L29 0 L5 5 L0 29 L-5 5 L-29 0 L-5 -5 Z" />
      <path d="M0 -29 L5 -5 L-5 -5 Z" class="fill-[#8b1e1e] dark:fill-[#d9534f]" />
    </g>
    <text
      x="0" y="-36" text-anchor="middle"
      class="fill-[#4a3520] dark:fill-[#e8d5b0]"
      style="font: italic 700 20px Georgia, 'Palatino Linotype', serif"
    >С</text>
  </g>

  <!-- summit: one big inked peak with a red pennant on the apex -->
  <g v-else :transform="root">
    <g
      class="fill-[#f0e1bb] stroke-[#4a3520] dark:fill-[#34271a] dark:stroke-[#e8d5b0]"
      style="stroke-width: 2; stroke-linejoin: round; stroke-linecap: round"
    >
      <path d="M-24 0 L0 -44 L24 0" />
      <path v-for="h in hatches" :key="h" :d="h" fill="none" transform="scale(1.2)" style="stroke-width: 1.2" />
    </g>
    <!-- pennant: pole up from the apex, flag flying to the right; dimmed until reached -->
    <g class="transition-opacity duration-500" :style="{ opacity: reached ? 1 : 0.55 }">
      <path d="M0 -44 V-72" class="stroke-[#4a3520] dark:stroke-[#e8d5b0]" fill="none" style="stroke-width: 2; stroke-linecap: round" />
      <path
        class="pennant fill-[#8b1e1e] stroke-[#4a3520] dark:fill-[#d9534f] dark:stroke-[#e8d5b0]"
        d="M0 -72 L22 -66 L0 -58 Z" style="stroke-width: 1.2; stroke-linejoin: round"
      />
    </g>
  </g>
</template>
