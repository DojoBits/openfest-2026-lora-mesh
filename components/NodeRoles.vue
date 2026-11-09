<script setup lang="ts">
// Slide 29 „Роли на устройствата“: the Meshtastic device roles on the same
// parchment sheet as slide 27, one role per click, each where it lives:
//   start    empty landscape: ground, a mountain, the role strip dimmed;
//   click 1  CLIENT: a hiker with a phone and a small radio on the pack;
//   click 2  CLIENT_BASE: a house with a radio on a short roof mast, linked to
//            the hiker;
//   click 3  ROUTER: a radio on a mast on the peak, linked to the house; it
//            rebroadcasts (ripple at the whip tip);
//   click 4  SENSOR: a weather-sensor pole with a radio, linked to the peak.
// Every radio is drawn from MT_RADIO (no larger than the phone) and is either
// carried or mounted; every link is a thin, sparse, straight dotted line.
// A strip under the scene names each role (data/meshtasticRoles.ts, sources
// there). Print/PDF and a pinned `step` get the finished picture.
import { useNav } from '@slidev/client'
import { MT_ROLE_CLICKS, MT_ROLES, type MtRoleId } from './data/meshtasticRoles'
import { MT_PHONE, MT_RADIO } from './data/meshtasticScene'
import { useStep } from './data/useStep'
import MapGlyphs from './MapGlyphs.vue'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(MT_ROLE_CLICKS, () => props.step, () => props.startAt ?? 0)
const { isPrintMode } = useNav()
const still = props.step !== undefined || isPrintMode.value
const at = (id: MtRoleId) => MT_ROLES.find(r => r.id === id)?.at ?? 0
const shown = (from: number) => (s.value >= from ? 'opacity-100' : 'opacity-0')

const GROUND = 272
// Mounted radios are drawn in radio units scaled by K around the mount point:
// the body sits right of the mast top, the whip rises from its right edge.
const K = 1.3
const WHIP_X = MT_RADIO.w - 1

// Mount points (sheet units): the hiker's feet, the roof apex, the main peak
// apex (MapGlyphs mountains, s 4.6 → apex y 106) and the sensor pole foot.
// `mast` is how far the mount rises above that point before the radio body.
const SPOTS = {
  client: { x: 140, y: GROUND, mast: 0 },
  base: { x: 330, y: 180, mast: 18 },
  router: { x: 600, y: 106, mast: 24 },
  sensor: { x: 800, y: GROUND, mast: 60 },
} as const

// Hiker radio on top of the pack, in hiker units (same figure as slide 27).
const RX = -21
const RY = -61
const WX = RX + MT_RADIO.w - 2
const PX = 12
const PY = -47

// Whip tips in sheet units: where links and the ripple start.
const tipOf = (id: MtRoleId): { x: number, y: number } => {
  const p = SPOTS[id]
  if (id === 'client') return { x: p.x + K * WX, y: p.y + K * (RY - MT_RADIO.whip) }
  return { x: p.x + K * WHIP_X, y: p.y - K * (p.mast + MT_RADIO.whip) }
}
const TIP = Object.fromEntries(MT_ROLES.map(r => [r.id, tipOf(r.id)])) as Record<MtRoleId, { x: number, y: number }>

// Links appear with the later of their two ends: hiker ↔ house (click 2),
// house ↔ peak (click 3), peak ↔ sensor (click 4). Straight line of sight.
const LINKS = ([['client', 'base'], ['base', 'router'], ['router', 'sensor']] as const).map(([p, q]) => ({
  id: `${p}-${q}`,
  from: Math.max(at(p), at(q)),
  a: TIP[p],
  b: TIP[q],
}))

// Mounted radios (house, peak, sensor) share one drawing.
const MOUNTED = (['base', 'router', 'sensor'] as const).map(id => ({ id, ...SPOTS[id], from: at(id) }))

// Role strip: four equal columns across the sheet.
const COL = 218
const strip = MT_ROLES.map((r, i) => ({ ...r, x: 124 + i * COL }))
</script>

<template>
  <div class="lora-viz w-full select-none" :class="{ 'story-still': still }">
    <svg viewBox="0 0 900 400" class="w-full" role="img" aria-label="Роли на устройствата в Meshtastic: CLIENT е турист с телефон и радио, CLIENT_BASE е радио на покрива, ROUTER е радио на върха, SENSOR е радио на стълб със сензор">
      <!-- parchment sheet with a double ink border -->
      <rect x="4" y="4" width="892" height="392" rx="14" class="fill-parchment dark:fill-parchment" />
      <g class="stroke-ink dark:stroke-ink" fill="none" style="opacity: 0.7">
        <rect x="9" y="9" width="882" height="382" rx="10" style="stroke-width: 2" />
        <rect x="14" y="14" width="872" height="372" rx="7" style="stroke-width: 1" />
      </g>

      <!-- ground and the mountain (back peaks first) -->
      <path :d="`M18 ${GROUND} H882`" class="stroke-edge dark:stroke-edge" style="stroke-width: 3" />
      <MapGlyphs kind="mountains" :x="SPOTS.router.x" :y="GROUND" :pts="[{ dx: -92, dy: 0, s: 2.4 }, { dx: 96, dy: 0, s: 2.2 }, { dx: 0, dy: 0, s: 4.6 }]" />

      <!-- click 2: the house (CLIENT_BASE lives on its roof) -->
      <g class="transition-opacity duration-700" :class="shown(at('base'))">
        <path :d="`M${SPOTS.base.x - 45} ${GROUND} V222 H${SPOTS.base.x + 45} V${GROUND}`" class="fill-parchment-hi stroke-ink dark:fill-parchment-hi dark:stroke-ink" style="stroke-width: 2.5" />
        <path :d="`M${SPOTS.base.x - 56} 224 L${SPOTS.base.x} ${SPOTS.base.y} L${SPOTS.base.x + 56} 224 Z`" class="fill-trail stroke-ink dark:fill-trail dark:stroke-ink" style="stroke-width: 2.5; stroke-linejoin: round" />
        <rect :x="SPOTS.base.x - 30" y="236" width="20" height="18" class="fill-water/40 stroke-ink dark:fill-water/40 dark:stroke-ink" style="stroke-width: 2" />
        <rect :x="SPOTS.base.x + 10" y="240" width="18" height="32" class="fill-earth stroke-ink dark:fill-earth dark:stroke-ink" style="stroke-width: 2" />
      </g>

      <!-- click 4: the weather-sensor pole (louvred screen left of the pole) -->
      <g class="transition-opacity duration-700" :class="shown(at('sensor'))" :transform="`translate(${SPOTS.sensor.x} ${GROUND}) scale(${K})`">
        <path d="M-6 0 L0 -8 L6 0" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 2; stroke-linejoin: round" />
        <rect x="-15" y="-46" width="13" height="16" rx="1.5" class="fill-parchment-hi stroke-ink dark:fill-parchment-hi dark:stroke-ink" style="stroke-width: 1.5" />
        <path d="M-15 -41 H-2 M-15 -36 H-2" class="stroke-ink dark:stroke-ink" style="stroke-width: 1" />
      </g>

      <!-- radio links: thin sparse dots, straight between whip tips -->
      <line
        v-for="l in LINKS" :key="l.id" :x1="l.a.x" :y1="l.a.y" :x2="l.b.x" :y2="l.b.y"
        class="stroke-verdigris transition-opacity duration-700 dark:stroke-verdigris" :class="[shown(l.from), { 'mt-flow': !still }]"
        style="stroke-width: 2; stroke-dasharray: 1 9; stroke-linecap: round"
      />

      <!-- click 1: the hiker (CLIENT), same figure as slide 27 -->
      <g class="transition-opacity duration-700" :class="shown(at('client'))" :transform="`translate(${SPOTS.client.x} ${SPOTS.client.y}) scale(${K})`">
        <path d="M-5 0 L-3 -26 M6 0 L3 -26" class="stroke-ink dark:stroke-ink" style="stroke-width: 4; stroke-linecap: round" />
        <rect x="-18" y="-50" width="9" height="23" rx="3" class="fill-earth stroke-ink dark:fill-earth dark:stroke-ink" style="stroke-width: 2" />
        <path d="M-11 -24 Q -12 -50 0 -52 Q 12 -50 11 -24 Z" class="fill-moss stroke-ink dark:fill-moss dark:stroke-ink" style="stroke-width: 2.5" />
        <circle cy="-62" r="9" class="fill-parchment-hi stroke-ink dark:fill-parchment-hi dark:stroke-ink" style="stroke-width: 2.5" />
        <path d="M6 -44 L14 -37" class="stroke-ink dark:stroke-ink" style="stroke-width: 3.5; stroke-linecap: round" />
        <rect :x="PX" :y="PY" :width="MT_PHONE.w" :height="MT_PHONE.h" rx="2" class="fill-ink dark:fill-ink" />
        <line :x1="WX" :y1="RY" :x2="WX" :y2="RY - MT_RADIO.whip" class="stroke-water dark:stroke-water" style="stroke-width: 2; stroke-linecap: round" />
        <rect :x="RX" :y="RY" :width="MT_RADIO.w" :height="MT_RADIO.h" rx="1.5" class="fill-water stroke-ink dark:fill-water dark:stroke-ink" style="stroke-width: 1.5" />
        <rect :x="RX + 1.5" :y="RY + 2" :width="MT_RADIO.w - 3" height="3" class="fill-page/80 dark:fill-page/80" />
      </g>

      <!-- clicks 2–4: mounted radios (roof, peak, sensor pole): a mast, the
           radio body beside its top, the whip up from the body's right edge -->
      <g
        v-for="m in MOUNTED" :key="m.id" class="transition-opacity duration-700" :class="shown(m.from)"
        :transform="`translate(${m.x} ${m.y}) scale(${K})`"
      >
        <line x1="0" y1="0" x2="0" :y2="-m.mast - 2" class="stroke-ink dark:stroke-ink" style="stroke-width: 2.5; stroke-linecap: round" />
        <line :x1="WHIP_X" :y1="-m.mast" :x2="WHIP_X" :y2="-m.mast - MT_RADIO.whip" class="stroke-water dark:stroke-water" style="stroke-width: 2; stroke-linecap: round" />
        <rect x="0" :y="-m.mast" :width="MT_RADIO.w" :height="MT_RADIO.h" rx="1.5" class="fill-water stroke-ink dark:fill-water dark:stroke-ink" style="stroke-width: 1.5" />
        <rect x="1.5" :y="-m.mast + 2" :width="MT_RADIO.w - 3" height="3" class="fill-page/80 dark:fill-page/80" />
      </g>

      <!-- click 3: the peak router rebroadcasts (ripple at its whip tip) -->
      <circle
        v-if="s >= at('router')" :cx="TIP.router.x" :cy="TIP.router.y" r="11" fill="none"
        class="stroke-verdigris dark:stroke-verdigris" :class="{ 'mt-ripple': !still }" style="stroke-width: 1.5"
      />

      <!-- ── role strip ── -->
      <path d="M30 300 H870" class="stroke-edge dark:stroke-edge" style="stroke-width: 1.5; opacity: 0.7" />
      <g v-for="r in strip" :key="r.id" class="transition-opacity duration-500" :class="s >= r.at ? 'opacity-100' : 'opacity-25'">
        <text
          :x="r.x" y="338" text-anchor="middle"
          :class="s === r.at ? 'fill-verdigris dark:fill-verdigris' : 'fill-ink-strong dark:fill-ink-strong'"
          style="font-size: 22px; font-weight: 700; font-family: ui-monospace, Menlo, monospace"
        >{{ r.role }}</text>
        <text :x="r.x" y="367" text-anchor="middle" class="fill-stone-deep dark:fill-stone-deep" style="font-size: 17px; font-weight: 600">{{ r.sub }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
/* Rebroadcast ripple at the peak: a ring grows from the whip tip and fades.
   Frozen by the global .lora-viz reduced-motion rule. */
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
/* Radio link: dots march along the line. One period = dash + gap = 10 units. */
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
