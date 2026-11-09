<script setup lang="ts">
// Slide „Ограничения“: six points in two blocks, one click each (clicks 1 to 3
// for the air block, 4 to 6 for the legal block). Nothing shows before its click.
// Air block visual: one hour as a strip, the usable 10 % slice highlighted
// (appears with click 2), an SMS tick inside it for scale, and on click 3 a
// small noisy radio whose transmissions fill the whole slice.
// Radio links are dashed. All numbers come from data/limits.ts.
import { computed } from 'vue'
import { AIR_HEADING, AIR_ITEMS, HOUR, LEGAL_HEADING, LEGAL_ITEMS, LEGEND_FULL, LEGEND_PARTLY, LIMIT_PROJECTS, LIMIT_PROJECT_NAMES, LIMITS_CLICKS } from './data/limits'
import { vis } from './data/format'
import { PROJECT_COLOUR } from './data/tones'
import { useStep } from './data/useStep'

const props = defineProps<{ step?: number }>()
const s = useStep(LIMITS_CLICKS, () => props.step)

// Project name colours for the legend, same mapping as ProjectMarker.
const NAME_TEXT = { meshtastic: PROJECT_COLOUR.cyan.text, meshcore: PROJECT_COLOUR.indigo.text, reticulum: PROJECT_COLOUR.fuchsia.text }

// Slice width in percent of the hour strip.
const slicePct = computed(() => HOUR.dutyPct)
// Transmission ticks that fill the slice once the noisy node talks.
const ticks = Array.from({ length: 16 }, (_, i) => i)
</script>

<template>
  <div class="lora-viz grid w-full grid-cols-[1.5fr_1fr] gap-6">
    <!-- Block A: air -->
    <section class="card-surface rounded-xl border px-5 py-3">
      <h3 class="m-0 mb-3 text-2xl font-bold text-water dark:text-water">{{ AIR_HEADING }}</h3>

      <div class="flex items-center gap-3 text-xl transition-opacity duration-500" :class="vis(s, AIR_ITEMS[0].at)">
        <carbon-text-short-paragraph class="shrink-0 text-4xl text-water dark:text-water" />
        <span>{{ AIR_ITEMS[0].label }}</span>
        <span class="ml-auto flex shrink-0 gap-1"><ProjectMarker v-for="(lvl, k) in AIR_ITEMS[0].applies" :key="k" :project="LIMIT_PROJECTS[k]" :level="lvl" /></span>
      </div>
      <div class="mt-2 flex items-center gap-3 text-xl transition-opacity duration-500" :class="vis(s, AIR_ITEMS[1].at)">
        <carbon-time class="shrink-0 text-4xl text-water dark:text-water" />
        <span>{{ AIR_ITEMS[1].label }}</span>
        <span class="ml-auto flex shrink-0 gap-1"><ProjectMarker v-for="(lvl, k) in AIR_ITEMS[1].applies" :key="k" :project="LIMIT_PROJECTS[k]" :level="lvl" /></span>
      </div>
      <div class="mt-2 flex items-center gap-3 text-xl transition-opacity duration-500" :class="vis(s, AIR_ITEMS[2].at)">
        <carbon-volume-up class="shrink-0 text-4xl text-trail dark:text-trail" />
        <span>{{ AIR_ITEMS[2].label }}</span>
        <span class="ml-auto flex shrink-0 gap-1"><ProjectMarker v-for="(lvl, k) in AIR_ITEMS[2].applies" :key="k" :project="LIMIT_PROJECTS[k]" :level="lvl" /></span>
      </div>

      <!-- One hour as a thin strip, zoomed into its usable slice. Appears with click 2. -->
      <div class="relative mt-2 h-[176px] transition-opacity duration-500" :class="vis(s, AIR_ITEMS[1].at)">
        <!-- left column: strip and zoom box share this width, the radio sits to the right -->
        <div class="absolute bottom-0 left-0 right-[92px] top-0">
          <div class="absolute right-0 top-0 whitespace-nowrap text-xl text-stone-deep dark:text-stone-deep">{{ HOUR.hourLabel }}</div>
          <div class="absolute left-0 right-0 top-[28px] h-[14px] overflow-hidden rounded-sm border-2 border-edge/70 bg-parchment-hi dark:bg-parchment-hi">
            <div class="absolute inset-y-0 left-0 bg-gold dark:bg-gold" :style="{ width: `${slicePct}%` }" />
          </div>
          <!-- dashed zoom lines from the slice edges down to the wide box -->
          <svg class="absolute left-0 top-[42px] h-[48px] w-full overflow-visible" aria-hidden="true">
            <line x1="0" y1="0" x2="0" y2="48" class="stroke-gold-deep dark:stroke-gold-deep" stroke-width="2.5" stroke-dasharray="5 5" />
            <line :x1="`${slicePct}%`" y1="0" x2="100%" y2="48" class="stroke-gold-deep dark:stroke-gold-deep" stroke-width="2.5" stroke-dasharray="5 5" />
          </svg>
          <div class="absolute left-[12px] top-[60px] whitespace-nowrap text-xl font-bold text-gold-deep dark:text-gold-deep">{{ HOUR.dutyPct }} % = {{ HOUR.sliceLabel }}</div>
          <!-- zoom box: the 6 minute slice -->
          <div class="absolute left-0 right-0 top-[90px] h-[50px] overflow-hidden rounded border-2 border-gold-deep bg-gold/25 dark:border-gold-deep dark:bg-gold/25">
            <!-- SMS block: 5,9 s of 360 s, a thin bar at the left edge of the box -->
            <div class="absolute inset-y-0 left-0 w-[6px] bg-water dark:bg-water" />
            <!-- noisy node: transmissions fill the box (click 3) -->
            <div v-for="t in ticks" :key="t" class="absolute inset-y-[5px] w-[5px] rounded-sm bg-trail transition-opacity duration-500 dark:bg-trail" :class="vis(s, AIR_ITEMS[2].at)" :style="{ left: `calc(${(t + 0.5) / ticks.length * 100}% - 2px)` }" />
          </div>
          <!-- label sits right under the SMS bar it names -->
          <div class="absolute left-0 top-[142px] whitespace-nowrap text-xl font-bold text-water dark:text-water">{{ HOUR.smsLabel }}</div>
        </div>
        <!-- small handheld radio beside the zoom box, dashed link into it (click 3) -->
        <svg viewBox="0 0 90 50" class="absolute right-0 top-[90px] h-[50px] w-[90px] overflow-visible transition-opacity duration-500" :class="vis(s, AIR_ITEMS[2].at)" aria-hidden="true">
          <line x1="0" y1="31" x2="52" y2="31" stroke-width="3" stroke-dasharray="5 5" stroke-linecap="round" class="stroke-trail dark:stroke-trail" />
          <line x1="76" y1="0" x2="76" y2="14" stroke-width="2.5" stroke-linecap="round" class="stroke-water dark:stroke-water" />
          <rect x="58" y="14" width="20" height="34" rx="5" stroke-width="2.5" class="fill-parchment stroke-water dark:fill-parchment dark:stroke-water" />
          <rect x="62" y="19" width="12" height="9" rx="1.5" class="fill-water dark:fill-water" style="fill-opacity: 0.35" />
          <circle cx="68" cy="38" r="2.5" class="fill-trail dark:fill-trail" />
        </svg>
      </div>
    </section>

    <!-- Block B: law and privacy -->
    <section class="card-surface flex flex-col rounded-xl border px-5 py-3">
      <h3 class="m-0 mb-3 text-2xl font-bold text-dusk dark:text-dusk">{{ LEGAL_HEADING }}</h3>
      <div class="flex flex-1 flex-col justify-around gap-3 leading-snug">
        <div class="flex items-center gap-4 text-xl transition-opacity duration-500" :class="vis(s, LEGAL_ITEMS[0].at)">
          <carbon-view class="shrink-0 text-6xl text-dusk dark:text-dusk" />
          <div>
            <div>{{ LEGAL_ITEMS[0].label }}</div>
            <div class="mt-1 flex gap-1"><ProjectMarker v-for="(lvl, k) in LEGAL_ITEMS[0].applies" :key="k" :project="LIMIT_PROJECTS[k]" :level="lvl" /></div>
          </div>
        </div>
        <div class="flex items-center gap-4 text-xl transition-opacity duration-500" :class="vis(s, LEGAL_ITEMS[1].at)">
          <carbon-cell-tower class="shrink-0 text-6xl text-dusk dark:text-dusk" />
          <div>
            <div>{{ LEGAL_ITEMS[1].label }}</div>
            <div class="mt-1 flex gap-1"><ProjectMarker v-for="(lvl, k) in LEGAL_ITEMS[1].applies" :key="k" :project="LIMIT_PROJECTS[k]" :level="lvl" /></div>
          </div>
        </div>
        <div class="flex items-center gap-4 text-xl transition-opacity duration-500" :class="vis(s, LEGAL_ITEMS[2].at)">
          <carbon-certificate class="shrink-0 text-6xl text-dusk dark:text-dusk" />
          <div>
            <div>{{ LEGAL_ITEMS[2].label }}</div>
            <div class="mt-1 flex gap-1"><ProjectMarker v-for="(lvl, k) in LEGAL_ITEMS[2].applies" :key="k" :project="LIMIT_PROJECTS[k]" :level="lvl" /></div>
          </div>
        </div>
      </div>
      <!-- legend, shown from the start -->
      <div class="mt-2 flex flex-col items-end gap-1 text-base">
        <div class="flex gap-3">
          <span v-for="p in LIMIT_PROJECTS" :key="p" class="font-bold" :class="NAME_TEXT[p]">{{ LIMIT_PROJECT_NAMES[p] }}</span>
        </div>
        <div class="flex items-center gap-2 text-stone-deep dark:text-stone-deep">
          <ProjectMarker level="full" /><span>{{ LEGEND_FULL }}</span>
          <ProjectMarker level="partly" class="ml-2" /><span>{{ LEGEND_PARTLY }}</span>
        </div>
      </div>
    </section>
  </div>
</template>
