<script setup lang="ts">
// Slide 31 „Канали“: one device's channel table as a strip of 8 slots.
//  - always: slots 0–7 and the bracket „обща честота и preset“ under them
//    (secondary channels ignore radio settings; only the PSK differs).
//  - click ROLES_AT: „основен“ + „позиция, батерия“ (what slot 0 sends by
//    default) under slot 0, „допълнителни“ over 1–7.
//  - click 3: slot 0 (default channel) and slot 1 (Sofia city channel) fill,
//    both with the public key AQ== (red).
//  - click 4: slot 2 fills with a private channel (random key, green).
// Slots 0–2 are wider so a name and a key chip fit; empty slots are dashed.
import { CHANNEL_SLOTS, CHANNEL_SLOTS_TOTAL, ROLES_AT } from './data/channelTable'
import { TONE } from './data/tones'
import { vis } from './data/format'
import { useStep } from './data/useStep'

const props = defineProps<{ step?: number }>()
const s = useStep(CHANNEL_SLOTS_TOTAL, () => props.step)
</script>

<template>
  <div class="flex flex-col items-stretch gap-1">
    <!-- role label over the secondary slots -->
    <div class="flex gap-2 transition-opacity duration-500" :class="vis(s, ROLES_AT)">
      <div class="w-[150px] shrink-0" />
      <div class="flex-1 border-b-2 border-stone/60 pb-1 text-center text-lg text-stone-deep dark:border-stone/60 dark:text-stone-deep">допълнителни (1–7)</div>
    </div>

    <div class="flex gap-2">
      <div
        v-for="cell in CHANNEL_SLOTS" :key="cell.index"
        class="flex h-[104px] flex-col items-center justify-start rounded-xl border-2 px-2 py-1"
        :class="[
          cell.index < 3 ? 'w-[150px] shrink-0' : 'flex-1',
          cell.channel ? 'border-solid border-stone/60 dark:border-stone/60' : 'border-dashed border-stone/40 dark:border-stone/50',
        ]"
      >
        <span class="font-mono text-lg text-stone-deep dark:text-stone-deep">{{ cell.index }}</span>
        <div v-if="cell.channel" class="flex flex-col items-center gap-1 transition-opacity duration-500" :class="vis(s, cell.channel.at)">
          <span class="text-xl font-semibold">{{ cell.channel.name }}</span>
          <span
            class="flex items-center gap-1 rounded-full border-2 px-3 text-lg font-bold"
            :class="cell.channel.private
              ? [TONE.emerald.soft, TONE.emerald.border, TONE.emerald.text]
              : [TONE.red.soft, TONE.red.border, TONE.red.text]"
          >
            <carbon-locked v-if="cell.channel.private" class="shrink-0" />
            <carbon-unlocked v-else class="shrink-0" />
            <span class="font-mono" style="font-variant-ligatures: none">{{ cell.channel.key }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- role label under the primary slot + shared radio settings bracket -->
    <div class="flex gap-2">
      <div class="flex w-[150px] shrink-0 flex-col items-center leading-tight transition-opacity duration-500" :class="vis(s, ROLES_AT)">
        <span class="text-lg font-semibold text-ink dark:text-ink">основен</span>
        <!-- firmware defaults: NodeInfo, device telemetry and position go here -->
        <span class="whitespace-nowrap text-base text-stone-deep dark:text-stone-deep">+ позиция, батерия</span>
      </div>
    </div>
    <div class="mt-1 border-t-2 border-stone/60 pt-1 text-center text-lg text-stone-deep dark:border-stone/60 dark:text-stone-deep">обща честота и preset</div>
  </div>
</template>
