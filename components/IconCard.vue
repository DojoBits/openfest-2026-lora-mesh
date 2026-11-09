<script setup lang="ts">
// Generic card (slides 25, 39, 43, 53): icon, title, optional body and a small
// grey tag such as „международен пример“. Static — put `v-click` on it.
import { computed } from 'vue'
import type { IconName } from './data/icons'
import { ICONS } from './data/icons'
import type { Tone } from './data/tones'
import { TONE } from './data/tones'

const props = withDefaults(defineProps<{
  icon?: IconName
  title: string
  body?: string
  tone?: Tone
  tag?: string
}>(), { tone: 'blue' })

const iconComp = computed(() => (props.icon ? ICONS[props.icon] : null))
</script>

<template>
  <div class="lora-viz flex h-full flex-col justify-center gap-2 rounded-xl border-2 bg-parchment p-5 text-center dark:bg-parchment" :class="TONE[tone].border">
    <div class="mx-auto text-4xl" :class="TONE[tone].text">
      <slot name="icon"><component :is="iconComp" v-if="iconComp" /></slot>
    </div>
    <div class="text-2xl font-semibold leading-tight">{{ title }}</div>
    <div v-if="body" class="text-lg leading-snug">{{ body }}</div>
    <slot />
    <span v-if="tag" class="mx-auto mt-1 rounded-full border px-3 text-lg" :class="[TONE.slate.soft, TONE.slate.border, TONE.slate.text]">{{ tag }}</span>
  </div>
</template>
