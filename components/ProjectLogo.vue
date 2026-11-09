<script setup lang="ts">
// A project's own mark (data/projectLogos.ts), painted in currentColor so the
// parent's text token sets its colour. Size it with width classes, the height
// follows the viewBox.
import { computed } from 'vue'
import { PROJECT_LOGOS, type ProjectId } from './data/projectLogos'

const props = defineProps<{ project: ProjectId }>()
const logo = computed(() => PROJECT_LOGOS[props.project])
</script>

<template>
  <svg
    :viewBox="logo.viewBox" role="img" :aria-label="logo.label"
    fill="currentColor" class="h-auto overflow-visible"
  >
    <!-- outline in the same colour thickens hairlines (Reticulum's constellation) -->
    <path
      v-for="(p, i) in logo.paths" :key="i"
      :d="p.d" :transform="p.transform"
      :stroke="logo.outline ? 'currentColor' : undefined"
      :style="logo.outline ? { strokeWidth: logo.outline, strokeLinejoin: 'round' } : undefined"
    />
  </svg>
</template>
