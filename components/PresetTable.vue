<script setup lang="ts">
// Slide 32 „Какво е preset“: the six EU_868 modem presets as one table.
//  - click 1 (knobs): only the SF / BW / CR headers, each with a gloss.
//  - click 2 (rows): the six presets, each a row of SF / BW / CR values.
//  - click 3 (effects): kbps, relative airtime bars, sensitivity in dBm.
//  - click 4 (sofia): Sofia's row highlighted, city tags, footer line.
// Columns: preset, SF, BW, CR, kbps, dBm, then airtime last so the bar
// and the city chip get the free width. All rows share one grid template so the columns line up. Bars are scaled
// to the slowest preset and capped at 70 % of the cell so its label fits.
import { MODEM_PRESETS, PRESET_STEPS } from './data/modemPresets'
import { vis } from './data/format'
import { useStep } from './data/useStep'

const props = defineProps<{ step?: number }>()
const s = useStep(PRESET_STEPS.total, () => props.step)

const maxX = Math.max(...MODEM_PRESETS.map(p => p.airtimeX))
const barWidth = (x: number) => `${(x / maxX) * 70}%`

const KNOBS = [
  { label: 'SF', gloss: 'дължина на chirp' },
  { label: 'BW', gloss: 'ширина на лентата' },
  { label: 'CR', gloss: 'резерв за поправка' },
]
</script>

<template>
  <div class="flex flex-col gap-1 text-lg">
    <!-- header: knobs first, effect columns later -->
    <div class="grid grid-cols-[135px_90px_100px_90px_60px_80px_1fr] items-end gap-x-2 border-b-2 border-stone/60 pb-1 leading-tight dark:border-stone/60">
      <div class="text-stone-deep transition-opacity duration-500 dark:text-stone-deep" :class="vis(s, PRESET_STEPS.rows)">preset</div>
      <div
        v-for="k in KNOBS" :key="k.label"
        class="flex flex-col items-center text-center transition-opacity duration-500" :class="vis(s, PRESET_STEPS.knobs)"
      >
        <span class="font-mono text-xl font-bold text-ink dark:text-ink">{{ k.label }}</span>
        <span class="text-base text-stone-deep dark:text-stone-deep">{{ k.gloss }}</span>
      </div>
      <div class="text-center text-stone-deep transition-opacity duration-500 dark:text-stone-deep" :class="vis(s, PRESET_STEPS.effects)">kbps</div>
      <div class="text-center text-stone-deep transition-opacity duration-500 dark:text-stone-deep" :class="vis(s, PRESET_STEPS.effects)">чува до, dBm</div>
      <div class="pl-2 text-stone-deep transition-opacity duration-500 dark:text-stone-deep" :class="vis(s, PRESET_STEPS.effects)">време в ефира</div>
    </div>

    <!-- one row per preset -->
    <div
      v-for="p in MODEM_PRESETS" :key="p.key"
      class="grid grid-cols-[135px_90px_100px_90px_60px_80px_1fr] items-center gap-x-2 rounded-lg border-2 px-0 py-0.5 transition-all duration-500"
      :class="[
        vis(s, PRESET_STEPS.rows),
        p.highlight && s >= PRESET_STEPS.sofia ? 'border-focus bg-focus/15 dark:border-focus dark:bg-focus/20' : 'border-transparent',
      ]"
    >
      <span class="font-semibold text-ink-strong dark:text-ink-strong">{{ p.name }}</span>
      <span class="text-center font-mono">{{ p.sf }}</span>
      <span class="text-center font-mono">{{ p.bwKHz }} kHz</span>
      <span class="text-center font-mono">4/{{ p.crDenom }}</span>
      <span class="text-center font-mono transition-opacity duration-500" :class="vis(s, PRESET_STEPS.effects)">{{ p.kbpsLabel }}</span>
      <span class="text-center font-mono transition-opacity duration-500" :class="vis(s, PRESET_STEPS.effects)">{{ p.sensitivityLabel }}</span>
      <div class="flex items-center gap-2 whitespace-nowrap pl-2">
        <div
          class="h-4 shrink-0 rounded-sm bg-water/70 transition-all duration-700 dark:bg-water/70"
          :style="{ width: s >= PRESET_STEPS.effects ? barWidth(p.airtimeX) : '0%' }"
        />
        <span class="font-mono transition-opacity duration-500" :class="vis(s, PRESET_STEPS.effects)">{{ p.airtimeLabel }}</span>
        <span
          v-if="p.cities"
          class="chip text-base transition-opacity duration-500" :class="vis(s, PRESET_STEPS.sofia)"
        >{{ p.cities.join(', ') }}</span>
      </div>
    </div>

    <div class="mt-2 text-center text-xl font-semibold text-trail transition-opacity duration-500 dark:text-trail" :class="vis(s, PRESET_STEPS.sofia)">
      Различен preset: възлите не се чуват
    </div>
  </div>
</template>
