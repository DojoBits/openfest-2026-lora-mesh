<script setup lang="ts">
// Inked "peril" marginalia for the slide-5 journey map: a flying dragon, a
// stone troll, a hanging spider and a prowling warg, in the same sepia ink as
// MapGlyphs.vue. The root is a <g> because it is drawn inside the map's <svg>.
// Every creature is drawn around its own centre (0, 0), faces right, and fits
// the native box exported as PERIL_BOX from data/perilBox.ts; the root
// transform moves it to (x, y), scales it and mirrors it when `flip` is set.
// Class names are literal (UnoCSS extracts from source text only); stroke
// widths live in `style` (attributify trap).
import { computed } from 'vue'
import type { PerilKind } from './data/perilBox'

const props = withDefaults(defineProps<{
  kind: PerilKind
  x: number
  y: number
  scale?: number
  /** Mirror horizontally (the creature faces left instead of right). */
  flip?: boolean
  /** No wing flap: pass Slidev's isPrintMode so exports get a still frame. */
  static?: boolean
}>(), { scale: 1, flip: false, static: false })

// Mirroring is a negative x scale about the centre, which is why every
// figure is authored around (0, 0) rather than a corner.
const root = computed(() => `translate(${props.x} ${props.y}) scale(${props.flip ? -props.scale : props.scale} ${props.scale})`)
</script>

<template>
  <g :transform="root" :class="{ 'peril-static': static }" style="stroke-linejoin: round; stroke-linecap: round">
    <!-- DRAGON: side view, flying right. Box 92 x 50. The shoulder (where both
         wings hinge) is at (4, -2); the wings flap about that point. Drawn
         wing tips at y = -33 down to the feet at y = 16, so the group is
         shifted down 8 to centre that span on the origin. -->
    <g v-if="kind === 'dragon'" transform="translate(0 8)">
      <!-- far wing, behind the body: a smaller, lighter bat wing raised
           forward of the shoulder, so the pair reads as spread -->
      <g class="dragon-wing dragon-wing-far">
        <path
          class="fill-[#a8423a] stroke-[#4a3520] dark:fill-[#b8443f] dark:stroke-[#e8d5b0]"
          d="M7 -3 L14 -22 L8 -33 Q5 -26 0 -24 Q3 -17 -2 -13 Q2 -9 0 -2 Z"
          style="stroke-width: 1.2"
        />
        <path d="M14 -22 L0 -24 M14 -22 L-2 -13" class="fill-none stroke-[#4a3520] dark:stroke-[#e8d5b0]" style="stroke-width: 0.8" />
      </g>
      <!-- spade-tipped tail: an S-curve sweeping back and down from the rump,
           ending in an arrowhead (the "spade") pointing back-up -->
      <path
        class="dragon-tail fill-none stroke-[#4a3520] dark:stroke-[#e8d5b0]"
        d="M-14 6 C-22 14, -30 16, -34 9 C-36 5, -36 2, -39 -1"
        style="stroke-width: 2.4"
      />
      <path
        class="dragon-tail-spade fill-[#8b1e1e] stroke-[#4a3520] dark:fill-[#d9534f] dark:stroke-[#e8d5b0]"
        d="M-39 -1 L-37 -5 L-45 -7 L-41 1 Z"
        style="stroke-width: 1.1"
      />
      <!-- body: rump at left, back rising into a curved neck, wedge head at
           right with the snout at (37, -8), belly curving back under -->
      <path
        class="dragon-body fill-[#8b1e1e] stroke-[#4a3520] dark:fill-[#d9534f] dark:stroke-[#e8d5b0]"
        d="M-16 5 C-10 -2, 6 -3, 15 -2 C20 -5, 22 -11, 27 -13 L33 -12 L38 -9 L37 -6 L30 -6
           C26 -5, 23 -1, 21 4 C14 11, -6 11, -16 5 Z"
        style="stroke-width: 1.4"
      />
      <!-- horn swept back from the crown, and the eye -->
      <path d="M28 -13 L24 -18 L31 -13" class="fill-[#8b1e1e] stroke-[#4a3520] dark:fill-[#d9534f] dark:stroke-[#e8d5b0]" style="stroke-width: 1" />
      <circle cx="31" cy="-10" r="1" class="fill-[#f3e7c9] dark:fill-[#2a1d12]" />
      <!-- back spines: three small teeth along the top line -->
      <path d="M-6 -1 L-4 -5 L-2 -1 M2 -2 L4 -6 L6 -2 M10 -2 L12 -6 L14 -2" class="fill-none stroke-[#4a3520] dark:stroke-[#e8d5b0]" style="stroke-width: 1" />
      <!-- tucked legs with clawed feet under the belly -->
      <path d="M-8 9 L-10 15 L-6 16 M12 8 L12 14 L16 15" class="fill-none stroke-[#4a3520] dark:stroke-[#e8d5b0]" style="stroke-width: 1.6" />
      <!-- near wing, in front of the body: arm from the shoulder to the wrist
           (-4, -22), leading edge on to the tip (-28, -32), trailing edge
           scalloped in three arcs back to the flank; the two finger bones
           fan from the wrist to the scallop points -->
      <g class="dragon-wing dragon-wing-near">
        <path
          class="fill-[#8b1e1e] stroke-[#4a3520] dark:fill-[#d9534f] dark:stroke-[#e8d5b0]"
          d="M4 -2 L-4 -22 L-28 -32 Q-22 -23 -25 -15 Q-17 -16 -16 -8 Q-10 -10 -7 2 Z"
          style="stroke-width: 1.4"
        />
        <path d="M-4 -22 L-25 -15 M-4 -22 L-16 -8" class="fill-none stroke-[#4a3520] dark:stroke-[#e8d5b0]" style="stroke-width: 0.9" />
      </g>
      <!-- fire: a short tongue of flame curling out of the open mouth -->
      <path
        class="dragon-fire fill-[#d9822b] stroke-[#8b1e1e] dark:fill-[#f0a64a] dark:stroke-[#d9534f]"
        d="M37 -7 Q42 -11 45 -8 Q43 -8 44 -5 Q47 -6 45 -2 Q42 -4 38 -5 Z"
        style="stroke-width: 0.9"
      />
    </g>

    <!-- TROLL: hunched stone troll on a ground line at y = 18: big hump,
         small head jutting forward under it, one long arm hanging to a fist
         that drags a knobbly club along the ground. Box 52 x 34. Drawn
         x -17..34, y -14..18, so shifted (-8, -2) to centre on the origin. -->
    <g v-else-if="kind === 'troll'" transform="translate(-8 -2)">
      <!-- far arm, behind the body: only the knuckles show at the back -->
      <path d="M-9 -4 C-15 2, -16 9, -14 14" class="fill-none stroke-[#4a3520] dark:stroke-[#e8d5b0]" style="stroke-width: 3.2" />
      <!-- body: hump (top at y = -14) pushed back, two thick legs planted -->
      <path
        class="troll-body fill-[#8a8478] stroke-[#4a3520] dark:fill-[#6f695e] dark:stroke-[#e8d5b0]"
        d="M-14 18 L-12 8 C-17 1, -15 -11, -4 -14 C5 -16, 11 -10, 11 -3 C12 4, 9 10, 9 18
           L2 18 L1 11 L-4 11 L-7 18 Z"
        style="stroke-width: 1.4"
      />
      <!-- stone cracks across the hide -->
      <path d="M-8 -7 L-4 -3 L-5 2 M-2 -11 L0 -7" class="fill-none stroke-[#4a3520] dark:stroke-[#e8d5b0]" style="stroke-width: 0.8" />
      <!-- head: round skull under a heavy brow, set low and forward of the
           hump; bulbous nose at (21, -6), a tusk poking up from the jaw -->
      <path
        class="troll-head fill-[#8a8478] stroke-[#4a3520] dark:fill-[#6f695e] dark:stroke-[#e8d5b0]"
        d="M8 -9 C8 -14, 15 -16, 18 -12 L21 -9 C24 -7, 22 -4, 19 -5 L18 -3 C15 0, 9 -1, 8 -5 Z"
        style="stroke-width: 1.2"
      />
      <path d="M16 -2 L17 -5 M10 -12 Q14 -15 18 -12" class="fill-none stroke-[#4a3520] dark:stroke-[#e8d5b0]" style="stroke-width: 1" />
      <circle cx="15" cy="-10" r="0.9" class="fill-[#4a3520] dark:fill-[#e8d5b0]" />
      <!-- club: handle from the fist (12, 9) forward and down to a knobbly
           log-shaped head lying on the ground in front of the feet;
           its studs stick out of the top edge -->
      <path d="M11 8 L19 11" class="troll-club fill-none stroke-[#5a3d22] dark:stroke-[#d9b98a]" style="stroke-width: 2.6" />
      <path
        class="troll-club-head fill-[#7a5a36] stroke-[#4a3520] dark:fill-[#8f6c44] dark:stroke-[#e8d5b0]"
        d="M17 12 C18 7, 28 6, 31 10 C33 14, 27 18, 18 16 Z"
        style="stroke-width: 1.2"
      />
      <path d="M21 8 L20 5.5 M26 7 L26.5 4.5 M31 11 L33.5 10.5" class="fill-none stroke-[#4a3520] dark:stroke-[#e8d5b0]" style="stroke-width: 1.1" />
      <!-- near arm: a long thick limb from the shoulder down to the fist -->
      <path
        class="fill-[#8a8478] stroke-[#4a3520] dark:fill-[#6f695e] dark:stroke-[#e8d5b0]"
        d="M0 -8 C7 -7, 11 0, 13 7 L9 9 C7 3, 4 -1, -1 -3 Z"
        style="stroke-width: 1.2"
      />
      <circle cx="11.5" cy="9" r="3" class="fill-[#8a8478] stroke-[#4a3520] dark:fill-[#6f695e] dark:stroke-[#e8d5b0]" style="stroke-width: 1.2" />
      <!-- ground line under the feet -->
      <path d="M-17 18 H30" class="fill-none stroke-[#4a3520] dark:stroke-[#e8d5b0]" style="stroke-width: 1" />
    </g>

    <!-- SPIDER: hangs head-down from a silk thread that starts at the top
         of the box. Box 40 x 46. Shifted down 2 to centre
         the thread top (y = -25) and the feet (y = 21). -->
    <g v-else-if="kind === 'spider'" transform="translate(0 2)">
      <path d="M0 -25 V-4" class="spider-thread fill-none stroke-[#4a3520] dark:stroke-[#e8d5b0]" style="stroke-width: 0.9" />
      <!-- eight legs, four a side, each a hip-knee-foot polyline: the knees
           sit high and wide so the legs read as arched, spider-like -->
      <path
        class="spider-legs fill-none stroke-[#1f160e] dark:stroke-[#e8d5b0]"
        d="M-3 2 L-12 -7 L-19 -1 M-4 4 L-15 -1 L-20 7 M-4 6 L-14 6 L-18 15 M-3 8 L-10 13 L-12 21
           M3 2 L12 -7 L19 -1 M4 4 L15 -1 L20 7 M4 6 L14 6 L18 15 M3 8 L10 13 L12 21"
        style="stroke-width: 1.5"
      />
      <!-- abdomen (top, near the thread) and the smaller head below it -->
      <ellipse cx="0" cy="-1" rx="7" ry="8" class="fill-[#1f160e] stroke-[#4a3520] dark:fill-[#1a120b] dark:stroke-[#e8d5b0]" style="stroke-width: 1" />
      <circle cx="0" cy="9" r="4" class="fill-[#1f160e] stroke-[#4a3520] dark:fill-[#1a120b] dark:stroke-[#e8d5b0]" style="stroke-width: 1" />
      <!-- pale hourglass mark on the abdomen and two eyes -->
      <path d="M-2 -5 L2 -5 L0 -1 L2 3 L-2 3 L0 -1 Z" class="fill-[#c9a27a] dark:fill-[#e8d5b0]" />
      <circle cx="-1.5" cy="10" r="0.8" class="fill-[#f3e7c9] dark:fill-[#e8d5b0]" />
      <circle cx="1.5" cy="10" r="0.8" class="fill-[#f3e7c9] dark:fill-[#e8d5b0]" />
    </g>

    <!-- WARG: a wolf prowling right, head lowered below the shoulder, bushy
         tail drooping behind, on a ground line at y = 16. Box 70 x 30. -->
    <g v-else-if="kind === 'warg'" transform="translate(0 -1)">
      <!-- bushy tail: a tapering plume from the rump down to its tip at (-35, 8) -->
      <path
        class="warg-tail fill-[#5a4630] stroke-[#4a3520] dark:fill-[#a8957a] dark:stroke-[#e8d5b0]"
        d="M-19 -6 C-27 -7, -33 -1, -35 8 C-31 5, -26 3, -20 1 Z"
        style="stroke-width: 1.2"
      />
      <!-- body outline, clockwise from the rump: back rising to the high
           shoulder (10, -10), neck dropping to the head, pointed ear,
           long muzzle with the nose at (34, -1), throat, two front legs,
           belly tucked up, two hind legs with the hock bent back -->
      <path
        class="warg-body fill-[#5a4630] stroke-[#4a3520] dark:fill-[#a8957a] dark:stroke-[#e8d5b0]"
        d="M-21 -5 C-12 -10, 0 -12, 10 -10 L16 -7 L18 -9 L20 -14 L22 -8 L29 -5 L34 -2 L33 0 L27 1
           L22 3 L17 4 L16 16 L13 16 L12 7 L10 16 L7 16 L6 5 C0 5, -8 5, -13 3
           L-12 9 L-10 16 L-13 16 L-16 9 L-17 16 L-20 16 L-21 6 C-23 1, -23 -2, -21 -5 Z"
        style="stroke-width: 1.2"
      />
      <!-- raised hackles: short strokes standing up along the shoulders -->
      <path d="M1 -11 L0 -14 M5 -11 L5 -14 M9 -10 L10 -13" class="fill-none stroke-[#4a3520] dark:stroke-[#e8d5b0]" style="stroke-width: 1" />
      <circle cx="24" cy="-5" r="0.9" class="fill-[#f3e7c9] dark:fill-[#2a1d12]" />
      <path d="M-30 16 H22" class="fill-none stroke-[#4a3520] dark:stroke-[#e8d5b0]" style="stroke-width: 1" />
    </g>
  </g>
</template>

<style scoped>
/* Wing flap: each wing scales a little toward its shoulder hinge and tips
   back. fill-box makes the origin relative to the wing's own bbox; the
   shoulder is at the wing's bottom-right corner (near) or bottom, 70 % across
   (far). The far wing runs half a beat later so the pair does not move as
   one rigid plate. */
.dragon-wing {
  transform-box: fill-box;
  animation: peril-flap 2.5s ease-in-out infinite;
}
.dragon-wing-near { transform-origin: 100% 100%; }
.dragon-wing-far { transform-origin: 70% 100%; animation-delay: -0.4s; }

@keyframes peril-flap {
  0%, 100% { transform: scaleY(1) rotate(0deg); }
  50% { transform: scaleY(0.72) rotate(6deg); }
}

/* print / export (static prop) and reduced motion: wings stay spread */
.peril-static .dragon-wing { animation: none; }
@media (prefers-reduced-motion: reduce) {
  .dragon-wing { animation: none; }
}
</style>
