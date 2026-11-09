<script setup lang="ts">
// Gallery only (was a deck slide „Децибелите се събират“, replaced by DecibelLight): a dBm ladder with a broken axis — the
// transmit rungs on top, then a long drop to the receiver sensitivity.
import { computed } from 'vue'
import type { DbRung } from './data/radio'
import { DB_GAP, DB_PAYOFF, DB_RUNGS } from './data/radio'
import { INK, TONE } from './data/tones'
import { fmt, maxAt, vis } from './data/format'
import { useStep } from './data/useStep'

const props = withDefaults(defineProps<{
  rungs?: DbRung[]
  gap?: typeof DB_GAP
  payoff?: typeof DB_PAYOFF
  step?: number
  startAt?: number
}>(), { rungs: () => DB_RUNGS, gap: () => DB_GAP, payoff: () => DB_PAYOFF })

const s = useStep(maxAt(...props.rungs.map(r => r.at), props.gap.at, props.payoff.at), () => props.step, () => props.startAt ?? 0)

// Upper segment: 30 → 10 dBm at 12 px/dB. Lower segment: the sensitivity dot.
const yTop = (dbm: number): number => 50 + (30 - dbm) * 12
const BREAK_Y = 330
const SENS_Y = 440
const AX = 330
const sign = (n: number): string => (n < 0 ? `−${fmt(-n)}` : `+${fmt(n)}`)
const lowest = computed(() => Math.min(...props.rungs.map(r => r.dbm)))
</script>

<template>
  <svg class="lora-viz w-full" viewBox="0 0 1000 500" role="img" aria-label="Стълба на мощностите в dBm">
    <!-- broken axis -->
    <line :x1="AX" :x2="AX" :y1="30" :y2="BREAK_Y - 14" :class="INK.line" stroke-width="3" />
    <path :d="`M${AX - 18},${BREAK_Y - 6} l36,-12 M${AX - 18},${BREAK_Y + 8} l36,-12`" :class="INK.line" stroke-width="3" />
    <line :x1="AX" :x2="AX" :y1="BREAK_Y + 10" :y2="SENS_Y + 30" :class="INK.line" stroke-width="3" />

    <g v-for="r in rungs" :key="r.dbm" class="transition-opacity duration-500" :class="vis(s, r.at)">
      <line :x1="AX - 40" :x2="AX + 40" :y1="yTop(r.dbm)" :y2="yTop(r.dbm)" :class="TONE[r.tone].stroke" stroke-width="7" stroke-linecap="round" />
      <text :x="AX - 56" :y="yTop(r.dbm) + 9" text-anchor="end" style="font-size: 28px" font-weight="700" :class="TONE[r.tone].label">{{ sign(r.dbm) }} dBm</text>
      <text :x="AX + 60" :y="yTop(r.dbm) + 9" style="font-size: 26px" font-weight="600" :class="TONE[r.tone].label">{{ r.mw }}</text>
      <text :x="AX + 190" :y="yTop(r.dbm) + 9" style="font-size: 24px" :class="INK.text">{{ r.label }}</text>
    </g>

    <!-- the long drop to sensitivity -->
    <g class="transition-opacity duration-500" :class="vis(s, gap.at)">
      <line :x1="AX + 26" :x2="AX + 26" :y1="yTop(lowest) + 10" :y2="SENS_Y - 14" :class="TONE.blue.stroke" stroke-width="3" stroke-dasharray="3 9" stroke-linecap="round" />
      <circle :cx="AX" :cy="SENS_Y" r="12" :class="TONE.blue.fill" />
      <text :x="AX - 56" :y="SENS_Y + 9" text-anchor="end" style="font-size: 28px" font-weight="700" :class="TONE.blue.label">{{ sign(gap.dbm) }} dBm</text>
      <text :x="AX + 60" :y="SENS_Y + 9" style="font-size: 26px" :class="INK.text">{{ gap.label }}</text>
      <!-- link budget bracket -->
      <!-- starts at the chip's TX power (gap.txDbm), not the highest regulatory rung -->
      <path :d="`M840,${yTop(gap.txDbm)} h18 V${SENS_Y} h-18`" fill="none" :class="INK.line" stroke-width="3" />
      <text :x="872" :y="(yTop(gap.txDbm) + SENS_Y) / 2 + 10" style="font-size: 30px" font-weight="700" :class="INK.text">{{ gap.budget }}</text>
      <text :x="872" :y="(yTop(gap.txDbm) + SENS_Y) / 2 + 36" style="font-size: 18px" :class="INK.muted">{{ gap.budgetSub }}</text>
    </g>
    <g class="transition-opacity duration-500" :class="vis(s, payoff.at)">
      <rect x="470" :y="BREAK_Y - 22" width="330" height="56" rx="28" :class="[TONE.emerald.fill, TONE.emerald.stroke]" style="fill-opacity: 0.12" stroke-width="3" />
      <text x="635" :y="BREAK_Y + 15" text-anchor="middle" style="font-size: 26px" font-weight="700" :class="TONE.emerald.label">{{ payoff.text }}</text>
    </g>
  </svg>
</template>
