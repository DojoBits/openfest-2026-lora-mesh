<script setup lang="ts">
// Gallery only (no slide uses it): horizontal steps, one per click, and the last step also reveals its
// chips (the three flasher URLs in their hues).
import type { FlowStep } from './data/steps'
import { FLASH_STEPS } from './data/steps'
import { ICONS } from './data/icons'
import { PROJECT_COLOUR, TONE } from './data/tones'
import { vis } from './data/format'
import { useStep } from './data/useStep'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  steps?: FlowStep[]
  step?: number
  startAt?: number
}>(), { steps: undefined })

const list = computed<FlowStep[]>(() => props.steps ?? FLASH_STEPS)
const s = useStep(list.value.length, () => props.step, () => props.startAt ?? 0)
</script>

<template>
  <div class="lora-viz w-full">
    <div class="flex items-start">
      <template v-for="(st, i) in list" :key="st.label">
        <carbon-arrow-right v-if="i > 0" class="mx-2 mt-8 shrink-0 text-3xl opacity-60 transition-opacity duration-500" :class="vis(s, i + 1)" />
        <div class="flex flex-1 flex-col items-center gap-3 text-center transition-opacity duration-500" :class="vis(s, i + 1)">
          <div class="flex h-20 w-20 items-center justify-center rounded-full border-4 text-4xl" :class="[TONE[st.tone].border, TONE[st.tone].text, TONE[st.tone].soft]">
            <span v-if="st.check" class="font-bold">✓</span>
            <component :is="ICONS[st.icon]" v-else-if="st.icon" />
          </div>
          <span class="text-xl font-semibold leading-tight">{{ st.label }}</span>
        </div>
      </template>
    </div>
    <div class="mt-8 flex flex-wrap justify-center gap-3 transition-opacity duration-500" :class="vis(s, list.length)">
      <template v-for="st in list" :key="`c-${st.label}`">
        <span v-for="c in st.chips ?? []" :key="c.text" class="rounded-full border-2 px-4 py-0.5 font-mono text-lg" :class="[PROJECT_COLOUR[c.colour].soft, PROJECT_COLOUR[c.colour].border, PROJECT_COLOUR[c.colour].text]">{{ c.text }}</span>
      </template>
    </div>
  </div>
</template>
