<script setup lang="ts">
// An elf (a woman) for the slide-2 hook (the Fellowship cast), flat vector,
// original drawing in the style of Hobbit.vue and with its props contract.
// Tall and the slenderest figure: a pale floor-length gown with bell sleeves
// over a teal mantle, long straight pale-gold hair down the back, long
// pointed ears through the hair, a silver circlet with a blue stone, lashes.
//
// Local units (fellowGeometry.ts, ELF): origin = ground under the feet,
// facing right, y up = negative.
//   slipper tips at the hem · gown -133..0 (A-line, hem x -34..28, the train
//   a little longer on the far side) · sash -108..-102 · shoulders -130
//   head centre -146 (r 12.5), face top -158.5 · hair top -162
//   long hair behind the shoulders down to -93 (shows beside the neck)
//   hair cap over the head, centre parting, lower edge -152..-155.5 (just
//   above the brows at ≈ -150 and the panicked brows at ≈ -153.5)
//   circlet: arc (±13.3, -151) peaking -155.5 across the hair, stone at its top
//   ears: base on the head side at y -149..-141, tips up and out at (±23, -158)
//   bow (prop `bow`): an elven longbow held upright in the far hand (relaxed
//   grip at (-19, -86), the bow's middle), limbs bending out to recurved tips
//   at (-31, -160) and (-31, -12), string straight between the nocks at
//   x -30.5; drawn over the mantle and hair, under the far arm (so the hand
//   grips it) and the gown (which hides the lower limb's inner edge)
//   quiver: on her back, only its top and three fletchings show above the far
//   shoulder, between the hair (x ≈ -15 there) and the bowstring
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
  /** Walking staff in the far hand (props contract; slide 2 gives the elf a bow instead). */
  staff?: boolean
  /** Elven longbow in the far hand and a quiver on the back. */
  bow?: boolean
  /** No phone out yet: the near arm hangs. */
  idle?: boolean
  /** Face: happy (neutral), panicked, or calmly confident; moods crossfade. */
  mood?: 'neutral' | 'panic' | 'calm'
}>(), { scale: 1, flip: false, pose: 'relaxed', pack: false, staff: false, bow: false, idle: false, mood: 'neutral' })

const geo = FELLOW_GEOMETRY.elf
const HAIR = 'fill-amber-200 dark:fill-amber-300'
const HAIR_LINE = 'stroke-amber-400 dark:stroke-amber-500'
const GOWN = 'fill-sky-100 dark:fill-sky-200'
/**
 * Bow stave, local units: from the top tip down through the grip (the far
 * hand at (-19, -86)) to the bottom tip; each limb bends out from the grip and
 * flicks back at the tip (recurve). Nocks sit 4 in from each tip.
 */
const BOW = 'M-33 -163 Q-30 -160 -30.5 -156 Q-21 -128 -19 -86 Q-21 -44 -30.5 -16 Q-30 -12 -33 -9'
const STRING = 'M-30.5 -156 L-30.5 -16'
/** Quiver top (an angled tube opening behind the far shoulder) and three fletchings above it. */
const QUIVER = 'M-25 -140 L-17 -138 L-9 -104 L-15 -102 Z'
const FLETCH = ['M-23 -141 L-26 -154 L-22 -151 Z', 'M-20.5 -140 L-22 -156 L-18.5 -151 Z', 'M-18 -139.5 L-17.5 -153 L-15.5 -148 Z']
</script>

<template>
  <FellowFigure
    class="elf" :geo="geo" :x="x" :y="y" :scale="scale" :phone="phone" :flip="flip" :pose="pose"
    :pack="pack" :staff="staff" :idle="idle" :mood="mood"
    sleeve="stroke-sky-100 dark:stroke-sky-200" pocket-cloth="fill-teal-600 dark:fill-teal-500"
    skin="pale" lashes flare :arm-width="8" :cuff="0.75"
  >
    <template #behind="{ ol }">
      <!-- quiver on the back, first, so the mantle and hair cover all but its top and fletchings -->
      <g v-if="bow" class="elf-quiver">
        <path :d="QUIVER" class="fill-amber-800 dark:fill-amber-700" :class="ol" stroke-width="1.8" />
        <path v-for="(d, i) in FLETCH" :key="i" :d="d" class="fill-slate-100 dark:fill-slate-200" :class="ol" stroke-width="1.2" />
      </g>
      <!-- teal mantle behind the gown, to the ground: dark edges either side of the pale gown -->
      <path d="M-12 -133 L12 -133 Q25 -70 31 -2 Q0 4 -39 -2 Q-27 -70 -12 -133 Z" class="fill-teal-700 dark:fill-teal-600" :class="ol" stroke-width="2.5" />
      <!-- long straight hair down the back, a few strand lines -->
      <g class="elf-hair">
        <path d="M-13.5 -150 Q-15.5 -162 0 -162 Q15.5 -162 13.5 -150 L17.5 -100 Q16.5 -93.5 11 -93 L-11 -93 Q-16.5 -93.5 -17.5 -100 Z" :class="[HAIR, ol]" stroke-width="2.2" />
        <path d="M-15 -128 L-14 -98 M15 -128 L14 -98" :class="HAIR_LINE" stroke-width="1.3" fill="none" />
      </g>
      <!-- elven longbow in the far hand: thin string, pale wood stave with a dark outline, gold tips -->
      <g v-if="bow" class="elf-bow">
        <path class="elf-bowstring stroke-slate-500 dark:stroke-slate-300" :d="STRING" stroke-width="1.1" fill="none" />
        <path :d="BOW" :class="ol" stroke-width="6" fill="none" stroke-linecap="round" />
        <path :d="BOW" class="stroke-amber-300 dark:stroke-amber-400" stroke-width="3" fill="none" stroke-linecap="round" />
        <path d="M-33 -163 Q-30 -160 -30.5 -156 M-30.5 -16 Q-30 -12 -33 -9" class="stroke-yellow-500 dark:stroke-yellow-400" stroke-width="3" fill="none" stroke-linecap="round" />
      </g>
    </template>

    <template #body="{ ol }">
      <!-- slipper tips peeking out under the hem -->
      <ellipse cx="21" cy="-1.5" rx="6" ry="2.6" class="fill-slate-300 dark:fill-slate-300" :class="ol" stroke-width="1.8" />
      <ellipse cx="-14" cy="-1.5" rx="5" ry="2.4" class="fill-slate-300 dark:fill-slate-300" :class="ol" stroke-width="1.8" />
      <!-- floor-length A-line gown with two soft folds -->
      <g class="elf-gown">
        <path d="M-13 -133 Q0 -136 13 -133 L15 -108 Q19 -60 27 -4 Q13 0.5 0 0 Q-15 0.5 -33 -3 Q-20 -60 -15 -108 Z" :class="[GOWN, ol]" stroke-width="2.5" />
        <path d="M-4 -100 Q-6 -50 -10 -3 M6 -100 Q8 -50 13 -3" class="stroke-sky-300 dark:stroke-sky-400" stroke-width="1.4" fill="none" />
        <path d="M-6 -134 Q0 -127 6 -134" :class="ol" stroke-width="1.4" fill="none" />
        <!-- sash at the high waist -->
        <path d="M-15.3 -108.5 L15.3 -108.5 L15.8 -102 L-15.8 -102 Z" class="fill-teal-600 dark:fill-teal-500" :class="ol" stroke-width="1.8" />
      </g>
    </template>

    <template #over="{ ol, skin }">
      <!-- hair cap with a centre parting, covering the top of the head -->
      <path class="elf-hair" d="M-13 -146 Q-14.5 -162 0 -162 Q14.5 -162 13 -146 Q11.5 -153 4 -155.5 L0 -152 L-4 -155.5 Q-11.5 -153 -13 -146 Z" :class="[HAIR, ol]" stroke-width="2" />
      <!-- long pointed ears through the hair, tips up and out -->
      <path class="elf-ears" d="M12.2 -149 Q19 -152 23 -158 Q20.5 -146 11.8 -141 Z M-12.2 -149 Q-19 -152 -23 -158 Q-20.5 -146 -11.8 -141 Z" :class="[skin, ol]" stroke-width="1.8" />
      <!-- silver circlet across the hair, a blue stone at the front -->
      <g class="elf-circlet">
        <path d="M-13.3 -151 Q0 -160 13.3 -151" :class="ol" stroke-width="3.4" fill="none" />
        <path d="M-13.3 -151 Q0 -160 13.3 -151" class="stroke-slate-200 dark:stroke-slate-200" stroke-width="1.6" fill="none" />
        <path d="M0 -159 L2.4 -155.5 L0 -152.5 L-2.4 -155.5 Z" class="fill-sky-400 dark:fill-sky-300" :class="ol" stroke-width="1.2" />
      </g>
    </template>

    <template #default>
      <slot />
    </template>
  </FellowFigure>
</template>
