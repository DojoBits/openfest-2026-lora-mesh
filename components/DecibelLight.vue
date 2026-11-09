<script setup lang="ts">
// Slide 13 „Какво са dB, dBm и dBi“: a light bulb explains the three units,
// one card per click (data and maths: data/dbUnits.ts, tested).
//   1 dB  — the base: how many times (formula DB_FORMULA); twice the bulbs
//           = +3 dB, ten times = +10 dB;
//   2 dBm — dB against a tiny 1 mW bulb: 1 mW = 0 dBm, 25 mW = 14 dBm;
//   3 dBi — where the light goes: a bare bulb shines everywhere (0 dBi), a
//           torch reflector sends the same light forward (+5 dBi ≈ 3×).
// Card 3 reuses slide 14's emerald rings: round = everywhere, flat = forward.
import { useStep } from './data/useStep'
import { vis } from './data/format'
import { DBI_EXAMPLE, DBM_EXAMPLES, DB_CARDS, DB_FORMULA, DB_STEPS } from './data/dbUnits'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(DB_CARDS.length, () => props.step, () => props.startAt ?? 0)

interface Spot { x: number, y: number, k: number }
// dBm card: the stronger bulb is drawn bigger with a wider glow.
const DBM_BULBS = DBM_EXAMPLES.map((e, i) => ({
  ...e,
  spot: { x: i === 0 ? 55 : 170, y: 80, k: i === 0 ? 0.8 : 1.3 } as Spot,
  glow: 24 + e.dbm * 2.4,
}))

// dB card: one row per step, `bulbs` small bulbs side by side.
const rowBulbs = (n: number, y: number): Spot[] => {
  const gap = n > 5 ? 22 : 30
  const x0 = 120 - ((n - 1) * gap) / 2
  return Array.from({ length: n }, (_, i) => ({ x: x0 + i * gap, y, k: 0.55 }))
}
const STEP_ROWS = DB_STEPS.map((x, i) => ({ ...x, spots: rowBulbs(x.bulbs, 22 + i * 62) }))

const RINGS = [1, 2, 3]
</script>

<template>
  <div class="lora-viz w-full select-none">
    <div class="grid grid-cols-[1.4fr_1fr_1fr] gap-5">
      <div
        v-for="c in DB_CARDS"
        :key="c.unit"
        class="flex flex-col items-center rounded-xl border-2 border-edge/30 bg-page/60 px-3 py-3 text-center transition duration-500 dark:border-stone dark:bg-parchment"
        :class="vis(s, c.at)"
      >
        <div class="text-4xl font-bold text-water dark:text-water">{{ c.unit }}</div>
        <div class="text-xl opacity-75">{{ c.title }}</div>

        <!-- 1 · dB: the formula, then how many times more -->
        <template v-if="c.unit === 'dB'">
          <div class="mt-3 whitespace-nowrap text-2xl font-semibold">{{ DB_FORMULA }}</div>
          <svg class="mt-1" width="240" height="124" viewBox="0 0 240 124" aria-hidden="true">
            <g v-for="r in STEP_ROWS" :key="r.bulbs">
              <g v-for="(p, i) in r.spots" :key="i" :transform="`translate(${p.x} ${p.y}) scale(${p.k})`">
                <circle cy="-6" r="16" class="fill-gold/40 stroke-gold dark:fill-gold-deep dark:stroke-gold" style="stroke-width: 2.5" />
                <rect x="-7" y="9" width="14" height="12" rx="2" class="fill-stone dark:fill-stone" />
              </g>
              <text x="120" :y="r.spots[0].y + 36" text-anchor="middle" class="fill-current" style="font-size: 22px; font-weight: 600">{{ r.label }}</text>
            </g>
          </svg>
        </template>

        <!-- 2 · dBm: dB against a 1 mW bulb -->
        <template v-else-if="c.unit === 'dBm'">
          <svg class="mt-2" width="240" height="160" viewBox="0 0 240 160" role="img" aria-label="крушка">
            <g v-for="b in DBM_BULBS" :key="b.mw" :transform="`translate(${b.spot.x} ${b.spot.y})`">
              <circle :r="b.glow" class="fill-gold/40 dark:fill-gold-deep/20" />
              <g :transform="`scale(${b.spot.k})`">
                <circle cy="-6" r="16" class="fill-gold/40 stroke-gold dark:fill-gold-deep dark:stroke-gold" style="stroke-width: 2" />
                <rect x="-7" y="9" width="14" height="12" rx="2" class="fill-stone dark:fill-stone" />
              </g>
            </g>
          </svg>
          <div class="grid w-full grid-cols-2 text-lg leading-snug">
            <div v-for="b in DBM_BULBS" :key="b.mw">
              <div class="font-semibold">{{ b.mw }} mW</div>
              <div class="text-water dark:text-water">= {{ b.dbm }} dBm</div>
            </div>
          </div>
        </template>

        <!-- 3 · dBi: same bulb, light sent forward -->
        <template v-else>
          <svg class="mt-2" width="240" height="160" viewBox="0 0 240 160" aria-hidden="true">
            <!-- bare bulb, round rings -->
            <g transform="translate(48 80)">
              <g class="fill-none stroke-moss dark:stroke-moss" style="stroke-width: 2.5">
                <circle v-for="r in RINGS" :key="r" :r="8 + r * 11" :opacity="1.15 - r * 0.25" />
              </g>
              <g transform="scale(0.7)">
                <circle cy="-6" r="16" class="fill-gold/40 stroke-gold dark:fill-gold-deep dark:stroke-gold" style="stroke-width: 2" />
                <rect x="-7" y="9" width="14" height="12" rx="2" class="fill-stone dark:fill-stone" />
              </g>
            </g>
            <!-- torch: reflector cone, rings squashed forward -->
            <g transform="translate(122 80)" role="img" aria-label="фенерче">
              <g class="fill-none stroke-moss dark:stroke-moss" style="stroke-width: 2.5">
                <ellipse v-for="r in RINGS" :key="r" :cx="4 + r * 18" :rx="r * 19" :ry="3 + r * 5" :opacity="1.15 - r * 0.25" />
              </g>
              <rect x="-26" y="-7" width="18" height="14" rx="3" class="fill-stone dark:fill-stone-deep" />
              <path d="M -8 -7 L 8 -16 L 8 16 L -8 7 Z" class="fill-stone stroke-stone-deep dark:fill-stone dark:stroke-stone-deep" style="stroke-width: 1.5" />
              <circle cx="6" r="5" class="fill-gold/40 dark:fill-gold-deep" />
            </g>
          </svg>
          <div class="grid w-full grid-cols-2 text-lg leading-snug">
            <div>
              <div class="font-semibold">крушка</div>
              <div class="text-moss dark:text-moss">0 dBi</div>
            </div>
            <div>
              <div class="font-semibold">фенерче</div>
              <div class="text-moss dark:text-moss">+{{ DBI_EXAMPLE.dbi }} dBi</div>
              <div class="text-moss dark:text-moss">{{ DBI_EXAMPLE.times }} напред</div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
