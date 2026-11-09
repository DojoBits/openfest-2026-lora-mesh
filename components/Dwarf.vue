<script setup lang="ts">
// A dwarf for the slide-2 hook (the Fellowship cast), flat vector, original
// drawing in the style of Hobbit.vue and with its props contract. As short as
// the hobbit but the broadest figure: heavy boots, mail skirt, red tunic with
// steel shoulder plates, a big ginger beard ending in two braids, a round
// steel helmet with a bronze rim, a double-bladed axe on the back.
//
// Local units (fellowGeometry.ts, DWARF): origin = ground under the feet,
// facing right, y up = negative.
//   boots 0..-14 · legs -12..-36 · mail skirt -50..-28 · belt -54..-47
//   tunic -92..-50 (half-width 22 at the shoulders, 26 at the hem)
//   head centre -104 (r 14) · beard from the sideburns (-107) to -64, braids to -56
//   helmet rim -117..-112.5 (above the brows, see FellowFace), dome to -131, knob -135
//   axe: handle (-16, -60) → (-35, -128) behind the far shoulder, blades round (-34, -122)
// The beard is drawn over the head but under the face (#jaw), so the mouth
// and its moods read on top of it; the upper beard edge (centre y -91) sits
// just under the mouth (y ≈ -95.6..-92.3).
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

const geo = FELLOW_GEOMETRY.dwarf
const BEARD = 'fill-orange-700 dark:fill-orange-600'
const BEARD_STROKE = 'stroke-orange-700 dark:stroke-orange-600'
const BEARD_LINE = 'stroke-orange-900 dark:stroke-orange-800'
const STEEL = 'fill-slate-400 dark:fill-slate-500'
const BRONZE = 'fill-amber-600 dark:fill-amber-500'
</script>

<template>
  <FellowFigure
    class="dwarf" :geo="geo" :x="x" :y="y" :scale="scale" :phone="phone" :flip="flip" :pose="pose"
    :pack="pack" :staff="staff" :idle="idle" :mood="mood"
    sleeve="stroke-red-800 dark:stroke-red-700" pocket-cloth="fill-amber-900 dark:fill-amber-800"
    skin="ruddy" nose="big" :arm-width="11" :cuff="0.8"
  >
    <template #behind="{ ol }">
      <!-- axe on the back: handle behind the body, double blade above the far shoulder, clear of the helmet -->
      <g class="dwarf-axe">
        <path d="M-16 -60 L-35 -128" :class="ol" stroke-width="6.5" fill="none" />
        <path d="M-16 -60 L-35 -128" class="stroke-amber-800 dark:stroke-amber-700" stroke-width="3.2" fill="none" />
        <path d="M-34 -127 L-42 -131 Q-47.5 -122 -42 -113 L-34 -117 Z M-34 -127 L-26 -131 Q-20.5 -122 -26 -113 L-34 -117 Z" class="fill-slate-300 dark:fill-slate-400" :class="ol" stroke-width="2" />
      </g>
    </template>

    <template #body="{ ol }">
      <!-- legs: short and thick, trousers into the boots -->
      <path d="M-9 -36 L-9 -12 M9 -36 L9 -12" :class="ol" stroke-width="15" fill="none" />
      <path d="M-9 -36 L-9 -12 M9 -36 L9 -12" class="stroke-[#6b5a3e] dark:stroke-[#7a6847]" stroke-width="10.5" fill="none" />
      <!-- heavy boots, toes outwards, a turned-down cuff -->
      <g class="dwarf-boots">
        <path d="M2 0 L2 -15 L16 -15 L16 -11 Q28 -10 28 -4 Q28 0 24 0 Z M-2 0 L-2 -15 L-16 -15 L-16 -11 Q-28 -10 -28 -4 Q-28 0 -24 0 Z" class="fill-stone-700 dark:fill-stone-600" :class="ol" stroke-width="2.5" />
        <path d="M2 -11 L16 -11 M-2 -11 L-16 -11" :class="ol" stroke-width="1.6" fill="none" />
      </g>
      <!-- mail skirt below the tunic: steel with rows of rings (scallops) -->
      <path d="M-26 -50 L26 -50 L28 -30 Q0 -26 -28 -30 Z" :class="[STEEL, ol]" stroke-width="2.5" />
      <path d="M-24 -43 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 M-25 -36 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0" class="stroke-slate-600 dark:stroke-slate-700" stroke-width="1.2" fill="none" />
      <!-- tunic: broad, barrel-shaped -->
      <path d="M-22 -92 Q0 -96 22 -92 Q28 -72 26 -50 L-26 -50 Q-28 -72 -22 -92 Z" class="fill-red-800 dark:fill-red-700" :class="ol" stroke-width="2.5" />
      <!-- wide belt with a gold buckle -->
      <path d="M-26.5 -55 L26.5 -55 L26.5 -47.5 L-26.5 -47.5 Z" class="fill-amber-900 dark:fill-amber-800" :class="ol" stroke-width="2" />
      <rect x="-5" y="-56.5" width="10" height="10.5" rx="1.5" class="fill-amber-400 stroke-amber-700 dark:fill-amber-400 dark:stroke-amber-600" stroke-width="1.6" />
      <!-- steel shoulder plates: make the shoulders read broad -->
      <path d="M-29 -82 Q-29 -95 -14 -95 L-15 -84 Z M29 -82 Q29 -95 14 -95 L15 -84 Z" :class="[STEEL, ol]" stroke-width="2" />
    </template>

    <template #head="{ ol }">
      <!-- hair at the back of the head, showing under the helmet rim on both sides -->
      <path d="M-17.5 -114 Q-20 -98 -15 -90 L15 -90 Q20 -98 17.5 -114 Z" :class="[BEARD, ol]" stroke-width="2" />
    </template>

    <template #jaw="{ ol }">
      <!-- big beard from the sideburns down to two points; upper edge dips under the mouth -->
      <g class="dwarf-beard">
        <path d="M-14.5 -108 Q-22 -92 -17.5 -78 Q-12 -66 -4 -64 L0 -68 L4 -64 Q12 -66 17.5 -78 Q22 -92 14.5 -108 Q13 -97 6 -93.5 Q0 -90.5 -6 -93.5 Q-13 -97 -14.5 -108 Z" :class="[BEARD, ol]" stroke-width="2.2" />
        <path d="M-11 -88 Q-10 -78 -6 -70 M0 -88 L0 -72 M11 -88 Q10 -78 6 -70" :class="BEARD_LINE" stroke-width="1.3" fill="none" />
        <!-- moustache under the nose, over the beard's upper edge -->
        <path d="M-10 -96.5 Q-5 -100.5 0 -98 Q5 -100.5 10 -96.5 Q5 -94.5 0 -96.5 Q-5 -94.5 -10 -96.5 Z" :class="[BEARD, ol]" stroke-width="1.6" />
      </g>
      <!-- two braids hanging from the beard points, each with a gold bead -->
      <g class="dwarf-braids">
        <path d="M-4 -66 L-4 -57 M4 -66 L4 -57" :class="ol" stroke-width="6" fill="none" />
        <path d="M-4 -66 L-4 -57 M4 -66 L4 -57" :class="BEARD_STROKE" stroke-width="3.2" fill="none" />
        <rect x="-6.2" y="-62" width="4.4" height="3.4" rx="1" class="fill-amber-400 dark:fill-amber-400" />
        <rect x="1.8" y="-62" width="4.4" height="3.4" rx="1" class="fill-amber-400 dark:fill-amber-400" />
      </g>
    </template>

    <template #over="{ ol }">
      <!-- round steel helmet: dome, ridge and top knob over a bronze rim with rivets -->
      <g class="dwarf-helmet">
        <path d="M-15 -115 Q-15.5 -131 0 -131.5 Q15.5 -131 15 -115 Z" :class="[STEEL, ol]" stroke-width="2.2" />
        <path d="M0 -131 L0 -116" :class="ol" stroke-width="1.4" fill="none" />
        <path d="M-2.6 -130.5 L0 -135 L2.6 -130.5 Z" :class="[BRONZE, ol]" stroke-width="1.4" />
        <path d="M-17 -117 L17 -117 L17 -112.5 L-17 -112.5 Z" :class="[BRONZE, ol]" stroke-width="2" />
        <circle cx="-11" cy="-114.8" r="0.9" class="fill-amber-900 dark:fill-amber-900" />
        <circle cx="0" cy="-114.8" r="0.9" class="fill-amber-900 dark:fill-amber-900" />
        <circle cx="11" cy="-114.8" r="0.9" class="fill-amber-900 dark:fill-amber-900" />
      </g>
    </template>

    <template #default>
      <slot />
    </template>
  </FellowFigure>
</template>
