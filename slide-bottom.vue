<script setup lang="ts">
// Section accent probe. Slidev renders this layer as the first
// child of every `.slidev-page`, so a variant stylesheet can select
// `.slidev-page:has(.stop-probe[data-stop="1"])` and set `--c-accent` for
// everything on that slide, in the deck, presenter view and export alike.
//
// Which stop a slide belongs to: walk back from this slide to the nearest one
// whose frontmatter carries `stop:` (set once per journey stop on the `src:`
// imports in slides.md, which Slidev merges into the first imported slide).
// So only the four stop openers are tagged and every slide after inherits,
// the same way the talk itself inherits "where we are" from the last divider.
// `stop: 0` closes the journey (close, Q&A, end): no section accent.
import { computed } from 'vue'
import { useNav, useSlideContext } from '@slidev/client'

const { slides } = useNav()
const { $page } = useSlideContext()

const stop = computed<number>(() => {
  for (let i = $page.value - 1; i >= 0; i--) {
    const s = slides.value[i]?.meta?.slide?.frontmatter?.stop
    if (typeof s === 'number') return s
  }
  return 0
})
</script>

<template>
  <span class="stop-probe" :data-stop="stop" hidden />
</template>
