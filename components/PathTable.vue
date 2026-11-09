<script setup lang="ts">
// Slide 46 „Таблица с пътища“: the path table of one transport node, printed
// the way `rnpath -t` prints it. Left: the node as on the slide 45 map.
// Clicks: 1 the rows, 2 the hobbit row lit with its next hop marked, 3 two short lines.
import type { PathRow } from './data/pathTableRows'
import { DOT, PATH_COMMAND, PATH_ROWS, hashPrefix } from './data/pathTableRows'
import type { NodeId } from './data/sofia'
import { INK, PROJECT_COLOUR, TONE } from './data/tones'
import { vis } from './data/format'
import { useStep } from './data/useStep'
import BeaconFire from './BeaconFire.vue'
import Elf from './Elf.vue'
import Hobbit from './Hobbit.vue'

const props = withDefaults(defineProps<{
  rows?: PathRow[]
  step?: number
  startAt?: number
}>(), {})

const rows = props.rows ?? PATH_ROWS
const s = useStep(3, () => props.step, () => props.startAt ?? 0)
const wine = PROJECT_COLOUR.fuchsia

// While the label is up, the other rows step back
const dim = (r: PathRow) => (s.value >= 2 && !r.highlight ? 'opacity-40' : 'opacity-100')
const lit = (r: PathRow) => s.value >= 2 && r.highlight
// The next hop of the lit row gets a ring in the picture too
const litNext = (id: NodeId) => s.value >= 2 && rows.some(r => r.highlight && r.nextHop === id)
const dot = (id: NodeId) => TONE[DOT[id]!].fill
</script>

<template>
  <div class="lora-viz w-full">
    <div class="flex items-center">
      <!-- the node as on the slide 45 map: hill, beacon fire, wine transport ring.
           Its three neighbours are small, wireless links are dashed -->
      <svg data-node-visual viewBox="0 0 320 336" class="h-[336px] w-[320px] shrink-0" role="img" aria-label="Огън на хълма и неговите съседи">
        <!-- links first, so the sprites sit on top. Wireless is dashed, the TCP link dash-dot -->
        <g fill="none" stroke-width="3" stroke-linecap="round">
          <path d="M36,114 L90,214" stroke-dasharray="5 9" :class="INK.line" />
          <path d="M126,226 L178,168" stroke-dasharray="5 9" :class="INK.line" />
          <path d="M202,128 L262,104" stroke-dasharray="5 9" :class="INK.line" />
          <path d="M128,254 L246,290" stroke-dasharray="14 6 3 6" :class="wine.stroke" />
          <!-- dashed arrow from the node to its table -->
          <path d="M140,236 H318" stroke-dasharray="6 8" :class="wine.stroke" stroke-width="4" />
          <path d="M310,226 L322,236 L310,246" :class="wine.stroke" stroke-width="4" stroke-linejoin="round" />
        </g>
        <!-- the hill with its fire and the ring of a transport node, as on the map -->
        <path d="M36,286 Q105,186 174,286" class="fill-moss/25 stroke-earth-deep dark:fill-moss/25 dark:stroke-earth-deep" style="stroke-width: 3" />
        <path d="M105,240 V222" class="stroke-earth-deep dark:stroke-earth-deep" style="stroke-width: 4; stroke-linecap: round" />
        <BeaconFire :x="105" :y="222" />
        <circle cx="105" cy="240" r="26" fill="none" :class="wine.stroke" stroke-width="5" />
        <rect x="87" y="222" width="36" height="36" rx="6" :class="TONE.slate.fill" />
        <text x="105" y="324" text-anchor="middle" style="font-size: 20px; paint-order: stroke; stroke-width: 6px; stroke-linejoin: round; font-weight: 700" :class="[INK.text, INK.halo]">Огън на хълма</text>

        <!-- neighbours and the hobbit behind the stone tower, each with the start of its hash.
             Labels sit on the free side of every sprite, away from the links -->
        <g data-neighbour-icon="pes">
          <text x="46" y="20" text-anchor="middle" style="font-size: 20px; paint-order: stroke; stroke-width: 6px; stroke-linejoin: round" :class="[INK.text, INK.halo]">Елф</text>
          <circle cx="16" cy="38" r="6" :class="[dot('pes'), 'dark:opacity-90']" />
          <text x="26" y="44" style="font-size: 17px; paint-order: stroke; stroke-width: 6px; stroke-linejoin: round" class="font-mono" :class="[INK.text, INK.halo]">{{ hashPrefix('pes') }}</text>
          <Elf :x="30" :y="106" :scale="0.36" phone="pocket" />
        </g>
        <g data-neighbour-icon="rMla">
          <circle v-if="litNext('rMla')" data-next-ring cx="190" cy="146" r="26" fill="none" :class="wine.stroke" stroke-width="5" />
          <g transform="translate(190 146) scale(0.34)">
            <path d="M-34,84 L-26,-14 L-32,-14 L-32,-34 L-19,-34 L-19,-24 L-7,-24 L-7,-34 L7,-34 L7,-24 L19,-24 L19,-34 L32,-34 L32,-14 L26,-14 L34,84 Z" class="fill-parchment-lo stroke-earth-deep dark:fill-parchment-lo dark:stroke-earth-deep" style="stroke-width: 6; stroke-linejoin: round" />
            <path d="M-9,84 V70 A9,9 0 0 1 9,70 V84 Z" class="fill-earth-deep dark:fill-earth-deep" />
            <rect x="-18" y="-18" width="36" height="36" rx="6" :class="TONE.slate.fill" />
          </g>
          <text x="222" y="150" text-anchor="start" style="font-size: 20px; paint-order: stroke; stroke-width: 6px; stroke-linejoin: round" :class="[INK.text, INK.halo]">Каменна</text>
          <text x="222" y="172" text-anchor="start" style="font-size: 20px; paint-order: stroke; stroke-width: 6px; stroke-linejoin: round" :class="[INK.text, INK.halo]">кула</text>
          <circle cx="212" cy="192" r="6" :class="[dot('rMla'), 'dark:opacity-90']" />
          <text x="222" y="198" style="font-size: 17px; paint-order: stroke; stroke-width: 6px; stroke-linejoin: round" class="font-mono" :class="[INK.text, INK.halo]">{{ hashPrefix('rMla') }}</text>
        </g>
        <g data-neighbour-icon="me">
          <text x="274" y="20" text-anchor="middle" style="font-size: 20px; paint-order: stroke; stroke-width: 6px; stroke-linejoin: round" :class="[INK.text, INK.halo]">Хобит</text>
          <circle cx="246" cy="38" r="6" :class="[dot('me'), 'dark:opacity-90']" />
          <text x="256" y="44" style="font-size: 17px; paint-order: stroke; stroke-width: 6px; stroke-linejoin: round" class="font-mono" :class="[INK.text, INK.halo]">{{ hashPrefix('me') }}</text>
          <Hobbit :x="276" :y="106" :scale="0.34" phone="pocket" flip />
        </g>
        <g data-neighbour-icon="plo">
          <rect x="246" y="276" width="26" height="26" rx="5" :class="TONE.slate.fill" />
          <text x="259" y="262" text-anchor="middle" style="font-size: 20px; paint-order: stroke; stroke-width: 6px; stroke-linejoin: round" :class="[INK.text, INK.halo]">Град</text>
          <text x="214" y="312" text-anchor="middle" style="font-size: 20px; paint-order: stroke; stroke-width: 6px; stroke-linejoin: round; font-weight: 700" :class="[wine.label, INK.halo]">TCP</text>
          <circle cx="250" cy="322" r="6" :class="[dot('plo'), 'dark:opacity-90']" />
          <text x="260" y="328" style="font-size: 17px; paint-order: stroke; stroke-width: 6px; stroke-linejoin: round" class="font-mono" :class="[INK.text, INK.halo]">{{ hashPrefix('plo') }}</text>
        </g>
      </svg>

      <!-- the table, as the terminal prints it -->
      <div data-terminal class="min-w-0 flex-1 overflow-hidden rounded-xl border-2 bg-parchment dark:bg-parchment" :class="wine.border">
        <div class="flex items-center gap-1.5 border-b border-stone/30 bg-parchment-lo px-3 py-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-trail/70" /><span class="h-2.5 w-2.5 rounded-full bg-gold/70" /><span class="h-2.5 w-2.5 rounded-full bg-moss/70" />
          <span class="ml-3 font-mono text-base opacity-70">rnsd@hill</span>
        </div>
        <div class="px-4 py-2 font-mono text-[13px] leading-snug">
          <div class="pb-1 font-bold" data-command>$ {{ PATH_COMMAND }}</div>
          <div
            v-for="r in rows" :key="r.dest" data-row
            class="border-t py-1 transition-opacity duration-500 border-edge/40"
            :class="[vis(s, 1), s >= 1 ? dim(r) : '']"
          >
            <div data-dest>
              <span class="mr-1.5 inline-block h-3 w-3 rounded-full" :class="TONE[r.destTone].bg" data-dot />&lt;{{ r.hash }}&gt; is <span class="font-bold">{{ r.hopsText }}</span> away
            </div>
            <div class="ml-4" data-via>
              via
              <span class="rounded-md border-2 px-1 transition-all duration-500" :class="lit(r) ? [wine.border, wine.soft] : 'border-transparent'">
                <span class="mr-1.5 inline-block h-3 w-3 rounded-full" :class="TONE[r.nextTone].bg" data-dot />&lt;{{ r.nextHash }}&gt;
              </span>
            </div>
            <div class="ml-4" data-tail>on <span class="font-bold">{{ r.ifaceStr }}</span> expires {{ r.expires }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- label for click 2: it keeps its space so nothing jumps -->
    <div class="mt-1 flex items-center justify-end gap-2 text-lg font-bold transition-opacity duration-500" :class="[wine.text, vis(s, 2)]" data-label>
      <carbon-arrow-up class="text-2xl" />
      Само следващият скок, не целият път
    </div>

    <div class="mt-1 flex flex-col text-lg transition-opacity duration-500" :class="vis(s, 3)" data-lines>
      <div class="flex items-center gap-3"><carbon-time class="text-2xl" :class="wine.text" />Записът изтича след 7 дни, таблицата не расте безкрайно</div>
      <div class="flex items-center gap-3"><carbon-help class="text-2xl" :class="wine.text" />Пропуснал обявата? Транспортният възел я повтаря.</div>
    </div>
  </div>
</template>
