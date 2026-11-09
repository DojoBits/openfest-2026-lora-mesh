<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ src: string }>()

// Eager `?raw` glob, so the SVG is inlined into the bundle at build time.
// Nothing is fetched at render time: this survives a dead venue wifi and the
// headless browser used by `slidev export`.
//
// Collision-proofing (unique element ids, per-drawing font-family names) is
// done once in scripts/gen-drawings.mjs, so the committed files are already
// safe to inline side by side and this component stays a dumb renderer.
const drawings = import.meta.glob('../drawings/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const svg = computed(() => {
  const found = drawings[`../drawings/${props.src}.svg`]
  if (!found)
    console.warn(`[Drawing] no such drawing: ${props.src}.svg`)
  return found ?? ''
})
</script>

<template>
  <div class="excalidraw-drawing" v-html="svg" />
</template>
