<script setup lang="ts">
// Slide-2 hook (HookSwitch, viewBox 900 × 400): today's mobile network, a
// lattice cell tower standing where the eye tower stood (clicks 3 to 5).
// Same footprint as EyeTower, so every computed link still fits: the mobile
// links aim at TOWER = (450, 60) and start TOWER_CLEAR = 62 out, the red ✕
// (HookSwitch) sits on the mast at (450, 96). Everything stays inside
// x 398–502 and y 0–140.
//
//   base      y 128–140   a low grassy mound on the far ridge
//   mast      y 34–138    lattice: two legs narrowing upwards, zigzag braces
//   panels    y 40–64     three sector antennas round the top
//   spike     y 10–34     the top rod with a red warning light
//   waves     centre (450, 50), two arcs per side while the network works
//
// `down` = the network failed: the waves and the light fade out and the
// tower desaturates (CSS filter). Opacity/filter only: nothing moves.
defineProps<{ down: boolean }>()

/** Zigzag braces between the legs: the legs run from x 432/468 at y 138 to x 444/456 at y 36. */
const leg = (y: number) => 432 + ((138 - y) / 102) * 12
const RUNGS = [138, 118, 100, 84, 70, 58, 46, 36]
const braces = RUNGS.slice(0, -1).map((y, i) => {
  const y2 = RUNGS[i + 1]
  // alternate the diagonal direction on each section
  return i % 2 === 0
    ? `M${leg(y)} ${y} L${900 - leg(y2)} ${y2}`
    : `M${900 - leg(y)} ${y} L${leg(y2)} ${y2}`
})
const rungs = RUNGS.map(y => `M${leg(y)} ${y} H${900 - leg(y)}`)
/** Signal arcs off the panels, left and right. */
const arc = (r: number, side: 1 | -1) => `M${450 + side * r * 0.5} ${50 - r * 0.87} A${r} ${r} 0 0 ${side === 1 ? 1 : 0} ${450 + side * r * 0.5} ${50 + r * 0.87}`
const waves = [26, 38].flatMap(r => [arc(r, 1), arc(r, -1)])
</script>

<template>
  <g class="cell-tower transition-[filter,opacity] duration-500" :class="down ? 'cell-tower-down' : ''">
    <!-- grassy mound on the far ridge -->
    <path d="M404 140 Q450 120 496 140 Z" class="fill-green-300 stroke-green-700 dark:fill-green-800 dark:stroke-green-500" stroke-width="1.5" />

    <!-- lattice mast: legs, rungs and zigzag braces -->
    <g class="stroke-slate-700 dark:stroke-slate-300" fill="none" stroke-linecap="round">
      <path d="M432 138 L444 36 M468 138 L456 36" stroke-width="3.5" />
      <path :d="rungs.join(' ')" stroke-width="1.8" />
      <path :d="braces.join(' ')" stroke-width="1.5" />
      <!-- top rod -->
      <path d="M450 36 V12" stroke-width="2.5" />
    </g>

    <!-- three sector antenna panels round the top -->
    <g class="fill-slate-100 stroke-slate-700 dark:fill-slate-600 dark:stroke-slate-300" stroke-width="1.5">
      <rect x="434" y="40" width="7" height="24" rx="2" />
      <rect x="446.5" y="38" width="7" height="24" rx="2" />
      <rect x="459" y="40" width="7" height="24" rx="2" />
    </g>

    <!-- red warning light and signal waves, only while the network works -->
    <g class="transition-opacity duration-500" :class="down ? 'opacity-0' : 'opacity-100'">
      <circle cx="450" cy="10" r="4" class="fill-red-500 dark:fill-red-400" />
      <path v-for="w in waves" :key="w" :d="w" fill="none" class="stroke-slate-500 dark:stroke-slate-400" stroke-width="3" stroke-linecap="round" />
    </g>
  </g>
</template>

<style scoped>
.cell-tower-down {
  filter: grayscale(1);
}
</style>
