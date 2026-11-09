<script setup lang="ts">
// Intro slide after the MeshCore and Reticulum section heroes (04/05 pages): three rows,
// one per click — what it is, which problem it solves, its philosophy.
// Text lives in data/introText.ts; colour is the project's theme accent.
import { computed } from 'vue'
import { INTRO_ROWS, PROJECT_INTRO } from './data/introText'
import { PROJECT_COLOUR, PROJECT_META } from './data/tones'
import type { IntroProject } from './data/introText'

const props = defineProps<{ project: IntroProject }>()

const intro = computed(() => PROJECT_INTRO[props.project])
const colour = computed(() => PROJECT_COLOUR[PROJECT_META[props.project].colour])
</script>

<template>
  <div class="lora-viz mx-auto flex w-[900px] flex-col gap-4">
    <div
      v-for="(row, i) in INTRO_ROWS"
      :key="row.key"
      v-click="i + 1"
      class="flex items-center gap-6 rounded-xl border-2 bg-parchment px-6 py-3 dark:bg-parchment"
      :class="colour.border"
    >
      <!-- one fixed icon per row kind, same across the three projects -->
      <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-4xl" :class="[colour.soft, colour.text]">
        <carbon-information v-if="row.key === 'what'" />
        <carbon-help v-else-if="row.key === 'problem'" />
        <carbon-idea v-else />
      </div>
      <div class="flex min-w-0 flex-col">
        <span class="text-lg font-semibold uppercase tracking-wide" :class="colour.text">{{ row.label }}</span>
        <span class="whitespace-nowrap text-[1.75rem] font-semibold leading-snug">{{ intro[row.key] }}</span>
      </div>
    </div>
  </div>
</template>
