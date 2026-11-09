<script setup lang="ts">
// Slide-2 hook (HookSwitch, viewBox 900 × 400): the „mobile network“ as a
// distant dark tower with a flaming eye. Original flat drawing.
// Geometry is fixed in HookSwitch's coordinates and must stay there: the
// mobile links aim at TOWER = (450, 60) and start TOWER_CLEAR = 62 out, the
// red ✕ (HookSwitch) sits on the body at (450, 96), the label starts at x 486.
// So everything here stays inside x 398–502 and y 0–140, right edge of the
// flames ≤ 476.
//
//   rocky base  y 112–140   jagged dark rock the tower stands on (far ridge)
//   keep        y 48–136    three stepped tiers, each tier narrower; at every
//                           step a buttress spike juts out and up (jagged look)
//   horns       y 4–54      two curved spires rising from the crown, bending
//                           inwards: they cradle the eye between them
//   eye         centre (450, 30): flame tongues, almond eye, slit pupil
//
// `down` = the network failed: the open eye fades out, a shut grey lid fades
// in, and the whole tower desaturates (CSS filter, so the lit windows go grey
// too). Opacity/filter only: nothing moves between clicks.
defineProps<{ down: boolean }>()
</script>

<template>
  <g class="eye-tower transition-[filter,opacity] duration-500" :class="down ? 'eye-tower-down' : ''">
    <!-- rocky base: a jagged mound, wider than the tower, on the far ridge -->
    <path
      d="M392 140 L400 133 L406 135 L412 124 L419 128 L425 114 L432 120 L438 117 L450 110 L462 117 L468 120 L475 114 L481 128 L488 124 L494 135 L500 133 L508 140 Z"
      class="fill-stone-500 stroke-stone-700 dark:fill-stone-700 dark:stroke-stone-500" stroke-width="1.5" stroke-linejoin="round"
    />

    <g class="fill-slate-800 stroke-slate-900 dark:fill-slate-700 dark:stroke-slate-500" stroke-width="1.5" stroke-linejoin="round">
      <!-- keep: symmetric about x 450. Left side bottom → top, then right side
           top → bottom. Each (out, up, back in) triple is one buttress spike
           at a tier step: tier 1 to y 104, tier 2 to y 78, tier 3 to y 52. -->
      <path
        d="M424 136 L428 112 L417 97 L431 102 L434 82 L425 69 L437 76 L439 58 L432 46 L441 52
           L459 52 L468 46 L461 58 L463 76 L475 69 L466 82 L469 102 L483 97 L472 112 L476 136 Z"
      />
      <!-- crown block between the horn roots, so no sky shows under the eye -->
      <path d="M441 53 L444 40 L456 40 L459 53 Z" />
    </g>

    <!-- lit window slits up the keep (amber; greyed by the filter when down) -->
    <g class="fill-amber-400 dark:fill-amber-300">
      <rect x="448.5" y="62" width="3" height="8" rx="1" />
      <rect x="443" y="86" width="3" height="9" rx="1" />
      <rect x="454" y="86" width="3" height="9" rx="1" />
      <rect x="448.5" y="114" width="3" height="10" rx="1" />
    </g>

    <!-- the fire, burning while the network works (behind the horns) -->
    <g class="tower-fire transition-opacity duration-500" :class="down ? 'opacity-0' : 'opacity-100'">
      <!-- soft glow behind everything -->
      <ellipse cx="450" cy="28" rx="27" ry="20" class="fill-orange-400 dark:fill-orange-500" style="fill-opacity: 0.25" />
      <!-- outer flame: tongues licking up between the horns -->
      <path
        class="tower-flame fill-orange-500 dark:fill-orange-500"
        d="M428 34 Q427 22 434 15 Q434 24 438 24 Q437 12 445 5 Q444 16 449 18 Q450 8 456 4
           Q455 15 460 22 Q462 14 467 11 Q466 22 472 34 Q450 46 428 34 Z"
      />
      <!-- inner flame: brighter core -->
      <path
        class="fill-amber-300 dark:fill-amber-300"
        d="M433 33 Q434 25 439 21 Q440 27 444 27 Q445 18 450 13 Q452 21 455 24 Q458 20 462 20
           Q463 27 467 33 Q450 42 433 33 Z"
      />
    </g>

    <!-- horns: thick at the crown, tapering to points that lean back in,
         inner edges ≈ x 435 / 465 at the eye's height (y 30); drawn over the
         fire so they visibly cradle it -->
    <g class="tower-horns fill-slate-800 stroke-slate-900 dark:fill-slate-700 dark:stroke-slate-500" stroke-width="1.5" stroke-linejoin="round">
      <path d="M441 54 C427 44 423 24 432 3 C432 20 436 36 448 48 Z" />
      <path d="M459 54 C473 44 477 24 468 3 C468 20 464 36 452 48 Z" />
    </g>

    <!-- the eye, open while the network works -->
    <g class="tower-eye transition-opacity duration-500" :class="down ? 'opacity-0' : 'opacity-100'">
      <!-- almond eye with a hot iris and a vertical black slit pupil -->
      <path d="M436 30 Q450 19 464 30 Q450 41 436 30 Z" class="fill-yellow-200 stroke-orange-700 dark:stroke-orange-600" stroke-width="1.5" />
      <circle cx="450" cy="30" r="6.5" class="fill-orange-500" />
      <ellipse class="tower-pupil fill-slate-950" cx="450" cy="30" rx="1.6" ry="7.5" />
    </g>

    <!-- the eye shut once the tower fails: grey almond, closed lid, lashes down -->
    <g class="tower-eye-closed transition-opacity duration-500" :class="down ? 'opacity-100' : 'opacity-0'">
      <path d="M436 30 Q450 22 464 30 Q450 38 436 30 Z" class="fill-slate-400 dark:fill-slate-600" />
      <path d="M436 30 Q450 37 464 30" class="stroke-slate-600 dark:stroke-slate-300" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <path d="M442 34 l-2 4 M450 35.5 l0 4.5 M458 34 l2 4" class="stroke-slate-600 dark:stroke-slate-300" stroke-width="1.8" stroke-linecap="round" />
    </g>
  </g>
</template>

<style scoped>
/* Tower down: drained of colour and slightly faded, the red ✕ on top stays red. */
.eye-tower-down {
  filter: grayscale(1);
  opacity: 0.75;
}
</style>
