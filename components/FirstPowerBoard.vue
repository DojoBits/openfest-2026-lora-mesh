<script setup lang="ts">
// Slide 23 „Първо включване: четири проверки“: one generic LoRa dev board,
// drawn from above in a framed parchment card, with four numbered callouts,
// one per click (texts and positions: data/firstPowerChecks.ts, tested):
//   1 antenna connector + stub antenna — attach before power (red: the risk)
//   2 LoRa module „868“ + antenna      — both for the same band
//   3 2-pin battery connector          — red/black leads against the +/− print
//   4 USB-C port                       — exact firmware, then region EU_868
// Callouts stay once shown; the part the current click talks about gets a soft
// dashed ring. Map tokens only, each class with its dark: twin; every SVG
// font-size, stroke width and opacity lives in style="" (attributify trap).
import { computed } from 'vue'
import type { Tone } from './data/tones'
import { TONE } from './data/tones'
import { vis } from './data/format'
import { useStep } from './data/useStep'
import {
  FIRST_POWER_CHECKS, FP_ANT, FP_BATT, FP_BOARD, FP_H, FP_HOLES, FP_LORA, FP_SCREEN, FP_USB, FP_W, calloutLines,
} from './data/firstPowerChecks'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(FIRST_POWER_CHECKS.length, () => props.step, () => props.startAt ?? 0)

const B = FP_BOARD
const w = (n: number) => `stroke-width: ${n}`
const OL = 'stroke-ink dark:stroke-ink'
const INK_FILL = 'fill-ink-strong dark:fill-ink-strong'
const HALO = 'stroke-parchment-hi dark:stroke-parchment-hi'
// Callout text: big, with a parchment halo painted under the fill.
const TEXT_STYLE = (size: number) => `font-size: ${size}px; font-weight: 700; paint-order: stroke; stroke-width: 7px; stroke-linejoin: round`

// Per-tone look of badge, ring and text. Literal strings so UnoCSS sees them.
const BADGE: Partial<Record<Tone, string>> = {
  red: 'fill-trail stroke-ink-strong dark:fill-trail dark:stroke-ink-strong',
  amber: 'fill-gold stroke-ink-strong dark:fill-gold dark:stroke-ink-strong',
}
const BADGE_NUM: Partial<Record<Tone, string>> = {
  red: 'fill-parchment-hi dark:fill-parchment-hi',
  amber: 'fill-ink-strong dark:fill-page',
}
const RING: Partial<Record<Tone, string>> = {
  red: 'fill-trail/10 stroke-trail dark:fill-trail/20 dark:stroke-trail',
  amber: 'fill-gold/15 stroke-gold-deep dark:fill-gold/15 dark:stroke-gold',
}
const LABEL: Partial<Record<Tone, string>> = {
  red: TONE.red.label,
  amber: INK_FILL,
}

// The callout whose click is current; earlier callouts keep their text but
// lose the ring.
const current = computed(() => FIRST_POWER_CHECKS.find(c => c.at === s.value))

// Leader: a straight ink line from beside the text to the part, ending in a dot.
const leaders = FIRST_POWER_CHECKS.map(c => ({ at: c.at, d: `M ${c.from.x},${c.from.y} L ${c.target.x},${c.target.y}`, end: c.target }))

// PCB traces: a few thin copper lines between the parts, decoration only.
const TRACES = [
  `M ${FP_SCREEN.x + FP_SCREEN.w},${FP_SCREEN.y + 30} H ${FP_LORA.x}`,
  `M ${FP_SCREEN.x + FP_SCREEN.w},${FP_SCREEN.y + 60} H ${FP_LORA.x - 20} V ${FP_LORA.y + FP_LORA.h + 30} H ${FP_USB.x + 10} V ${FP_USB.y}`,
  `M ${FP_LORA.x + FP_LORA.w},${FP_ANT.y} H ${FP_ANT.x - 4}`,
  `M ${FP_BATT.x + FP_BATT.w},${FP_BATT.y + 10} H ${FP_LORA.x - 40} V ${FP_SCREEN.y + FP_SCREEN.h}`,
].join(' ')

// Stub antenna: rubber sleeve lying flat to the right of the SMA nut.
const STUB = { x: FP_ANT.x + 12, y: FP_ANT.y - FP_ANT.stubW / 2, w: FP_ANT.stubLen, h: FP_ANT.stubW }
const STUB_RIDGES = [18, 30, 42].map(dx => STUB.x + dx)

// Battery leads: from the two pins straight down out of the board, then a
// soft bend to the left, ending in a cut-off wire end. Red = +, black = −.
const PIN_PLUS = FP_BATT.x + 15
const PIN_MINUS = FP_BATT.x + FP_BATT.w - 15
const LEAD_Y = FP_BATT.y + FP_BATT.h
const leadPath = (x: number, drop: number) => `M ${x},${LEAD_Y} V ${LEAD_Y + drop} Q ${x},${LEAD_Y + drop + 22} ${x - 26},${LEAD_Y + drop + 22} H ${x - 110}`
</script>

<template>
  <div class="lora-viz w-full select-none overflow-hidden rounded-[10px] border-2 border-ink/70 dark:border-ink/70 shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
    <svg class="block w-full" :viewBox="`0 0 ${FP_W} ${FP_H}`" role="img" aria-label="LoRa платка отгоре: антена, модул 868, конектор за батерия, USB-C">
      <rect x="0" y="0" :width="FP_W" :height="FP_H" class="fill-parchment-hi dark:fill-parchment-hi" />

      <!-- soft highlight ring(s) on the part of the current click, under the drawing -->
      <g v-if="current">
        <ellipse
          v-for="(r, i) in current.rings" :key="`${current.part}-${i}`"
          :cx="r.x" :cy="r.y" :rx="r.rx" :ry="r.ry" stroke-dasharray="8 6"
          :class="RING[current.tone]" :style="w(3)"
        />
      </g>

      <!-- battery leads (under the board edge): ink halo, then red + / black − -->
      <g fill="none" stroke-linecap="round">
        <path :d="leadPath(PIN_PLUS, 16)" class="stroke-ink/60 dark:stroke-ink/70" :style="w(10)" />
        <path :d="leadPath(PIN_MINUS, 28)" class="stroke-ink/60 dark:stroke-ink/70" :style="w(10)" />
        <path :d="leadPath(PIN_PLUS, 16)" class="stroke-trail dark:stroke-trail" :style="w(6)" />
        <path :d="leadPath(PIN_MINUS, 28)" class="stroke-ink-strong dark:stroke-page" :style="w(6)" />
      </g>

      <!-- stub antenna on the SMA connector, lying flat to the right -->
      <g role="img" aria-label="antenna">
        <rect :x="FP_ANT.x - 4" :y="FP_ANT.y - 13" width="18" height="26" rx="3" :class="[TONE.amber.fill, OL]" :style="w(2)" />
        <rect :x="STUB.x" :y="STUB.y" :width="STUB.w" :height="STUB.h" :rx="STUB.h / 2" class="fill-ink-strong stroke-ink-strong dark:fill-stone dark:stroke-ink" :style="w(2)" />
        <path :d="STUB_RIDGES.map(x => `M ${x},${STUB.y + 4} V ${STUB.y + STUB.h - 4}`).join(' ')" class="stroke-parchment-hi/70 dark:stroke-ink/70" :style="w(2)" />
      </g>

      <!-- the PCB: green board, ink edge, copper traces -->
      <rect :x="B.x" :y="B.y" :width="B.w" :height="B.h" :rx="B.r" class="fill-moss/35 dark:fill-moss/25" :class="OL" :style="w(3)" />
      <path :d="TRACES" fill="none" class="stroke-gold-deep/60 dark:stroke-gold/50" :style="w(2.5)" stroke-linejoin="round" />

      <!-- mounting holes: gold ring, open centre -->
      <g v-for="(h, i) in FP_HOLES" :key="`hole-${i}`" aria-label="mounting hole">
        <circle :cx="h.x" :cy="h.y" r="9" :class="[TONE.amber.fill, OL]" :style="w(1.5)" />
        <circle :cx="h.x" :cy="h.y" r="4.5" class="fill-parchment-hi dark:fill-parchment-hi" />
      </g>

      <!-- small OLED screen with a few text lines -->
      <rect :x="FP_SCREEN.x" :y="FP_SCREEN.y" :width="FP_SCREEN.w" :height="FP_SCREEN.h" rx="6" class="fill-ink-strong stroke-ink-strong dark:fill-page dark:stroke-ink" :style="w(2)" />
      <path
        :d="[18, 36, 54, 72].map((dy, i) => `M ${FP_SCREEN.x + 14},${FP_SCREEN.y + dy} h ${i % 2 ? 70 : 108}`).join(' ')"
        class="stroke-water dark:stroke-water" :style="w(5)" stroke-linecap="round"
      />

      <!-- LoRa module: metal can marked 868 -->
      <rect :x="FP_LORA.x" :y="FP_LORA.y" :width="FP_LORA.w" :height="FP_LORA.h" rx="6" class="fill-stone/50 dark:fill-stone/80" :class="OL" :style="w(2.5)" />
      <rect :x="FP_LORA.x + 8" :y="FP_LORA.y + 8" :width="FP_LORA.w - 16" :height="FP_LORA.h - 16" rx="4" fill="none" class="stroke-ink/50 dark:stroke-ink/50" :style="w(1.5)" />
      <text :x="FP_LORA.x + FP_LORA.w / 2" :y="FP_LORA.y + 56" text-anchor="middle" :class="INK_FILL" style="font-size: 36px; font-weight: 800">868</text>
      <text :x="FP_LORA.x + FP_LORA.w / 2" :y="FP_LORA.y + 84" text-anchor="middle" :class="INK_FILL" style="font-size: 20px; font-weight: 700">LoRa</text>

      <!-- 2-pin battery connector with + / − silkscreen above the pins -->
      <rect :x="FP_BATT.x" :y="FP_BATT.y" :width="FP_BATT.w" :height="FP_BATT.h" rx="3" class="fill-parchment dark:fill-stone-deep" :class="OL" :style="w(2)" />
      <circle :cx="PIN_PLUS" :cy="FP_BATT.y + FP_BATT.h / 2" r="5" class="fill-trail dark:fill-trail" />
      <circle :cx="PIN_MINUS" :cy="FP_BATT.y + FP_BATT.h / 2" r="5" class="fill-ink-strong dark:fill-page" />
      <!-- silkscreen: + over the red pin, − over the black pin -->
      <text :x="PIN_PLUS" :y="FP_BATT.y - 8" text-anchor="middle" :class="INK_FILL" style="font-size: 28px; font-weight: 800">+</text>
      <text :x="PIN_MINUS" :y="FP_BATT.y - 8" text-anchor="middle" :class="INK_FILL" style="font-size: 28px; font-weight: 800">−</text>

      <!-- USB-C receptacle sticking out of the bottom edge -->
      <g aria-label="USB-C">
        <rect :x="FP_USB.x" :y="FP_USB.y" :width="FP_USB.w" :height="FP_USB.h" rx="10" class="fill-stone dark:fill-stone-deep" :class="OL" :style="w(2.5)" />
        <rect :x="FP_USB.x + 12" :y="FP_USB.y + 8" :width="FP_USB.w - 24" height="6" rx="3" class="fill-ink-strong dark:fill-page" />
      </g>

      <!-- callouts: leader, numbered badge, big text; one per click, they stay -->
      <g
        v-for="(c, i) in FIRST_POWER_CHECKS" :key="c.part"
        class="transition-opacity duration-500" :class="vis(s, c.at)"
      >
        <path :d="leaders[i].d" fill="none" :class="c.tone === 'red' ? TONE.red.stroke : 'stroke-ink-strong dark:stroke-ink-strong'" :style="w(3)" stroke-linecap="round" />
        <circle :cx="leaders[i].end.x" :cy="leaders[i].end.y" r="6" :class="c.tone === 'red' ? TONE.red.fill : INK_FILL" />
        <circle :cx="c.x" :cy="c.y" r="22" :class="BADGE[c.tone]" :style="w(2)" />
        <text :x="c.x" :y="c.y + 9" text-anchor="middle" :class="BADGE_NUM[c.tone]" style="font-size: 26px; font-weight: 800">{{ c.at }}</text>
        <text
          v-for="(ln, k) in calloutLines(c)" :key="ln"
          :x="c.x + 34" :y="c.y + 10 + k * c.size * 1.25"
          :class="[LABEL[c.tone], HALO]" :style="TEXT_STYLE(c.size)"
        >{{ ln }}</text>
      </g>
    </svg>
  </div>
</template>
