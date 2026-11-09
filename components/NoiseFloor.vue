<script setup lang="ts">
// Gallery only (was a deck slide „Чува под шума“): a grey noise band (−117 dBm in 125 kHz incl. receiver NF)
// with a subtle CSS jitter, the LoRa signal drawn 20 dB BELOW it, then the
// emerald „декодирано“ and the −20 dB = 1/100 bracket.
import { computed } from 'vue'
import { NOISE } from './data/radio'
import { INK, TONE } from './data/tones'
import { fmt, vis } from './data/format'
import { useStep } from './data/useStep'

const props = withDefaults(defineProps<{
  noiseDbm?: number
  snrDb?: number
  step?: number
  startAt?: number
}>(), { noiseDbm: NOISE.noiseDbm, snrDb: NOISE.snrDb })

const s = useStep(2, () => props.step, () => props.startAt ?? 0)
const signalDbm = computed(() => props.noiseDbm + props.snrDb)

// y axis: −100 dBm at the top → −155 dBm at the bottom
const y = (dbm: number): number => 40 + (-100 - dbm) * 7
const X0 = 150
const X1 = 780
const sign = (n: number): string => (n < 0 ? `−${fmt(-n)}` : fmt(n))
// Jagged top/bottom edge of the noise band (deterministic).
const band = computed(() => {
  const top: string[] = []
  const bot: string[] = []
  for (let i = 0, x = X0; x <= X1; i++, x += 15) {
    top.push(`${x},${y(props.noiseDbm) - 14 - ((i * 7) % 11)}`)
    bot.unshift(`${x},${y(props.noiseDbm) + 14 + ((i * 5) % 9)}`)
  }
  return `M${top.join('L')}L${bot.join('L')}Z`
})
const signalPath = computed(() => {
  const pts: string[] = []
  for (let x = X0; x <= X1; x += 4)
    pts.push(`${x},${(y(signalDbm.value) - 6 * Math.sin((x - X0) / 9)).toFixed(1)}`)
  return `M${pts.join('L')}`
})
</script>

<template>
  <svg class="lora-viz w-full" viewBox="0 0 1000 440" role="img" aria-label="Сигнал под нивото на шума">
    <line :x1="X0 - 20" :x2="X0 - 20" y1="30" y2="420" :class="INK.line" stroke-width="3" />
    <text v-for="d in [-110, -130, -150]" :key="d" :x="X0 - 32" :y="y(d) + 7" text-anchor="end" style="font-size: 20px" :class="INK.muted">{{ sign(d) }}</text>
    <text :x="X0 - 32" y="24" text-anchor="end" style="font-size: 20px" :class="INK.muted">dBm</text>

    <!-- noise band (subtle jitter, disabled by prefers-reduced-motion) -->
    <path :d="band" class="noise-jitter fill-earth/35 dark:fill-stone/70" />
    <text :x="X1 + 16" :y="y(noiseDbm) + 8" style="font-size: 24px" font-weight="600" :class="INK.text">шум {{ sign(noiseDbm) }} dBm</text>

    <g class="transition-opacity duration-500" :class="vis(s, 1)">
      <path :d="signalPath" fill="none" :class="TONE.blue.stroke" stroke-width="5" stroke-linecap="round" />
      <text :x="X1 + 16" :y="y(signalDbm) + 8" style="font-size: 24px" font-weight="600" :class="TONE.blue.label">LoRa {{ sign(signalDbm) }} dBm</text>
    </g>

    <g class="transition-opacity duration-500" :class="vis(s, 2)">
      <path :d="`M${X0 + 40},${y(noiseDbm)} h-16 V${y(signalDbm)} h16`" fill="none" :class="TONE.emerald.stroke" stroke-width="3" />
      <text :x="X0 + 54" :y="(y(noiseDbm) + y(signalDbm)) / 2 + 8" style="font-size: 24px" font-weight="700" :class="TONE.emerald.label">{{ sign(snrDb) }} dB = 1/100</text>
      <g :transform="`translate(${X0 + 330}, ${y(signalDbm) + 66})`">
        <circle r="18" :class="TONE.emerald.fill" />
        <path d="M-8,0 l5,6 l10,-12" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <text x="30" y="9" style="font-size: 26px" font-weight="700" :class="TONE.emerald.label">декодирано</text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
/* Two-pixel shimmer: the one loop the storyboard asks for on this slide. */
.noise-jitter {
  animation: noise-jitter 0.9s steps(3, end) infinite alternate;
}
@keyframes noise-jitter {
  from { transform: translateY(-1.5px); }
  to { transform: translateY(1.5px); }
}
</style>
