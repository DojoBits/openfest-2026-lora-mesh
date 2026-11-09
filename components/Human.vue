<script setup lang="ts">
// A human ranger for the slide-2 hook (the Fellowship cast), flat vector,
// original drawing in the style of Hobbit.vue and with its props contract.
// The tallest figure (~7 heads): hood up, dark green cloak to below the
// knees, leather jerkin over a shirt, tall boots, stubble, a sword on the far
// hip with its hilt forward over the belt.
//
// Local units (fellowGeometry.ts, HUMAN): origin = ground under the feet,
// facing right, y up = negative.
//   boots 0..-34 · legs -28..-90 · jerkin -137..-86 (belt -97..-91)
//   shoulders -134 · head centre -152 (r 13), face top -165
//   hood: back shape behind the head up to ≈ -178; its front rim an arc of
//         radius ≈ 15 round the face, peak -168.5 (inside edge -166.7, so it
//         never covers the brows at ≈ -156 or the panicked brows at ≈ -160)
//   cloak from the shoulders to -38 behind everything
//   sword: scabbard (-12, -92) → (-34, -36) behind the far leg; the hilt
//          continues the blade line up and forward: grip (-12, -94) → (-7, -106),
//          crossguard across it at the belt, pommel on top
import { FELLOW_GEOMETRY } from './data/fellowGeometry'
import type { HobbitPhone } from './data/hobbitGeometry'

withDefaults(defineProps<{
  x: number
  y: number
  scale?: number
  phone: HobbitPhone
  flip?: boolean
  /** Far arm (away from the phone): hanging, or hand on the hip. */
  pose?: 'relaxed' | 'hip'
  /** Backpack on the far side. */
  pack?: boolean
  /** Walking staff in the far hand. */
  staff?: boolean
  /** No phone out yet: the near arm hangs. */
  idle?: boolean
  /** Face: happy (neutral), panicked, or calmly confident; moods crossfade. */
  mood?: 'neutral' | 'panic' | 'calm'
}>(), { scale: 1, flip: false, pose: 'relaxed', pack: false, staff: false, idle: false, mood: 'neutral' })

const geo = FELLOW_GEOMETRY.human
const CLOAK = 'fill-green-800 dark:fill-green-700'
const CLOAK_STROKE = 'stroke-green-800 dark:stroke-green-700'
const HAIR = 'fill-stone-800 dark:fill-stone-700'
</script>

<template>
  <FellowFigure
    class="human" :geo="geo" :x="x" :y="y" :scale="scale" :phone="phone" :flip="flip" :pose="pose"
    :pack="pack" :staff="staff" :idle="idle" :mood="mood"
    sleeve="stroke-stone-500 dark:stroke-stone-400" pocket-cloth="fill-stone-600 dark:fill-stone-500"
    skin="fair" :cheeks="false" :arm-width="9" :cuff="0.85"
  >
    <template #behind="{ ol }">
      <!-- long cloak from the shoulders, wider than the body, below the knees -->
      <path class="human-cloak" d="M-17 -138 L17 -138 Q26 -90 30 -40 Q0 -33 -30 -40 Q-26 -90 -17 -138 Z" :class="[CLOAK, ol]" stroke-width="2.5" />
    </template>

    <template #body="{ ol }">
      <!-- long legs into the tall boots -->
      <path d="M-8 -90 L-8 -28 M8 -90 L8 -28" :class="ol" stroke-width="13.5" fill="none" />
      <path d="M-8 -90 L-8 -28 M8 -90 L8 -28" class="stroke-stone-600 dark:stroke-stone-500" stroke-width="9" fill="none" />
      <!-- sword scabbard, angled back behind the far leg -->
      <g class="human-sword">
        <path d="M-12 -92 L-34 -36" :class="ol" stroke-width="7" fill="none" />
        <path d="M-12 -92 L-34 -36" class="stroke-stone-800 dark:stroke-stone-600" stroke-width="3.6" fill="none" />
      </g>
      <!-- tall boots, toes outwards, a cuff at the top -->
      <g class="human-boots">
        <path d="M2.5 0 L2.5 -34 L13.5 -34 L13.5 -10 Q23 -9 23 -3.5 Q23 0 19 0 Z M-2.5 0 L-2.5 -34 L-13.5 -34 L-13.5 -10 Q-23 -9 -23 -3.5 Q-23 0 -19 0 Z" class="fill-stone-800 dark:fill-stone-700" :class="ol" stroke-width="2.4" />
        <path d="M2.5 -29 L13.5 -29 M-2.5 -29 L-13.5 -29" :class="ol" stroke-width="1.5" fill="none" />
      </g>
      <!-- leather jerkin, split at the front hem -->
      <path d="M-17 -137 Q0 -141 17 -137 L19 -96 Q20 -90 21 -86 L2.5 -86 L0 -91 L-2.5 -86 L-21 -86 Q-20 -90 -19 -96 Z" class="fill-amber-800 dark:fill-amber-700" :class="ol" stroke-width="2.5" />
      <!-- shirt in the V of the collar, with lacing -->
      <path d="M-6.5 -138.5 L0 -126 L6.5 -138.5 Z" class="fill-stone-100 dark:fill-stone-200" :class="ol" stroke-width="1.8" />
      <path d="M-2 -134 L2 -132 M-2 -131 L2 -129" class="stroke-stone-600 dark:stroke-stone-600" stroke-width="1" fill="none" />
      <!-- belt with a silver buckle -->
      <path d="M-19.5 -97.5 L19.5 -97.5 L19.5 -91 L-19.5 -91 Z" class="fill-stone-800 dark:fill-stone-700" :class="ol" stroke-width="2" />
      <rect x="-3.5" y="-98.5" width="7" height="8.5" rx="1.2" class="fill-slate-300 stroke-slate-600 dark:fill-slate-300 dark:stroke-slate-500" stroke-width="1.4" />
      <!-- sword hilt over the belt on the far hip: grip, crossguard, pommel -->
      <g class="human-sword">
        <path d="M-12 -94 L-7 -106" :class="ol" stroke-width="5.5" fill="none" />
        <path d="M-12 -94 L-7 -106" class="stroke-amber-900 dark:stroke-amber-800" stroke-width="2.6" fill="none" />
        <path d="M-18.5 -96.6 L-5.5 -91.4" :class="ol" stroke-width="5" fill="none" />
        <path d="M-18.5 -96.6 L-5.5 -91.4" class="stroke-slate-300 dark:stroke-slate-300" stroke-width="2.4" fill="none" />
        <circle cx="-6.4" cy="-107.8" r="2.6" class="fill-slate-300 dark:fill-slate-300" :class="ol" stroke-width="1.6" />
      </g>
    </template>

    <template #head="{ ol }">
      <!-- the hood's back: a rounded cowl behind the head, down to the shoulders -->
      <path class="human-hood" d="M-17.5 -136 Q-21 -158 -14 -171 Q0 -183 14 -171 Q20 -159 17.5 -138 Z" :class="[CLOAK, ol]" stroke-width="2.5" />
    </template>

    <template #jaw>
      <!-- stubble on the jaw and round the mouth (translucent, so the skin shows through) -->
      <path class="human-stubble fill-stone-600 dark:fill-stone-700" style="fill-opacity: 0.4" d="M-12.5 -150 Q-11 -139.5 0 -139 Q11 -139.5 12.5 -150 Q11 -146 6 -145.8 Q0 -147.5 -6 -145.8 Q-11 -146 -12.5 -150 Z" />
    </template>

    <template #over="{ ol }">
      <!-- dark fringe under the hood, thin, so the brows stay clear -->
      <path d="M-11.5 -159 Q-6 -166.5 2 -165.5 Q10 -165.5 11.5 -159 Q6 -162 0 -161.2 Q-6 -162 -11.5 -159 Z" :class="HAIR" />
      <!-- the hood's front rim round the face -->
      <g class="human-hood">
        <path d="M-13.8 -145 Q-15.5 -169 0 -169.5 Q15.5 -169 13.8 -145" :class="ol" stroke-width="6.5" fill="none" />
        <path d="M-13.8 -145 Q-15.5 -169 0 -169.5 Q15.5 -169 13.8 -145" :class="CLOAK_STROKE" stroke-width="3.2" fill="none" />
      </g>
    </template>

    <template #default>
      <slot />
    </template>
  </FellowFigure>
</template>
