<script setup lang="ts">
// Slide 2 (hook): one tower, several phones; the tower fails; the phones carry
// on through LoRa radios that link to each other and to a fixed router.
// Shire theme: the network tower is a dark tower with a flaming eye (the eye
// closes when it fails), and each phone belongs to one of the Fellowship, left
// to right hobbit, dwarf, human, elf (Hobbit/Dwarf/Human/Elf.vue, one props
// contract, so they are interchangeable via <component :is>): sender (hobbit)
// and receiver (elf) large in front; the two relays (dwarf, human) smaller,
// further back on the hills. All four hold their phone up. A muted hobbit
// village (ShireBackdrop) sits behind everything. Phones and radios scale with
// their figure (data/hookFrames.ts, data/fellowGeometry.ts), so every link
// endpoint is computed, not typed.
// One SVG scene, every element always drawn; frames (data/hookFrames.ts,
// tested) only change opacity, so nothing moves or reflows between clicks.
//   frame 0: only the Shire and the four figures (arms down, no phones, tower or links);
//   frame 1: the eye tower, a gold ring in every hand, slate dotted links
//            tower → every ring (flowing); links start TOWER_CLEAR out from
//            the antenna so none runs behind the mast;
//   frame 2: links turn red and stop flowing, tower crossed out, rings go dull;
//   frame 3: like frame 1, but a cell tower (CellTower) and phones with signal bars;
//   frame 4: like frame 2, the cell tower falls, phones show signal-off;
//   frame 5: tower ghosts to opacity-20, the radios appear, each carried by
//            its own figure (HookMount): clipped behind the hobbit's and the
//            elf's phones, on the dwarf's belt, in the human's backpack (the
//            belt and backpack radios with a short blue Bluetooth arc to
//            their phone), plus a fixed router on a mast on the green hobbit
//            hole's roof; neighbouring radios link (LoRa, emerald), so every
//            LoRa hop ends on a figure's radio or on the router;
//   frame 6: LoRa links flow first phone → last, message bubbles on both ends.
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useNav } from '@slidev/client'
import { useStep } from './data/useStep'
import Hobbit from './Hobbit.vue'
import Dwarf from './Dwarf.vue'
import Human from './Human.vue'
import Elf from './Elf.vue'
import { HOOK_WAYPOINTS, HOOK_ANIM_END, hookAnimAt, hookAnimFinal } from './data/hookAnim'
import { HOOK_BLE, HOOK_CLICKS, HOOK_LABELS, HOOK_MESH, HOOK_PHONE, HOOK_PHONES, HOOK_BUBBLES, HOOK_RADIO, HOOK_ROUTER, HOOK_SOLAR, ROUTER_MAST, hookFrame, hookFigure, hookTowerLink, hookRadio, hookNodeTip, hookRouterRadio } from './data/hookFrames'

// `captions` = false hides the per-frame header caption (slide 2 shows the scene only).
const props = withDefaults(defineProps<{ step?: number, startAt?: number, captions?: boolean }>(), { captions: true })
const s = useStep(HOOK_CLICKS, () => props.step, () => props.startAt ?? 0)
const f = computed(() => hookFrame(s.value))

/** Mobile links: from HOOK_TOWER_CLEAR out of the tower's antenna point down to the phone (hookTowerLink). */
const phones = HOOK_PHONES.map((p) => {
  const h = hookFigure(p)
  return { ...p, ...hookTowerLink(p), kind: h.kind, h, r: hookRadio(p) }
})
/** Drawing per kind; all four share Hobbit's props contract. */
const FIGURES = { hobbit: Hobbit, dwarf: Dwarf, human: Human, elf: Elf } as const
/** Per-figure extras: far-arm pose, plus the hobbit's palette (only Hobbit has palettes). */
const LOOKS = [
  { palette: 'green', pose: 'hip' },
  { pose: 'relaxed' },
  { pose: 'hip' },
  { pose: 'relaxed' },
] as const
/**
 * Bluetooth hop (HOOK_BLE: every radio not clipped to its phone), no text
 * label, the blue arc says it:
 *   pack — from the phone's top edge, a quarter in from its outer side, up to
 *          the radio's near lower corner. A straight line would graze the
 *          head, so it is a quadratic arc whose control point sits a third of
 *          the way across and 38 × figure-scale units above the radio corner:
 *          it rises steeply off the phone and passes over the head;
 *   belt — the radio hangs just under the phone, so a short arc from the
 *          phone's outer edge (6 above its bottom) bows outwards, 14 ×
 *          figure-scale beyond the outer of the two edges, and comes back in
 *          to the radio's outer edge at mid-height, clear of the whip.
 */
const ble = HOOK_BLE.map((i) => {
  const p = phones[i]
  const rw = HOOK_RADIO.w * p.r.k
  const rh = HOOK_RADIO.h * p.r.k
  if (p.mount === 'belt') {
    const x1 = p.x + (HOOK_PHONE.w * p.k / 2) * p.side
    const y1 = p.y + HOOK_PHONE.h * p.k - 6
    const x2 = (p.side === 1 ? p.r.x + rw : p.r.x) + p.side
    const y2 = p.r.y + rh * 0.55
    const cx = (p.side === 1 ? Math.max(x1, x2) : Math.min(x1, x2)) + 14 * p.h.scale * p.side
    return { d: `M${x1} ${y1} Q${cx} ${(y1 + y2) / 2} ${x2} ${y2}` }
  }
  const near = p.r.ant === 1 ? p.r.x : p.r.x + rw
  const x1 = p.x - (HOOK_PHONE.w * p.k / 4) * p.side
  const y1 = p.y - 3
  const x2 = near - 2 * p.r.ant
  const y2 = p.r.y + rh * 0.75
  const cx = x1 + (x2 - x1) / 3
  const cy = y2 - 38 * p.h.scale
  return { d: `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}` }
})
/**
 * Solar panel on the router mast (HOOK_SOLAR box): a parallelogram whose top
 * edge is shifted 4 right of its bottom edge, so it reads as tilted towards the
 * viewer. Cell grid: two dividers parallel to the slanted sides, one across.
 */
const solar = (() => {
  const { x0, x1, y0, y1 } = HOOK_SOLAR
  const skew = 4
  // point at fraction u across the bottom edge, v up the panel (0 bottom, 1 top)
  const at = (u: number, v: number) => `${x0 + (x1 - skew - x0) * u + skew * v} ${y1 - (y1 - y0) * v}`
  return {
    frame: `M${at(0, 0)} L${at(1, 0)} L${at(1, 1)} L${at(0, 1)} Z`,
    grid: `M${at(1 / 3, 0)} L${at(1 / 3, 1)} M${at(2 / 3, 0)} L${at(2 / 3, 1)} M${at(0, 0.5)} L${at(1, 0.5)}`,
  }
})()

/** The fixed router on the green hobbit hole's roof: radio on a mast (HOOK_ROUTER = mast foot). */
const router = hookRouterRadio()
/** LoRa links between neighbouring nodes (figures' radios and the router), antenna tip to antenna tip. */
const mesh = HOOK_MESH.map(([a, b]) => ({ a: hookNodeTip(a), b: hookNodeTip(b) }))
const frames = Array.from({ length: HOOK_CLICKS + 1 }, (_, i) => i)
const last = phones.length - 1
/** Tower links of held phones run behind the figure; pocket phones' links (none at present) would be drawn in front, down to the phone's top edge. */
const behind = phones.filter(p => p.hold === 'hand')
const front = phones.filter(p => p.hold === 'pocket')
const bubble = HOOK_BUBBLES

// ── Click 3 animation: the message hops dwarf → router → ranger → elf ──
// hookAnimAt(ms) (data/hookAnim.ts, tested) gives bubble/token/pulse/glow for
// the elapsed time; a requestAnimationFrame clock feeds it. Everything that
// is not live playback shows the FINAL state: print/PDF export, a pinned
// `step` (gallery, overview), prefers-reduced-motion. Leaving click 3 stops
// the clock; coming back replays from zero.
const { isPrintMode } = useNav()
const still = props.step !== undefined || isPrintMode.value
  || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
const anim = ref(hookAnimFinal())
let raf = 0
const stop = () => { if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(raf) }
watch(s, (v) => {
  stop()
  if (v !== HOOK_CLICKS || still || typeof requestAnimationFrame === 'undefined') {
    anim.value = hookAnimFinal()
    return
  }
  const t0 = performance.now()
  anim.value = hookAnimAt(0)
  const tick = (now: number) => {
    const ms = now - t0
    anim.value = hookAnimAt(ms)
    if (ms < HOOK_ANIM_END) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}, { immediate: true })
onBeforeUnmount(stop)
/** Opacity of a message element: hidden before click 3, otherwise as animated. */
const vis = (v: number) => (f.value.delivered ? v : 0)
/** Hop lines and radio rings, by index; the token pill sits above the antenna tip. */
const hops = HOOK_WAYPOINTS.slice(0, -1).map((a, i) => ({ a, b: HOOK_WAYPOINTS[i + 1] }))
</script>

<template>
  <div class="lora-viz flex w-full flex-col items-center gap-4">
    <!-- Header caption: one per frame, all in one grid cell so nothing shifts. -->
    <div v-if="captions" class="grid h-12 items-center text-center text-3xl font-bold">
      <p
        v-for="i in frames" :key="i"
        class="col-start-1 row-start-1 transition-opacity duration-500"
        :class="[s === i ? 'opacity-100' : 'opacity-0', i === 2 ? 'text-red-600 dark:text-red-400' : i >= 3 ? 'text-emerald-600 dark:text-emerald-400' : '']"
      >{{ hookFrame(i).caption }}</p>
    </div>

    <svg viewBox="0 0 900 400" class="h-[400px] w-[900px]" aria-label="Тъмна кула с око; хобит, джудже, човек и елф с телефони; кулата спира; телефоните се свързват през LoRa радиа">
      <!-- ── Scenery: the hobbit village, behind everything ── -->
      <ShireBackdrop :smoke="!f.mesh" />

      <!-- ── Tower and its links: solid while up, red when down, ghosted once the mesh takes over ── -->
      <g class="transition-opacity duration-700" :class="!f.network ? 'opacity-0' : f.mesh ? 'opacity-20 dark:opacity-30' : 'opacity-100'">
        <g v-for="up in [true, false]" :key="String(up)" class="transition-opacity duration-500" :class="(f.tower === 'up') === up ? 'opacity-100' : 'opacity-0'">
          <line v-for="p in behind" :key="p.x" :x1="p.from.x" :y1="p.from.y" :x2="p.end.x" :y2="p.end.y" :class="up ? 'cell-link stroke-slate-500 dark:stroke-slate-400' : 'stroke-red-600 dark:stroke-red-400'" stroke-width="5" stroke-dasharray="2 12" stroke-linecap="round" />
        </g>
        <!-- clicks 1 and 2: dark tower with the flaming eye (EyeTower), eye open while up, shut and greyed when down -->
        <g class="transition-opacity duration-500" :class="f.realm === 'ring' ? 'opacity-100' : 'opacity-0'"><EyeTower :down="f.tower === 'down'" /></g>
        <!-- clicks 3 to 6: today's lattice cell tower in the same place, the same links -->
        <g class="transition-opacity duration-500" :class="f.realm === 'phone' ? 'opacity-100' : 'opacity-0'"><CellTower :down="f.tower === 'down'" /></g>
        <!-- the break: tower crossed out -->
        <g class="transition-opacity duration-500" :class="f.tower === 'down' ? 'opacity-100' : 'opacity-0'">
          <circle cx="450" cy="96" r="24" class="fill-page stroke-red-600 dark:fill-page dark:stroke-red-400" stroke-width="4" />
          <path d="M440 86 L460 106 M460 86 L440 106" class="stroke-red-600 dark:stroke-red-400" stroke-width="5" stroke-linecap="round" />
        </g>
      </g>


      <!-- ── LoRa links between neighbouring radios: behind the figures, so a link
           running past a distant figure goes behind the feet, not through the body ── -->
      <g class="transition-opacity duration-700" :class="f.mesh ? 'opacity-100' : 'opacity-0'">
        <line
          v-for="(m, i) in mesh" :key="i"
          :x1="m.a.x" :y1="m.a.y" :x2="m.b.x" :y2="m.b.y"
          class="stroke-emerald-600 dark:stroke-emerald-400" :class="f.delivered ? 'hook-flow' : ''"
          stroke-width="5" stroke-dasharray="2 12" stroke-linecap="round"
        />
        <!-- the hop the message is on lights up, then fades -->
        <line
          v-for="(h, i) in hops" :key="`glow${i}`"
          :x1="h.a.x" :y1="h.a.y" :x2="h.b.x" :y2="h.b.y" :style="{ opacity: vis(anim.glow[i]) }"
          class="stroke-emerald-300 dark:stroke-emerald-200"
          stroke-width="9" stroke-dasharray="2 12" stroke-linecap="round"
        />
      </g>

      <!-- ── The four figures, each holding a phone; only the phone's status icon changes ── -->
      <component
        :is="FIGURES[p.kind]" v-for="(p, i) in phones" :key="p.x"
        :x="p.h.cx" :y="p.h.gy" :scale="p.h.scale" :phone="p.hold" :flip="p.side === -1"
        v-bind="LOOKS[i]"
        :idle="!f.network" :mood="f.moods[i]" :pack="p.mount === 'pack'" :bow="p.kind === 'elf'"
      >
        <!-- the phone at k = 1 is HOOK_PHONE (34 × 56); scaled to the figure's hand or pocket -->
        <!-- radio in the slot, so the phone (phone case) or the pack rim (backpack) covers its lower part; a belt radio sits in front of the hip -->
        <g class="transition-opacity duration-700" :class="f.mesh ? 'opacity-100' : 'opacity-0'">
          <MeshRadio :x="p.r.x" :y="p.r.y" :k="p.r.k" :ant="p.r.ant" />
          <!-- belt clip: a short dark strap across the radio, in line with the belt -->
          <path
            v-if="p.mount === 'belt'" :d="`M${p.r.x - 1} ${p.h.gy - 49 * p.h.scale} h${HOOK_RADIO.w * p.r.k + 2}`"
            class="stroke-amber-900 dark:stroke-amber-300" stroke-width="3" stroke-linecap="round"
          />
        </g>
        <!-- clicks 1 and 2: a ring held up where the phone will be, bound to the Eye's tower.
             Gold with a glow while the tower is up, dull stone once it falls (the ring loses its power). -->
        <g :transform="`translate(${p.x} ${p.y}) scale(${p.k})`" class="hook-ring transition-opacity duration-700" :class="f.network && f.realm === 'ring' ? 'opacity-100' : 'opacity-0'">
          <circle cx="0" cy="16" r="20" class="fill-gold/30 transition-opacity duration-500" :class="f.tower === 'up' ? 'opacity-100' : 'opacity-0'" />
          <ellipse cx="0" cy="16" rx="13" ry="11" fill="none" class="transition-[stroke] duration-500" :class="f.tower === 'up' ? 'stroke-gold-deep' : 'stroke-stone'" stroke-width="7" />
          <path d="M-8 9 A10 8 0 0 1 4 6" fill="none" class="stroke-parchment-hi transition-opacity duration-500" :class="f.tower === 'up' ? 'opacity-100' : 'opacity-0'" stroke-width="2.5" stroke-linecap="round" />
        </g>
        <!-- from click 3: the phone, first on the cell tower, then with its LoRa radio -->
        <g :transform="`translate(${p.x} ${p.y}) scale(${p.k})`" class="hook-phone transition-opacity duration-700" :class="f.realm === 'phone' ? 'opacity-100' : 'opacity-0'">
          <rect :x="-HOOK_PHONE.w / 2" y="0" :width="HOOK_PHONE.w" :height="HOOK_PHONE.h" rx="7" class="fill-white stroke-slate-700 dark:fill-slate-900 dark:stroke-slate-300" stroke-width="4" />
          <!-- phone case: the radio's clip wraps round the phone's edge on the radio side (mesh only) -->
          <path
            v-if="p.mount === 'phone'" :d="`M${p.side * (HOOK_PHONE.w / 2 - 4)} 10 h${p.side * 8} v22 h${-p.side * 8}`"
            class="fill-blue-500 stroke-slate-800 transition-opacity duration-700 dark:fill-blue-400 dark:stroke-slate-200" :class="f.mesh ? 'opacity-100' : 'opacity-0'"
            stroke-width="3" stroke-linejoin="round"
          />
          <carbon-connection-signal x="-11" y="5" width="22" height="22" class="text-slate-600 transition-opacity duration-500 dark:text-slate-300" :class="f.tower === 'up' ? 'opacity-100' : 'opacity-0'" />
          <carbon-connection-signal-off x="-11" y="5" width="22" height="22" class="text-red-600 transition-opacity duration-500 dark:text-red-400" :class="f.tower === 'down' && !f.mesh ? 'opacity-100' : 'opacity-0'" />
          <carbon-bluetooth x="-11" y="5" width="22" height="22" class="text-blue-600 transition-opacity duration-500 dark:text-blue-400" :class="f.mesh ? 'opacity-100' : 'opacity-0'" />
        </g>
      </component>

      <!-- ── Tower links of the pocket phones, in front of their figures so they reach the phone ── -->
      <g class="transition-opacity duration-700" :class="!f.network ? 'opacity-0' : f.mesh ? 'opacity-20 dark:opacity-30' : 'opacity-100'">
        <g v-for="up in [true, false]" :key="String(up)" class="transition-opacity duration-500" :class="(f.tower === 'up') === up ? 'opacity-100' : 'opacity-0'">
          <line v-for="p in front" :key="p.x" :x1="p.from.x" :y1="p.from.y" :x2="p.end.x" :y2="p.end.y" :class="up ? 'cell-link stroke-slate-500 dark:stroke-slate-400' : 'stroke-red-600 dark:stroke-red-400'" stroke-width="5" stroke-dasharray="2 12" stroke-linecap="round" />
        </g>
      </g>

      <!-- ── Mesh: the roof router, Bluetooth arcs phone → own radio, the LoRa label ── -->
      <g class="transition-opacity duration-700" :class="f.mesh ? 'opacity-100' : 'opacity-0'">
        <text :x="HOOK_LABELS.lora.x" :y="HOOK_LABELS.lora.y" :text-anchor="HOOK_LABELS.lora.anchor" class="fill-emerald-600 dark:fill-emerald-400" :style="{ fontSize: `${HOOK_LABELS.lora.size}px` }" font-weight="700">LoRa</text>
        <!-- fixed router (Meshtastic role „router“): a mast planted in the turf roof, the radio on top -->
        <g class="roof-mount">
          <path
            :d="`M${HOOK_ROUTER.x - 5} ${HOOK_ROUTER.y + 1} h10 M${HOOK_ROUTER.x} ${HOOK_ROUTER.y + 1} v${-ROUTER_MAST - 2}`"
            class="stroke-slate-600 dark:stroke-slate-300" stroke-width="3" stroke-linecap="round"
          />
          <!-- small solar panel clamped to the mast below the radio -->
          <g class="router-solar">
            <path :d="solar.frame" class="router-solar-cells fill-blue-900 dark:fill-blue-800 stroke-slate-700 dark:stroke-slate-300" stroke-width="1.2" stroke-linejoin="round" />
            <path :d="solar.grid" fill="none" class="router-solar-grid stroke-sky-200 dark:stroke-sky-300" stroke-width="0.6" />
          </g>
          <MeshRadio :x="router.x" :y="router.y" :k="router.k" :ant="router.ant" />
        </g>
        <!-- Bluetooth: phone ↔ its own radio, where the radio is not on the phone (belt, backpack) -->
        <path v-for="(b, i) in ble" :key="i" :d="b.d" fill="none" class="ble-link stroke-blue-600 dark:stroke-blue-400" stroke-width="5" />
      </g>

      <!-- ── Frame 3: the message, sent on the first phone, arrived on the last ── -->
      <g :style="{ opacity: vis(anim.sender) }">
        <rect :x="bubble.sender.x" :y="bubble.sender.y" :width="bubble.sender.w" :height="bubble.sender.h" rx="14" class="fill-blue-600 dark:fill-blue-500" />
        <text :x="bubble.sender.x + bubble.sender.w / 2" :y="bubble.sender.y + 27" text-anchor="middle" class="fill-white" style="font-size: 20px">Здравей, OpenFest</text>
      </g>
      <!-- left-aligned under the bubble, clear of the first LoRa hop to the dwarf below it -->
      <!-- status slot, three stages crossfading in the same place -->
      <text :x="bubble.sender.x + 8" :y="bubble.sender.y + bubble.sender.h + 20" text-anchor="start" class="fill-slate-500 dark:fill-slate-400" :style="{ fontSize: '20px', opacity: vis(anim.statusOpacity.sending) }" font-weight="600">изпраща се…</text>
      <text :x="bubble.sender.x + 8" :y="bubble.sender.y + bubble.sender.h + 20" text-anchor="start" class="fill-blue-600 dark:fill-blue-400" :style="{ fontSize: '20px', opacity: vis(anim.statusOpacity.transit) }" font-weight="600">на път · {{ anim.hop }}/{{ HOOK_WAYPOINTS.length - 1 }}</text>
      <text :x="bubble.sender.x + 8" :y="bubble.sender.y + bubble.sender.h + 20" text-anchor="start" class="fill-emerald-600 dark:fill-emerald-400" :style="{ fontSize: '20px', opacity: vis(anim.statusOpacity.delivered) }" font-weight="600">✓ доставено</text>
      <g :style="{ opacity: vis(anim.receiver) }">
        <rect :x="bubble.receiver.x" :y="bubble.receiver.y" :width="bubble.receiver.w" :height="bubble.receiver.h" rx="14" class="fill-slate-200 dark:fill-slate-700" />
        <text :x="bubble.receiver.x + bubble.receiver.w / 2" :y="bubble.receiver.y + 27" text-anchor="middle" class="fill-slate-900 dark:fill-slate-100" style="font-size: 20px">Здравей, OpenFest</text>
      </g>

      <!-- ── Message in flight, drawn last so no figure covers it ── -->
      <g v-if="f.delivered">
        <!-- ring flash at the radio the message is on -->
        <circle
          v-for="(w, i) in HOOK_WAYPOINTS" :key="`ring${i}`" :cx="w.x" :cy="w.y" :r="8 + 24 * anim.pulse[i]"
          :style="{ opacity: anim.pulse[i] > 0 ? 1 - anim.pulse[i] : 0 }"
          fill="none" class="stroke-emerald-600 dark:stroke-emerald-300" stroke-width="4"
        />
        <g v-if="anim.token && anim.status !== 'sending'" :transform="`translate(${anim.token.x} ${anim.token.y - 26})`">
          <rect x="-48" y="-14" width="96" height="28" rx="14" class="fill-blue-600 stroke-page dark:fill-blue-500 dark:stroke-page" stroke-width="3" />
          <text x="0" y="6" text-anchor="middle" class="fill-white" style="font-size: 16px" font-weight="600">Здравей…</text>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
/* Mobile dots drift tower → phone while the tower works. */
.cell-link {
  animation: hook-flow 1.2s linear infinite;
}
/* LoRa dots drift first phone → last: the message hopping radio to radio. */
.hook-flow {
  animation: hook-flow 1.2s linear infinite;
}
@keyframes hook-flow {
  to { stroke-dashoffset: -28; }
}
</style>
