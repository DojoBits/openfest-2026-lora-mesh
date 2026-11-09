<script setup lang="ts">
// Recurring motif: the same phone, linked over Bluetooth to a LoRa radio.
//   phone ─Bluetooth─ radio ))) LoRa ((( radio ─Bluetooth─ phone|laptop
// Same visual language as HookSwitch (slide 2): blue = Bluetooth hop and the
// radio board, emerald = the LoRa link through the air. Static (no clicks);
// the waves pulse, and `.lora-viz` freezes them under prefers-reduced-motion.
// Size it with a wrapper div (`<div class="mx-auto w-[760px]"><LinkChain/></div>`).
withDefaults(defineProps<{
  /** Right-hand endpoint: another phone, or a laptop (demo, Reticulum). */
  end?: 'phone' | 'laptop'
  /** Optional line under the chain. */
  caption?: string
}>(), { end: 'phone' })
</script>

<template>
  <div class="lora-viz flex w-full flex-col items-center gap-2">
    <svg viewBox="0 0 900 172" class="w-full" role="img" aria-label="Телефон, Bluetooth, LoRa радио, ефир, LoRa радио, Bluetooth, телефон">
      <defs>
        <marker id="ble-arrow-chainlink" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 Z" class="fill-water dark:fill-water" />
        </marker>
      </defs>
      <!-- left phone -->
      <g class="stroke-stone-deep dark:stroke-stone-deep" fill="none" stroke-width="5">
        <rect x="36" y="20" width="56" height="92" rx="12" />
        <line x1="56" y1="100" x2="72" y2="100" stroke-linecap="round" />
      </g>
      <!-- left Bluetooth hop -->
      <line x1="126" y1="66" x2="176" y2="66" class="ble-link stroke-blue-600 dark:stroke-blue-400" stroke-width="5" marker-start="url(#ble-arrow-chainlink)" marker-end="url(#ble-arrow-chainlink)" />
      <carbon-bluetooth x="139" y="76" width="24" height="24" class="text-blue-600 dark:text-blue-400" />
      <text x="151" y="52" text-anchor="middle" class="fill-water dark:fill-water" style="font-size: 19px" font-weight="600">Bluetooth</text>
      <!-- left radio -->
      <line x1="262" y1="44" x2="262" y2="8" class="stroke-water dark:stroke-water" stroke-width="6" stroke-linecap="round" />
      <rect x="208" y="44" width="62" height="56" rx="7" class="fill-water dark:fill-water" />
      <rect x="219" y="56" width="24" height="18" rx="2" class="fill-page/80 dark:fill-page/80" />

      <!-- LoRa through the air: waves leave the left antenna, arrive at the right -->
      <g class="stroke-moss dark:stroke-moss" fill="none" stroke-width="5" stroke-linecap="round">
        <path class="chain-wave" d="M290 14 A26 26 0 0 1 290 54" />
        <path class="chain-wave [animation-delay:0.3s]" d="M310 2 A44 44 0 0 1 310 66" />
        <path class="chain-wave [animation-delay:0.6s]" d="M590 2 A44 44 0 0 0 590 66" />
        <path class="chain-wave [animation-delay:0.9s]" d="M610 14 A26 26 0 0 0 610 54" />
        <line x1="360" y1="34" x2="540" y2="34" stroke-width="4" stroke-dasharray="3 12" />
      </g>
      <text x="450" y="80" text-anchor="middle" class="fill-moss dark:fill-moss" style="font-size: 32px" font-weight="700">LoRa</text>

      <!-- right radio -->
      <line x1="638" y1="44" x2="638" y2="8" class="stroke-water dark:stroke-water" stroke-width="6" stroke-linecap="round" />
      <rect x="630" y="44" width="62" height="56" rx="7" class="fill-water dark:fill-water" />
      <rect x="657" y="56" width="24" height="18" rx="2" class="fill-page/80 dark:fill-page/80" />
      <!-- right Bluetooth hop -->
      <line x1="724" y1="66" x2="774" y2="66" class="ble-link stroke-blue-600 dark:stroke-blue-400" stroke-width="5" marker-start="url(#ble-arrow-chainlink)" marker-end="url(#ble-arrow-chainlink)" />
      <carbon-bluetooth x="737" y="76" width="24" height="24" class="text-blue-600 dark:text-blue-400" />
      <text x="749" y="52" text-anchor="middle" class="fill-water dark:fill-water" style="font-size: 19px" font-weight="600">Bluetooth</text>
      <!-- right endpoint -->
      <g class="stroke-stone-deep dark:stroke-stone-deep" fill="none" stroke-width="5" stroke-linecap="round">
        <template v-if="end === 'phone'">
          <rect x="808" y="20" width="56" height="92" rx="12" />
          <line x1="828" y1="100" x2="844" y2="100" />
        </template>
        <template v-else>
          <rect x="806" y="32" width="70" height="50" rx="5" />
          <line x1="796" y1="94" x2="886" y2="94" />
        </template>
      </g>

      <!-- role labels: the phone is the screen, the radio is the link -->
      <g class="fill-stone-deep dark:fill-stone-deep" style="font-size: 26px" text-anchor="middle">
        <text x="64" y="150">телефон</text>
        <text x="239" y="132">радио</text>
        <text x="661" y="132">радио</text>
        <text x="836" y="150">{{ end === 'phone' ? 'телефон' : 'лаптоп' }}</text>
      </g>
    </svg>
    <p v-if="caption" class="m-0 text-center text-2xl font-bold text-moss dark:text-moss">{{ caption }}</p>
  </div>
</template>

<style scoped>
.chain-wave {
  animation: chain-wave 1.6s ease-in-out infinite;
}
@keyframes chain-wave {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 1; }
}
</style>
