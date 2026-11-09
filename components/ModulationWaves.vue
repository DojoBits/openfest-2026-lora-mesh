<script setup lang="ts">
// Slide 12 „AM, FM и FSK“: how a radio wave carries information, right before
// the chirp slide. Three rows like a textbook figure (data/modulation.ts):
//   click 1  „Съобщение“: the slow wave we want to send;
//   click 2  „Носеща вълна“: the fast radio wave;
//   click 3  result AM: the carrier's height follows the message (dashed
//            envelope in the message colour);
//   click 4  result FM: same height, the waves crowd where the message is high;
//   click 5  result FSK: the message turns into bits 1 0 1 1 0 1, a 1 is the
//            high tone, a 0 the low tone.
// Interactive: AM / FM / FSK buttons above the plot switch the result live
// (any revealed mode), and a cursor sweeps left to right with a dot on the
// message and one on the result, so the eye links „message high“ to „wave
// tall“ (AM) or „wave dense“ (FM, FSK). The result redraws itself when the
// mode changes. Print, a pinned `step` and reduced motion get still frames
// (no cursor, no draw-in).
import { useNav } from '@slidev/client'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  BITS, MOD_CLICKS, MOD_MODES, MOD_STEPS, MOD_WIN, type ModMode,
  amEnvelope, amY, bitsY, carrierY, fmY, fskY, messageY, modeAt, wavePath,
} from './data/modulation'
import { useStep } from './data/useStep'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(MOD_CLICKS, () => props.step, () => props.startAt ?? 0)
const { isPrintMode } = useNav()
const still = props.step !== undefined || isPrintMode.value
  || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

// The presenter's pick wins until the next click resets it.
const pick = ref<ModMode | null>(null)
watch(s, () => { pick.value = null })
const mode = computed<ModMode | null>(() => pick.value ?? modeAt(s.value))
const revealed = (m: ModMode) => s.value >= MOD_STEPS[m]

// Rows: centre y and amplitude in SVG units.
const ROW = {
  message: { cy: 72, amp: 32 },
  carrier: { cy: 190, amp: 32 },
  result: { cy: 316, amp: 46 },
} as const
const W = MOD_WIN.x1 - MOD_WIN.x0
const xAt = (u: number) => MOD_WIN.x0 + u * W

const paths = {
  sine: wavePath(messageY, ROW.message.cy, ROW.message.amp, 2),
  bits: wavePath(bitsY, ROW.message.cy, ROW.message.amp, 0.5),
  carrier: wavePath(carrierY, ROW.carrier.cy, ROW.carrier.amp, 0.5),
  am: wavePath(amY, ROW.result.cy, ROW.result.amp, 0.5),
  fm: wavePath(fmY, ROW.result.cy, ROW.result.amp, 0.5),
  fsk: wavePath(fskY, ROW.result.cy, ROW.result.amp, 0.5),
  envTop: wavePath(amEnvelope, ROW.result.cy, ROW.result.amp, 2),
  envBot: wavePath(u => -amEnvelope(u), ROW.result.cy, ROW.result.amp, 2),
}
const RESULT_FN: Record<ModMode, (u: number) => number> = { am: amY, fm: fmY, fsk: fskY }
const LABEL: Record<ModMode, { name: string, sub: string }> = {
  am: { name: 'AM', sub: 'амплитуда' },
  fm: { name: 'FM', sub: 'честота' },
  fsk: { name: 'FSK', sub: 'две честоти' },
}
const bitW = W / BITS.length

// ── Cursor: sweeps the window every SWEEP_MS, from click 1 on ──
const SWEEP_MS = 7000
const u = ref(0.125)
let raf = 0
const stop = () => { if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(raf) }
onMounted(() => {
  if (still || typeof requestAnimationFrame === 'undefined') return
  const t0 = performance.now()
  const tick = (now: number) => {
    u.value = ((now - t0) % SWEEP_MS) / SWEEP_MS
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(stop)
const msgDotY = computed(() => ROW.message.cy - ROW.message.amp * (mode.value === 'fsk' ? bitsY(u.value) : messageY(u.value)))
const resDotY = computed(() => (mode.value ? ROW.result.cy - ROW.result.amp * RESULT_FN[mode.value](u.value) : ROW.result.cy))
</script>

<template>
  <div class="lora-viz w-full select-none">
    <!-- mode buttons: each appears on its own click, the active one is filled -->
    <div class="mb-1 flex h-10 justify-end gap-2 pr-2">
      <button
        v-for="m in MOD_MODES" :key="m" type="button"
        class="rounded-full border-2 px-5 text-lg font-bold transition-opacity duration-500"
        :class="[
          revealed(m) ? 'opacity-100' : 'pointer-events-none opacity-0',
          mode === m ? 'border-focus bg-focus text-parchment-hi dark:border-focus dark:bg-focus dark:text-parchment-hi' : 'border-edge bg-parchment-hi text-ink-strong dark:border-edge dark:bg-parchment-hi dark:text-ink-strong',
        ]"
        @click="pick = m"
      >{{ LABEL[m].name }}</button>
    </div>

    <svg viewBox="0 0 900 400" class="w-full" role="img" aria-label="Съобщение, носеща вълна и резултат при AM, FM и FSK">
      <!-- dash-dot zero lines, one per row -->
      <g class="stroke-stone dark:stroke-stone" style="stroke-width: 1.5; stroke-dasharray: 10 5 2 5; opacity: 0.8">
        <line v-for="r in ROW" :key="r.cy" :x1="MOD_WIN.x0" :x2="MOD_WIN.x1" :y1="r.cy" :y2="r.cy" />
      </g>

      <!-- ── row 1: the message ── -->
      <g class="transition-opacity duration-700" :class="s >= MOD_STEPS.message ? 'opacity-100' : 'opacity-0'">
        <text x="16" :y="ROW.message.cy - 4" class="fill-ink-strong dark:fill-ink-strong" style="font-size: 26px; font-weight: 700">Съобщение</text>
        <text x="16" :y="ROW.message.cy + 24" class="fill-stone-deep dark:fill-stone-deep" style="font-size: 20px">{{ mode === 'fsk' ? 'битове' : 'глас, музика' }}</text>
        <path :d="paths.sine" fill="none" class="stroke-earth-deep transition-opacity duration-500 dark:stroke-earth-deep" :class="mode === 'fsk' ? 'opacity-0' : 'opacity-100'" style="stroke-width: 4; stroke-linecap: round; stroke-linejoin: round" />
        <g class="transition-opacity duration-500" :class="mode === 'fsk' ? 'opacity-100' : 'opacity-0'">
          <path :d="paths.bits" fill="none" class="stroke-earth-deep dark:stroke-earth-deep" style="stroke-width: 4; stroke-linejoin: round" />
          <text
            v-for="(b, i) in BITS" :key="i" :x="MOD_WIN.x0 + (i + 0.5) * bitW" :y="ROW.message.cy - ROW.message.amp - 10"
            text-anchor="middle" class="fill-earth-deep dark:fill-earth-deep" style="font-size: 24px; font-weight: 800"
          >{{ b }}</text>
        </g>
      </g>

      <!-- ── row 2: the carrier ── -->
      <g class="transition-opacity duration-700" :class="s >= MOD_STEPS.carrier ? 'opacity-100' : 'opacity-0'">
        <text x="16" :y="ROW.carrier.cy - 4" class="fill-ink-strong dark:fill-ink-strong" style="font-size: 26px; font-weight: 700">Носеща вълна</text>
        <text x="16" :y="ROW.carrier.cy + 24" class="fill-stone-deep dark:fill-stone-deep" style="font-size: 20px">радиото</text>
        <path :d="paths.carrier" fill="none" class="stroke-water dark:stroke-water" style="stroke-width: 3; stroke-linejoin: round" />
      </g>

      <!-- ── row 3: the result, AM / FM / FSK ── -->
      <g class="transition-opacity duration-700" :class="mode ? 'opacity-100' : 'opacity-0'">
        <text x="16" :y="ROW.result.cy - 4" class="fill-focus dark:fill-focus" style="font-size: 34px; font-weight: 800">{{ mode ? LABEL[mode].name : '' }}</text>
        <text x="16" :y="ROW.result.cy + 26" class="fill-stone-deep dark:fill-stone-deep" style="font-size: 20px">{{ mode ? LABEL[mode].sub : '' }}</text>
        <!-- AM: the envelope is the message, dashed in its colour -->
        <g class="transition-opacity duration-500" :class="mode === 'am' ? 'opacity-100' : 'opacity-0'">
          <path :d="paths.envTop" fill="none" class="stroke-earth-deep dark:stroke-earth-deep" style="stroke-width: 2.5; stroke-dasharray: 8 6" />
          <path :d="paths.envBot" fill="none" class="stroke-earth-deep dark:stroke-earth-deep" style="stroke-width: 2.5; stroke-dasharray: 8 6" />
        </g>
        <!-- FSK: faint bit borders through the message and the result rows -->
        <g class="stroke-stone transition-opacity duration-500 dark:stroke-stone" :class="mode === 'fsk' ? 'opacity-100' : 'opacity-0'" style="stroke-width: 1.5; stroke-dasharray: 3 5">
          <line v-for="i in BITS.length - 1" :key="i" :x1="MOD_WIN.x0 + i * bitW" :x2="MOD_WIN.x0 + i * bitW" y1="22" :y2="ROW.result.cy + ROW.result.amp + 8" />
        </g>
        <!-- keyed on the mode, so a new result draws itself in from the left -->
        <path
          v-if="mode" :key="mode" :d="paths[mode]" fill="none" pathLength="1"
          class="stroke-focus dark:stroke-focus" :class="{ 'mw-draw': !still }"
          style="stroke-width: 3.5; stroke-linejoin: round"
        />
      </g>

      <!-- ── cursor: links the message to the result ── -->
      <g v-if="!still" class="transition-opacity duration-500" :class="s >= MOD_STEPS.message ? 'opacity-100' : 'opacity-0'">
        <line :x1="xAt(u)" :x2="xAt(u)" y1="20" y2="372" class="stroke-ink dark:stroke-ink" style="stroke-width: 1.5; opacity: 0.45" />
        <circle :cx="xAt(u)" :cy="msgDotY" r="8" class="fill-earth-deep stroke-parchment-hi dark:fill-earth-deep dark:stroke-parchment-hi" style="stroke-width: 2.5" />
        <circle
          :cx="xAt(u)" :cy="resDotY" r="8" class="fill-focus stroke-parchment-hi transition-opacity duration-500 dark:fill-focus dark:stroke-parchment-hi"
          :class="mode ? 'opacity-100' : 'opacity-0'" style="stroke-width: 2.5"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
/* The result draws itself in from the left when the mode changes. */
.mw-draw {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: mw-draw 1.4s ease-out forwards;
}
@keyframes mw-draw {
  to { stroke-dashoffset: 0; }
}
</style>
