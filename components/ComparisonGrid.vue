<script setup lang="ts">
// Slides 51 „Лицензи“ and 52 („Кое да избера?“): three project columns,
// one per click; pros/cons adds a red „no interop“ footer on the next click.
import { computed } from 'vue'
import type { CompareColumn } from './data/comparison'
import { LICENSE_COLUMNS, PROSCONS_COLUMNS, PROSCONS_FOOTER } from './data/comparison'
import type { Tone } from './data/tones'
import { PROJECT_COLOUR, PROJECT_META, TONE } from './data/tones'
import { vis } from './data/format'
import { useStep } from './data/useStep'

const props = withDefaults(defineProps<{
  mode?: 'license' | 'proscons'
  columns?: CompareColumn[]
  footer?: { text: string, tone: Tone } | null
  step?: number
  startAt?: number
}>(), { mode: 'license' })

const cols = computed(() => props.columns ?? (props.mode === 'license' ? LICENSE_COLUMNS : PROSCONS_COLUMNS))
const foot = computed(() => (props.footer === undefined ? (props.mode === 'proscons' ? PROSCONS_FOOTER : null) : props.footer))
const total = (props.columns?.length ?? 3) + ((props.footer ?? (props.mode === 'proscons' ? PROSCONS_FOOTER : null)) ? 1 : 0)
const s = useStep(total, () => props.step, () => props.startAt ?? 0)
// Columns with a closed part, with their index so the row reveals with its column.
const closedCols = computed(() => cols.value.map((c, i) => ({ c, i })).filter(x => x.c.closed))
const colour = (c: CompareColumn) => PROJECT_COLOUR[PROJECT_META[c.project].colour]
</script>

<template>
  <div class="lora-viz w-full">
    <div class="grid grid-cols-3 gap-5">
      <div
        v-for="(c, i) in cols" :key="c.project"
        class="flex flex-col gap-3 rounded-xl border-2 bg-parchment p-5 transition-opacity duration-500 dark:bg-parchment"
        :class="[colour(c).border, vis(s, i + 1)]"
      >
        <div class="flex items-center gap-2 text-2xl font-bold" :class="colour(c).text">
          <carbon-license v-if="mode === 'license'" class="shrink-0" />
          {{ PROJECT_META[c.project].name }}
        </div>
        <span v-if="c.status" class="self-start rounded-full border px-3 py-0.5 text-lg font-semibold" :class="[TONE[c.status.tone].soft, TONE[c.status.tone].border, TONE[c.status.tone].text]">{{ c.status.text }}</span>
        <div v-for="l in c.lines ?? []" :key="l" class="flex gap-2 text-lg leading-snug"><span data-bullet class="font-bold" :class="colour(c).text">•</span><span>{{ l }}</span></div>
        <div v-for="p in c.pros ?? []" :key="`p-${p}`" class="flex gap-2 text-xl"><span class="font-bold" :class="TONE.emerald.text">+</span>{{ p }}</div>
        <div v-for="m in c.cons ?? []" :key="`m-${m}`" class="flex gap-2 text-xl"><span class="font-bold" :class="TONE.red.text">−</span>{{ m }}</div>
      </div>
    </div>
    <!-- Closed part of a project: too long for its card, so it gets a full-width
         row under the grid, outlined in the project colour, shown with its column.
         It names the project and a short line links it up to that card. -->
    <div
      v-for="{ c, i } in closedCols" :key="`closed-${c.project}`" data-closed
      class="relative mt-3 flex flex-col gap-1.5 rounded-xl border-2 px-5 py-2 text-lg leading-snug transition-opacity duration-500"
      :class="[TONE.red.soft, colour(c).border, vis(s, i + 1)]"
    >
      <!-- Connector across the mt-3 gap. Column i of 3 has its centre at (2i+1)/6 of the width. -->
      <div data-closed-link class="absolute -top-[14px] h-3 w-1 -translate-x-1/2 rounded-full" :class="colour(c).bg" :style="{ left: `${((2 * i + 1) / 6) * 100}%` }" />
      <div class="flex items-center gap-2 font-semibold" :class="TONE.red.text"><carbon-locked class="shrink-0" /><span data-closed-project :class="colour(c).text">{{ PROJECT_META[c.project].name }}:</span>{{ c.closed!.title }}</div>
      <!-- One sub-card per detail, side by side: small label on top, text below. -->
      <div class="grid gap-3" :style="{ gridTemplateColumns: `repeat(${c.closed!.details.length}, minmax(0, 1fr))` }">
        <div v-for="d in c.closed!.details" :key="d.label" data-closed-card class="flex flex-col rounded-lg border bg-parchment px-3 py-1 dark:bg-parchment" :class="TONE.red.border">
          <span class="text-sm font-semibold uppercase leading-tight tracking-wide" :class="TONE.red.text">{{ d.label }}</span>
          <span>{{ d.text }}</span>
        </div>
      </div>
    </div>
    <!-- Footer: broken links. Same 3-column grid as the cards, so each radio sits under its card.
         The link svg spans from one radio edge to the next (cell width + gap 20px - 2 x 22px). -->
    <div v-if="foot" data-broken-links class="mt-5 flex flex-col items-center gap-2 transition-opacity duration-500" :class="vis(s, cols.length + 1)">
      <div class="grid w-full grid-cols-3 gap-5">
        <div v-for="(c, i) in cols" :key="`radio-${c.project}`" data-radio class="relative flex h-14 items-center justify-center">
          <!-- Radio: whip, rounded body, screen. Body 24 x 36, whip 12 tall. -->
          <svg viewBox="0 0 24 50" class="h-12 w-auto overflow-visible">
            <line x1="18" y1="0" x2="18" y2="14" stroke-width="2.5" stroke-linecap="round" :class="colour(c).stroke" />
            <rect x="2" y="14" width="20" height="34" rx="5" stroke-width="2.5" class="fill-parchment" :class="colour(c).stroke" />
            <rect x="6" y="19" width="12" height="9" rx="1.5" :class="colour(c).fill" style="fill-opacity: 0.35" />
            <circle cx="12" cy="38" r="2.5" :class="colour(c).fill" />
          </svg>
          <!-- Dashed link to the next radio, cut in the middle by a red cross. -->
          <svg v-if="i < cols.length - 1" data-link class="absolute top-1/2 h-6 -translate-y-1/2 overflow-visible" style="left: calc(50% + 22px); width: calc(100% + 20px - 44px)">
            <line x1="0" y1="12" x2="44%" y2="12" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round" :class="TONE.red.stroke" style="stroke-opacity: 0.7" />
            <line x1="56%" y1="12" x2="100%" y2="12" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round" :class="TONE.red.stroke" style="stroke-opacity: 0.7" />
            <text x="50%" y="12" text-anchor="middle" dominant-baseline="central" font-weight="700" :class="TONE.red.label" style="font-size: 26px">✕</text>
          </svg>
        </div>
      </div>
      <div class="text-2xl font-semibold" :class="TONE[foot.tone].text">{{ foot.text }}</div>
    </div>
  </div>
</template>
