<script setup lang="ts">
// Slide 39 „Офлайн пощенска кутия“: a parchment street scene in the
// same sheet style as the MeshCore story (slide 37), built per click.
//   start    Аз sends in a channel, Пешо is out of range (faded) and misses it
//   click 1  a Room Server sits on a roof mast, Аз's post flows to it along a
//            dotted leg and fills the first slot of its inbox
//   click 2  another person posts too, more slots fill (up to 32 unseen)
//   click 3  Пешо comes back, logs in, the waiting posts flow to him
// Facts and sources live in data/roomServerScene.ts. Print/PDF and a pinned
// `step` get the finished picture.
import { useNav } from '@slidev/client'
import { MC_PHONE, MC_RADIO } from './data/meshcoreScene'
import { RS_FACTS, RS_POSTS, RS_STATIONS, RS_STORY_CLICKS } from './data/roomServerScene'
import { useStep } from './data/useStep'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(RS_STORY_CLICKS, () => props.step, () => props.startAt ?? 0)
const { isPrintMode } = useNav()
const still = props.step !== undefined || isPrintMode.value
const at = (id: string) => RS_STATIONS.find(st => st.id === id)?.at ?? 0
const STORED = at('stored')
const QUEUE = at('queue')
const LOGIN = at('login')

const shown = (from: number) => (s.value >= from ? 'opacity-100' : 'opacity-0')
const GROUND = 272

// One building in the middle, the Room Server on a mast on its roof.
const BUILDING = { x: 390, w: 150, top: 140 }
const WINDOWS: { x: number, y: number }[] = []
// panes on a 22 × 26 grid, kept clear of the walls and the ground
for (let y = BUILDING.top + 14; y < GROUND - 26; y += 26) {
  for (let x = BUILDING.x + 14; x < BUILDING.x + BUILDING.w - 20; x += 22) WINDOWS.push({ x, y })
}
// Roof mast in radio units at scale RK: the board is MC_RADIO, never larger than the phone.
const RK = 1.3
const MAST = 14
const ROOF = { x: 465, y: BUILDING.top }

// People: feet on the ground at x, facing `dir`, scaled by k.
const PEOPLE = [
  { id: 'me', x: 110, dir: 1, k: 1.3 },
  { id: 'c', x: 300, dir: 1, k: 0.9 },
  { id: 'pes', x: 790, dir: -1, k: 1.3 },
] as const
// Radio on the pack (person units, facing right, feet at 0,0) and phone in hand.
const RX = -21
const RY = -61
const WX = RX + MC_RADIO.w - 2
const PX = 12
const PY = -47

type NodeId = (typeof PEOPLE)[number]['id'] | 'srv'
// Whip tip of every radio in sheet units: legs and ripples start there.
const TIP = Object.fromEntries([
  ...PEOPLE.map(p => [p.id, { x: p.x + p.dir * p.k * WX, y: GROUND + p.k * (RY - MC_RADIO.whip) }]),
  ['srv', { x: ROOF.x + RK * 2, y: ROOF.y - RK * (MAST + MC_RADIO.h + MC_RADIO.whip) }],
]) as Record<NodeId, { x: number, y: number }>

// Dotted legs (radio links are never solid): who sends, from which click.
const leg = (a: NodeId, b: NodeId) => `M${TIP[a].x} ${TIP[a].y} L ${TIP[b].x} ${TIP[b].y}`
const LEGS = [
  { id: 'me-srv', d: leg('me', 'srv'), from: STORED },
  { id: 'c-srv', d: leg('c', 'srv'), from: QUEUE },
  { id: 'srv-pes', d: leg('srv', 'pes'), from: LOGIN },
]
const AIR_RINGS = [18, 34] as const

// Inbox panel left of the server: one slot per unseen message handed out on
// login (8 × 4). It sits above the Аз → server leg (the leg is at y 120 by x 354).
const PANEL = { x: 214, y: 18, w: 140, h: 98 }
const CELL = 12
const GAP = 4
const COLS = 8
const gridX = PANEL.x + (PANEL.w - (COLS * (CELL + GAP) - GAP)) / 2
const SLOTS = Array.from({ length: RS_FACTS.unseenOnLogin }, (_, i) => ({
  i,
  x: gridX + (i % COLS) * (CELL + GAP),
  y: PANEL.y + 30 + Math.floor(i / COLS) * (CELL + GAP),
}))
// Filled slots per click: one post after click 1, all RS_POSTS from click 2.
const filled = (i: number) => (s.value >= QUEUE ? i < RS_POSTS : s.value >= STORED ? i < 1 : false)
function slotClass(i: number) {
  if (!filled(i)) return 'fill-parchment-hi stroke-edge dark:fill-parchment-hi dark:stroke-edge'
  return s.value >= LOGIN ? 'fill-moss stroke-ink dark:fill-moss dark:stroke-ink' : 'fill-gold stroke-ink dark:fill-gold dark:stroke-ink'
}

// Station strip: four equal columns across the sheet.
const COL = 218
const strip = RS_STATIONS.map((st, i) => ({ ...st, x: 124 + i * COL }))
</script>

<template>
  <div class="lora-viz w-full select-none" :class="{ 'story-still': still }">
    <svg viewBox="0 0 900 400" class="w-full" role="img" aria-label="Пешо е извън обхват и пропуска съобщението в канала. Room Server на покрива пази постовете. Когато Пешо се върне и влезе, получава до 32 непрочетени.">
      <!-- parchment sheet with a double ink border -->
      <rect x="4" y="4" width="892" height="392" rx="14" class="fill-parchment dark:fill-parchment" />
      <g class="stroke-ink dark:stroke-ink" fill="none" style="opacity: 0.7">
        <rect x="9" y="9" width="882" height="382" rx="10" style="stroke-width: 2" />
        <rect x="14" y="14" width="872" height="372" rx="7" style="stroke-width: 1" />
      </g>

      <!-- ground and the building -->
      <path :d="`M18 ${GROUND} H882`" class="stroke-edge dark:stroke-edge" style="stroke-width: 3" />
      <rect
        :x="BUILDING.x" :y="BUILDING.top" :width="BUILDING.w" :height="GROUND - BUILDING.top"
        class="fill-parchment-hi stroke-ink dark:fill-parchment-hi dark:stroke-ink" style="stroke-width: 2.5"
      />
      <rect v-for="(w, i) in WINDOWS" :key="`w${i}`" :x="w.x" :y="w.y" width="8" height="12" class="fill-stone-deep dark:fill-stone-deep" style="opacity: 0.35" />

      <!-- click 1: the Room Server board on a roof mast, its label and air rings -->
      <g class="roof transition-opacity duration-700" :class="shown(STORED)">
        <g :transform="`translate(${ROOF.x} ${ROOF.y}) scale(${RK})`">
          <path :d="`M0 0 V${-MAST} M-5 0 L0 -6 L5 0`" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 2; stroke-linecap: round" />
          <line x1="2" :y1="-MAST - MC_RADIO.h" x2="2" :y2="-MAST - MC_RADIO.h - MC_RADIO.whip" class="stroke-gold-deep dark:stroke-gold-deep" style="stroke-width: 2; stroke-linecap: round" />
          <rect :x="-MC_RADIO.w / 2" :y="-MAST - MC_RADIO.h" :width="MC_RADIO.w" :height="MC_RADIO.h" rx="1.5" class="fill-gold stroke-ink dark:fill-gold dark:stroke-ink" style="stroke-width: 1.5" />
        </g>
        <circle
          v-for="rad in AIR_RINGS" :key="rad" :cx="TIP.srv.x" :cy="TIP.srv.y" :r="rad" fill="none"
          class="stroke-gold-deep dark:stroke-gold-deep" style="stroke-width: 2; stroke-dasharray: 2 6; stroke-linecap: round; opacity: 0.6"
        />
        <text :x="TIP.srv.x + 44" :y="TIP.srv.y - 8" class="fill-ink-strong dark:fill-ink-strong" style="font-size: 20px; font-weight: 700">Room Server</text>
      </g>

      <!-- click 1: inbox panel, one slot per unseen message handed out on login -->
      <g class="transition-opacity duration-700" :class="shown(STORED)">
        <rect :x="PANEL.x" :y="PANEL.y" :width="PANEL.w" :height="PANEL.h" rx="8" class="fill-parchment-hi stroke-ink dark:fill-parchment-hi dark:stroke-ink" style="stroke-width: 2" />
        <text :x="PANEL.x + PANEL.w / 2" :y="PANEL.y + 21" text-anchor="middle" class="fill-ink-strong dark:fill-ink-strong" style="font-size: 16px; font-weight: 700">непрочетени</text>
        <rect
          v-for="sl in SLOTS" :key="sl.i" :x="sl.x" :y="sl.y" :width="CELL" :height="CELL" rx="2"
          class="transition-colors duration-500" :class="slotClass(sl.i)" style="stroke-width: 1.2"
          :style="{ transitionDelay: !still ? `${sl.i * 0.15}s` : '0s' }"
        />
      </g>

      <!-- start: Аз sends in a channel, dotted air rings and a ripple at the whip -->
      <g class="transition-opacity duration-500" :class="s >= STORED ? 'opacity-0' : 'opacity-100'">
        <circle
          v-for="rad in AIR_RINGS" :key="rad" :cx="TIP.me.x" :cy="TIP.me.y" :r="rad" fill="none"
          class="stroke-dusk dark:stroke-dusk" style="stroke-width: 2; stroke-dasharray: 2 6; stroke-linecap: round; opacity: 0.6"
        />
        <circle :cx="TIP.me.x" :cy="TIP.me.y" r="16" fill="none" class="stroke-dusk dark:stroke-dusk" :class="{ 'rs-ripple': !still }" style="stroke-width: 2" />
      </g>

      <!-- legs: posts flow to the server (clicks 1, 2), then to Пешо (click 3) -->
      <path
        v-for="leg in LEGS" :key="leg.id" :d="leg.d" fill="none" class="stroke-gold-deep transition-opacity duration-500 dark:stroke-gold-deep"
        :class="[s >= leg.from ? 'opacity-100' : 'opacity-0', { 'rs-flow': !still }]"
        :style="{ strokeWidth: 2.5, strokeLinecap: 'round', strokeDasharray: '1 9' }"
      />

      <!-- people with a phone in hand and a companion radio on the pack. Пешо is faded while out of range -->
      <g
        v-for="p in PEOPLE" :key="p.id" class="transition-opacity duration-700"
        :style="{ opacity: p.id === 'pes' && s < LOGIN ? 0.35 : p.id === 'c' && s < QUEUE ? 0.5 : 1 }"
      >
        <g :transform="`translate(${p.x} ${GROUND}) scale(${p.dir * p.k} ${p.k})`">
          <path d="M-5 0 L-3 -26 M6 0 L3 -26" class="stroke-ink dark:stroke-ink" style="stroke-width: 4; stroke-linecap: round" />
          <rect x="-18" y="-50" width="9" height="23" rx="3" class="fill-earth stroke-ink dark:fill-earth dark:stroke-ink" style="stroke-width: 2" />
          <path d="M-11 -24 Q -12 -50 0 -52 Q 12 -50 11 -24 Z" class="fill-moss stroke-ink dark:fill-moss dark:stroke-ink" style="stroke-width: 2.5" />
          <circle cy="-62" r="9" class="fill-parchment-hi stroke-ink dark:fill-parchment-hi dark:stroke-ink" style="stroke-width: 2.5" />
          <path d="M6 -44 L14 -37" class="stroke-ink dark:stroke-ink" style="stroke-width: 3.5; stroke-linecap: round" />
          <rect :x="PX" :y="PY" :width="MC_PHONE.w" :height="MC_PHONE.h" rx="2" class="fill-ink dark:fill-ink" />
          <line :x1="WX" :y1="RY" :x2="WX" :y2="RY - MC_RADIO.whip" class="stroke-water dark:stroke-water" style="stroke-width: 2; stroke-linecap: round" />
          <rect :x="RX" :y="RY" :width="MC_RADIO.w" :height="MC_RADIO.h" rx="1.5" class="fill-water stroke-ink dark:fill-water dark:stroke-ink" style="stroke-width: 1.5" />
        </g>
      </g>
      <text x="110" y="296" text-anchor="middle" class="fill-ink-strong dark:fill-ink-strong" style="font-size: 18px; font-weight: 700">Аз</text>
      <text x="790" y="296" text-anchor="middle" class="fill-ink-strong dark:fill-ink-strong" style="font-size: 18px; font-weight: 700">Пешо</text>

      <!-- speech bubble over Пешо: missed while away, then the waiting posts arrive -->
      <g class="transition-opacity duration-500" transform="translate(790 118)" :class="s >= LOGIN ? 'opacity-0' : 'opacity-100'">
        <rect x="-30" y="-16" width="60" height="32" rx="8" class="fill-parchment-hi stroke-ink dark:fill-parchment-hi dark:stroke-ink" style="stroke-width: 2" />
        <rect x="-21" y="-9" width="24" height="17" rx="2" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 2; opacity: 0.5" />
        <path d="M-21 -8 L-9 1 L3 -8" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 2; opacity: 0.5" />
        <path d="M9 -8 L21 4 M21 -8 L9 4" class="stroke-trail dark:stroke-trail" style="stroke-width: 3.5; stroke-linecap: round" />
      </g>
      <g
        class="transition-opacity duration-500" transform="translate(790 118)" :class="s >= LOGIN ? 'opacity-100' : 'opacity-0'"
        :style="{ transitionDelay: s >= LOGIN && !still ? '0.9s' : '0s' }"
      >
        <rect x="-38" y="-16" width="76" height="32" rx="8" class="fill-parchment-hi stroke-moss dark:fill-parchment-hi dark:stroke-moss" style="stroke-width: 2.5" />
        <rect x="-29" y="-9" width="24" height="17" rx="2" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 2" />
        <path d="M-29 -8 L-17 1 L-5 -8" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 2" />
        <text x="17" y="8" text-anchor="middle" class="fill-moss dark:fill-moss" style="font-size: 22px; font-weight: 800">×{{ RS_POSTS }}</text>
      </g>

      <!-- station strip -->
      <path d="M30 312 H870" class="stroke-edge dark:stroke-edge" style="stroke-width: 1.5; opacity: 0.7" />
      <g v-for="st in strip" :key="st.id" class="transition-opacity duration-500" :class="s >= st.at ? 'opacity-100' : 'opacity-25'">
        <text
          :x="st.x" y="345" text-anchor="middle"
          :class="s === st.at ? 'fill-gold-deep dark:fill-gold-deep' : 'fill-ink-strong dark:fill-ink-strong'"
          style="font-size: 23px; font-weight: 700"
        >{{ st.title }}</text>
        <text :x="st.x" y="372" text-anchor="middle" class="fill-stone-deep dark:fill-stone-deep" style="font-size: 17px; font-weight: 600">{{ st.sub }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
/* Send ripple: a ring grows from the whip tip and fades, then repeats.
   Frozen by the global .lora-viz reduced-motion rule. */
.rs-ripple {
  transform-box: fill-box;
  transform-origin: center;
  animation: rs-ripple 2.7s ease-out infinite both;
}
@keyframes rs-ripple {
  0% { transform: scale(0.3); opacity: 0; }
  10% { opacity: 1; }
  45% { transform: scale(1.8); opacity: 0; }
  100% { transform: scale(1.8); opacity: 0; }
}
/* Radio link: the dots march along the leg in the path direction.
   One period = dash + gap = 10 units. */
.rs-flow {
  animation: rs-flow 0.8s linear infinite;
}
@keyframes rs-flow {
  to { stroke-dashoffset: -10; }
}
.story-still * {
  transition: none !important;
}
</style>
