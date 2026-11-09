<script setup lang="ts">
// One round marker in a project colour: filled means the limit applies fully,
// outline with a filled left half means it applies partly.
import { PROJECT_COLOUR } from './data/tones'
import type { Applies, LimitProject } from './data/limits'

defineProps<{ project?: LimitProject, level: Applies }>()

// Same project to colour mapping as the rest of the deck.
const COLOUR = { meshtastic: PROJECT_COLOUR.cyan, meshcore: PROJECT_COLOUR.indigo, reticulum: PROJECT_COLOUR.fuchsia }
</script>

<template>
  <svg viewBox="0 0 20 20" class="inline-block h-[20px] w-[20px] shrink-0" aria-hidden="true">
    <template v-if="project">
      <circle cx="10" cy="10" r="8" stroke-width="2.5" :class="[COLOUR[project].stroke, level === 'full' ? COLOUR[project].fill : 'fill-transparent']" />
      <path v-if="level === 'partly'" d="M 10 2 A 8 8 0 0 0 10 18 Z" :class="COLOUR[project].fill" />
    </template>
    <template v-else>
      <circle cx="10" cy="10" r="8" stroke-width="2.5" class="stroke-ink dark:stroke-ink" :class="level === 'full' ? 'fill-ink dark:fill-ink' : 'fill-transparent'" />
      <path v-if="level === 'partly'" d="M 10 2 A 8 8 0 0 0 10 18 Z" class="fill-ink dark:fill-ink" />
    </template>
  </svg>
</template>
