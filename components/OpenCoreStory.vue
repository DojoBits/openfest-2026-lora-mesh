<script setup lang="ts">
// Slide 40 „Лицензи в MeshCore“: a parchment desk scene in the same sheet style as
// the Room Server story (slide 39), built per click.
//   start    phone, small radio board and laptop on a desk, neutral
//   click 1  radio: tag „фърмуер / MIT“
//   click 2  laptop: tag for the CLI and the libraries, MIT
//   click 3  phone: tag „официално приложение / затворено, част е платена“ with a lock
//   click 4  phone: tag „приложение MeshCore Open / MIT, от общността“
// Every tag names its software and says the licence once. No strip under the
// sheet, it only repeated the tags. Facts live in data/openCoreScene.ts.
// Print/PDF and a pinned `step` get the finished picture.
import { useNav } from '@slidev/client'
import { MC_PHONE, MC_RADIO } from './data/meshcoreScene'
import { OC_STATIONS, OC_STORY_CLICKS, type OcDevice, type OcStation } from './data/openCoreScene'
import { useStep } from './data/useStep'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(OC_STORY_CLICKS, () => props.step, () => props.startAt ?? 0)
const { isPrintMode } = useNav()
const still = props.step !== undefined || isPrintMode.value

const shown = (from: number) => (s.value >= from ? 'opacity-100' : 'opacity-0')
const DESK = 232

// Devices are drawn from the shared MeshCore sizes scaled by K, so the radio
// board keeps its real proportion to the phone and is never larger than it.
const K = 7
const PHONE = { cx: 170, w: MC_PHONE.w * K, h: MC_PHONE.h * K }
const RADIO = { cx: 480, w: MC_RADIO.w * K, h: MC_RADIO.h * K, whip: MC_RADIO.whip * K }
const LAPTOP = { cx: 740, w: 190, h: 104, base: 20 }

const phone = { x: PHONE.cx - PHONE.w / 2, y: DESK - PHONE.h }
const radio = { x: RADIO.cx - RADIO.w / 2, y: DESK - RADIO.h }
const screen = { x: LAPTOP.cx - LAPTOP.w / 2, y: DESK - LAPTOP.base - LAPTOP.h }

// Links between the devices: BLE phone to radio is wireless, so it is dashed
// and flows. The USB cable radio to laptop is a wire and stays solid.
const BLE_FROM = { x: phone.x + PHONE.w + 4, y: phone.y + 40 }
const BLE_TO = { x: radio.x - 4, y: radio.y + 40 }
const BLE_PATH = `M${BLE_FROM.x} ${BLE_FROM.y} Q ${(BLE_FROM.x + BLE_TO.x) / 2} ${BLE_FROM.y - 70} ${BLE_TO.x} ${BLE_TO.y}`
const LINKS = [{ id: 'ble', d: BLE_PATH }]
const USB_PATH = `M${radio.x + RADIO.w + 2} ${radio.y + 55} H${screen.x - 2}`

// Tags hang below the desk, under their device, and stand in for device
// captions. Two phone tags stack: the official app first, MeshCore Open under it.
// Width is estimated from the longer line (about 0.6 em per character) and the
// centre is clamped so a wide tag never crosses the sheet border.
const NAME_PX = 18
const LIC_PX = 23
const LOCK_W = 30
const TAG_H = 58
const DEVICE_CX: Record<OcDevice, number> = { radio: RADIO.cx, laptop: LAPTOP.cx, phone: PHONE.cx }
const TAG_ROWS = [DESK + 48, DESK + 112]
function tagBox(st: OcStation) {
  const lic = st.tagLicence.length * LIC_PX * 0.58 + (st.open ? 0 : LOCK_W)
  const w = Math.round(Math.max(st.tagName.length * NAME_PX * 0.58, lic) + 32)
  const cx = Math.min(Math.max(DEVICE_CX[st.device], 24 + w / 2), 876 - w / 2)
  const row = OC_STATIONS.filter(o => o.device === st.device && o.at < st.at).length
  return { ...st, w, cx, cy: TAG_ROWS[row] }
}
const tags = OC_STATIONS.map(tagBox)
// Full class names spelled out so UnoCSS sees them (it cannot read built strings).
const TAG_STROKE = { open: 'stroke-moss dark:stroke-moss', closed: 'stroke-gold-deep dark:stroke-gold-deep' }
const TAG_FILL = { open: 'fill-moss dark:fill-moss', closed: 'fill-gold-deep dark:fill-gold-deep' }
const tagKey = (open: boolean) => (open ? 'open' : 'closed')

// A device ring per station, in the tag colour. The second phone ring sits
// outside the first so both stay visible at click 4.
const RING = {
  radio: { x: radio.x - 12, y: radio.y - RADIO.whip - 10, w: RADIO.w + 24, h: RADIO.h + RADIO.whip + 16 },
  laptop: { x: screen.x - 24, y: screen.y - 12, w: LAPTOP.w + 48, h: LAPTOP.h + LAPTOP.base + 18 },
  phone: { x: phone.x - 12, y: phone.y - 12, w: PHONE.w + 24, h: PHONE.h + 18 },
}
const rings = OC_STATIONS.map((st) => {
  const r = RING[st.device]
  const out = OC_STATIONS.filter(o => o.device === st.device && o.at < st.at).length * 7
  return { id: st.id, at: st.at, open: st.open, x: r.x - out, y: r.y - out, w: r.w + 2 * out, h: r.h + out }
})

const ARIA = `Телефон, малка MeshCore платка и лаптоп на бюро. ${OC_STATIONS.map(st => `${st.tagName}: ${st.tagLicence}`).join('. ')}.`
</script>

<template>
  <div class="lora-viz w-full select-none" :class="{ 'story-still': still }">
    <svg viewBox="0 0 900 400" class="w-full" role="img" :aria-label="ARIA">
      <!-- parchment sheet with a double ink border -->
      <rect x="4" y="4" width="892" height="392" rx="14" class="fill-parchment dark:fill-parchment" />
      <g class="stroke-ink dark:stroke-ink" fill="none" style="opacity: 0.7">
        <rect x="9" y="9" width="882" height="382" rx="10" style="stroke-width: 2" />
        <rect x="14" y="14" width="872" height="372" rx="7" style="stroke-width: 1" />
      </g>

      <!-- the desk -->
      <path :d="`M30 ${DESK} H870`" class="stroke-edge dark:stroke-edge" style="stroke-width: 3" />

      <!-- BLE link phone to radio: dashed and flowing, never a solid line -->
      <path
        v-for="link in LINKS" :key="link.id" :d="link.d" fill="none" class="stroke-water dark:stroke-water"
        :class="{ 'oc-flow': !still }"
        :style="{ strokeWidth: 3, strokeLinecap: 'round', strokeDasharray: '3 10' }"
      />
      <text :x="(BLE_FROM.x + BLE_TO.x) / 2" :y="BLE_FROM.y - 44" text-anchor="middle" class="fill-stone-deep dark:fill-stone-deep" style="font-size: 18px; font-weight: 700">BLE</text>

      <!-- USB cable radio to laptop: a wire, so solid -->
      <path :d="USB_PATH" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 3; stroke-linecap: round" />
      <text :x="(radio.x + RADIO.w + screen.x) / 2" :y="radio.y + 40" text-anchor="middle" class="fill-stone-deep dark:fill-stone-deep" style="font-size: 18px; font-weight: 700">USB</text>

      <!-- rings: the tagged device gets a ring in the tag colour -->
      <rect
        v-for="r in rings" :key="`ring-${r.id}`" :x="r.x" :y="r.y" :width="r.w" :height="r.h" rx="10" fill="none"
        class="transition-opacity duration-700" :class="[shown(r.at), TAG_STROKE[tagKey(r.open)]]"
        style="stroke-width: 3"
      />

      <!-- phone -->
      <rect :x="phone.x" :y="phone.y" :width="PHONE.w" :height="PHONE.h" rx="7" class="fill-ink dark:fill-ink" />
      <rect :x="phone.x + 6" :y="phone.y + 12" :width="PHONE.w - 12" :height="PHONE.h - 26" rx="3" class="fill-parchment-hi dark:fill-parchment-hi" style="opacity: 0.18" />
      <path :d="`M${phone.x + 14} ${phone.y + 28} H${phone.x + PHONE.w - 22} M${phone.x + 14} ${phone.y + 42} H${phone.x + PHONE.w - 14}`" class="stroke-parchment-hi dark:stroke-parchment-hi" style="stroke-width: 3; stroke-linecap: round; opacity: 0.6" />

      <!-- small radio board with its whip, no larger than the phone -->
      <line :x1="radio.x + RADIO.w - 8" :y1="radio.y" :x2="radio.x + RADIO.w - 8" :y2="radio.y - RADIO.whip" class="stroke-water dark:stroke-water" style="stroke-width: 3; stroke-linecap: round" />
      <rect :x="radio.x" :y="radio.y" :width="RADIO.w" :height="RADIO.h" rx="4" class="fill-water stroke-ink dark:fill-water dark:stroke-ink" style="stroke-width: 2.5" />

      <!-- laptop -->
      <rect :x="screen.x" :y="screen.y" :width="LAPTOP.w" :height="LAPTOP.h" rx="6" class="fill-ink stroke-ink dark:fill-ink dark:stroke-ink" style="stroke-width: 3" />
      <text :x="screen.x + 14" :y="screen.y + 36" class="fill-parchment-hi dark:fill-parchment-hi" style="font-size: 20px; font-weight: 700; font-family: monospace">$ meshcore-cli</text>
      <path :d="`M${screen.x + 14} ${screen.y + 60} H${screen.x + 120} M${screen.x + 14} ${screen.y + 78} H${screen.x + 80}`" class="stroke-parchment-hi dark:stroke-parchment-hi" style="stroke-width: 3; stroke-linecap: round; opacity: 0.45" />
      <path
        :d="`M${screen.x - 16} ${DESK} L${screen.x + 4} ${DESK - LAPTOP.base} H${screen.x + LAPTOP.w - 4} L${screen.x + LAPTOP.w + 16} ${DESK} Z`"
        class="fill-stone stroke-ink dark:fill-stone dark:stroke-ink" style="stroke-width: 2.5; stroke-linejoin: round"
      />

      <!-- tags under the desk: software name on top, licence below in the tag colour -->
      <g v-for="st in tags" :key="st.id" class="transition-opacity duration-700" :class="shown(st.at)" :transform="`translate(${st.cx} ${st.cy})`">
        <rect :x="-st.w / 2" :y="-TAG_H / 2" :width="st.w" :height="TAG_H" rx="10" class="fill-parchment-hi dark:fill-parchment-hi" :class="TAG_STROKE[tagKey(st.open)]" style="stroke-width: 3" />
        <text y="-6" text-anchor="middle" class="fill-ink-strong dark:fill-ink-strong" :style="{ fontSize: `${NAME_PX}px`, fontWeight: 600 }">{{ st.tagName }}</text>
        <g :transform="`translate(${st.open ? 0 : LOCK_W / 2} 0)`">
          <!-- lock for the closed app: body and shackle, left of the licence text -->
          <g v-if="!st.open" :transform="`translate(${-(st.tagLicence.length * LIC_PX * 0.29) - 26} 6)`">
            <rect x="0" y="0" width="16" height="13" rx="2" class="fill-gold-deep dark:fill-gold-deep" />
            <path d="M3 0 V-5 A5 5 0 0 1 13 -5 V0" fill="none" class="stroke-gold-deep dark:stroke-gold-deep" style="stroke-width: 2.5" />
          </g>
          <text y="20" text-anchor="middle" :class="TAG_FILL[tagKey(st.open)]" :style="{ fontSize: `${LIC_PX}px`, fontWeight: 800 }">{{ st.tagLicence }}</text>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
/* Radio link: the dashes march along the link in the path direction.
   One period = dash + gap = 13 units. Frozen by the global .lora-viz
   reduced-motion rule. */
.oc-flow {
  animation: oc-flow 0.9s linear infinite;
}
@keyframes oc-flow {
  to { stroke-dashoffset: -13; }
}
.story-still * {
  transition: none !important;
}
</style>
