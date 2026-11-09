<script setup lang="ts">
// Slide 53 „Къде пасва всеки“: one column per project (same grid and project
// colours as ComparisonGrid), revealed one per click. Each column has a name,
// a short subtitle and two use cases: icon, short label, optional grey tag.
import type { UseCaseColumn } from './data/comparison'
import { USE_CASE_COLUMNS } from './data/comparison'
import { ICONS } from './data/icons'
import { PROJECT_COLOUR, PROJECT_META, TONE } from './data/tones'
import { vis } from './data/format'
import { useStep } from './data/useStep'

const props = withDefaults(defineProps<{
  columns?: UseCaseColumn[]
  step?: number
  startAt?: number
}>(), {})

const cols = props.columns ?? USE_CASE_COLUMNS
const s = useStep(cols.length, () => props.step, () => props.startAt ?? 0)
const colour = (c: UseCaseColumn) => PROJECT_COLOUR[PROJECT_META[c.project].colour]
</script>

<template>
  <div class="lora-viz w-full">
    <!-- Grid rows size to content, so all three cards share the tallest height and
         never stretch to the slide bottom -->
    <div class="grid grid-cols-3 items-stretch gap-3 pb-6">
      <div
        v-for="(c, i) in cols" :key="c.project"
        class="flex flex-col gap-5 rounded-xl border-2 bg-parchment px-4 py-4 transition-opacity duration-500 dark:bg-parchment"
        :class="[colour(c).border, vis(s, i + 1)]"
      >
        <div>
          <div class="text-3xl font-bold" :class="colour(c).text">{{ PROJECT_META[c.project].name }}</div>
          <div class="text-lg leading-snug text-ink/80 dark:text-ink/80">{{ c.subtitle }}</div>
        </div>
        <div v-for="u in c.cases" :key="u.label" data-case class="flex items-start gap-2">
          <component :is="ICONS[u.icon]" class="mt-1 shrink-0 text-3xl" :class="colour(c).text" />
          <div class="flex min-w-0 flex-col">
            <div class="text-2xl font-bold leading-tight">{{ u.label }}</div>
            <div v-if="u.tag" class="mt-1 whitespace-nowrap text-base" :class="TONE.slate.text">{{ u.tag }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
