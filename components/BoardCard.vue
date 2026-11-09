<script setup lang="ts">
// Slide 21: one board — photo from public/boards/ (or a labelled „СНИМКА“
// placeholder when a board has no img), name, price and an MCU chip whose
// tone carries the meaning (nRF52 = emerald, the battery-friendly choice),
// then what it is for and roughly how long the battery lasts.
import { computed } from 'vue'
import { withBase } from './data/asset'
import type { Board } from './data/boards'
import { MCU_META, board } from './data/boards'
import { TONE } from './data/tones'

const props = defineProps<{
  /** An id from data/boards.ts, or a full board object. */
  id?: string
  board?: Board
}>()

const b = computed<Board>(() => props.board ?? board(props.id ?? 'heltec-v4'))
const meta = computed(() => MCU_META[b.value.mcu])
</script>

<template>
  <div class="lora-viz flex h-full items-center gap-4 rounded-xl border-2 bg-parchment p-4 dark:bg-parchment" :class="TONE[meta.tone].border">
    <img v-if="b.img" :src="withBase(b.img)" :alt="b.name" class="h-24 w-32 shrink-0 rounded-lg object-contain">
    <div v-else class="flex h-24 w-32 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-stone text-lg font-semibold tracking-wider text-stone-deep dark:border-stone dark:text-stone-deep">
      СНИМКА
    </div>
    <div class="flex min-w-0 flex-col gap-1">
      <div class="text-2xl font-semibold leading-tight">{{ b.name }}</div>
      <div class="flex items-center gap-3">
        <span class="text-xl font-bold" :class="TONE.blue.text">{{ b.price }}</span>
        <span class="whitespace-nowrap rounded-full border px-3 text-lg" :class="[TONE[meta.tone].soft, TONE[meta.tone].border, TONE[meta.tone].text]">{{ b.mcu }}</span>
      </div>
      <span class="whitespace-nowrap text-lg leading-snug">{{ b.use }}</span>
      <span class="flex items-center gap-1 whitespace-nowrap text-lg font-semibold" :class="TONE[meta.tone].text"><carbon-battery-full v-if="b.mcu === 'nRF52840'" class="shrink-0" /><carbon-battery-quarter v-else class="shrink-0" /> {{ b.battery }}</span>
    </div>
  </div>
</template>
