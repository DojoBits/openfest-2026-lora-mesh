<script setup lang="ts">
// Slide „От какво се нуждае IoT“: the IoT radio problem as a Venn diagram.
// Three overlapping map circles, each in its own token: „малко ток“ (moss),
// „обхват“ (water), „цена“ (gold). Fills are translucent, so the overlaps
// blend into mixed tints. Each circle carries its medallion (battery, peaks,
// coin) inside its own outer lobe, and its label just outside its edge. Every
// technology has two of the three, so its badge lands in the lens of exactly
// those two circles; the medallions mark ✓ (moss) or ✗ (trail) for it while it
// is on stage, and it joins the verdict list on the right with what it lacks,
// and stays there:
//   click 1  Bluetooth  малко ток ∩ цена     → „малък обхват“
//   click 2  Wi-Fi      обхват ∩ цена        → „висока консумация“
//   click 3  LTE / 5G   обхват ∩ малко ток   → „SIM и абонамент“
//            (low power via its IoT variants NB-IoT and LTE-M)
//   click 4  the empty centre („?“ until now) gets a gold LoRa medallion with
//            a soft halo: the one radio with all three.
// Geometry and judging live in data/loraOrigin.ts (VENN, VENN_LOBES,
// vennRegion, cornerState, tested). Every state is its own stacked layer
// revealed by opacity, never a colour swap. Print/PDF and a pinned `step`
// drop the transitions.
import { useNav } from '@slidev/client'
import { CONTENDERS, CORNERS, LORA_AT, TRADEOFF_CLICKS, VENN, VENN_LOBES, cornerState, vennRegion } from './data/loraOrigin'
import type { Corner } from './data/loraOrigin'
import { useStep } from './data/useStep'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(TRADEOFF_CLICKS, () => props.step, () => props.startAt ?? 0)
const { isPrintMode } = useNav()
const still = props.step !== undefined || isPrintMode.value

const C = VENN.centres
const R = VENN.r
const MED = Object.fromEntries(CORNERS.map(k => [k.id, VENN_LOBES[k.id].med])) as Record<Corner, { x: number, y: number }>
const LAB = Object.fromEntries(CORNERS.map(k => [k.id, VENN_LOBES[k.id].label])) as Record<Corner, { x: number, y: number }>
const centre = vennRegion(['power', 'range', 'cost'])

// Per-circle colour classes, written out in full so UnoCSS extracts them (a
// class built from a binding is never generated). Text uses gold-deep: plain
// gold is too pale as text on parchment. Tokens swap by themselves in dark.
const TONE_CLS = {
  moss: { fill: 'fill-moss dark:fill-moss', stroke: 'stroke-moss dark:stroke-moss', text: 'fill-moss dark:fill-moss' },
  water: { fill: 'fill-water dark:fill-water', stroke: 'stroke-water dark:stroke-water', text: 'fill-water dark:fill-water' },
  gold: { fill: 'fill-gold dark:fill-gold', stroke: 'stroke-gold dark:stroke-gold', text: 'fill-gold-deep dark:fill-gold-deep' },
} as const

const MR = 26
const on = (c: Corner, st: 'ok' | 'fail') => (cornerState(s.value, c) === st ? 'opacity-100' : 'opacity-0')
const badge = Object.fromEntries(CONTENDERS.map(c => [c.id, vennRegion(c.pair)]))
// Verdict rows on the right, one per technology.
const rowY = (i: number) => 92 + i * 104
// Wi-Fi arcs above a dot at (0, 14): radius r, ±45° about straight up.
const arcs = [9, 18, 27].map(r => `M${(-r * Math.SQRT1_2).toFixed(1)} ${(14 - r * Math.SQRT1_2).toFixed(1)} A${r} ${r} 0 0 1 ${(r * Math.SQRT1_2).toFixed(1)} ${(14 - r * Math.SQRT1_2).toFixed(1)}`)
// LTE / 5G: four rising signal bars, bottoms on y = 18.
const bars = [0, 1, 2, 3].map(i => ({ x: -16 + i * 9, h: 10 + i * 8 }))
</script>

<template>
  <div class="lora-viz w-full select-none" :class="{ 'trade-still': still }">
    <svg viewBox="0 0 900 400" class="w-full" role="img" aria-label="Диаграма на Вен: малко ток, обхват, цена. Bluetooth, Wi-Fi и LTE / 5G имат по две от трите; LoRa е в средата">
      <!-- radio glyphs, drawn once and reused: centred on (0, 0), about 60 px -->
      <defs>
        <g id="rt-wifi">
          <circle cx="0" cy="14" r="4" class="fill-ink dark:fill-ink" />
          <path v-for="d in arcs" :key="d" :d="d" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 4; stroke-linecap: round" />
        </g>
        <!-- Bluetooth: the bind-rune of ᚼ and ᛒ -->
        <path id="rt-bluetooth" d="M-10 -9 L10 9 L0 19 L0 -19 L10 -9 L-10 9" fill="none" class="stroke-ink dark:stroke-ink" style="stroke-width: 4; stroke-linecap: round; stroke-linejoin: round" />
        <!-- LTE / 5G: signal-strength bars -->
        <g id="rt-cellular">
          <rect v-for="b in bars" :key="b.x" :x="b.x" :y="18 - b.h" width="6" :height="b.h" rx="1.5" class="fill-ink dark:fill-ink" />
        </g>
      </defs>

      <!-- ── Venn: translucent tinted circles (overlaps blend), solid coloured edges ── -->
      <circle
        v-for="k in CORNERS" :key="`f-${k.id}`" :cx="C[k.id].x" :cy="C[k.id].y" :r="R"
        class="stroke-none" :class="TONE_CLS[k.tone].fill" style="fill-opacity: 0.22"
      />
      <circle
        v-for="k in CORNERS" :key="`e-${k.id}`" :cx="C[k.id].x" :cy="C[k.id].y" :r="R" fill="none"
        :class="TONE_CLS[k.tone].stroke" style="stroke-width: 3.5"
      />

      <!-- ── Medallions: glyph, ring in the circle's colour, ✗ ring and ✓ / ✗ mark ── -->
      <g v-for="k in CORNERS" :key="k.id" :transform="`translate(${MED[k.id].x} ${MED[k.id].y})`">
        <circle :r="MR" class="fill-parchment-hi dark:fill-parchment-hi" />
        <circle :r="MR" fill="none" :class="TONE_CLS[k.tone].stroke" style="stroke-width: 3.5" />
        <circle :r="MR" fill="none" class="stroke-trail transition-opacity duration-500 dark:stroke-trail" :class="on(k.id, 'fail')" style="stroke-width: 5" />
        <!-- battery -->
        <g v-if="k.id === 'power'" class="stroke-ink dark:stroke-ink" fill="none" style="stroke-width: 2.5; stroke-linejoin: round">
          <rect x="-8" y="-12" width="16" height="26" rx="3" />
          <rect x="-3.5" y="-16" width="7" height="4" rx="1" class="fill-ink dark:fill-ink" />
          <rect x="-5" y="2" width="10" height="9" rx="1" class="fill-moss stroke-none dark:fill-moss" />
        </g>
        <!-- distance: two inked peaks with a flag on the far one -->
        <g v-else-if="k.id === 'range'" class="stroke-ink dark:stroke-ink" fill="none" style="stroke-width: 2.5; stroke-linejoin: round; stroke-linecap: round">
          <path d="M-17 11 L-6 -5 L1 5 L8 -4 L18 11" />
          <path d="M8 -4 V-16 L15 -13 L8 -10" class="fill-trail dark:fill-trail" />
        </g>
        <!-- cost: a coin -->
        <g v-else class="stroke-ink dark:stroke-ink" style="stroke-width: 2.5">
          <circle r="13" class="fill-gold/40 dark:fill-gold/40" />
          <text y="7" text-anchor="middle" class="fill-ink-strong stroke-none dark:fill-ink-strong" style="font-size: 18px; font-weight: 800">€</text>
        </g>
        <!-- ✓ / ✗ mark, top right of the medallion -->
        <g transform="translate(21 -21)">
          <g class="transition-opacity duration-500" :class="on(k.id, 'ok')">
            <circle r="12" class="fill-moss dark:fill-moss" />
            <path d="M-6 0 L-2 5 L6 -5" fill="none" class="stroke-page dark:stroke-page" style="stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round" />
          </g>
          <g class="transition-opacity duration-500" :class="on(k.id, 'fail')">
            <circle r="12" class="fill-trail dark:fill-trail" />
            <path d="M-5 -5 L5 5 M5 -5 L-5 5" fill="none" class="stroke-page dark:stroke-page" style="stroke-width: 3.5; stroke-linecap: round" />
          </g>
        </g>
      </g>
      <!-- labels: just outside each circle's outer edge, in the circle's colour -->
      <text
        v-for="k in CORNERS" :key="`l-${k.id}`" :x="LAB[k.id].x" :y="LAB[k.id].y" text-anchor="middle"
        :class="TONE_CLS[k.tone].text"
        style="font-size: 28px; font-weight: 700; font-style: italic; font-family: Georgia, 'Palatino Linotype', Palatino, serif"
      >{{ k.label }}</text>

      <!-- ── Centre halo (last click), drawn under the badges ── -->
      <g :transform="`translate(${centre.x} ${centre.y})`" class="transition-opacity duration-700" :class="s >= LORA_AT ? 'opacity-100' : 'opacity-0'">
        <circle r="54" class="fill-gold dark:fill-gold" style="fill-opacity: 0.18" />
        <circle r="44" class="fill-gold dark:fill-gold" style="fill-opacity: 0.3" />
      </g>

      <!-- ── Badges: each technology lands in its two-circle lens and stays ── -->
      <g
        v-for="c in CONTENDERS" :key="`b-${c.id}`" :transform="`translate(${badge[c.id].x} ${badge[c.id].y})`"
        class="transition-opacity duration-500" :class="s >= c.at ? 'opacity-100' : 'opacity-0'"
      >
        <circle r="27" class="fill-parchment-hi stroke-ink dark:fill-parchment-hi dark:stroke-ink" style="stroke-width: 2.5" />
        <use :href="`#rt-${c.id}`" transform="scale(0.8)" />
      </g>

      <!-- ── Centre: „?“ until LoRa lands there ── -->
      <g :transform="`translate(${centre.x} ${centre.y})`">
        <g class="transition-opacity duration-500" :class="s < LORA_AT ? 'opacity-100' : 'opacity-0'">
          <circle r="22" class="fill-page stroke-ink dark:fill-page dark:stroke-ink" style="stroke-width: 2; stroke-dasharray: 5 4" />
          <text y="11" text-anchor="middle" class="fill-ink-strong dark:fill-ink-strong" style="font-size: 30px; font-weight: 800">?</text>
        </g>
        <g class="transition-opacity duration-700" :class="s >= LORA_AT ? 'opacity-100' : 'opacity-0'">
          <circle r="33" class="fill-gold stroke-trail dark:fill-gold dark:stroke-trail" style="stroke-width: 3.5" />
          <text y="8" text-anchor="middle" class="fill-ink-strong dark:fill-page" style="font-size: 22px; font-weight: 800">LoRa</text>
        </g>
      </g>

      <!-- ── Verdict list: each radio stays with what it lacks ── -->
      <g v-for="(c, i) in CONTENDERS" :key="`v-${c.id}`" class="transition-opacity duration-500" :class="s >= c.at ? 'opacity-100' : 'opacity-0'">
        <g :transform="`translate(540 ${rowY(i)})`">
          <circle r="34" class="fill-parchment-hi stroke-trail dark:fill-parchment-hi dark:stroke-trail" style="stroke-width: 3" />
          <use :href="`#rt-${c.id}`" />
        </g>
        <text x="590" :y="rowY(i) - 4" class="fill-ink-strong dark:fill-ink-strong" style="font-size: 30px; font-weight: 700">{{ c.name }}</text>
        <text x="590" :y="rowY(i) + 30" class="fill-trail dark:fill-trail" style="font-size: 26px; font-weight: 600">✗ {{ c.verdict }}</text>
      </g>
      <text
        x="506" y="388" class="fill-gold-deep transition-opacity duration-500 dark:fill-gold-deep" :class="s >= LORA_AT ? 'opacity-100' : 'opacity-0'"
        style="font-size: 30px; font-weight: 700"
      >LoRa покрива и трите</text>
    </svg>
  </div>
</template>

<style scoped>
.trade-still * {
  transition: none !important;
}
</style>
