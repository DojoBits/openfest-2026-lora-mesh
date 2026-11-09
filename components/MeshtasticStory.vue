<script setup lang="ts">
// Slide 27 „Какво е Meshtastic“: a parchment map scene for someone who
// has never heard of Meshtastic, the same sheet style as the LoRa origin story.
//   start    two hikers on either side of a ridge, no service bubbles over
//            their heads, the cell tower on the right is down (✕ over waves);
//   click 1  every hiker gets a small LoRa radio on the pack (drawn no larger
//            than the phone: MT_RADIO ≤ MT_PHONE), linked to the phone over
//            Bluetooth (dotted blue arc); A's direct shot at B dies on the hillside;
//   click 2  the message hops A → the radio on the ridge → B: each dashed
//            leg fades in and its dashes flow toward B, every radio sends out a ripple as it rebroadcasts, B's
//            phone gets the message;
//   click 3  more radios on the hills join with faint links (the community
//            mesh) and the origin card: 2020, Kevin Hester (geeksville), what
//            it was made for (licence is in the notes).
// A strip of four stations under the scene names each step (data/meshtasticScene.ts,
// sources there). Print/PDF and a pinned `step` get the finished picture.
import { useNav } from '@slidev/client'
import { MT_ORIGIN, MT_PHONE, MT_RADIO, MT_STATIONS, MT_STORY_CLICKS } from './data/meshtasticScene'
import { useStep } from './data/useStep'
import MapGlyphs from './MapGlyphs.vue'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(MT_STORY_CLICKS, () => props.step, () => props.startAt ?? 0)
const { isPrintMode } = useNav()
const still = props.step !== undefined || isPrintMode.value
const at = (id: string) => MT_STATIONS.find(st => st.id === id)?.at ?? 0
const DEVICE = at('device')
const RELAY = at('relay')
const ORIGIN = at('origin')

const shown = (from: number) => (s.value >= from ? 'opacity-100' : 'opacity-0')
const GROUND = 272

// Hikers: feet on the ground at (x, y), facing `dir`, scaled by k. The ridge
// hiker stands on the main peak (apex y 106) and carries the radio on the pack.
// `from` is the click the hiker appears on: the c* hikers join on click 3 as
// the wider community (people with radios, never bare dots), smaller with
// distance: on the foothill apexes (358, 178) and (546, 186) and in the valley.
const HIKERS = [
  { id: 'a', x: 110, y: GROUND, dir: 1, k: 1.3, from: 0 },
  { id: 'b', x: 790, y: GROUND, dir: -1, k: 1.3, from: 0 },
  { id: 'ridge', x: 450, y: 108, dir: 1, k: 0.65, from: 0 },
  { id: 'c1', x: 50, y: GROUND, dir: 1, k: 0.75, from: ORIGIN },
  { id: 'c2', x: 358, y: 179, dir: 1, k: 0.5, from: ORIGIN },
  { id: 'c3', x: 546, y: 187, dir: -1, k: 0.5, from: ORIGIN },
  { id: 'c4', x: 640, y: GROUND, dir: -1, k: 0.75, from: ORIGIN },
] as const
type HikerId = (typeof HIKERS)[number]['id']

// Radio on top of the pack, in hiker units (facing right, feet at 0,0): body
// top-left (RX, RY), whip up from (WX, RY) by MT_RADIO.whip. The phone is in
// the near hand at (PX, PY). Same sizes for every hiker, scaled with them.
const RX = -21
const RY = -61
const WX = RX + MT_RADIO.w - 2
const PX = 12
const PY = -47
// Whip tip in sheet units: where the relay legs and ripples start.
const TIP = Object.fromEntries(HIKERS.map(h => [h.id, {
  x: h.x + h.dir * h.k * WX,
  y: h.y + h.k * (RY - MT_RADIO.whip),
}])) as Record<HikerId, { x: number, y: number }>

// Relay legs: radio travels in a straight line of sight, so each hop is a
// straight line from whip tip to whip tip, drawn as sparse dots (radio links
// are never solid lines), fading in one hop after the other with the dots
// flowing A → B. Leg 1 clears the left foothill apex (358, 178) by ~90 units
// and passes under the origin card (bottom y 96).
const LEGS = [
  `M${TIP.a.x} ${TIP.a.y} L ${TIP.ridge.x} ${TIP.ridge.y}`,
  `M${TIP.ridge.x} ${TIP.ridge.y} L ${TIP.b.x} ${TIP.b.y}`,
]
// Ripple start delays: A sends, the ridge repeats when leg 1 lands, then B hears.
const RIPPLES = [
  { id: 'a', delay: '0s' },
  { id: 'ridge', delay: '0.9s' },
  { id: 'b', delay: '1.8s' },
] as const

// Click 3: the community hikers' radios chained by faint links into one mesh,
// each link between neighbouring whip tips.
const COMMUNITY_LINKS: readonly [HikerId, HikerId][] = [
  ['c1', 'a'],
  ['a', 'c2'],
  ['c2', 'ridge'],
  ['ridge', 'c3'],
  ['c3', 'c4'],
  ['c4', 'b'],
]

// Station strip: four equal columns across the sheet.
const COL = 218
const strip = MT_STATIONS.map((st, i) => ({ ...st, x: 124 + i * COL }))
</script>

<template>
  <div class="lora-viz w-full select-none" :class="{ 'story-still': still }">
    <svg viewBox="0 0 900 400" class="w-full" role="img" aria-label="Двама туристи без покритие, разделени от хребет; малки LoRa радиа на раниците, свързани с телефоните; съобщението минава през радиото на хребета; Meshtastic, 2020, Kevin Hester">
      <!-- parchment sheet with a double ink border -->
      <rect x="4" y="4" width="892" height="392" rx="14" class="fill-parchment dark:fill-parchment" />
      <g class="stroke-ink dark:stroke-ink" fill="none" style="opacity: 0.7">
        <rect x="9" y="9" width="882" height="382" rx="10" style="stroke-width: 2" />
        <rect x="14" y="14" width="872" height="372" rx="7" style="stroke-width: 1" />
      </g>

      <!-- ground and the ridge between the hikers (back peaks first) -->
      <path :d="`M18 ${GROUND} H882`" class="stroke-edge dark:stroke-edge" style="stroke-width: 3" />
      <MapGlyphs kind="mountains" :x="450" :y="GROUND" :pts="[{ dx: -92, dy: 0, s: 2.6 }, { dx: 96, dy: 0, s: 2.4 }, { dx: 0, dy: 0, s: 4.6 }]" />

      <!-- cell tower on the right, down: waves crossed out -->
      <g class="tower" :transform="`translate(858 ${GROUND})`">
        <path d="M-16 0 L0 -96 L16 0 M-10 -30 H10 M-6 -60 H6 M-10 -30 L6 -60 M10 -30 L-6 -60" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 3; stroke-linejoin: round" />
        <path d="M-12 -108 Q -18 -96 -12 -84 M12 -108 Q 18 -96 12 -84 M-20 -114 Q -28 -96 -20 -78 M20 -114 Q 28 -96 20 -78" fill="none" class="stroke-stone-deep dark:stroke-stone-deep" style="stroke-width: 2.5; opacity: 0.6" />
        <path d="M-16 -112 L16 -80 M16 -112 L-16 -80" class="stroke-trail dark:stroke-trail" style="stroke-width: 5; stroke-linecap: round" />
      </g>

      <!-- click 1: A's direct shot at B dies on the foothill -->
      <g class="transition-opacity duration-500" :class="s >= RELAY ? 'opacity-30' : shown(DEVICE)">
        <path :d="`M${TIP.a.x} ${TIP.a.y} L330 203`" class="stroke-verdigris dark:stroke-verdigris" style="stroke-width: 3; stroke-dasharray: 8 7; stroke-linecap: round" />
        <path d="M332 196 L348 212 M348 196 L332 212" class="stroke-trail dark:stroke-trail" style="stroke-width: 4; stroke-linecap: round" />
      </g>

      <!-- click 3: community radios on the hills, faint links into one mesh -->
      <g class="transition-opacity duration-700" :class="shown(ORIGIN)">
        <line
          v-for="([p, q], i) in COMMUNITY_LINKS" :key="`cl${i}`" :x1="TIP[p].x" :y1="TIP[p].y" :x2="TIP[q].x" :y2="TIP[q].y"
          class="stroke-verdigris dark:stroke-verdigris" style="stroke-width: 1.5; stroke-dasharray: 1 7; stroke-linecap: round; opacity: 0.6"
        />
        <!-- origin card, top left: licence + what it was made for. Founder and
             year live only in the strip below (no duplicate name on the slide). -->
        <g transform="translate(26 22) scale(0.9)">
          <rect x="0" y="0" width="118" height="38" rx="19" class="fill-trail dark:fill-trail" />
          <text x="59" y="27" text-anchor="middle" class="fill-parchment-hi dark:fill-parchment-hi" style="font-size: 22px; font-weight: 800">{{ MT_ORIGIN.licence }}</text>
          <text
            x="0" y="64" class="fill-ink-strong dark:fill-ink-strong"
            style="font-size: 20px; font-style: italic; font-family: Georgia, 'Palatino Linotype', Palatino, serif"
          >{{ MT_ORIGIN.purpose }}</text>
        </g>
      </g>

      <!-- click 2: the relay A → ridge → B, each leg inking itself in turn -->
      <path
        v-for="(d, i) in LEGS" :key="d" :d="d" fill="none" class="stroke-verdigris transition-opacity duration-500 dark:stroke-verdigris"
        :class="[s >= RELAY ? 'opacity-100' : 'opacity-0', { 'mt-flow': !still }]"
        :style="{ strokeWidth: 2, strokeLinecap: 'round', strokeDasharray: '1 9', transitionDelay: s >= RELAY && !still ? `${i * 0.9}s` : '0s' }"
      />

      <!-- hikers -->
      <g
        v-for="h in HIKERS" :key="h.id" class="transition-opacity duration-700" :class="shown(h.from)"
        :transform="`translate(${h.x} ${h.y}) scale(${h.dir * h.k} ${h.k})`"
      >
        <path d="M-5 0 L-3 -26 M6 0 L3 -26" class="stroke-ink dark:stroke-ink" style="stroke-width: 4; stroke-linecap: round" />
        <rect x="-18" y="-50" width="9" height="23" rx="3" class="fill-earth stroke-ink dark:fill-earth dark:stroke-ink" style="stroke-width: 2" />
        <path d="M-11 -24 Q -12 -50 0 -52 Q 12 -50 11 -24 Z" class="fill-moss stroke-ink dark:fill-moss dark:stroke-ink" style="stroke-width: 2.5" />
        <circle cy="-62" r="9" class="fill-parchment-hi stroke-ink dark:fill-parchment-hi dark:stroke-ink" style="stroke-width: 2.5" />
        <path d="M6 -44 L14 -37" class="stroke-ink dark:stroke-ink" style="stroke-width: 3.5; stroke-linecap: round" />
        <rect :x="PX" :y="PY" :width="MT_PHONE.w" :height="MT_PHONE.h" rx="2" class="fill-ink dark:fill-ink" />
        <!-- click 1: radio on the pack (no larger than the phone), Bluetooth arc to the phone -->
        <g class="transition-opacity duration-500" :class="shown(DEVICE)">
          <line :x1="WX" :y1="RY" :x2="WX" :y2="RY - MT_RADIO.whip" class="stroke-water dark:stroke-water" style="stroke-width: 2; stroke-linecap: round" />
          <rect :x="RX" :y="RY" :width="MT_RADIO.w" :height="MT_RADIO.h" rx="1.5" class="fill-water stroke-ink dark:fill-water dark:stroke-ink" style="stroke-width: 1.5" />
          <rect :x="RX + 1.5" :y="RY + 2" :width="MT_RADIO.w - 3" height="3" class="fill-page/80 dark:fill-page/80" />
          <!-- bluetooth rune beside the phone: the phone talks to the radio over Bluetooth -->
          <path transform="translate(29 -48) scale(0.8)" d="M-4 -4 L4 4 L0 8 V-8 L4 -4 L-4 4" fill="none" class="stroke-blue-600 dark:stroke-blue-400" style="stroke-width: 2; stroke-linejoin: round" />
        </g>
      </g>

      <!-- click 2: each radio rebroadcasts (ripple at the whip tip) -->
      <g v-if="s >= RELAY">
        <circle
          v-for="r in RIPPLES" :key="r.id" :cx="TIP[r.id].x" :cy="TIP[r.id].y" r="11" fill="none"
          class="stroke-verdigris dark:stroke-verdigris" :class="{ 'mt-ripple': !still }" :style="{ strokeWidth: 1.5, animationDelay: r.delay }"
        />
      </g>

      <!-- speech bubbles over the valley hikers: no service, then the message -->
      <g v-for="bx in [110, 790]" :key="`nb${bx}`" class="transition-opacity duration-500" :transform="`translate(${bx} 118)`" :class="s >= RELAY ? 'opacity-0' : 'opacity-100'">
        <rect x="-26" y="-16" width="52" height="32" rx="8" class="fill-parchment-hi stroke-ink dark:fill-parchment-hi dark:stroke-ink" style="stroke-width: 2" />
        <rect v-for="i in 4" :key="i" :x="-17 + (i - 1) * 6" :y="8 - i * 4" width="4" :height="i * 4" class="fill-stone-deep dark:fill-stone-deep" style="opacity: 0.45" />
        <path d="M8 -8 L20 4 M20 -8 L8 4" class="stroke-trail dark:stroke-trail" style="stroke-width: 3.5; stroke-linecap: round" />
      </g>
      <g
        class="transition-opacity duration-500" transform="translate(790 118)" :class="s >= RELAY ? 'opacity-100' : 'opacity-0'"
        :style="{ transitionDelay: s >= RELAY && !still ? '1.9s' : '0s' }"
      >
        <rect x="-30" y="-16" width="60" height="32" rx="8" class="fill-parchment-hi stroke-moss dark:fill-parchment-hi dark:stroke-moss" style="stroke-width: 2.5" />
        <rect x="-21" y="-9" width="24" height="17" rx="2" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 2" />
        <path d="M-21 -8 L-9 1 L3 -8" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 2" />
        <path d="M9 0 L14 6 L23 -7" fill="none" class="stroke-moss dark:stroke-moss" style="stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round" />
      </g>

      <!-- ── station strip ── -->
      <path d="M30 300 H870" class="stroke-edge dark:stroke-edge" style="stroke-width: 1.5; opacity: 0.7" />
      <g v-for="st in strip" :key="st.id" class="transition-opacity duration-500" :class="s >= st.at ? 'opacity-100' : 'opacity-25'">
        <text
          :x="st.x" y="338" text-anchor="middle"
          :class="s === st.at ? 'fill-verdigris dark:fill-verdigris' : 'fill-ink-strong dark:fill-ink-strong'"
          style="font-size: 23px; font-weight: 700"
        >{{ st.title }}</text>
        <text :x="st.x" y="367" text-anchor="middle" class="fill-stone-deep dark:fill-stone-deep" style="font-size: 17px; font-weight: 600">{{ st.sub }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
/* Rebroadcast ripple: a ring grows from the whip tip and fades, then repeats.
   Delays stagger A → ridge → B so the ripples follow the message. Frozen by the
   global .lora-viz reduced-motion rule; a still picture shows one static ring. */
.mt-ripple {
  transform-box: fill-box;
  transform-origin: center;
  animation: mt-ripple 2.7s ease-out infinite both;
}
@keyframes mt-ripple {
  0% { transform: scale(0.3); opacity: 0; }
  10% { opacity: 1; }
  45% { transform: scale(1.8); opacity: 0; }
  100% { transform: scale(1.8); opacity: 0; }
}
/* Radio link: the dashes march along the leg in the path direction (A → B).
   One period = dash + gap = 10 units. */
.mt-flow {
  animation: mt-flow 0.8s linear infinite;
}
@keyframes mt-flow {
  to { stroke-dashoffset: -10; }
}
.story-still * {
  transition: none !important;
}
</style>
