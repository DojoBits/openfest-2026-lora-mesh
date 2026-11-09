<script setup lang="ts">
// Slide 30 „Структура на пакета“ and the Reticulum „адресът е ключ“ slide:
// a horizontal packet bar whose segments reveal one per click.
//  - meshtastic: header (amber) zoomed out into its wire fields with byte
//    sizes → payload (emerald, locked) with the whole-packet bracket (≤ 255 B).
//  - keyChip (optional, any preset): a key chip that can flip to a second key.
//  - rns: key pair → hash → a full 16 byte destination (32 hex characters),
//    then the packet „До / данни“ and a note that there is no „От:“ field.
import { computed } from 'vue'
import type { PacketPreset } from './data/packets'
import { PACKET_PRESETS } from './data/packets'
import { TONE, VIS } from './data/tones'
import { vis } from './data/format'
import { useStep } from './data/useStep'

const props = withDefaults(defineProps<{
  variant?: 'meshtastic' | 'rns'
  preset?: PacketPreset
  step?: number
  startAt?: number
}>(), { variant: 'meshtastic' })

const p = computed<PacketPreset>(() => props.preset ?? PACKET_PRESETS[props.variant])
const s = useStep((props.preset ?? PACKET_PRESETS[props.variant]).total, () => props.step, () => props.startAt ?? 0)
// Zoom: the segment with wire fields (the header) is redrawn full width under
// the bar. Its left/right edges on the bar, as fractions of the bar width, are
// where the two zoom lines start (gaps between segments are ignored).
// Made-up example, 16 bytes written as 32 hex characters like Reticulum shows them.
const RNS_EXAMPLE_ADDR = 'a7f39b1c04e2d65f8a13c7b90e4f2d61'
const zoom = computed(() => {
  const segs = p.value.segments
  const i = segs.findIndex(seg => seg.parts)
  if (i < 0) return undefined
  const sum = segs.reduce((n, seg) => n + seg.weight, 0)
  const left = segs.slice(0, i).reduce((n, seg) => n + seg.weight, 0) / sum
  return { seg: segs[i], left: left * 100, right: (left + segs[i].weight / sum) * 100 }
})
// The bracket over the bar shows with the last segment (the whole packet is on screen).
const lastAt = computed(() => p.value.segments[p.value.segments.length - 1]?.at ?? 0)
const flipped = computed(() => {
  const f = p.value.keyChip?.flipTo
  return f !== undefined && s.value >= f.at
})
</script>

<template>
  <div class="lora-viz w-full text-xl">
    <!-- rns: identity → hash → address -->
    <div v-if="variant === 'rns'" class="mb-8 flex items-center justify-center gap-4 transition-opacity duration-500" :class="vis(s, 1)">
      <div class="flex flex-col items-center gap-1 rounded-xl border px-4 py-2" :class="[TONE.slate.soft, TONE.slate.border]">
        <div class="flex gap-2 text-3xl"><carbon-password /><carbon-password class="opacity-60" /></div>
        <span class="text-lg">двойка ключове</span>
      </div>
      <div class="flex flex-col items-center text-lg"><carbon-arrow-right class="text-3xl" /><span>hash</span></div>
      <div class="flex flex-col items-center gap-1">
        <span class="rounded-full border px-4 py-1 font-mono text-xl font-semibold" :class="[TONE.blue.soft, TONE.blue.border, TONE.blue.text]">{{ RNS_EXAMPLE_ADDR }}</span>
        <span class="text-lg opacity-70">16 байта адрес</span>
      </div>
    </div>

    <!-- whole-packet bracket over the bar: ticks at both ends, size in the middle -->
    <div v-if="p.maxBytes" class="mb-2 flex items-center gap-3 transition-opacity duration-500" :class="vis(s, lastAt)">
      <div class="h-4 flex-1 rounded-tl-md border-l-2 border-t-2 border-ink/50 dark:border-ink/50" />
      <span class="whitespace-nowrap text-2xl font-semibold">пакет ≤ {{ p.maxBytes }} B</span>
      <div class="h-4 flex-1 rounded-tr-md border-r-2 border-t-2 border-ink/50 dark:border-ink/50" />
    </div>

    <!-- the packet bar; widths are flex weights, geometry fixed from frame 0 -->
    <div class="flex w-full gap-1">
      <div
        v-for="seg in p.segments" :key="seg.label"
        class="flex min-w-0 flex-col gap-2 transition-opacity duration-500"
        :class="vis(s, seg.at)" :style="{ flexGrow: seg.weight, flexBasis: 0 }"
      >
        <div class="flex items-center justify-center gap-2 rounded-lg border-2 px-3 font-semibold" :class="[zoom ? 'h-16' : 'h-20', TONE[seg.tone].soft, TONE[seg.tone].border, TONE[seg.tone].text]">
          <carbon-locked v-if="seg.locked" class="shrink-0 text-2xl" />
          <span class="whitespace-nowrap">{{ seg.label }}</span>
        </div>
      </div>
    </div>
    <p v-if="p.note" class="mt-3 text-center text-xl transition-opacity duration-500" :class="vis(s, lastAt)">{{ p.note }}</p>

    <!-- zoom of the header: two thin lines fan out from its edges on the bar to
         the full-width row of wire fields; each cell is as wide as bytes + 3 so
         the 1-byte fields still fit their label -->
    <div v-if="zoom" class="transition-opacity duration-500" :class="vis(s, zoom.seg.at)">
      <svg viewBox="0 0 100 10" preserveAspectRatio="none" class="block h-7 w-full">
        <path :d="`M${zoom.left} 0 L0 10 M${zoom.right} 0 L100 10`" fill="none" class="stroke-gold dark:stroke-gold" vector-effect="non-scaling-stroke" style="stroke-width: 1.5; stroke-dasharray: 4 4" />
      </svg>
      <div class="flex w-full gap-1">
        <div
          v-for="f in zoom.seg.parts" :key="f.label"
          class="flex min-w-0 flex-col items-center justify-center rounded-lg border-2 py-1"
          :class="[TONE[zoom.seg.tone].soft, TONE[zoom.seg.tone].border]" :style="{ flexGrow: f.bytes + 3, flexBasis: 0 }"
        >
          <span class="whitespace-nowrap text-xl font-semibold" :class="TONE[zoom.seg.tone].text">{{ f.label }}</span>
          <span class="font-mono text-lg opacity-80">{{ f.bytes }} B</span>
        </div>
      </div>
    </div>

    <!-- key chip; both states share one grid cell so the flip never reflows -->
    <div v-if="p.keyChip" class="flex items-center justify-center gap-3 transition-opacity duration-500" :class="[vis(s, p.keyChip.at), zoom ? 'mt-4' : 'mt-8']">
      <carbon-password class="text-3xl" />
      <span class="text-lg">ключ на канала:</span>
      <div class="grid">
        <div class="col-start-1 row-start-1 flex items-center gap-2 transition-opacity duration-500" :class="flipped ? VIS.hidden : VIS.shown">
          <span class="rounded-full border-2 px-4 py-0.5 font-mono font-bold" :class="[TONE[p.keyChip.tone].soft, TONE[p.keyChip.tone].border, TONE[p.keyChip.tone].text]">{{ p.keyChip.text }}</span>
          <span :class="TONE[p.keyChip.tone].text">{{ p.keyChip.note }}</span>
        </div>
        <div v-if="p.keyChip.flipTo" class="col-start-1 row-start-1 flex items-center gap-2 transition-opacity duration-500" :class="flipped ? VIS.shown : VIS.hidden">
          <span class="rounded-full border-2 px-4 py-0.5 font-bold" :class="[TONE[p.keyChip.flipTo.tone].soft, TONE[p.keyChip.flipTo.tone].border, TONE[p.keyChip.flipTo.tone].text]">{{ p.keyChip.flipTo.text }}</span>
          <span :class="TONE[p.keyChip.flipTo.tone].text">{{ p.keyChip.flipTo.note }}</span>
        </div>
      </div>
    </div>

    <!-- rns: forward secrecy -->
    <div v-if="variant === 'rns'" class="mt-8 flex items-center justify-center gap-3 transition-opacity duration-500" :class="[vis(s, 3), TONE.emerald.text]">
      <span class="relative text-4xl"><carbon-locked /></span>
      <carbon-renew class="text-3xl" />
      <span class="text-2xl font-semibold">forward secrecy</span>
    </div>
  </div>
</template>
