<script setup lang="ts">
// Slide 46 „Стек, независим от средата“: four layers built bottom-up, one per
// click. The last click drops one packet down a dashed arrow in a gutter right
// of the stack and lights the two interfaces it leaves through at once (LoRa
// and TCP). The gutter keeps the packet clear of the interface chips.
import { computed } from 'vue'
import type { StackLayer } from './data/reticulum'
import { RNS_EXITS, RNS_MIN_BPS, RNS_MTU_BYTES, RNS_STACK } from './data/reticulum'
import { PROJECT_COLOUR, TONE } from './data/tones'
import { fmt, maxAt, vis } from './data/format'
import { useStep } from './data/useStep'

const props = withDefaults(defineProps<{
  layers?: StackLayer[]
  exits?: string[]
  /** Click that drops the packet; defaults to one after the last layer. */
  dropPacketAt?: number
  step?: number
  startAt?: number
}>(), { layers: () => RNS_STACK, exits: () => RNS_EXITS })

const dropAt = computed(() => props.dropPacketAt ?? maxAt(...props.layers.map(l => l.at)) + 1)
const s = useStep(props.dropPacketAt ?? maxAt(...props.layers.map(l => l.at)) + 1, () => props.step, () => props.startAt ?? 0)
const dropped = computed(() => s.value >= dropAt.value)

// Each row is h-20 (5rem) + gap-3 (0.75rem). The packet falls to the last row.
const ROW_REM = 5.75
const packetStyle = computed(() => ({
  transform: `translateY(${dropped.value ? (props.layers.length - 1) * ROW_REM : 0}rem)`,
}))
</script>

<template>
  <div class="lora-viz relative w-full">
    <div class="flex gap-4">
      <div class="flex min-w-0 flex-1 flex-col gap-3">
        <div
          v-for="l in layers" :key="l.name"
          class="flex h-20 items-center gap-4 rounded-xl border-2 px-5 transition-opacity duration-500"
          :class="[PROJECT_COLOUR.fuchsia.border, vis(s, l.at)]"
        >
          <span class="w-40 shrink-0 text-2xl font-bold" :class="PROJECT_COLOUR.fuchsia.text">{{ l.name }}</span>
          <span v-if="l.desc" class="text-xl">{{ l.desc }}</span>
          <div v-if="l.items.length" class="flex flex-wrap gap-2">
            <span
              v-for="it in l.items" :key="it"
              class="rounded-full border px-3 py-0.5 text-lg font-medium transition-colors duration-500"
              :class="dropped && exits.includes(it) ? [TONE.amber.soft, TONE.amber.border, TONE.amber.text, 'border-2'] : [TONE.blue.soft, TONE.blue.border, TONE.blue.text]"
            >{{ it }}</span>
          </div>
        </div>
      </div>

      <!-- gutter: a dashed arrow from the top layer down to the interfaces,
           the packet slides along it (translate only, no scaling) -->
      <div class="relative w-24 shrink-0 transition-opacity duration-500" :class="dropped ? 'opacity-100' : 'opacity-0'">
        <div data-packet-track class="absolute bottom-[3.4rem] left-1/2 top-[3.6rem] flex -translate-x-1/2 flex-col items-center">
          <div class="flex-1 border-l-[3px] border-dashed" :class="TONE.amber.border" />
          <carbon-arrow-down class="-mt-1 text-2xl" :class="TONE.amber.text" />
        </div>
        <div
          class="absolute left-1/2 top-[1.4rem] flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-md border-2 px-2 py-1 text-lg font-semibold transition-transform duration-1000 ease-in-out"
          :class="[TONE.amber.soft, TONE.amber.border, TONE.amber.text]"
          :style="packetStyle"
        >
          <carbon-email /> пакет
        </div>
      </div>
    </div>

    <p class="mt-3 text-right text-lg opacity-70 transition-opacity duration-500" :class="vis(s, 1)">от {{ fmt(RNS_MIN_BPS) }} bit/s, MTU {{ fmt(RNS_MTU_BYTES) }} B</p>
  </div>
</template>
