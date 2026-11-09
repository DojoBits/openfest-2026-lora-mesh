<script setup lang="ts">
// One Meshtastic chat screen of the live demo, drawn inside the phone or the
// laptop mockup (DemoRig). Both screens read the same script (demoChat.ts):
// a message is outgoing (right, water) on the device that sent it and incoming
// (left, parchment) on the other one. Incoming bubbles, and the sender's
// „доставено“, wait PACKET_MS so they land when the packet arrives.
// The header icon is how the screen reaches its node (DEMO_LINK).
import { computed } from 'vue'
import { DEMO_AT, DEMO_CHANNEL, DEMO_LINK, DEMO_MESSAGES, PACKET_MS, type DemoDevice } from './data/demoChat'
import { vis } from './data/format'

const props = defineProps<{ device: DemoDevice, step: number }>()
const device = computed(() => props.device)
const delay = `${PACKET_MS}ms`
</script>

<template>
  <div class="flex h-full flex-col bg-page text-ink dark:bg-page dark:text-ink">
    <div class="flex items-center justify-between gap-2 border-b border-edge/60 px-2.5 py-1.5 text-sm dark:border-edge/80">
      <span v-if="DEMO_LINK[device] === 'usb'" class="flex items-center gap-1 font-semibold text-moss dark:text-moss"><carbon-usb /> LoRa</span>
      <span v-else class="flex items-center gap-1 font-semibold text-moss dark:text-moss"><carbon-bluetooth /> LoRa</span>
      <!-- channel click: same name and key appear on both screens at once -->
      <span
        class="flex items-center gap-1 rounded-full border-2 px-2 font-semibold transition-opacity duration-500 border-moss/60 dark:border-moss/70 bg-moss/10 dark:bg-moss/20 text-moss dark:text-moss"
        :class="vis(step, DEMO_AT.channel)"
      ><carbon-password />{{ DEMO_CHANNEL }}</span>
    </div>
    <div class="flex flex-1 flex-col justify-end gap-1.5 p-3 text-lg leading-snug">
      <template v-for="m in DEMO_MESSAGES" :key="m.text">
        <div
          v-if="m.from === device"
          class="ml-auto max-w-[88%] rounded-2xl rounded-br-sm px-3 py-1 transition-opacity duration-300 bg-water dark:bg-water text-page dark:text-earth"
          :class="vis(step, m.at)"
        >{{ m.text }}</div>
        <div
          v-else
          class="mr-auto max-w-[88%] rounded-2xl rounded-bl-sm px-3 py-1 transition-opacity duration-300 bg-parchment-lo dark:bg-parchment-lo text-ink dark:text-ink"
          :class="vis(step, m.at)"
          :style="step >= m.at ? { transitionDelay: delay } : {}"
        >{{ m.text }}</div>
        <!-- the phone's first message gets its ack once the packet reaches B -->
        <div
          v-if="m.from === device && m.at === DEMO_AT.send"
          class="ml-auto flex items-center gap-1 text-base transition-opacity duration-300 text-moss dark:text-moss"
          :class="vis(step, m.at)"
          :style="step >= m.at ? { transitionDelay: delay } : {}"
        ><carbon-checkmark-outline />доставено</div>
      </template>
    </div>
  </div>
</template>
