<script setup lang="ts">
// Gallery only for variant sf (was a deck slide „Spreading factor: далеч или бързо“: time on air for 20 bytes at
// 125 kHz, linear ms scale, bars grow on reveal. Click 4 adds one pill:
// „SF12: 23× по-бавно, но стига по-далеч“ (the dB per step is in the notes).
// variant="sms" (slide 54): one 160-byte message at SF12 as a long red bar,
// next to a 20-byte SF7 reference — all numbers from data/airtime.ts.
import { computed } from 'vue'
import type { AirtimeRow } from './data/airtime'
import { AIRTIME_GAIN, AIRTIME_RATIO, AIRTIME_ROWS, SMS_ROW } from './data/airtime'
import { TONE } from './data/tones'
import { isShown, maxAt, vis } from './data/format'
import { useStep } from './data/useStep'

const props = withDefaults(defineProps<{
  variant?: 'sf' | 'sms'
  rows?: AirtimeRow[]
  step?: number
  startAt?: number
}>(), { variant: 'sf', rows: () => AIRTIME_ROWS })

const sms = computed(() => props.variant === 'sms')
const total = props.variant === 'sms' ? 0 : maxAt(...props.rows.map(r => r.at), AIRTIME_RATIO.at, AIRTIME_GAIN.at)
const s = useStep(total, () => props.step, () => props.startAt ?? 0)

interface Bar { key: string, label: string, sub?: string, ms: number, valueLabel: string, tone: AirtimeRow['tone'], at?: number }
const bars = computed<Bar[]>(() => sms.value
  ? [
      { key: 'sf7', label: '20 B', sub: 'SF7', ms: props.rows[0].ms, valueLabel: props.rows[0].label, tone: 'blue' },
      { key: 'sms', label: `${SMS_ROW.bytes} B`, sub: 'SMS · SF12', ms: SMS_ROW.seconds * 1000, valueLabel: SMS_ROW.label, tone: 'red' },
    ]
  : props.rows.map(r => ({ key: `sf${r.sf}`, label: `SF${r.sf}`, ms: r.ms, valueLabel: r.label, tone: r.tone, at: r.at })))
// sms: leave room on the right for the long value label inside the narrow column.
const barScale = computed(() => (sms.value ? 0.62 : 0.82))
const maxMs = computed(() => Math.max(...bars.value.map(b => b.ms)))
const w = (b: Bar): number => (isShown(s.value, b.at) ? (b.ms / maxMs.value) * 100 : 0)
</script>

<template>
  <div class="lora-viz w-full">
    <div class="grid items-center gap-x-4 gap-y-4" :class="sms ? 'grid-cols-[150px_1fr]' : 'grid-cols-[80px_1fr]'">
      <template v-for="b in bars" :key="b.key">
        <div class="text-right transition-opacity duration-500" :class="vis(s, b.at)">
          <div class="text-2xl font-bold" :class="TONE[b.tone].text">{{ b.label }}</div>
          <div v-if="b.sub" class="text-lg text-stone-deep dark:text-stone-deep">{{ b.sub }}</div>
        </div>
        <div class="relative h-11 transition-opacity duration-500" :class="vis(s, b.at)">
          <div class="absolute inset-y-0 left-0 min-w-[6px] rounded-r transition-all duration-1000 ease-out" :class="TONE[b.tone].bg" :style="{ width: `${w(b) * barScale}%` }" />
          <span class="absolute top-1/2 -translate-y-1/2 whitespace-nowrap pl-3 text-xl font-bold transition-all duration-1000 ease-out" :class="TONE[b.tone].text" :style="{ left: `${w(b) * barScale}%` }">
            {{ b.valueLabel }}
          </span>
        </div>
      </template>
    </div>

    <div v-if="!sms" class="mt-6 flex justify-center pl-[96px] transition-opacity duration-500" :class="vis(s, AIRTIME_RATIO.at)">
      <span class="rounded-full border px-5 py-1 text-xl font-bold" :class="[TONE.red.soft, TONE.red.text, TONE.red.border]">SF12: {{ AIRTIME_RATIO.label }}, <span :class="TONE.emerald.text">но стига по-далеч</span></span>
    </div>
  </div>
</template>
