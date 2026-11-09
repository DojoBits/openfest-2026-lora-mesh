<script setup lang="ts">
// Shared shell of the slide-2 figures that are not the hobbit (Dwarf.vue,
// Human.vue, Elf.vue). It owns everything the four kinds have in common —
// placement, arms and their phone poses, the face and its moods, backpack and
// staff, the gripping hand and the pocket — and each kind composes its own
// look into named slots. Same contract as Hobbit.vue: local units from
// fellowGeometry.ts (origin = ground under the feet, facing right), the
// phone drawn by the parent through the default slot in scene coordinates.
//
// Paint order (each slot gets { ol, skin, skinStroke } so a kind draws in
// the same outline and skin tone):
//   pack body · staff pole · #behind (cloak, long hair, axe)
//   far arm · #body (legs, coat, belt) · pack straps · near arm(s)
//   #head (behind the head: hood back, helmet rim back) · head circle
//   #jaw (beard, stubble: over the head, under the face) · face · #over
//   (helmet, hood rim, hair cap, ears, circlet)
//   ── default slot: the phone (and a radio) ──
//   pack rim · gripping hand · pocket patch
import { computed } from 'vue'
import type { HobbitPhone } from './data/hobbitGeometry'
import type { FellowGeometry } from './data/fellowGeometry'

type Skin = 'fair' | 'ruddy' | 'pale'

const props = withDefaults(defineProps<{
  geo: FellowGeometry
  x: number
  y: number
  scale?: number
  phone: HobbitPhone
  flip?: boolean
  pose?: 'relaxed' | 'hip'
  pack?: boolean
  staff?: boolean
  idle?: boolean
  mood?: 'neutral' | 'panic' | 'calm'
  /** Sleeve stroke class (with its dark: pair). */
  sleeve: string
  /** Fill class of the cloth the pocket is sewn on. */
  pocketCloth: string
  skin?: Skin
  armWidth?: number
  /** Share of the forearm the sleeve covers (FellowArm). */
  cuff?: number
  flare?: boolean
  nose?: 'small' | 'big'
  lashes?: boolean
  cheeks?: boolean
}>(), { scale: 1, flip: false, pose: 'relaxed', pack: false, staff: false, idle: false, mood: 'neutral', skin: 'fair', armWidth: 10, cuff: 0.6, flare: false, nose: 'small', lashes: false, cheeks: true })

// Class strings are literal so UnoCSS extracts them; every one has a dark: pair.
const OL = 'stroke-slate-800 dark:stroke-slate-400'
const SKINS: Record<Skin, { fill: string, stroke: string }> = {
  fair: { fill: 'fill-[#f6cfa6] dark:fill-[#ecc195]', stroke: 'stroke-[#f6cfa6] dark:stroke-[#ecc195]' },
  ruddy: { fill: 'fill-[#eab38c] dark:fill-[#dea67f]', stroke: 'stroke-[#eab38c] dark:stroke-[#dea67f]' },
  pale: { fill: 'fill-[#fbe4d0] dark:fill-[#f1d6be]', stroke: 'stroke-[#fbe4d0] dark:stroke-[#f1d6be]' },
}
const skin = computed(() => SKINS[props.skin])
const slotProps = computed(() => ({ ol: OL, skin: skin.value.fill, skinStroke: skin.value.stroke }))

const transform = computed(() => `translate(${props.x} ${props.y}) scale(${(props.flip ? -1 : 1) * props.scale} ${props.scale})`)

const farArm = computed(() => (props.staff ? props.geo.arms.staff : props.geo.arms.far[props.pose]))
/** Near arms: the raised arm and the hanging one crossfade (`idle`); a pocket figure only has the hanging one. */
const nearArms = computed(() => props.phone === 'hand'
  ? [{ arm: props.geo.arms.near.hand, hanging: false, show: !props.idle }, { arm: props.geo.arms.near.pocket, hanging: true, show: props.idle }]
  : [{ arm: props.geo.arms.near.pocket, hanging: true, show: true }])
/** Eyes look towards the phone when it is held up (head units, see FellowFace). */
const look = computed(() => (props.phone === 'hand' && !props.idle ? 2.5 : 0))
/** Gripping hand, in front of the phone: fist on the lower inner corner, thumb above it on the phone face. */
const grip = computed(() => props.geo.arms.near.hand.h)
const handR = computed(() => props.armWidth * 0.46)

// Gear outlines from the kind's pack box and staff (local units).
const packBody = computed(() => {
  const P = props.geo.pack
  return `M${P.x0 + 4} ${P.top} L${P.x1} ${P.top} L${P.x1} ${P.bottom} L${P.x0 + 5} ${P.bottom} Q${P.x0} ${P.bottom} ${P.x0} ${P.bottom - 5} L${P.x0} ${P.top + 4} Q${P.x0} ${P.top} ${P.x0 + 4} ${P.top} Z`
})
const packPocket = computed(() => {
  const P = props.geo.pack
  return `M${P.x0 + 4} ${P.bottom - 20} L${P.x1 - 4} ${P.bottom - 20} L${P.x1 - 4} ${P.bottom - 6} L${P.x0 + 4} ${P.bottom - 6} Z`
})
const packRim = computed(() => {
  const P = props.geo.pack
  return `M${P.x0 - 1} ${P.top} L${P.x1 + 1} ${P.top} L${P.x1 + 1} ${P.top + 6} L${P.x0 - 1} ${P.top + 6} Z`
})
/**
 * Pack straps: from 3 units inside each shoulder straight down 30 units, so
 * they read over the coat whatever the kind's shoulder width.
 */
const straps = computed(() => {
  const far = props.geo.arms.far.relaxed.s
  const near = props.geo.arms.near.pocket.s
  return `M${far[0] + 3} ${far[1] - 4} L${far[0]} ${far[1] + 26} M${near[0] - 3} ${near[1] - 4} L${near[0]} ${near[1] + 26}`
})
const staffPole = computed(() => `M${props.geo.staff.x} 2 L${props.geo.staff.x} ${props.geo.staff.top}`)
const pocket = computed(() => {
  const k = props.geo.pocket
  return { d: `M${k.x0} ${k.y0} L${k.x1} ${k.y0} L${k.x1} ${k.y1 - 3} Q${k.x1} ${k.y1} ${k.x1 - 3} ${k.y1} L${k.x0 + 3} ${k.y1} Q${k.x0} ${k.y1} ${k.x0} ${k.y1 - 3} Z`, stitch: `M${k.x0 + 2} ${k.y0 + 2} L${k.x0 + 2} ${k.y1 - 3.5} Q${k.x0 + 2} ${k.y1 - 2} ${k.x0 + 3.5} ${k.y1 - 2} L${k.x1 - 3.5} ${k.y1 - 2} Q${k.x1 - 2} ${k.y1 - 2} ${k.x1 - 2} ${k.y1 - 3.5} L${k.x1 - 2} ${k.y0 + 2}` }
})
</script>

<template>
  <g class="fellow">
    <!-- ════ figure, behind the phone ════ -->
    <g :transform="transform" stroke-linecap="round" stroke-linejoin="round">
      <g v-if="pack" class="fellow-pack">
        <path :d="packBody" class="fill-amber-700 dark:fill-amber-800" :class="OL" stroke-width="2.5" />
        <path :d="packPocket" class="fill-amber-800 dark:fill-amber-900" :class="OL" stroke-width="1.8" />
      </g>
      <g v-if="staff" class="fellow-staff">
        <path :d="staffPole" :class="OL" stroke-width="7" fill="none" />
        <path :d="staffPole" class="stroke-amber-700 dark:stroke-amber-600" stroke-width="3.6" fill="none" />
      </g>

      <slot name="behind" v-bind="slotProps" />

      <FellowArm :arm="farArm" :sleeve="sleeve" :skin-stroke="skin.stroke" :skin-fill="skin.fill" :ol="OL" :width="armWidth" :cuff="cuff" :flare="flare" />

      <slot name="body" v-bind="slotProps" />

      <g v-if="pack">
        <path :d="straps" :class="OL" stroke-width="5" fill="none" />
        <path :d="straps" class="stroke-amber-700 dark:stroke-amber-800" stroke-width="2.6" fill="none" />
      </g>

      <g v-for="(n, i) in nearArms" :key="i" class="transition-opacity duration-500" :class="n.show ? 'opacity-100' : 'opacity-0'">
        <FellowArm :arm="n.arm" :sleeve="sleeve" :skin-stroke="skin.stroke" :skin-fill="skin.fill" :ol="OL" :width="armWidth" :cuff="cuff" :flare="flare" :hand="n.hanging" />
      </g>

      <slot name="head" v-bind="slotProps" />
      <circle cx="0" :cy="geo.head.y" :r="geo.head.r" :class="[skin.fill, OL]" stroke-width="2.5" />
      <slot name="jaw" v-bind="slotProps" />
      <FellowFace :cx="0" :cy="geo.head.y" :r="geo.head.r" :look="look" :mood="mood" :nose="nose" :lashes="lashes" :cheeks="cheeks" :skin-fill="skin.fill" :ol="OL" />
      <slot name="over" v-bind="slotProps" />
    </g>

    <!-- ════ the phone (parent draws it, scene coordinates) ════ -->
    <slot />

    <!-- ════ in front of the phone ════ -->
    <g :transform="transform" stroke-linecap="round" stroke-linejoin="round">
      <path v-if="pack" :d="packRim" class="fill-amber-800 dark:fill-amber-900" :class="OL" stroke-width="2" />
      <g v-if="phone === 'hand'" class="fellow-grip transition-opacity duration-500" :class="idle ? 'opacity-0' : 'opacity-100'">
        <circle :cx="grip[0]" :cy="grip[1]" :r="handR" :class="[skin.fill, OL]" stroke-width="2.2" />
        <ellipse :cx="grip[0] + 1" :cy="grip[1] - handR - 0.6" :rx="handR * 0.45" :ry="handR * 0.6" :class="[skin.fill, OL]" stroke-width="1.6" />
      </g>
      <g v-else class="fellow-pocket">
        <path :d="pocket.d" :class="[pocketCloth, OL]" stroke-width="1.8" />
        <path :d="pocket.stitch" class="stroke-white/70 dark:stroke-white/60" stroke-width="0.9" stroke-dasharray="1.6 1.4" fill="none" />
      </g>
    </g>
  </g>
</template>
