<script setup lang="ts">
// Slide 16 „Защо в Европа ползваме 868 MHz“: four reasons as a 2×2 card grid,
// one card per click (data: data/why868Facts.ts, tested):
//   1 power  — big bulb 500 mW (869,4–869,65 MHz) vs tiny bulb 10 mW (433 MHz),
//              same bulb glyph as ReachBars / DecibelLight;
//   2 busy   — a crowded 433 strip (car keys, thermometers, garage doors, radio
//              amateurs) vs the 868 sub-band where a 10 % duty-cycle clock
//              limits how long each node may transmit;
//   3 antenna — the two quarter-wave whips drawn to the same scale;
//   4 compat — LoRaWAN, Meshtastic and MeshCore nodes on one 868 MHz line.
// Every SVG font-size / fill-opacity sits in style="" (attributify trap).
import { useStep } from './data/useStep'
import { vis } from './data/format'
import { PROJECT_COLOUR, TONE } from './data/tones'
import { ANTENNA_PAIR, BUSY_433, NETWORKS, POWER, SUB_BAND, WHY868_CARDS } from './data/why868Facts'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(WHY868_CARDS.length, () => props.step, () => props.startAt ?? 0)

// Card 2: the 433 icons are packed edge to edge so the strip reads as crowded.
const DEVICE_X0 = 102
const DEVICE_GAP = 50
const devices = BUSY_433.devices.map((d, i) => ({ ...d, x: DEVICE_X0 + i * DEVICE_GAP }))
// Duty-cycle wedge: 10 % of a full turn, drawn clockwise from 12 o'clock.
const CLOCK_R = 17
const dutyAngle = (SUB_BAND.dutyPct / 100) * 2 * Math.PI
const dutyWedge = `M0 0 L0 ${-CLOCK_R} A${CLOCK_R} ${CLOCK_R} 0 0 1 ${(CLOCK_R * Math.sin(dutyAngle)).toFixed(2)} ${(-CLOCK_R * Math.cos(dutyAngle)).toFixed(2)} Z`

// Card 3: one px-per-cm scale for both whips, so the 433 one is really twice
// as tall. The board top is the common baseline the whips grow up from.
const PX_PER_CM = 5
const BOARD_TOP = 88
const whips = ANTENNA_PAIR.map((a, i) => ({ ...a, x: 70 + i * 165, h: a.cm * PX_PER_CM }))

// Card 4: each network keeps its own colour (LoRaWAN neutral water, the two
// projects their identity hues), all three hanging off one 868 MHz line.
const NET_CLASS: Record<string, string> = {
  LoRaWAN: TONE.blue.label,
  Meshtastic: PROJECT_COLOUR.cyan.label,
  MeshCore: PROJECT_COLOUR.indigo.label,
}
const NET_BOARD: Record<string, string> = {
  LoRaWAN: TONE.blue.fill,
  Meshtastic: PROJECT_COLOUR.cyan.fill,
  MeshCore: PROJECT_COLOUR.indigo.fill,
}
const nets = NETWORKS.map((n, i) => ({ ...n, x: 70 + i * 130 }))
const LINE_Y = 72
</script>

<template>
  <div class="lora-viz w-full select-none">
    <div class="grid grid-cols-2 gap-4">
      <div
        v-for="c in WHY868_CARDS"
        :key="c.id"
        class="card-surface flex flex-col rounded-xl border px-5 py-3 transition-opacity duration-500"
        :class="vis(s, c.at)"
      >
        <div class="text-2xl font-bold">{{ c.title }}</div>

        <!-- 1 · power: bulb size follows the legal limit -->
        <template v-if="c.id === 'power'">
          <svg class="mt-1" width="400" height="104" viewBox="0 0 400 104" role="img" aria-label="500 mW срещу 10 mW">
            <g transform="translate(40 54)">
              <circle r="40" class="fill-gold/40 dark:fill-gold-deep/20" />
              <g transform="scale(1.3)">
                <circle cy="-6" r="16" class="fill-gold/40 stroke-gold dark:fill-gold-deep dark:stroke-gold" style="stroke-width: 2" />
                <rect x="-7" y="9" width="14" height="12" rx="2" class="fill-stone dark:fill-stone" />
              </g>
            </g>
            <text x="90" y="50" class="fill-current" style="font-size: 30px; font-weight: 700">{{ POWER.subMw }} mW</text>
            <text x="90" y="80" class="fill-current" style="font-size: 18px; fill-opacity: 0.75">{{ SUB_BAND.label }}</text>
            <g transform="translate(274 54)">
              <circle r="11" class="fill-gold/40 dark:fill-gold-deep/20" />
              <g transform="scale(0.45)">
                <circle cy="-6" r="16" class="fill-gold/40 stroke-gold dark:fill-gold-deep dark:stroke-gold" style="stroke-width: 3" />
                <rect x="-7" y="9" width="14" height="12" rx="2" class="fill-stone dark:fill-stone" />
              </g>
            </g>
            <text x="292" y="50" class="fill-current" style="font-size: 28px; font-weight: 700">{{ POWER.mw433 }} mW</text>
            <text x="292" y="80"class="fill-current" style="font-size: 18px; fill-opacity: 0.75">433 MHz</text>
          </svg>
          <div class="mt-1 flex items-baseline justify-between gap-3">
            <span class="text-xl font-semibold" :class="TONE.amber.text">{{ POWER.reach }}</span>
            <span class="text-lg opacity-70">{{ POWER.sum }}</span>
          </div>
        </template>

        <!-- 2 · busy: a crowded 433 strip vs the duty-cycled 868 sub-band -->
        <template v-else-if="c.id === 'busy'">
          <svg class="mt-1" width="400" height="104" viewBox="0 0 400 104" role="img" aria-label="433 MHz е заета">
            <text x="0" y="32" class="fill-current" style="font-size: 22px; font-weight: 700">433</text>
            <rect x="66" y="4" width="332" height="42" rx="8" class="fill-trail/10 stroke-trail/50 dark:fill-trail/20 dark:stroke-trail/60" style="stroke-width: 2" />
            <g v-for="(d, i) in devices" :key="i" :transform="`translate(${d.x} 25)`" fill="none" class="stroke-ink-strong dark:stroke-ink-strong" style="stroke-width: 2.2" stroke-linecap="round" stroke-linejoin="round">
              <title>{{ d.name }}</title>
              <!-- car key fob: body, key ring, two buttons -->
              <template v-if="d.kind === 'key'">
                <rect x="-7" y="-10" width="14" height="22" rx="6" />
                <circle cy="-14" r="4" />
                <circle cy="-3" r="2" />
                <circle cy="5" r="2" />
              </template>
              <!-- thermometer: tube and a red bulb -->
              <template v-else-if="d.kind === 'thermo'">
                <rect x="-4" y="-17" width="8" height="22" rx="4" />
                <circle cy="9" r="6" />
                <circle cy="9" r="3" class="fill-trail stroke-none dark:fill-trail" />
              </template>
              <!-- garage: house outline with a ribbed door -->
              <template v-else-if="d.kind === 'garage'">
                <path d="M-15 -3 L0 -16 L15 -3 V15 H-15 Z" />
                <path d="M-9 15 V2 H9 V15 M-9 7 H9 M-9 11 H9" />
              </template>
              <!-- radio amateur mast: lattice legs with radio arcs at the top -->
              <template v-else>
                <path d="M-8 16 L0 -12 L8 16 M-5 6 H5" />
                <path d="M-7 -18 Q-11 -12 -7 -6 M7 -18 Q11 -12 7 -6" />
              </template>
            </g>
            <text x="0" y="90" class="fill-current" style="font-size: 22px; font-weight: 700">868</text>
            <rect x="66" y="60" width="332" height="42" rx="8" class="fill-moss/10 stroke-moss/50 dark:fill-moss/20 dark:stroke-moss/60" style="stroke-width: 2" />
            <!-- two nodes share the sub-band too; the clock is what keeps it usable -->
            <g v-for="x in [98, 138]" :key="x" :transform="`translate(${x - 11} 66) scale(0.33)`">
              <line x1="56" y1="40" x2="56" y2="5" class="stroke-water dark:stroke-water" style="stroke-width: 7" stroke-linecap="round" />
              <rect x="2" y="40" width="62" height="56" rx="7" class="fill-water dark:fill-water" />
            </g>
            <g transform="translate(184 81)">
              <circle :r="CLOCK_R" class="fill-page stroke-stone dark:fill-page dark:stroke-stone" style="stroke-width: 2.5" />
              <path :d="dutyWedge" class="fill-moss dark:fill-moss" />
            </g>
            <text x="210" y="89" class="fill-current" style="font-size: 22px; font-weight: 700">{{ SUB_BAND.dutyPct }} %</text>
            <text x="272" y="89" class="fill-current" style="font-size: 18px; fill-opacity: 0.75">от времето</text>
          </svg>
          <div class="mt-1 text-lg">любителска лента: <b>{{ BUSY_433.ham.label }}</b></div>
        </template>

        <!-- 3 · antenna: both quarter-wave whips on one scale -->
        <template v-else-if="c.id === 'antenna'">
          <svg class="mt-1" width="400" height="104" viewBox="0 0 400 104" role="img" aria-label="четвърт вълна в мащаб">
            <g v-for="w in whips" :key="w.mhz">
              <line :x1="w.x + 16" :y1="BOARD_TOP" :x2="w.x + 16" :y2="BOARD_TOP - w.h" class="stroke-water dark:stroke-water" style="stroke-width: 5" stroke-linecap="round" />
              <rect :x="w.x - 20" :y="BOARD_TOP" width="44" height="16" rx="4" class="fill-water dark:fill-water" />
              <text :x="w.x + 34" :y="BOARD_TOP - w.h / 2" class="fill-current" style="font-size: 28px; font-weight: 700">{{ w.label }}</text>
              <text :x="w.x + 34" :y="BOARD_TOP - w.h / 2 + 24" class="fill-current" style="font-size: 18px; fill-opacity: 0.75">{{ w.band }}</text>
            </g>
          </svg>
          <div class="mt-1 text-lg">четвърт вълна, в един мащаб</div>
        </template>

        <!-- 4 · compat: the networks people meet in Europe share one band -->
        <template v-else>
          <svg class="mt-1" width="400" height="104" viewBox="0 0 400 104" role="img" aria-label="LoRaWAN, Meshtastic и MeshCore на 868 MHz">
            <line x1="10" :y1="LINE_Y" x2="390" :y2="LINE_Y" class="stroke-moss dark:stroke-moss" style="stroke-width: 4" stroke-linecap="round" />
            <g v-for="n in nets" :key="n.name">
              <text :x="n.x" y="20" text-anchor="middle" :class="NET_CLASS[n.name]" style="font-size: 20px; font-weight: 700">{{ n.name }}</text>
              <line :x1="n.x" y1="58" :x2="n.x" :y2="LINE_Y" class="stroke-moss dark:stroke-moss" style="stroke-width: 3" />
              <g :transform="`translate(${n.x - 14} 28)`">
                <line x1="24" y1="12" x2="24" y2="0" class="stroke-ink-strong dark:stroke-ink-strong" style="stroke-width: 3" stroke-linecap="round" />
                <rect x="0" y="12" width="28" height="20" rx="4" :class="NET_BOARD[n.name]" />
              </g>
            </g>
            <text x="200" y="100" text-anchor="middle" :class="TONE.emerald.label" style="font-size: 22px; font-weight: 700">868 MHz</text>
          </svg>
          <div class="mt-1 text-lg">чуват се само в една и съща лента</div>
        </template>
      </div>
    </div>
  </div>
</template>
