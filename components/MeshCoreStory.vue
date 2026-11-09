<script setup lang="ts">
// Slide 37 „Какво е MeshCore“: a parchment city scene in the same sheet style
// as the Meshtastic story (slide 27), built per click.
//   start    a street full of people, every radio rebroadcasts what it hears:
//            ripples everywhere, collision marks (✕) in the air, B's message is lost
//   click 1  the people's radios (companions) go quiet, small repeaters appear
//            mounted on masts on the rooftops (radio no larger than the phone)
//   click 2  the message hops A → roof repeater → roof repeater → B along
//            dotted legs that flow toward B, only the repeaters send out a ripple,
//            B gets the message
//   click 3  the origin card: MIT licence, Scott Powell · Ripple Radios, the app author.
//            Founder and year live only in the strip below.
// A strip of four stations under the scene names each step (data/meshcoreScene.ts,
// sources there). Print/PDF and a pinned `step` get the finished picture.
import { useNav } from '@slidev/client'
import { MC_ORIGIN, MC_PHONE, MC_RADIO, MC_STATIONS, MC_STORY_CLICKS } from './data/meshcoreScene'
import { useStep } from './data/useStep'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(MC_STORY_CLICKS, () => props.step, () => props.startAt ?? 0)
const { isPrintMode } = useNav()
const still = props.step !== undefined || isPrintMode.value
const at = (id: string) => MC_STATIONS.find(st => st.id === id)?.at ?? 0
const ROLES = at('philosophy')
const RELAY = at('relay')
const ORIGIN = at('origin')

const shown = (from: number) => (s.value >= from ? 'opacity-100' : 'opacity-0')
const GROUND = 272

// Buildings (x, width, roof height). The middle block stands between A and B,
// so A's radio has no line of sight to B. Each window row is a few small panes.
const BUILDINGS = [
  { id: 'west', x: 220, w: 110, top: 140 },
  { id: 'mid', x: 360, w: 180, top: 170 },
  { id: 'east', x: 570, w: 110, top: 130 },
] as const
const WINDOWS = BUILDINGS.flatMap(b => {
  const panes: { x: number, y: number }[] = []
  // panes on a 22 × 26 grid, kept 12 units clear of the walls and the ground
  for (let y = b.top + 14; y < GROUND - 26; y += 26) {
    for (let x = b.x + 14; x < b.x + b.w - 20; x += 22) panes.push({ x, y })
  }
  return panes
})

// Rooftop repeaters: a mast on the roof, the radio body on top, whip above.
// Drawn in radio units at scale RK, so the body is MC_RADIO, never larger than
// the phone. Mast 14, body MC_RADIO.h, whip MC_RADIO.whip.
const RK = 1.3
const MAST = 14
const ROOFS = [
  { id: 'r1', x: 275, y: 140 },
  { id: 'r2', x: 625, y: 130 },
] as const

// People: feet on the ground at x, facing `dir`, scaled by k. A and B are the
// two who want to talk, c1..c3 are the crowd that floods the air at the start.
const PEOPLE = [
  { id: 'a', x: 110, dir: 1, k: 1.3 },
  { id: 'b', x: 790, dir: -1, k: 1.3 },
  { id: 'c1', x: 180, dir: 1, k: 0.9 },
  { id: 'c2', x: 450, dir: 1, k: 0.8 },
  { id: 'c3', x: 720, dir: -1, k: 0.9 },
] as const

// Radio on top of the pack, in person units (facing right, feet at 0,0): body
// top-left (RX, RY), whip up from (WX, RY). The phone is in the hand at (PX, PY).
const RX = -21
const RY = -61
const WX = RX + MC_RADIO.w - 2
const PX = 12
const PY = -47

type NodeId = (typeof PEOPLE)[number]['id'] | (typeof ROOFS)[number]['id']
// Whip tip of every radio in sheet units: where legs and ripples start.
// People: pack whip, mirrored by dir. Repeaters: whip on top of the mast body.
const TIP = Object.fromEntries([
  ...PEOPLE.map(p => [p.id, { x: p.x + p.dir * p.k * WX, y: GROUND + p.k * (RY - MC_RADIO.whip) }]),
  ...ROOFS.map(r => [r.id, { x: r.x + RK * 2, y: r.y - RK * (MAST + MC_RADIO.h + MC_RADIO.whip) }]),
]) as Record<NodeId, { x: number, y: number }>

// Relay legs: straight lines of sight from whip tip to whip tip, drawn as
// sparse dots (radio links are never solid lines). Every leg clears the roof
// corners it passes (west roof at x 220, east roof at x 680).
const LEGS = [
  `M${TIP.a.x} ${TIP.a.y} L ${TIP.r1.x} ${TIP.r1.y}`,
  `M${TIP.r1.x} ${TIP.r1.y} L ${TIP.r2.x} ${TIP.r2.y}`,
  `M${TIP.r2.x} ${TIP.r2.y} L ${TIP.b.x} ${TIP.b.y}`,
]
// Click 2 ripples: A sends, each repeater repeats as its leg lands, B hears.
const RELAY_RIPPLES = [
  { id: 'a', delay: '0s' },
  { id: 'r1', delay: '0.9s' },
  { id: 'r2', delay: '1.8s' },
] as const
// Start: every person's radio rebroadcasts, staggered so the rings overlap.
const FLOOD_RIPPLES = PEOPLE.map((p, i) => ({ id: p.id, delay: `${(i * 0.37).toFixed(2)}s` }))
// Static air rings (radii) around a radio that is sending: dotted, never solid.
const AIR_RINGS = [18, 34] as const
// Collision marks in the air where neighbouring rings overlap.
const COLLISIONS = [
  { x: 140, y: 162 },
  { x: 345, y: 196 },
  { x: 762, y: 166 },
]

// Station strip: four equal columns across the sheet.
const COL = 218
const strip = MC_STATIONS.map((st, i) => ({ ...st, x: 124 + i * COL }))
</script>

<template>
  <div class="lora-viz w-full select-none" :class="{ 'story-still': still }">
    <svg viewBox="0 0 900 400" class="w-full" role="img" aria-label="Улица, на която всяко радио препраща и ефирът се претоварва. В MeshCore телефоните не препращат, само repeater-и по покривите. Съобщението минава през тях. MeshCore, 2025, Scott Powell">
      <!-- parchment sheet with a double ink border -->
      <rect x="4" y="4" width="892" height="392" rx="14" class="fill-parchment dark:fill-parchment" />
      <g class="stroke-ink dark:stroke-ink" fill="none" style="opacity: 0.7">
        <rect x="9" y="9" width="882" height="382" rx="10" style="stroke-width: 2" />
        <rect x="14" y="14" width="872" height="372" rx="7" style="stroke-width: 1" />
      </g>

      <!-- ground and the city blocks -->
      <path :d="`M18 ${GROUND} H882`" class="stroke-edge dark:stroke-edge" style="stroke-width: 3" />
      <rect
        v-for="b in BUILDINGS" :key="b.id" :x="b.x" :y="b.top" :width="b.w" :height="GROUND - b.top"
        class="fill-parchment-hi stroke-ink dark:fill-parchment-hi dark:stroke-ink" style="stroke-width: 2.5"
      />
      <rect v-for="(w, i) in WINDOWS" :key="`w${i}`" :x="w.x" :y="w.y" width="8" height="12" class="fill-stone-deep dark:fill-stone-deep" style="opacity: 0.35" />

      <!-- click 1: repeaters mounted on the roofs (mast, small radio body, whip) -->
      <g
        v-for="r in ROOFS" :key="r.id" class="roof transition-opacity duration-700" :class="shown(ROLES)"
        :transform="`translate(${r.x} ${r.y}) scale(${RK})`"
      >
        <path :d="`M0 0 V${-MAST} M-5 0 L0 -6 L5 0`" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 2; stroke-linecap: round" />
        <line x1="2" :y1="-MAST - MC_RADIO.h" x2="2" :y2="-MAST - MC_RADIO.h - MC_RADIO.whip" class="stroke-dusk dark:stroke-dusk" style="stroke-width: 2; stroke-linecap: round" />
        <rect :x="-MC_RADIO.w / 2" :y="-MAST - MC_RADIO.h" :width="MC_RADIO.w" :height="MC_RADIO.h" rx="1.5" class="fill-dusk stroke-ink dark:fill-dusk dark:stroke-ink" style="stroke-width: 1.5" />
      </g>

      <!-- click 1 on: only the roof repeaters send, dotted air rings around their whips -->
      <g class="transition-opacity duration-700" :class="shown(ROLES)">
        <template v-for="r in ROOFS" :key="`ra${r.id}`">
          <circle
            v-for="rad in AIR_RINGS" :key="rad" :cx="TIP[r.id].x" :cy="TIP[r.id].y" :r="rad" fill="none"
            class="stroke-dusk dark:stroke-dusk" style="stroke-width: 2; stroke-dasharray: 2 6; stroke-linecap: round; opacity: 0.6"
          />
        </template>
      </g>

      <!-- start: every radio floods the air, collisions where rings overlap -->
      <g class="transition-opacity duration-500" :class="s >= ROLES ? 'opacity-0' : 'opacity-100'">
        <template v-for="p in PEOPLE" :key="`pa${p.id}`">
          <circle
            v-for="rad in AIR_RINGS" :key="rad" :cx="TIP[p.id].x" :cy="TIP[p.id].y" :r="rad" fill="none"
            class="stroke-trail dark:stroke-trail" style="stroke-width: 2; stroke-dasharray: 2 6; stroke-linecap: round; opacity: 0.6"
          />
        </template>
        <circle
          v-for="r in FLOOD_RIPPLES" :key="`f${r.id}`" :cx="TIP[r.id].x" :cy="TIP[r.id].y" r="16" fill="none"
          class="stroke-trail dark:stroke-trail" :class="{ 'mc-ripple': !still }" :style="{ strokeWidth: 2, animationDelay: r.delay }"
        />
        <g v-for="(c, i) in COLLISIONS" :key="`x${i}`" class="collision" :transform="`translate(${c.x} ${c.y})`">
          <circle r="13" class="fill-parchment-hi stroke-trail dark:fill-parchment-hi dark:stroke-trail" style="stroke-width: 2" />
          <path d="M-6 -6 L6 6 M6 -6 L-6 6" class="stroke-trail dark:stroke-trail" style="stroke-width: 3.5; stroke-linecap: round" />
        </g>
      </g>

      <!-- click 3: origin card, top left: licence, founder and company, app author.
           The name sits next to the company so Ripple Radios does not read as the project. The year lives in the strip below. -->
      <g class="transition-opacity duration-700" :class="shown(ORIGIN)" transform="translate(26 22) scale(0.9)">
        <rect x="0" y="0" width="80" height="38" rx="19" class="fill-trail dark:fill-trail" />
        <text x="40" y="27" text-anchor="middle" class="fill-parchment-hi dark:fill-parchment-hi" style="font-size: 22px; font-weight: 800">{{ MC_ORIGIN.licence }}</text>
        <text x="94" y="27" class="fill-ink-strong dark:fill-ink-strong" style="font-size: 21px; font-weight: 700">{{ MC_ORIGIN.founder }} · {{ MC_ORIGIN.company }}</text>
        <text
          x="0" y="66" class="fill-ink-strong dark:fill-ink-strong"
          style="font-size: 20px; font-style: italic; font-family: Georgia, 'Palatino Linotype', Palatino, serif"
        >приложение: {{ MC_ORIGIN.app }}</text>
      </g>

      <!-- click 2: the relay A → r1 → r2 → B, each leg inking itself in turn -->
      <path
        v-for="(d, i) in LEGS" :key="d" :d="d" fill="none" class="stroke-dusk transition-opacity duration-500 dark:stroke-dusk"
        :class="[s >= RELAY ? 'opacity-100' : 'opacity-0', { 'mc-flow': !still }]"
        :style="{ strokeWidth: 2.5, strokeLinecap: 'round', strokeDasharray: '1 9', transitionDelay: s >= RELAY && !still ? `${i * 0.9}s` : '0s' }"
      />

      <!-- people with a phone in hand and a companion radio on the pack -->
      <g
        v-for="p in PEOPLE" :key="p.id"
        :transform="`translate(${p.x} ${GROUND}) scale(${p.dir * p.k} ${p.k})`"
      >
        <path d="M-5 0 L-3 -26 M6 0 L3 -26" class="stroke-ink dark:stroke-ink" style="stroke-width: 4; stroke-linecap: round" />
        <rect x="-18" y="-50" width="9" height="23" rx="3" class="fill-earth stroke-ink dark:fill-earth dark:stroke-ink" style="stroke-width: 2" />
        <path d="M-11 -24 Q -12 -50 0 -52 Q 12 -50 11 -24 Z" class="fill-moss stroke-ink dark:fill-moss dark:stroke-ink" style="stroke-width: 2.5" />
        <circle cy="-62" r="9" class="fill-parchment-hi stroke-ink dark:fill-parchment-hi dark:stroke-ink" style="stroke-width: 2.5" />
        <path d="M6 -44 L14 -37" class="stroke-ink dark:stroke-ink" style="stroke-width: 3.5; stroke-linecap: round" />
        <rect :x="PX" :y="PY" :width="MC_PHONE.w" :height="MC_PHONE.h" rx="2" class="fill-ink dark:fill-ink" />
        <line :x1="WX" :y1="RY" :x2="WX" :y2="RY - MC_RADIO.whip" class="stroke-water dark:stroke-water" style="stroke-width: 2; stroke-linecap: round" />
        <rect :x="RX" :y="RY" :width="MC_RADIO.w" :height="MC_RADIO.h" rx="1.5" class="fill-water stroke-ink dark:fill-water dark:stroke-ink" style="stroke-width: 1.5" />
        <rect :x="RX + 1.5" :y="RY + 2" :width="MC_RADIO.w - 3" height="3" class="fill-page/80 dark:fill-page/80" />
      </g>

      <!-- click 2: A sends, only the repeaters rebroadcast (ripple at the whip tip) -->
      <g v-if="s >= RELAY">
        <circle
          v-for="r in RELAY_RIPPLES" :key="r.id" :cx="TIP[r.id].x" :cy="TIP[r.id].y" r="11" fill="none"
          class="stroke-dusk dark:stroke-dusk" :class="{ 'mc-ripple': !still }" :style="{ strokeWidth: 1.5, animationDelay: r.delay }"
        />
      </g>

      <!-- speech bubble over B: message lost in the flood, then delivered -->
      <g class="transition-opacity duration-500" transform="translate(790 118)" :class="s >= RELAY ? 'opacity-0' : 'opacity-100'">
        <rect x="-30" y="-16" width="60" height="32" rx="8" class="fill-parchment-hi stroke-ink dark:fill-parchment-hi dark:stroke-ink" style="stroke-width: 2" />
        <rect x="-21" y="-9" width="24" height="17" rx="2" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 2; opacity: 0.5" />
        <path d="M-21 -8 L-9 1 L3 -8" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 2; opacity: 0.5" />
        <path d="M9 -8 L21 4 M21 -8 L9 4" class="stroke-trail dark:stroke-trail" style="stroke-width: 3.5; stroke-linecap: round" />
      </g>
      <g
        class="transition-opacity duration-500" transform="translate(790 118)" :class="s >= RELAY ? 'opacity-100' : 'opacity-0'"
        :style="{ transitionDelay: s >= RELAY && !still ? '2.7s' : '0s' }"
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
          :class="s === st.at ? 'fill-dusk dark:fill-dusk' : 'fill-ink-strong dark:fill-ink-strong'"
          style="font-size: 23px; font-weight: 700"
        >{{ st.title }}</text>
        <text :x="st.x" y="367" text-anchor="middle" class="fill-stone-deep dark:fill-stone-deep" style="font-size: 17px; font-weight: 600">{{ st.sub }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
/* Rebroadcast ripple: a ring grows from the whip tip and fades, then repeats.
   Delays stagger the rings. Frozen by the global .lora-viz reduced-motion rule,
   a still picture shows one static ring. */
.mc-ripple {
  transform-box: fill-box;
  transform-origin: center;
  animation: mc-ripple 2.7s ease-out infinite both;
}
@keyframes mc-ripple {
  0% { transform: scale(0.3); opacity: 0; }
  10% { opacity: 1; }
  45% { transform: scale(1.8); opacity: 0; }
  100% { transform: scale(1.8); opacity: 0; }
}
/* Radio link: the dots march along the leg in the path direction (A → B).
   One period = dash + gap = 10 units. */
.mc-flow {
  animation: mc-flow 0.8s linear infinite;
}
@keyframes mc-flow {
  to { stroke-dashoffset: -10; }
}
.story-still * {
  transition: none !important;
}
</style>
