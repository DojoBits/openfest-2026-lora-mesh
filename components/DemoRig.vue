<script setup lang="ts">
// Live demo slide (09-demo.md).
//  - demo:  phone —Bluetooth→ node A ))) LoRa ((( node B —USB cable→ laptop.
//           Phone and laptop are mockups showing the same Meshtastic chat
//           (DemoChat); the nodes are the real demo boards: A Heltec T114
//           (slide 21), B LilyGO T-LoRa V2.1-1.6 (DEMO_NODE_B).
//           Clicks (demoChat.ts): 1 channel „openfest“ + key on both screens,
//           2 the phone sends and a packet flies to the laptop,
//           3 the laptop replies and a packet flies back.
import { computed } from 'vue'
import { useNav } from '@slidev/client'
import { withBase } from './data/asset'
import { useStep } from './data/useStep'
import { BOARDS } from './data/boards'
import { DEMO_AT, DEMO_NODE_B, PACKET_MS } from './data/demoChat'
import DemoChat from './DemoChat.vue'

const props = withDefaults(defineProps<{
  step?: number
  startAt?: number
}>(), {})

const s = useStep(DEMO_AT.reply, () => props.step, () => props.startAt ?? 0)
const { isPrintMode } = useNav()
const nodeA = BOARDS.find(b => b.id === 'heltec-t114')!
// The packet runs only on the click that sends it; in print it stays hidden.
const packet = computed(() => {
  if (isPrintMode.value) return ''
  if (s.value === DEMO_AT.send) return 'packet-right'
  if (s.value === DEMO_AT.reply) return 'packet-left'
  return ''
})
const packetMs = `${PACKET_MS}ms`
</script>

<template>
  <div class="lora-viz relative w-full text-xl">
    <!-- ── demo chain ─────────────────────────────────────────────────── -->
    <div class="relative flex items-center">
      <!-- phone -->
      <div class="flex w-48 shrink-0 flex-col items-center gap-2">
        <div class="h-[290px] w-48 overflow-hidden rounded-[1.8rem] border-[5px] shadow-xl border-ink-strong dark:border-ink">
          <DemoChat device="phone" :step="s" />
        </div>
        <span>телефон</span>
      </div>
      <!-- Bluetooth hop: phone ↔ node A -->
      <div class="flex min-w-0 flex-1 flex-col items-center">
        <carbon-bluetooth class="text-2xl text-blue-600 dark:text-blue-400" />
        <div class="flex w-full items-center text-xl text-water dark:text-water">
          <carbon-caret-left class="-mr-2 shrink-0" />
          <svg class="min-w-0 flex-1" height="12" preserveAspectRatio="none" viewBox="0 0 100 12" aria-hidden="true"><line x1="0" y1="6" x2="100" y2="6" class="ble-link stroke-blue-600 dark:stroke-blue-400" stroke-width="5" vector-effect="non-scaling-stroke" /></svg>
          <carbon-caret-right class="-ml-2 shrink-0" />
        </div>
      </div>
      <!-- node A -->
      <div class="flex w-24 shrink-0 flex-col items-center gap-2">
        <img :src="withBase(nodeA.img)" :alt="nodeA.name" class="w-24 object-contain">
        <span class="leading-tight">възел A</span>
        <span class="-mt-2 text-base opacity-70">T114</span>
      </div>
      <!-- LoRa: waves leave A, dotted air gap, arrive at B (same drawing as LinkChain) -->
      <div class="flex w-32 shrink-0 flex-col items-center">
        <span class="whitespace-nowrap text-lg font-semibold text-moss dark:text-moss">LoRa</span>
        <svg class="w-full" height="44" viewBox="0 0 240 44" aria-hidden="true">
          <g class="stroke-moss dark:stroke-moss" fill="none" stroke-width="4" stroke-linecap="round">
            <path class="chain-wave" d="M8 10 A16 16 0 0 1 8 34" />
            <path class="chain-wave [animation-delay:0.3s]" d="M22 2 A28 28 0 0 1 22 42" />
            <path class="chain-wave [animation-delay:0.6s]" d="M218 2 A28 28 0 0 0 218 42" />
            <path class="chain-wave [animation-delay:0.9s]" d="M232 10 A16 16 0 0 0 232 34" />
            <line x1="50" y1="22" x2="190" y2="22" stroke-width="3" stroke-dasharray="2 9" />
          </g>
        </svg>
      </div>
      <!-- node B -->
      <div class="flex w-24 shrink-0 flex-col items-center gap-2">
        <img :src="withBase(DEMO_NODE_B.img)" :alt="DEMO_NODE_B.name" class="w-24 object-contain">
        <span class="leading-tight">възел B</span>
        <span class="-mt-2 text-base opacity-70">{{ DEMO_NODE_B.short }}</span>
      </div>
      <!-- USB cable: node B ↔ laptop (solid line, unlike the dotted Bluetooth hop) -->
      <div class="flex min-w-0 flex-1 flex-col items-center">
        <span class="flex items-center gap-1 text-lg font-semibold text-ink-strong dark:text-ink"><carbon-usb class="text-2xl" />USB</span>
        <div class="flex w-full items-center text-xl text-ink-strong dark:text-ink">
          <carbon-caret-left class="-mr-2 shrink-0" />
          <svg class="min-w-0 flex-1" height="12" preserveAspectRatio="none" viewBox="0 0 100 12" aria-hidden="true"><line x1="0" y1="6" x2="100" y2="6" class="stroke-ink-strong dark:stroke-ink" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke" /></svg>
          <carbon-caret-right class="-ml-2 shrink-0" />
        </div>
      </div>
      <!-- laptop: screen + base -->
      <div class="flex w-56 shrink-0 flex-col items-center gap-2">
        <div class="flex w-56 flex-col items-center">
          <div class="h-[190px] w-52 overflow-hidden rounded-t-lg border-[5px] border-b-[8px] border-ink-strong dark:border-ink">
            <DemoChat device="laptop" :step="s" />
          </div>
          <div class="h-2.5 w-56 rounded-b-lg bg-ink-strong dark:bg-ink" />
        </div>
        <span>лаптоп</span>
      </div>

      <!-- packet: crosses the chain on the click that sends it (keyframes below) -->
      <div
        :key="packet"
        class="pointer-events-none absolute top-[56%] flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xl opacity-0 shadow-md bg-moss dark:bg-moss text-page dark:text-earth"
        :class="packet"
        :style="{ animationDuration: packetMs }"
      ><carbon-email /></div>
    </div>

  </div>
</template>

<style scoped>
/* Packet path: from the phone (left 10%) to the laptop (right 88%), or back. */
.packet-right { animation: packet-right ease-in-out forwards; }
.packet-left { animation: packet-left ease-in-out forwards; }
@keyframes packet-right {
  0% { left: 10%; opacity: 0; }
  10%, 90% { opacity: 1; }
  100% { left: 86%; opacity: 0; }
}
@keyframes packet-left {
  0% { left: 86%; opacity: 0; }
  10%, 90% { opacity: 1; }
  100% { left: 10%; opacity: 0; }
}
@media (prefers-reduced-motion: reduce) { .packet-right, .packet-left { animation: none; } }
.chain-wave {
  animation: chain-wave 1.6s ease-in-out infinite;
}
@keyframes chain-wave {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 1; }
}
</style>
