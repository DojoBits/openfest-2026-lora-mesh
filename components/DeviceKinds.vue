<script setup lang="ts">
// Slide 22 „Готови устройства“: four ready-made device types as a 2×2 card
// grid, one card per click (texts: data/readyDevices.ts, tested):
//   1 tracker  — credit-card-size dark box, lanyard slot, one button;
//   2 keyboard — screen on top, key grid below, stub antenna;
//   3 solar    — weatherproof box on a pole, antenna, tilted solar panel;
//   4 base     — desktop box, big antenna, cable.
// Cards are joined by dotted lines (a mesh feel) with a small radio glyph at
// each outer edge; the lines are absolutely positioned in the grid gaps.
// Every SVG font-size / fill-opacity would sit in style="" (attributify trap);
// the drawings need none, the badge numbers use a style.
import { useStep } from './data/useStep'
import { vis } from './data/format'
import { READY_DEVICES } from './data/readyDevices'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(READY_DEVICES.length, () => props.step, () => props.startAt ?? 0)

// Shared stroke look for all four drawings.
const LINE = 'fill-none stroke-ink-strong dark:stroke-ink-strong'
</script>

<template>
  <div class="lora-viz relative w-full select-none">
    <div class="grid grid-cols-2 gap-x-8 gap-y-6">
      <div
        v-for="(d, i) in READY_DEVICES"
        :key="d.id"
        class="card-surface relative flex items-center gap-2 rounded-xl border px-3 py-2 transition-opacity duration-500"
        :class="vis(s, d.at)"
      >
        <!-- dotted link to the neighbour on the right / below, drawn from the left / top card -->
        <div v-if="i % 2 === 0" class="absolute -right-8 top-1/2 w-8 border-t-2 border-dotted border-edge/70 dark:border-edge/70" />
        <div v-if="i < 2" class="absolute -bottom-6 left-1/2 h-6 border-l-2 border-dotted border-edge/70 dark:border-edge/70" />
        <!-- radio glyph at the outer edge of each row -->
        <carbon-wifi v-if="i % 2 === 0" class="absolute -left-9 top-1/2 -translate-y-1/2 text-2xl opacity-40" />
        <carbon-wifi v-else class="absolute -right-9 top-1/2 -translate-y-1/2 text-2xl opacity-40" />

        <svg class="shrink-0" width="116" height="116" viewBox="0 0 150 150" role="img" :aria-label="d.title">
          <circle cx="75" cy="75" r="70" class="fill-water/20 dark:fill-water/20" />

          <!-- 1 · tracker: dark card-size box, lanyard slot on top, one button -->
          <g v-if="d.id === 'tracker'" :class="LINE" style="stroke-width: 3" stroke-linecap="round" stroke-linejoin="round">
            <rect x="46" y="28" width="58" height="94" rx="10" class="fill-ink-strong stroke-ink-strong dark:fill-stone-deep dark:stroke-ink-strong" />
            <rect x="65" y="34" width="20" height="7" rx="3.5" class="fill-parchment stroke-none dark:fill-parchment" />
            <rect x="54" y="48" width="42" height="30" rx="4" class="fill-moss/60 stroke-none dark:fill-moss/60" />
            <circle cx="75" cy="100" r="9" class="fill-gold stroke-none dark:fill-gold" />
            <path d="M75 28 V14 Q75 8 82 8 H96" class="stroke-stone dark:stroke-stone" />
          </g>

          <!-- 2 · keyboard: screen above, 4×3 key grid below, stub antenna -->
          <g v-else-if="d.id === 'keyboard'" :class="LINE" style="stroke-width: 3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M104 40 V16" />
            <rect x="34" y="34" width="82" height="86" rx="10" class="fill-ink-strong stroke-ink-strong dark:fill-stone-deep dark:stroke-ink-strong" />
            <rect x="42" y="42" width="66" height="32" rx="3" class="fill-moss/60 stroke-none dark:fill-moss/60" />
            <g class="fill-parchment stroke-none dark:fill-parchment">
              <template v-for="r in 3" :key="r">
                <rect v-for="c in 5" :key="c" :x="40 + (c - 1) * 13" :y="80 + (r - 1) * 12" width="10" height="8" rx="2" />
              </template>
            </g>
          </g>

          <!-- 3 · solar node: pole, weatherproof box, antenna, tilted panel -->
          <g v-else-if="d.id === 'solar'" :class="LINE" style="stroke-width: 3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M61 140 V90" class="stroke-stone dark:stroke-stone" style="stroke-width: 5" />
            <path d="M52 62 V22" />
            <rect x="40" y="62" width="42" height="30" rx="5" class="fill-ink-strong stroke-ink-strong dark:fill-stone-deep dark:stroke-ink-strong" />
            <circle cx="61" cy="77" r="4" class="fill-gold stroke-none dark:fill-gold" />
            <path d="M82 70 L92 60 M78 44 L124 58 L132 38 L86 24 Z" class="fill-water stroke-ink-strong dark:fill-water dark:stroke-ink-strong" />
            <path d="M84 33 L129 48 M81 38.5 L127 53" class="stroke-parchment dark:stroke-parchment" style="stroke-width: 1.5" />
          </g>

          <!-- 4 · base station: desktop box, big antenna, cable to the left -->
          <g v-else :class="LINE" style="stroke-width: 3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M104 88 V14" />
            <rect x="26" y="88" width="88" height="34" rx="7" class="fill-ink-strong stroke-ink-strong dark:fill-stone-deep dark:stroke-ink-strong" />
            <circle cx="42" cy="105" r="4" class="fill-moss stroke-none dark:fill-moss" />
            <circle cx="56" cy="105" r="4" class="fill-gold stroke-none dark:fill-gold" />
            <path d="M26 108 Q10 108 10 124 V136" class="stroke-stone dark:stroke-stone" style="stroke-width: 4" />
          </g>

          <!-- number badge on the backdrop's upper-left rim -->
          <g transform="translate(26 26)">
            <circle r="15" class="fill-gold stroke-ink-strong dark:fill-gold dark:stroke-ink-strong" style="stroke-width: 2" />
            <text text-anchor="middle" y="7" class="fill-ink-strong dark:fill-ink-strong" style="font-size: 20px; font-weight: 700">{{ d.at }}</text>
          </g>
        </svg>

        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <div class="text-3xl font-bold leading-tight">{{ d.title }}</div>
          <div class="text-2xl leading-snug">{{ d.use }}</div>
          <div class="text-lg opacity-70">{{ d.example }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
