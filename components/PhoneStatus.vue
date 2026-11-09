<script setup lang="ts">
// Phone mock-up for the hook (slide 2) and the demo (slide 35).
// Status bar reads „Няма услуга“; the message bubble is pending (amber clock)
// or delivered (emerald ✓). `captionAt` / `caption2At` / `boardAt` are click steps;
// caption2 replaces caption in place (slide 2: click 1 caption, click 2 caption2 + board).
import { computed } from 'vue'
import { useStep } from './data/useStep'
import { maxAt, vis } from './data/format'

const props = withDefaults(defineProps<{
  state?: 'pending' | 'delivered'
  message?: string
  noService?: boolean
  size?: 'lg' | 'md' | 'corner' | 'sm'
  /** Which channel the phone is using: none (no service) or a LoRa radio over Bluetooth. */
  link?: 'cell' | 'lora'
  caption?: string
  captionAt?: number
  /** Second caption: replaces `caption` (same spot) from step `caption2At`. */
  caption2?: string
  caption2At?: number
  /** Step at which the board + battery silhouettes slide in. */
  boardAt?: number
  boardLabel?: string
  /** Receiving phone: the bubble comes in on the left, grey, with no send status. */
  incoming?: boolean
  step?: number
  startAt?: number
}>(), {
  state: 'pending',
  message: 'Здравей, OpenFest',
  noService: true,
  size: 'lg',
  link: 'cell',
  boardLabel: 'LoRa платка + батерия',
})

const s = useStep(maxAt(props.captionAt, props.caption2At, props.boardAt), () => props.step, () => props.startAt ?? 0)
const box = computed(() => ({ lg: 'h-[400px] w-[250px]', md: 'h-[340px] w-[240px]', corner: 'h-[270px] w-[230px]', sm: 'h-[240px] w-[180px]' })[props.size])
const lora = computed(() => props.link === 'lora')
const boardIn = computed(() => props.boardAt !== undefined && s.value >= props.boardAt)
</script>

<template>
  <div class="lora-viz flex items-center justify-center gap-10">
    <div class="flex flex-col items-center gap-6">
      <!-- Phone body -->
      <div
        class="flex flex-col overflow-hidden rounded-[2.2rem] border-[6px] border-slate-700 bg-white shadow-xl dark:border-slate-300 dark:bg-slate-900"
        :class="box"
      >
        <div class="flex items-center justify-between border-b border-slate-200 px-4 py-2 text-lg dark:border-slate-700">
          <!-- LoRa link: the phone has no service but now talks through the radio. -->
          <span v-if="lora" class="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
            <carbon-bluetooth /> LoRa
          </span>
          <span v-else-if="noService" class="flex items-center gap-1.5 font-semibold text-red-600 dark:text-red-400">
            <carbon-connection-signal-off /> Няма услуга
          </span>
          <span v-else class="text-slate-600 dark:text-slate-300">4G</span>
          <carbon-battery-full class="text-slate-500 dark:text-slate-400" />
        </div>
        <div class="flex flex-1 flex-col justify-end gap-2 bg-slate-50 p-4 dark:bg-slate-800/60">
          <div v-if="incoming" class="mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-200 px-4 py-2 text-xl text-slate-900 dark:bg-slate-700 dark:text-slate-100">
            {{ message }}
          </div>
          <div v-else class="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-blue-600 px-4 py-2 text-xl text-white dark:bg-blue-500">
            {{ message }}
          </div>
          <div v-if="!incoming" class="ml-auto flex items-center gap-1.5 text-lg">
            <template v-if="state === 'pending'">
              <carbon-time class="text-amber-600 dark:text-amber-400" />
              <span class="text-amber-600 dark:text-amber-400">{{ lora ? 'през LoRa…' : 'изпраща се…' }}</span>
            </template>
            <template v-else>
              <carbon-checkmark-outline class="text-emerald-600 dark:text-emerald-400" />
              <span class="text-emerald-600 dark:text-emerald-400">доставено</span>
            </template>
          </div>
        </div>
      </div>
      <!-- Captions share one grid cell: caption 1 fades out as caption 2 fades in. -->
      <div v-if="caption || caption2" class="grid justify-items-center text-center text-2xl font-semibold">
        <p v-if="caption" class="col-start-1 row-start-1 transition-opacity duration-500" :class="caption2At !== undefined && s >= caption2At ? 'opacity-0' : vis(s, captionAt)">
          {{ caption }}
        </p>
        <p v-if="caption2" class="col-start-1 row-start-1 transition-opacity duration-500" :class="vis(s, caption2At)">
          {{ caption2 }}
        </p>
      </div>
    </div>

    <!-- Board + battery: slide in from the right (no scaling). -->
    <div
      v-if="boardAt !== undefined"
      class="flex flex-col items-center gap-3 transition-all duration-700"
      :class="boardIn ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'"
    >
      <div class="flex items-end gap-4">
        <!-- LoRa board: PCB with a whip antenna -->
        <svg viewBox="0 0 120 160" class="h-[150px] w-[112px]" aria-hidden="true">
          <line x1="96" y1="58" x2="96" y2="4" class="stroke-blue-600 dark:stroke-blue-400" stroke-width="7" stroke-linecap="round" />
          <rect x="8" y="58" width="104" height="96" rx="8" class="fill-blue-500 dark:fill-blue-400" />
          <rect x="28" y="80" width="40" height="30" rx="3" class="fill-white/80 dark:fill-slate-900/80" />
          <rect x="30" y="128" width="20" height="10" rx="2" class="fill-white/60 dark:fill-slate-900/60" />
        </svg>
        <!-- Battery -->
        <svg viewBox="0 0 60 120" class="h-[110px] w-[55px]" aria-hidden="true">
          <rect x="20" y="2" width="20" height="10" rx="2" class="fill-blue-600 dark:fill-blue-400" />
          <rect x="4" y="12" width="52" height="104" rx="8" class="fill-none stroke-blue-600 dark:stroke-blue-400" stroke-width="6" />
          <rect x="12" y="50" width="36" height="58" rx="3" class="fill-blue-500 dark:fill-blue-400" />
        </svg>
      </div>
      <span v-if="!caption2" class="text-lg text-blue-600 dark:text-blue-400">{{ boardLabel }}</span>
    </div>
  </div>
</template>
