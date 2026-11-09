<script setup lang="ts">
// Closing recap strip: three small scenes in one row, one panel per click.
// Scene 1 is a phone talking to a LoRa radio over Bluetooth (the deck's dotted
// blue .ble-link) and the radio reaching far over dashed waves. Scene 2 lists
// who relays in each project. Scene 3 is one radio joining the community network: a dashed
// LoRa link to three community nodes, themselves linked by dashed links.
// Wireless links are always dashed, never solid.
import { useStep } from './data/useStep'
import { vis } from './data/format'
import { RELAY_ROWS, TAKEAWAYS } from './data/takeaways'
import { PROJECT_COLOUR } from './data/tones'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(3, () => props.step, () => props.startAt ?? 0)

// Scene 3: the community network the one radio joins.
const COMMUNITY_NODES = [{ x: 240, y: 112 }, { x: 330, y: 76 }, { x: 330, y: 152 }]
</script>

<template>
  <div class="lora-viz grid h-full grid-cols-3 content-center gap-6">
    <div
      v-for="(t, i) in TAKEAWAYS" :key="t.id"
      class="card-surface flex flex-col items-center justify-center gap-4 h-[390px] rounded-xl border p-5 text-center transition-opacity duration-500"
      :class="vis(s, i + 1)"
    >
      <h3 class="text-3xl font-bold text-ink-strong">
        {{ t.label }}
      </h3>

      <!-- 1. phone -> Bluetooth -> radio -> waves going far -->
      <svg v-if="t.id === 'lora'" viewBox="0 40 400 150" class="w-full" aria-hidden="true">
        <rect x="14" y="62" width="44" height="78" rx="9" class="fill-page stroke-ink" stroke-width="4" />
        <rect x="21" y="74" width="30" height="46" rx="3" class="fill-water/20" />
        <line x1="66" y1="104" x2="112" y2="104" class="ble-link stroke-water" stroke-width="5" />
        <MeshRadio :x="120" :y="92" :k="1.1" />
        <path v-for="(r, j) in [30, 60, 90]" :key="j" :d="`M 172 ${108 - r} A ${r} ${r} 0 0 1 172 ${108 + r}`" fill="none" class="stroke-moss" stroke-width="4" stroke-dasharray="7 9" stroke-linecap="round" :style="{ opacity: 1 - j * 0.2 }" />
        <line x1="215" y1="178" x2="385" y2="178" class="stroke-ink" stroke-width="3" stroke-dasharray="7 9" stroke-linecap="round" />
        <text x="300" y="166" text-anchor="middle" class="fill-ink-strong font-bold" style="font-size: 30px">км</text>
      </svg>

      <!-- 2. who relays -->
      <div v-else-if="t.id === 'relay'" class="flex w-full flex-col gap-4">
        <div v-for="r in RELAY_ROWS" :key="r.project" class="flex items-center gap-4 text-left">
          <div class="flex w-16 shrink-0 justify-center" :class="PROJECT_COLOUR[r.colour].text">
            <ProjectLogo :project="r.project" class="w-12" />
          </div>
          <div class="text-xl leading-snug">
            <div class="font-bold" :class="PROJECT_COLOUR[r.colour].text">
              {{ r.name }}
            </div>
            <div class="text-ink-strong">
              {{ r.who }}
            </div>
          </div>
        </div>
      </div>

      <!-- 3. one radio, dashed link into the community network -->
      <svg v-else viewBox="20 50 360 130" class="w-full" aria-hidden="true">
        <MeshRadio :x="40" :y="90" :k="1.3" />
        <g class="stroke-moss" stroke-width="5" stroke-dasharray="8 12" stroke-linecap="round">
          <line x1="112" y1="112" x2="240" y2="112" />
          <line x1="240" y1="112" x2="330" y2="76" />
          <line x1="240" y1="112" x2="330" y2="152" />
          <line x1="330" y1="76" x2="330" y2="152" />
        </g>
        <circle v-for="n in COMMUNITY_NODES" :key="n.x" :cx="n.x" :cy="n.y" r="14" class="fill-moss stroke-parchment-hi" stroke-width="4" />
      </svg>

      <p v-if="t.fact" class="text-xl text-ink-strong">
        {{ t.fact }}
      </p>
    </div>
  </div>
</template>
