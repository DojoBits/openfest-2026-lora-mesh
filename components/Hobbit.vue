<script setup lang="ts">
// One hobbit figure, flat vector, original drawing (slide-2 hook scene and
// anywhere else a small person is needed). Small and stocky, ~3.4 heads tall:
// curly hair framing a round face, pointed ears, white shirt with rolled
// sleeves, pear-shaped waistcoat open at the neck, knee-length breeches, big
// bare hairy feet.
//
// Geometry is local: origin = ground under the feet, body centre at x 0,
// facing right (+x), ~130 units tall. The root <g> translates to (x, y),
// scales by `scale` and mirrors when `flip`. Vertical landmarks (y up = negative):
//   feet 0..-10 · shins -7..-29 · breeches -28..-56 · waistcoat -46..-89
//   shoulders -84 · head centre -104 (r 15) · hair top ≈ -125
//
// The phone itself is drawn by the parent through the default slot, in scene
// coordinates (so the parent keeps its status icons and can attach links;
// hobbitGeometry.ts says where it is). The figure is split around the slot:
// body behind the phone, then the gripping hand or the pocket patch in front.
//   phone="hand"   — near arm bent, hand at (31, -77) grips the phone's lower
//                    inner corner beside the face, eyes turned towards it;
//   phone="pocket" — a small phone, top third out of a stitched patch pocket
//                    on the near thigh (x 4..17, y -50..-38); arms relaxed.
//
// Optional gear (composition: each is a flag, drawn in local units from
// hobbitGeometry.ts so the scene can mount things on it):
//   pack  — backpack on the far side (HOBBIT_PACK): body behind the figure,
//           two shoulder straps over the shirt, and a rim band drawn in front
//           of the slot, so whatever the parent draws there (a radio) reads
//           as sticking out of the pack;
//   staff — a walking staff (HOBBIT_STAFF) gripped upright in the far hand;
//           overrides `pose` for the far arm.
import { computed } from 'vue'
import { HOBBIT_PACK, HOBBIT_STAFF, type HobbitPhone } from './data/hobbitGeometry'

type Palette = 'green' | 'mustard' | 'burgundy' | 'brown'

const props = withDefaults(defineProps<{
  x: number
  y: number
  scale?: number
  palette?: Palette
  phone: HobbitPhone
  flip?: boolean
  /** Far arm (away from the phone): hanging, or hand on the hip. */
  pose?: 'relaxed' | 'hip'
  /** Backpack on the far side, its rim drawn over the slot (see header). */
  pack?: boolean
  /** Walking staff in the far hand. */
  staff?: boolean
  /** No phone out yet: a phone-holding hobbit lets the near arm hang (crossfades to the raised arm when false). */
  idle?: boolean
  /** Face: happy (neutral), panicked, or calmly confident; moods crossfade. */
  mood?: 'neutral' | 'panic' | 'calm'
}>(), { mood: 'neutral', scale: 1, palette: 'green', flip: false, pose: 'relaxed', pack: false, staff: false, idle: false })

// Class strings are literal so UnoCSS can extract them; every fill has a
// dark: pair. Skin and facial features keep the same colours in both schemes
// (a face reads the same on any background); clothes darken slightly.
const OL = 'stroke-slate-800 dark:stroke-slate-400'
const SKIN = 'fill-[#f6cfa6] dark:fill-[#ecc195]'
const SKIN_STROKE = 'stroke-[#f6cfa6] dark:stroke-[#ecc195]'
const SHIRT = 'fill-stone-50 dark:fill-stone-200'
const SHIRT_STROKE = 'stroke-stone-50 dark:stroke-stone-200'

/** Hair, waistcoat, breeches and an optional extra (scarf / short cloak) per palette. */
const PALETTES: Record<Palette, { hair: string, hairStroke: string, coat: string, breeches: string, extra: 'none' | 'scarf' | 'cloak', extraFill: string }> = {
  green: { hair: 'fill-amber-800 dark:fill-amber-700', hairStroke: 'stroke-amber-800 dark:stroke-amber-600', coat: 'fill-emerald-700 dark:fill-emerald-600', breeches: 'fill-stone-500 dark:fill-stone-500', extra: 'none', extraFill: '' },
  mustard: { hair: 'fill-orange-600 dark:fill-orange-500', hairStroke: 'stroke-orange-600 dark:stroke-orange-500', coat: 'fill-amber-400 dark:fill-amber-500', breeches: 'fill-[#7c6a4a] dark:fill-[#8a7655]', extra: 'scarf', extraFill: 'fill-red-600 dark:fill-red-500' },
  burgundy: { hair: 'fill-neutral-800 dark:fill-neutral-700', hairStroke: 'stroke-neutral-800 dark:stroke-neutral-500', coat: 'fill-rose-800 dark:fill-rose-700', breeches: 'fill-slate-500 dark:fill-slate-500', extra: 'none', extraFill: '' },
  brown: { hair: 'fill-[#c9a04a] dark:fill-[#c9a04a]', hairStroke: 'stroke-[#a8822f] dark:stroke-[#c9a04a]', coat: 'fill-amber-900 dark:fill-amber-800', breeches: 'fill-[#6b7a45] dark:fill-[#75854c]', extra: 'cloak', extraFill: 'fill-green-800 dark:fill-green-700' },
}
const pal = computed(() => PALETTES[props.palette])

const transform = computed(() => `translate(${props.x} ${props.y}) scale(${(props.flip ? -1 : 1) * props.scale} ${props.scale})`)

type Pt = readonly [number, number]
/** An arm as shoulder → elbow → hand. */
interface Arm { s: Pt, e: Pt, h: Pt }
const FAR_ARM: Record<'relaxed' | 'hip', Arm> = {
  relaxed: { s: [-15, -84], e: [-21, -66], h: [-21, -49] },
  hip: { s: [-14, -84], e: [-29, -69], h: [-21, -56] }, // elbow out, knuckles on the hip
}
const NEAR_ARM: Record<HobbitPhone, Arm> = {
  hand: { s: [14, -84], e: [22, -64], h: [31, -77] }, // elbow down, forearm up to the phone
  pocket: { s: [15, -84], e: [23, -66], h: [27, -48] }, // hanging just outside the pocket
}
/** Far arm gripping the staff: elbow out, hand round the pole at HOBBIT_STAFF.hand. */
const STAFF_ARM: Arm = { s: [-15, -84], e: [-28, -73], h: [HOBBIT_STAFF.x, HOBBIT_STAFF.hand] }
const farArm = computed(() => (props.staff ? STAFF_ARM : FAR_ARM[props.pose]))
/** Near arms drawn: the held arm and the hanging one crossfade (`idle`); a pocket hobbit only has the hanging one. */
const nearArms = computed(() => props.phone === 'hand'
  ? [{ arm: NEAR_ARM.hand, hanging: false, show: !props.idle }, { arm: NEAR_ARM.pocket, hanging: true, show: props.idle }]
  : [{ arm: NEAR_ARM.pocket, hanging: true, show: true }])
/** Point a fraction `t` of the way from a to b (rolled cuff = first quarter of the forearm). */
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const d = (...p: Pt[]) => `M${p.map(q => q.join(' ')).join(' L')}`

/**
 * Curly hair: circles on a ring around the head centre (0, -104). Back curls
 * (drawn before the face) run from the left ear over the top to the right
 * ear; the fringe (after the face) is three smaller curls on the forehead.
 * Angles in degrees, 90 = straight up.
 */
const ring = (angles: number[], radius: number, r: (i: number) => number) => angles.map((a, i) => {
  const t = (a * Math.PI) / 180
  return { x: radius * Math.cos(t), y: -104 - radius * Math.sin(t), r: r(i) }
})
const BACK = [205, 178, 150, 124, 100, 78, 54, 28, 2, -25]
const backCurls = ring(BACK, 14, i => (i === 0 || i === BACK.length - 1 ? 5 : 7))
const fringe = ring([128, 100, 72], 12.5, () => 5.2)
/** Eyes look towards the phone when it is held up. */
const look = computed(() => (props.phone === 'hand' && !props.idle ? 2.5 : 0))

// Gear outlines (local units). Pack: rounded body with a flap; rim = the band
// at the pack mouth, drawn in front. Staff: a straight pole.
const P = HOBBIT_PACK
const packBody = `M${P.x0 + 4} ${P.top} L${P.x1} ${P.top} L${P.x1} ${P.bottom} L${P.x0 + 5} ${P.bottom} Q${P.x0} ${P.bottom} ${P.x0} ${P.bottom - 5} L${P.x0} ${P.top + 4} Q${P.x0} ${P.top} ${P.x0 + 4} ${P.top} Z`
const packPocket = `M${P.x0 + 4} ${P.bottom - 20} L${P.x1 - 4} ${P.bottom - 20} L${P.x1 - 4} ${P.bottom - 6} L${P.x0 + 4} ${P.bottom - 6} Z`
const packRim = `M${P.x0 - 1} ${P.top} L${P.x1 + 1} ${P.top} L${P.x1 + 1} ${P.top + 6} L${P.x0 - 1} ${P.top + 6} Z`
const S = HOBBIT_STAFF
const staffPole = `M${S.x} 2 L${S.x} ${S.top}`
</script>

<template>
  <g class="hobbit">
    <!-- ════ body, behind the phone ════ -->
    <g :transform="transform" stroke-linecap="round" stroke-linejoin="round">
      <!-- backpack behind everything, sticking out on the far side and above the shoulder -->
      <g v-if="pack" class="hobbit-pack">
        <path :d="packBody" class="fill-amber-700 dark:fill-amber-800" :class="OL" stroke-width="2.5" />
        <path :d="packPocket" class="fill-amber-800 dark:fill-amber-900" :class="OL" stroke-width="1.8" />
      </g>
      <!-- walking staff, upright in the far hand (the hand is drawn over it below) -->
      <g v-if="staff" class="hobbit-staff">
        <path :d="staffPole" :class="OL" stroke-width="7" fill="none" />
        <path :d="staffPole" class="stroke-amber-700 dark:stroke-amber-600" stroke-width="3.6" fill="none" />
      </g>

      <!-- short cloak hanging from the shoulders, behind everything -->
      <path v-if="pal.extra === 'cloak'" d="M-14 -90 L14 -90 L30 -46 Q0 -40 -30 -46 Z" :class="[pal.extraFill, OL]" stroke-width="2.5" />

      <!-- far arm: outline, sleeve, rolled cuff, bare forearm, hand -->
      <g class="hobbit-arm">
        <path :d="d(farArm.s, farArm.e, farArm.h)" :class="OL" stroke-width="10" fill="none" />
        <path :d="d(farArm.e, lerp(farArm.e, farArm.h, 0.3))" :class="OL" stroke-width="12" fill="none" />
        <path :d="d(farArm.s, farArm.e)" :class="SHIRT_STROKE" stroke-width="5.5" fill="none" />
        <path :d="d(lerp(farArm.e, farArm.h, 0.3), farArm.h)" :class="SKIN_STROKE" stroke-width="5.5" fill="none" />
        <path :d="d(farArm.e, lerp(farArm.e, farArm.h, 0.3))" :class="SHIRT_STROKE" stroke-width="7.5" fill="none" />
        <circle :cx="farArm.h[0]" :cy="farArm.h[1]" r="4.3" :class="[SKIN, OL]" stroke-width="2.2" />
      </g>

      <!-- shins: short and sturdy, out of the breeches down into the feet -->
      <path d="M-10 -30 L-10 -6 M10 -30 L10 -6" :class="OL" stroke-width="12.5" fill="none" />
      <path d="M-10 -30 L-10 -6 M10 -30 L10 -6" :class="SKIN_STROKE" stroke-width="8" fill="none" />

      <!-- big bare feet, toes outwards; toe lines and hair tufts on top -->
      <g class="hobbit-feet">
        <path d="M4 -1 Q3 -10 11 -10.5 L21 -9.5 Q31 -8.5 31 -3.5 Q31 0 26 0 L7 0 Q4 0 4 -1 Z M-4 -1 Q-3 -10 -11 -10.5 L-21 -9.5 Q-31 -8.5 -31 -3.5 Q-31 0 -26 0 L-7 0 Q-4 0 -4 -1 Z" :class="[SKIN, OL]" stroke-width="2.5" />
        <path d="M23 0 L23 -3.5 M27 0 L27 -3 M-23 0 L-23 -3.5 M-27 0 L-27 -3" :class="OL" stroke-width="1.5" fill="none" />
        <path d="M11 -10.5 l-1.5 -3.5 M15 -10.2 l0 -4 M19 -9.8 l1.5 -3.5 M-11 -10.5 l1.5 -3.5 M-15 -10.2 l0 -4 M-19 -9.8 l-1.5 -3.5" :class="pal.hairStroke" stroke-width="2" fill="none" />
      </g>

      <!-- knee-length breeches, split between the legs, a button at each knee -->
      <path d="M-20 -56 L20 -56 L21.5 -31 Q21.5 -28 18.5 -28 L3 -28 L1 -42 L-1 -42 L-3 -28 L-18.5 -28 Q-21.5 -28 -21.5 -31 Z" :class="[pal.breeches, OL]" stroke-width="2.5" />
      <circle cx="17" cy="-32" r="1.4" class="fill-slate-800 dark:fill-slate-400" />
      <circle cx="-17" cy="-32" r="1.4" class="fill-slate-800 dark:fill-slate-400" />

      <!-- shirt under the waistcoat, with a pointed collar -->
      <path d="M-15 -89 Q0 -93 15 -89 L20 -56 L-20 -56 Z" :class="[SHIRT, OL]" stroke-width="2.5" />

      <!-- pear-shaped waistcoat, open V to the chest, pointed hem, buttons -->
      <g class="hobbit-waistcoat">
        <path d="M-15 -89 L-7 -89 L0 -69 L7 -89 L15 -89 Q23 -74 23 -60 Q23 -51 14 -50 L4 -50 L0 -46 L-4 -50 L-14 -50 Q-23 -51 -23 -60 Q-23 -74 -15 -89 Z" :class="[pal.coat, OL]" stroke-width="2.5" />
        <path d="M0 -69 L0 -47" :class="OL" stroke-width="1.5" fill="none" />
        <circle cx="3" cy="-64" r="1.6" class="fill-amber-200 dark:fill-amber-200" />
        <circle cx="3" cy="-57" r="1.6" class="fill-amber-200 dark:fill-amber-200" />
        <path d="M-17 -62 L-9 -62" :class="OL" stroke-width="1.5" fill="none" />
      </g>
      <path d="M-7 -90.5 L-2.5 -84 L0 -89 L2.5 -84 L7 -90.5" :class="[SHIRT, OL]" stroke-width="1.8" />
      <!-- backpack straps over both shoulders, down the chest beside the waistcoat V -->
      <g v-if="pack">
        <path d="M-12 -89 L-15 -60 M12 -89 L15 -60" :class="OL" stroke-width="5" fill="none" />
        <path d="M-12 -89 L-15 -60 M12 -89 L15 -60" class="stroke-amber-700 dark:stroke-amber-800" stroke-width="2.6" fill="none" />
      </g>

      <!-- scarf knotted at the neck, one end hanging on the far side -->
      <path v-if="pal.extra === 'scarf'" d="M-13 -92 Q0 -85 13 -92 L13 -86 Q0 -79 -13 -86 Z M-9 -85 L-13 -68 L-7 -68.5 L-4 -84 Z" :class="[pal.extraFill, OL]" stroke-width="2" />
      <!-- cloak clasp -->
      <circle v-if="pal.extra === 'cloak'" cx="-11" cy="-88" r="2.6" class="fill-amber-300 stroke-amber-700" stroke-width="1" />

      <!-- near arm: bent up towards the held phone, or hanging by the pocket -->
      <g v-for="(n, i) in nearArms" :key="i" class="hobbit-arm transition-opacity duration-500" :class="n.show ? 'opacity-100' : 'opacity-0'">
        <path :d="d(n.arm.s, n.arm.e, n.arm.h)" :class="OL" stroke-width="10" fill="none" />
        <path :d="d(n.arm.e, lerp(n.arm.e, n.arm.h, 0.3))" :class="OL" stroke-width="12" fill="none" />
        <path :d="d(n.arm.s, n.arm.e)" :class="SHIRT_STROKE" stroke-width="5.5" fill="none" />
        <path :d="d(lerp(n.arm.e, n.arm.h, 0.3), n.arm.h)" :class="SKIN_STROKE" stroke-width="5.5" fill="none" />
        <path :d="d(n.arm.e, lerp(n.arm.e, n.arm.h, 0.3))" :class="SHIRT_STROKE" stroke-width="7.5" fill="none" />
        <circle v-if="n.hanging" :cx="n.arm.h[0]" :cy="n.arm.h[1]" r="4.3" :class="[SKIN, OL]" stroke-width="2.2" />
      </g>

      <!-- head: back curls, small pointed ears (tips up and out), face, fringe -->
      <g class="hobbit-hair">
        <circle v-for="(c, i) in backCurls" :key="i" :cx="c.x" :cy="c.y" :r="c.r" :class="[pal.hair, OL]" stroke-width="2" />
      </g>
      <path d="M-13.5 -106 Q-18.5 -107.5 -21.5 -112.5 Q-20.5 -102 -13.5 -98.5 Z M13.5 -106 Q18.5 -107.5 21.5 -112.5 Q20.5 -102 13.5 -98.5 Z" :class="[SKIN, OL]" stroke-width="2" />
      <circle cx="0" cy="-104" r="15" :class="[SKIN, OL]" stroke-width="2.5" />
      <g class="hobbit-face">
        <!-- eyes: hidden while panicked (wide eyes drawn after the fringe) -->
        <g class="transition-opacity duration-500" :class="mood === 'panic' ? 'opacity-0' : 'opacity-100'">
          <ellipse :cx="-5 + look" cy="-104" rx="1.8" ry="2.4" class="fill-slate-800" />
          <ellipse :cx="5 + look" cy="-104" rx="1.8" ry="2.4" class="fill-slate-800" />
        </g>
        <circle cx="-8.5" cy="-98.5" r="2.6" class="fill-rose-300" style="fill-opacity: 0.7" />
        <circle cx="8.5" cy="-98.5" r="2.6" class="fill-rose-300" style="fill-opacity: 0.7" />
        <path :d="`M${0.5 + look / 2} -101.5 q2.2 1.6 0 3.2`" class="stroke-slate-700 transition-opacity duration-500" :class="mood === 'panic' ? 'opacity-0' : 'opacity-100'" stroke-width="1.4" fill="none" />
        <!-- neutral: level brows, small smile -->
        <g class="transition-opacity duration-500" :class="mood === 'neutral' ? 'opacity-100' : 'opacity-0'">
          <path :d="`M${-7.5 + look} -109 q2 -1.6 4 0 M${3.5 + look} -109 q2 -1.6 4 0`" class="stroke-slate-700" stroke-width="1.4" fill="none" />
          <path d="M-4 -95 Q0 -91.5 4 -95" class="stroke-slate-800" stroke-width="1.8" fill="none" />
        </g>
        <!-- calm: one brow raised, a wider knowing smile -->
        <g class="transition-opacity duration-500" :class="mood === 'calm' ? 'opacity-100' : 'opacity-0'">
          <path :d="`M${-7.5 + look} -109 q2 -1.6 4 0 M${3.5 + look} -112 q3 -2.6 6 0`" class="stroke-slate-700" stroke-width="1.6" fill="none" />
          <path d="M-5.5 -95.5 Q0 -90 6 -96.5" class="stroke-slate-800" stroke-width="2" fill="none" />
        </g>
      </g>
      <g class="hobbit-hair">
        <circle v-for="(c, i) in fringe" :key="i" :cx="c.x" :cy="c.y" :r="c.r" :class="[pal.hair, OL]" stroke-width="2" />
      </g>
      <!-- panicked: slanted worried brows, wide eyes with small pupils, open mouth, sweat drop, shake marks (over the fringe) -->
      <g class="hobbit-panic transition-opacity duration-500" :class="mood === 'panic' ? 'opacity-100' : 'opacity-0'">
        <path d="M-10.5 -108.5 L-3.5 -113 M3.5 -113 L10.5 -108.5" class="stroke-slate-800" stroke-width="2.4" fill="none" />
        <circle cx="-5.5" cy="-104" r="4.2" class="fill-white stroke-slate-800" stroke-width="1.4" />
        <circle cx="5.5" cy="-104" r="4.2" class="fill-white stroke-slate-800" stroke-width="1.4" />
        <circle :cx="-5.5 + look" cy="-104" r="1.4" class="fill-slate-900" />
        <circle :cx="5.5 + look" cy="-104" r="1.4" class="fill-slate-900" />
        <ellipse cx="0" cy="-94" rx="3.4" ry="4.4" class="fill-slate-800" />
        <path d="M17 -122 Q25 -108 17 -103 Q9 -108 17 -122 Z" class="fill-sky-300 stroke-sky-600 dark:fill-sky-300 dark:stroke-sky-500" stroke-width="1.6" />
        <path d="M-19 -124 l-6 -6 M-22 -112 l-8 -2 M24 -126 l5 -6" class="stroke-slate-700 dark:stroke-slate-300" stroke-width="2" fill="none" />
      </g>
    </g>

    <!-- ════ the phone (parent draws it, scene coordinates) ════ -->
    <slot />

    <!-- ════ in front of the phone ════ -->
    <g :transform="transform" stroke-linecap="round" stroke-linejoin="round">
      <!-- backpack rim, over anything poking out of the pack -->
      <path v-if="pack" :d="packRim" class="fill-amber-800 dark:fill-amber-900" :class="OL" stroke-width="2" />
      <!-- held: fingers over the phone's lower inner corner, thumb on its face -->
      <g v-if="phone === 'hand'" class="transition-opacity duration-500" :class="idle ? 'opacity-0' : 'opacity-100'">
        <circle cx="31" cy="-77" r="4.6" :class="[SKIN, OL]" stroke-width="2.2" />
        <ellipse cx="32" cy="-82" rx="2.1" ry="2.8" :class="[SKIN, OL]" stroke-width="1.6" />
      </g>
      <!-- pocketed: patch pocket in the breeches cloth, stitched inside its edge -->
      <g v-else class="hobbit-pocket">
        <path d="M4 -50 L17 -50 L17 -41 Q17 -38 14 -38 L7 -38 Q4 -38 4 -41 Z" :class="[pal.breeches, OL]" stroke-width="1.8" />
        <path d="M6 -48 L6 -41.5 Q6 -40 7.5 -40 L13.5 -40 Q15 -40 15 -41.5 L15 -48" class="stroke-white/70" stroke-width="0.9" stroke-dasharray="1.6 1.4" fill="none" />
      </g>
    </g>
  </g>
</template>
