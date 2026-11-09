<script setup lang="ts">
// Slide 48 „RNode е само модем“: two rows answer one question, where do
// routing and encryption run?
//   start   Meshtastic, MeshCore: the phone is only the screen, the radio
//           routes, encrypts and sends LoRa.
//   click 1 RNode: the host (Sideband) routes and encrypts, the RNode only
//           sends and receives LoRa. The two jobs that change sides keep the
//           Reticulum accent in both rows so the eye follows them.
//   click 2 three facts, click 3 the iOS line.
// Data and sources: data/rnodeModem.ts.
import { MOVED_JOBS, RNODE_FACTS, RNODE_IOS, RNODE_ROWS } from './data/rnodeModem'
import type { RNodeBox } from './data/rnodeModem'
import { PROJECT_COLOUR, TONE } from './data/tones'
import { vis } from './data/format'
import { useStep } from './data/useStep'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(RNODE_IOS.at, () => props.step, () => props.startAt ?? 0)

const jobClass = (job: string): string[] =>
  MOVED_JOBS.includes(job)
    ? [PROJECT_COLOUR.fuchsia.soft, PROJECT_COLOUR.fuchsia.border, PROJECT_COLOUR.fuchsia.text, 'border-2 font-semibold']
    : [TONE.blue.soft, TONE.blue.border, TONE.blue.text, 'border']
const isHost = (b: RNodeBox): boolean => b.icon === 'phone'
</script>

<template>
  <div class="lora-viz flex w-full flex-col gap-4">
    <div
      v-for="r in RNODE_ROWS" :key="r.label"
      class="flex items-center gap-4 transition-opacity duration-500"
      :class="vis(s, r.at)"
    >
      <span class="w-44 shrink-0 text-2xl font-bold" :class="r.label === 'RNode' ? PROJECT_COLOUR.fuchsia.text : ''">{{ r.label }}</span>

      <template v-for="(b, i) in [r.host, r.radio]" :key="b.name">
        <!-- link between host and radio: dashed, it is usually radio (Bluetooth) -->
        <div v-if="i === 1" class="flex w-36 shrink-0 flex-col items-center gap-1">
          <span class="whitespace-nowrap text-lg font-semibold" :class="TONE.blue.text">{{ r.link }}</span>
          <div class="w-full border-t-4 border-dashed" :class="TONE.blue.border" />
        </div>
        <div class="flex w-64 shrink-0 flex-col gap-2 self-stretch rounded-xl border-2 px-3 py-2" :class="TONE.blue.border">
          <div class="flex items-center gap-2 text-xl font-semibold">
            <template v-if="isHost(b)">
              <carbon-mobile class="text-2xl" /><carbon-laptop v-if="r.label === 'RNode'" class="text-2xl" />
            </template>
            <carbon-chip v-else class="text-2xl" />
            <span>{{ b.name }}</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="j in b.jobs" :key="j" class="rounded-full px-3 py-0.5 text-lg" :class="jobClass(j)">{{ j }}</span>
          </div>
        </div>
      </template>
    </div>

    <div class="flex gap-3 transition-opacity duration-500" :class="vis(s, RNODE_FACTS.at)">
      <span
        v-for="f in RNODE_FACTS.items" :key="f"
        class="flex-1 whitespace-nowrap rounded-lg border px-3 py-1.5 text-center text-xl"
        :class="[TONE.amber.soft, TONE.amber.border]"
      >{{ f }}</span>
    </div>

    <p class="m-0 self-center rounded-lg border-2 px-4 py-1 text-xl transition-opacity duration-500" :class="[vis(s, RNODE_IOS.at), TONE.red.soft, TONE.red.border, TONE.red.text]">{{ RNODE_IOS.text }}</p>
  </div>
</template>
