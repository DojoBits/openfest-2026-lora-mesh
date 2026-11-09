<script setup lang="ts">
// Small rounded label: „илюстративно“, „схематично“, „пример“, status chips.
import { computed } from 'vue'
import type { Tone } from './data/tones'
import { TONE } from './data/tones'

const props = withDefaults(defineProps<{ text?: string, tone?: Tone }>(), { tone: 'slate' })
const cls = computed(() => [TONE[props.tone].soft, TONE[props.tone].text, TONE[props.tone].border])
</script>

<template>
  <span class="lora-viz inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-0.5 text-lg font-medium leading-snug" :class="cls">
    <slot>{{ text }}</slot>
  </span>
</template>
