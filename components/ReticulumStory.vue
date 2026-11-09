<script setup lang="ts">
// Slide 44 „Какво е Reticulum“: a parchment map scene in the same sheet style
// as the Meshtastic story (slide 27), for someone who has never heard of it.
//   start    four hikers with small radios, every link runs up to one central
//            hub (a server with a power switch): whoever owns the hub can
//            switch the whole network off,
//   click 1  the hub is crossed out and fades, its links vanish, the radios
//            now pass the message to each other A → left hill → right hill → B
//            (dashed legs ink in one after the other, dashes flow toward B, each
//            radio sends a ripple as it forwards, B's bubble gets the message),
//   click 2  a padlock lands on every leg: encryption is always on,
//   click 3  more hikers join with faint links (community) and the origin
//            card: licence chip and the public-domain protocol.
// The founder and year live only in the strip below (data/reticulumScene.ts,
// sources there). The layer stack is ReticulumStack's job (slide 46), not here.
// Print/PDF and a pinned `step` get the finished picture.
import { useNav } from '@slidev/client'
import { RNS_ORIGIN, RNS_PEER_PATH, RNS_PHONE, RNS_RADIO, RNS_STATIONS, RNS_STORY_CLICKS } from './data/reticulumScene'
import { useStep } from './data/useStep'
import MapGlyphs from './MapGlyphs.vue'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(RNS_STORY_CLICKS, () => props.step, () => props.startAt ?? 0)
const { isPrintMode } = useNav()
const still = props.step !== undefined || isPrintMode.value
const at = (id: string) => RNS_STATIONS.find(st => st.id === id)?.at ?? 0
const PEER = at('philosophy')
const CRYPTO = at('crypto')
const ORIGIN = at('origin')

const shown = (from: number) => (s.value >= from ? 'opacity-100' : 'opacity-0')
const GROUND = 272

// Hikers: feet on the ground at (x, y), facing `dir`, scaled by k. p1 and p2
// stand on the two hill apexes (x 280 and 620, apex y 178: a MapGlyphs
// mountain is 36 units tall per unit of scale, s 2.6). The c* hikers join on
// click 3 as the wider community (people with radios, never bare dots).
const HIKERS = [
  { id: 'a', x: 110, y: GROUND, dir: 1, k: 1.3, from: 0 },
  { id: 'b', x: 790, y: GROUND, dir: -1, k: 1.3, from: 0 },
  { id: 'p1', x: 280, y: 179, dir: 1, k: 0.65, from: 0 },
  { id: 'p2', x: 620, y: 179, dir: -1, k: 0.65, from: 0 },
  { id: 'c1', x: 40, y: GROUND, dir: 1, k: 0.75, from: ORIGIN },
  { id: 'c2', x: 450, y: GROUND, dir: 1, k: 0.75, from: ORIGIN },
  { id: 'c3', x: 856, y: GROUND, dir: -1, k: 0.75, from: ORIGIN },
] as const
type HikerId = (typeof HIKERS)[number]['id']

// Radio on top of the pack, in hiker units (facing right, feet at 0,0): body
// top-left (RX, RY), whip up from (WX, RY). The phone is in the near hand at
// (PX, PY). Same sizes for every hiker, scaled with them.
const RX = -21
const RY = -61
const WX = RX + RNS_RADIO.w - 2
const PX = 12
const PY = -47
// Whip tip in sheet units: where every link and ripple starts. A hiker facing
// left mirrors the x offset, the scale k shrinks both offsets.
const TIP = Object.fromEntries(HIKERS.map(h => [h.id, {
  x: h.x + h.dir * h.k * WX,
  y: h.y + h.k * (RY - RNS_RADIO.whip),
}])) as Record<HikerId, { x: number, y: number }>

// The central hub, top centre. Its bottom edge (y 104) stays above the
// p1 → p2 leg (y ≈ 133) so the peer link never touches the ghosted hub.
const HUB = { x: 450, y: 66 }
const HUB_PORT = { x: HUB.x, y: HUB.y + 38 }
const HUB_USERS: readonly HikerId[] = ['a', 'p1', 'p2', 'b']

// Peer legs on click 1: consecutive pairs of RNS_PEER_PATH, each a straight
// line of sight from whip tip to whip tip. `mid` is where the click-2 padlock sits.
const LEGS = RNS_PEER_PATH.slice(1).map((to, i) => {
  const p = TIP[RNS_PEER_PATH[i]]
  const q = TIP[to]
  return { d: `M${p.x} ${p.y} L ${q.x} ${q.y}`, mid: { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 } }
})
// Ripple delays follow the message: each radio forwards when the leg before it lands.
const RIPPLES = RNS_PEER_PATH.map((id, i) => ({ id, delay: `${i * 0.9}s` }))

// Click 3: community radios chained to their neighbours by faint links.
const COMMUNITY_LINKS: readonly [HikerId, HikerId][] = [
  ['c1', 'a'],
  ['p1', 'c2'],
  ['c2', 'p2'],
  ['b', 'c3'],
]

// Station strip: four equal columns across the sheet.
const COL = 218
const strip = RNS_STATIONS.map((st, i) => ({ ...st, x: 124 + i * COL }))
</script>

<template>
  <div class="lora-viz w-full select-none" :class="{ 'story-still': still }">
    <svg viewBox="0 0 900 400" class="w-full" role="img" aria-label="Туристи с малки радиа, свързани през централен сървър. Сървърът отпада и радиата си предават съобщението едно на друго, криптирано. Reticulum, 2016, Mark Qvist">
      <!-- parchment sheet with a double ink border -->
      <rect x="4" y="4" width="892" height="392" rx="14" class="fill-parchment dark:fill-parchment" />
      <g class="stroke-ink dark:stroke-ink" fill="none" style="opacity: 0.7">
        <rect x="9" y="9" width="882" height="382" rx="10" style="stroke-width: 2" />
        <rect x="14" y="14" width="872" height="372" rx="7" style="stroke-width: 1" />
      </g>

      <!-- ground and the two hills (back peaks first) -->
      <path :d="`M18 ${GROUND} H882`" class="stroke-edge dark:stroke-edge" style="stroke-width: 3" />
      <MapGlyphs kind="mountains" :x="450" :y="GROUND" :pts="[{ dx: -222, dy: 0, s: 1.6 }, { dx: 222, dy: 0, s: 1.6 }, { dx: -170, dy: 0, s: 2.6 }, { dx: 170, dy: 0, s: 2.6 }]" />

      <!-- start: every radio talks only through the hub. Dashed, never solid. -->
      <g class="transition-opacity duration-500" :class="s >= PEER ? 'opacity-0' : 'opacity-100'">
        <line
          v-for="u in HUB_USERS" :key="`hl${u}`" data-link :x1="TIP[u].x" :y1="TIP[u].y" :x2="HUB_PORT.x" :y2="HUB_PORT.y"
          class="stroke-stone-deep dark:stroke-stone-deep" style="stroke-width: 2; stroke-dasharray: 3 9; stroke-linecap: round"
        />
      </g>

      <!-- the central hub: a server with a power switch, ghosted and crossed out on click 1 -->
      <g class="hub transition-opacity duration-700" :transform="`translate(${HUB.x} ${HUB.y})`" :class="s >= PEER ? 'opacity-25' : 'opacity-100'">
        <line x1="0" y1="-38" x2="0" y2="-50" class="stroke-ink dark:stroke-ink" style="stroke-width: 2.5; stroke-linecap: round" />
        <rect x="-30" y="-38" width="60" height="76" rx="5" class="fill-parchment-hi stroke-ink dark:fill-parchment-hi dark:stroke-ink" style="stroke-width: 2.5" />
        <g v-for="i in 3" :key="`slot${i}`">
          <rect x="-22" :y="-30 + (i - 1) * 22" width="44" height="14" rx="2" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 1.8" />
          <circle cx="14" :cy="-23 + (i - 1) * 22" r="2.5" class="fill-moss dark:fill-moss" />
        </g>
        <!-- power switch beside the server: the owner can turn everything off -->
        <g transform="translate(52 -18)">
          <path d="M-7 -7 A10 10 0 1 0 7 -7" fill="none" class="stroke-trail dark:stroke-trail" style="stroke-width: 3; stroke-linecap: round" />
          <path d="M0 -13 V-1" class="stroke-trail dark:stroke-trail" style="stroke-width: 3; stroke-linecap: round" />
        </g>
      </g>
      <g class="transition-opacity duration-500" :transform="`translate(${HUB.x} ${HUB.y})`" :class="shown(PEER)">
        <path d="M-30 -30 L30 30 M30 -30 L-30 30" class="stroke-trail dark:stroke-trail" style="stroke-width: 6; stroke-linecap: round" />
      </g>

      <!-- click 3: community radios with faint links, and the origin card -->
      <g class="transition-opacity duration-700" :class="shown(ORIGIN)">
        <line
          v-for="([p, q], i) in COMMUNITY_LINKS" :key="`cl${i}`" data-link :x1="TIP[p].x" :y1="TIP[p].y" :x2="TIP[q].x" :y2="TIP[q].y"
          class="stroke-wine dark:stroke-wine" style="stroke-width: 1.5; stroke-dasharray: 1 7; stroke-linecap: round; opacity: 0.6"
        />
        <!-- origin card, top left: code licence chip, protocol status under it.
             Founder and year live only in the strip below. -->
        <g transform="translate(26 22) scale(0.9)">
          <rect x="0" y="0" width="264" height="38" rx="19" class="fill-wine dark:fill-wine" />
          <text x="132" y="26" text-anchor="middle" class="fill-parchment-hi dark:fill-parchment-hi" style="font-size: 20px; font-weight: 800">{{ RNS_ORIGIN.codeLicence }}</text>
          <text
            x="0" y="64" class="fill-ink-strong dark:fill-ink-strong"
            style="font-size: 20px; font-style: italic; font-family: Georgia, 'Palatino Linotype', Palatino, serif"
          >{{ RNS_ORIGIN.protocol }}</text>
        </g>
      </g>

      <!-- click 1: radio to radio, each leg inking itself in turn and flowing toward B -->
      <path
        v-for="(leg, i) in LEGS" :key="leg.d" data-link :d="leg.d" fill="none" class="stroke-wine transition-opacity duration-500 dark:stroke-wine"
        :class="[s >= PEER ? 'opacity-100' : 'opacity-0', { 'rns-flow': !still }]"
        :style="{ strokeWidth: 2.5, strokeLinecap: 'round', strokeDasharray: '1 9', transitionDelay: s >= PEER && !still ? `${i * 0.9}s` : '0s' }"
      />

      <!-- click 2: a padlock on every leg, encryption is not optional -->
      <g
        v-for="(leg, i) in LEGS" :key="`lock${i}`" class="padlock transition-opacity duration-500"
        :class="shown(CRYPTO)" :transform="`translate(${leg.mid.x} ${leg.mid.y - 4}) scale(1.3)`"
        :style="{ transitionDelay: s >= CRYPTO && !still ? `${i * 0.25}s` : '0s' }"
      >
        <path d="M-5 -3 V-7 A5 5 0 0 1 5 -7 V-3" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 2.2" />
        <rect x="-8" y="-3" width="16" height="12" rx="2" class="fill-wine stroke-ink dark:fill-wine dark:stroke-ink" style="stroke-width: 1.5" />
        <circle cy="2.5" r="1.8" class="fill-parchment-hi dark:fill-parchment-hi" />
      </g>

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
        <rect :x="PX" :y="PY" :width="RNS_PHONE.w" :height="RNS_PHONE.h" rx="2" class="fill-ink dark:fill-ink" />
        <!-- radio on the pack, no larger than the phone -->
        <line :x1="WX" :y1="RY" :x2="WX" :y2="RY - RNS_RADIO.whip" class="stroke-wine dark:stroke-wine" style="stroke-width: 2; stroke-linecap: round" />
        <rect :x="RX" :y="RY" :width="RNS_RADIO.w" :height="RNS_RADIO.h" rx="1.5" class="fill-wine stroke-ink dark:fill-wine dark:stroke-ink" style="stroke-width: 1.5" />
        <rect :x="RX + 1.5" :y="RY + 2" :width="RNS_RADIO.w - 3" height="3" class="fill-page/80 dark:fill-page/80" />
      </g>

      <!-- click 1: each radio forwards (ripple at the whip tip) -->
      <g v-if="s >= PEER">
        <circle
          v-for="r in RIPPLES" :key="r.id" :cx="TIP[r.id].x" :cy="TIP[r.id].y" r="11" fill="none"
          class="stroke-wine dark:stroke-wine" :class="{ 'rns-ripple': !still }" :style="{ strokeWidth: 1.5, animationDelay: r.delay }"
        />
      </g>

      <!-- click 1: B's bubble gets the message once the last leg lands -->
      <g
        class="transition-opacity duration-500" transform="translate(790 118)" :class="s >= PEER ? 'opacity-100' : 'opacity-0'"
        :style="{ transitionDelay: s >= PEER && !still ? '2.8s' : '0s' }"
      >
        <rect x="-30" y="-16" width="60" height="32" rx="8" class="fill-parchment-hi stroke-moss dark:fill-parchment-hi dark:stroke-moss" style="stroke-width: 2.5" />
        <rect x="-21" y="-9" width="24" height="17" rx="2" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 2" />
        <path d="M-21 -8 L-9 1 L3 -8" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 2" />
        <path d="M9 0 L14 6 L23 -7" fill="none" class="stroke-moss dark:stroke-moss" style="stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round" />
      </g>

      <!-- station strip -->
      <path d="M30 300 H870" class="stroke-edge dark:stroke-edge" style="stroke-width: 1.5; opacity: 0.7" />
      <g v-for="st in strip" :key="st.id" class="transition-opacity duration-500" :class="s >= st.at ? 'opacity-100' : 'opacity-25'">
        <text
          :x="st.x" y="338" text-anchor="middle"
          :class="s === st.at ? 'fill-wine dark:fill-wine' : 'fill-ink-strong dark:fill-ink-strong'"
          style="font-size: 23px; font-weight: 700"
        >{{ st.title }}</text>
        <text :x="st.x" y="367" text-anchor="middle" class="fill-stone-deep dark:fill-stone-deep" style="font-size: 17px; font-weight: 600">{{ st.sub }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
/* Forwarding ripple: a ring grows from the whip tip and fades, then repeats.
   Delays stagger A to B so the ripples follow the message. Frozen by the
   global .lora-viz reduced-motion rule. A still picture shows one static ring. */
.rns-ripple {
  transform-box: fill-box;
  transform-origin: center;
  animation: rns-ripple 3.6s ease-out infinite both;
}
@keyframes rns-ripple {
  0% { transform: scale(0.3); opacity: 0; }
  10% { opacity: 1; }
  40% { transform: scale(1.8); opacity: 0; }
  100% { transform: scale(1.8); opacity: 0; }
}
/* Radio link: the dashes march along the leg in the path direction (A to B).
   One period = dash + gap = 10 units. */
.rns-flow {
  animation: rns-flow 0.8s linear infinite;
}
@keyframes rns-flow {
  to { stroke-dashoffset: -10; }
}
.story-still * {
  transition: none !important;
}
</style>
