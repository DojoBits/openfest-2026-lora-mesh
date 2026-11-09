<script setup lang="ts">
// Slide „Какво е LoRa“ (stop 1, right after the LoRa divider).
// Left: a parchment map panel, two LoRa radios on two hills and a noise floor
// across the whole sky (always there, everywhere: the band is never clean). Right: a
// three-strip layer stack, radio waves at the bottom.
//   click 1  a LoRa up-chirp appears on top of the noise and travels from
//            radio to radio (frequency rises across each symbol, repeats);
//   click 2  the bottom strip „Радиовълни“ lights with the LoRa chip, and a
//            dashed leader ties the chirp to it (LoRa = the shape of this wave);
//   click 3  „Мрежа“ lights: who relays to whom (Meshtastic, MeshCore,
//            Reticulum, LoRaWAN);
//   click 4  the talk's three projects (Meshtastic, MeshCore, Reticulum)
//            get a focus outline, LoRaWAN fades;
//   click 5  „Приложение“ lights: what it is for.
// Unlit strips are ghosted with opacity, never recoloured. Print/PDF, a pinned
// `step` and reduced motion get still pictures (the chirp and noise stop).
import { useNav } from '@slidev/client'
import { FOCUS_AT, FOCUS_CHIPS, LAYERS, LAYERS_CLICKS, SCENE, SYMBOLS_IN_WINDOW, WAVE, chirpValue, noiseTrack } from './data/loraOrigin'
import { useStep } from './data/useStep'
import MeshRadio from './MeshRadio.vue'
import MapGlyphs from './MapGlyphs.vue'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(LAYERS_CLICKS, () => props.step, () => props.startAt ?? 0)
const { isPrintMode } = useNav()
const still = props.step !== undefined || isPrintMode.value

// Radios: body top-left at (x, 252), scale 1.4; the left whip stands at
// x + 34·1.4, the mirrored right one at x + 10·1.4 (MeshRadio geometry), both
// tips at y = 252 − 28·1.4 ≈ 213.
const K = 1.4
const LEFT = { x: 58, y: 252 }
const RIGHT = { x: 300, y: 252 }
const tipL = { x: LEFT.x + 34 * K, y: LEFT.y - 28 * K }
const tipR = { x: RIGHT.x + 10 * K, y: RIGHT.y - 28 * K }

// The wave window: from a little right of the left tip to a little left of
// the right tip, 1.5 chirp symbols wide (wide symbols, so the long periods at
// the start and the short ones at the end of each sweep are visible from the
// back of the hall, and the restart of the next symbol is in view too). Built
// here from the data module (not typed in) so moving a radio moves the wave.
const WIN = { x0: tipL.x + 10, x1: tipR.x - 10, y: tipL.y - 6 }
const SW = (WIN.x1 - WIN.x0) / SYMBOLS_IN_WINDOW // one chirp symbol, px
// The chirp is drawn one symbol longer on the left than the window; sliding it
// right by exactly one symbol (--d = SW) and looping is seamless, because every
// symbol is the same sweep and holds whole cycles. Sampled every 1 px (the top
// of the sweep has a period of only SW/9 ≈ 14 px).
const chirp = (() => {
  const pts: string[] = []
  for (let x = WIN.x0 - SW; x <= WIN.x1 + 0.01; x += 1) {
    pts.push(`${x.toFixed(1)} ${(WIN.y - WAVE.chirpAmp * chirpValue((x - WIN.x0) / SW)).toFixed(1)}`)
  }
  return `M${pts.join(' L')}`
})()
// The noise is everywhere, not only on the path: the main floor runs at the
// chirp's height across the whole card (well under the chirp, but its taller
// spikes poke into it), and two faint traces with other seeds sit higher in
// the sky and low behind the hills. Each is two periods back to back, so it
// scrolls by one period and loops (noiseTrack in the data module).
const floor = noiseTrack(SCENE.x0, SCENE.x1, WIN.y, WAVE.noiseAmp)
const faint = [
  noiseTrack(SCENE.x0, SCENE.x1, 64, WAVE.noiseAmp * 0.8, 21),
  noiseTrack(SCENE.x0, SCENE.x1, 300, WAVE.noiseAmp * 0.8, 42),
]
// Labels. „LoRa сигнал“ sits above the chirp's crests. „шум“ sits above the
// main noise band at the far left, left of the left antenna, where only the
// noise runs (no chirp, clear of the click-2 leader on the right), tied to the
// band by a short stone leader (the noise scrolls, so the leader points at the
// band, not at one spike).
const SIG_LABEL = { x: (WIN.x0 + WIN.x1) / 2, y: WIN.y - WAVE.chirpAmp - 14 }
const NOISE_LABEL = { x: 54, y: WIN.y - WAVE.noiseAmp - 24 }

// Strip geometry: top to bottom app, network, radio (LAYERS is bottom first).
const STRIP = { x: 452, w: 440, h: 108, gap: 18, y0: 30 }
const strips = [...LAYERS].reverse().map((l, i) => ({ ...l, y: STRIP.y0 + i * (STRIP.h + STRIP.gap) }))
const SUB: Record<string, string> = { radio: 'физически слой', network: 'технология', app: 'вид съдържание' }
// Chips: right-aligned in the strip, 36 high. Two chips stack in one column
// (so they clear the long „Приложение“ label); more go two per row. Three
// chips (the „Приложение“ bar) use slightly narrower chips and a tighter gap so
// the two columns clear the label and subtitle on the left. The first chip sits
// top right (the long label would hit it further left); the second and third
// share the bottom row, the third to the right of the second.
const chipW = (n: number) => (n >= 3 ? 112 : 116)
const chipFont = (n: number) => (n >= 3 ? 17 : 18)
const chipPos = (n: number, k: number, y: number) => {
  const cols = n <= 2 ? 1 : 2
  const rows = Math.ceil(n / cols)
  // n = 3: first chip alone on top right, second and third side by side below
  const col = n === 3 ? (k === 0 ? 1 : k - 1) : k % cols
  const row = n === 3 ? Math.min(k, 1) : Math.floor(k / cols)
  const gap = n >= 3 ? 6 : 8
  const margin = n >= 3 ? 10 : 16
  const x = STRIP.x + STRIP.w - margin - (cols - col) * chipW(n) - (cols - col - 1) * gap
  const top = y + (STRIP.h - rows * 36 - (rows - 1) * 8) / 2 + row * 44
  return { x, y: top }
}
</script>

<template>
  <div class="lora-viz w-full select-none" :class="{ 'layers-still': still }">
    <svg viewBox="0 0 900 400" class="w-full" role="img" aria-label="Две LoRa радиа на два хълма, между тях LoRa chirp над шума; до тях слоеве: радиовълни, мрежа, приложение">
      <!-- ── Left: parchment panel with a double ink border ── -->
      <rect x="8" y="30" width="410" height="360" rx="14" class="fill-parchment dark:fill-parchment" />
      <g class="stroke-ink dark:stroke-ink" fill="none" style="opacity: 0.7">
        <rect x="13" y="35" width="400" height="350" rx="10" style="stroke-width: 2" />
        <rect x="18" y="40" width="390" height="340" rx="7" style="stroke-width: 1" />
      </g>
      <!-- noise everywhere: faint traces in the sky and behind the hills,
           clipped to the card, under the illustration -->
      <defs>
        <clipPath id="ll-card">
          <rect :x="SCENE.x0" y="40" :width="SCENE.x1 - SCENE.x0" height="340" rx="7" />
        </clipPath>
      </defs>
      <g clip-path="url(#ll-card)">
        <path
          v-for="(t, i) in faint" :key="i" :d="t.d" fill="none" class="stroke-stone dark:stroke-stone" :class="{ 'll-travel': !still }"
          :style="{ '--d': `${t.period}px`, animationDuration: `${7 + 2 * i}s`, strokeWidth: 1.5, strokeLinejoin: 'round', opacity: 0.35 }"
        />
      </g>
      <!-- terrain: far peaks and a little forest, then two hills under the radios -->
      <MapGlyphs kind="mountains" :x="210" :y="330" :pts="[{ dx: -20, dy: 0, s: 0.9 }, { dx: 14, dy: 4, s: 1.1 }]" />
      <MapGlyphs kind="forest" :x="60" :y="356" :pts="[{ dx: 0, dy: 0 }, { dx: 18, dy: 4 }, { dx: 300, dy: 2 }, { dx: 318, dy: -2 }]" />
      <path d="M30 330 Q 90 270 160 330 Z" class="fill-parchment-hi stroke-ink dark:fill-parchment-hi dark:stroke-ink" style="stroke-width: 2" />
      <path d="M268 330 Q 340 270 400 330 Z" class="fill-parchment-hi stroke-ink dark:fill-parchment-hi dark:stroke-ink" style="stroke-width: 2" />
      <line x1="22" y1="330" x2="404" y2="330" class="stroke-ink dark:stroke-ink" style="stroke-width: 2; opacity: 0.6" />
      <!-- short masts from hilltop to radio -->
      <line :x1="LEFT.x + 30" :y1="LEFT.y + 40 * K" :x2="LEFT.x + 30" y2="296" class="stroke-ink dark:stroke-ink" style="stroke-width: 4" />
      <line :x1="RIGHT.x + 30" :y1="RIGHT.y + 40 * K" :x2="RIGHT.x + 30" y2="296" class="stroke-ink dark:stroke-ink" style="stroke-width: 4" />
      <MeshRadio :x="LEFT.x" :y="LEFT.y" :k="K" />
      <MeshRadio :x="RIGHT.x" :y="RIGHT.y" :k="K" :ant="-1" />

      <!-- the main noise floor across the whole card, always; the chirp only
           in the wave window between the radios, from click 1. Both slide left
           to right and loop, unless still -->
      <g clip-path="url(#ll-card)">
        <path
          :d="floor.d" fill="none" class="stroke-stone dark:stroke-stone" :class="{ 'll-travel': !still }"
          :style="{ '--d': `${floor.period}px`, animationDuration: '10s', strokeWidth: 2, strokeLinejoin: 'round', opacity: 0.8 }"
        />
      </g>
      <defs>
        <clipPath id="ll-win">
          <rect :x="WIN.x0" :y="WIN.y - 40" :width="WIN.x1 - WIN.x0" height="80" />
        </clipPath>
      </defs>
      <g clip-path="url(#ll-win)">
        <g class="transition-opacity duration-700" :class="s >= 1 ? 'opacity-100' : 'opacity-0'">
          <path
            :d="chirp" fill="none" class="stroke-earth-deep dark:stroke-earth-deep" :class="{ 'll-travel': !still }"
            :style="{ '--d': `${SW}px`, animationDuration: '1.3s', strokeWidth: 3.5, strokeLinecap: 'round', strokeLinejoin: 'round' }"
          />
        </g>
      </g>
      <!-- noise leader: short stone line from the „шум“ label down to the noise -->
      <line
        :x1="NOISE_LABEL.x" :y1="NOISE_LABEL.y + 6" :x2="NOISE_LABEL.x" :y2="WIN.y - WAVE.noiseAmp + 1"
        class="stroke-stone dark:stroke-stone" style="stroke-width: 2; stroke-linecap: round"
      />
      <text
        :x="NOISE_LABEL.x" :y="NOISE_LABEL.y" text-anchor="middle" class="fill-stone-deep dark:fill-stone-deep"
        style="font-size: 22px; font-style: italic; font-weight: 600"
      >шум</text>
      <text
        :x="SIG_LABEL.x" :y="SIG_LABEL.y" text-anchor="middle" class="fill-earth-deep transition-opacity duration-700 dark:fill-earth-deep" :class="s >= 1 ? 'opacity-100' : 'opacity-0'"
        style="font-size: 22px; font-weight: 700"
      >LoRa сигнал</text>
      <text
        x="213" y="110" text-anchor="middle" class="fill-earth-deep transition-opacity duration-700 dark:fill-earth-deep"
        :class="s >= 1 ? 'opacity-100' : 'opacity-0'"
        style="font-size: 32px; font-weight: 700; font-style: italic; font-family: Georgia, 'Palatino Linotype', Palatino, serif"
      >радиовълни</text>

      <!-- leader from the wave to the radio strip (click 2) -->
      <path
        d="M310 176 C 420 176, 400 336, 446 336" fill="none" class="stroke-earth-deep transition-opacity duration-500 dark:stroke-earth-deep"
        :class="s >= 2 ? 'opacity-100' : 'opacity-0'" style="stroke-width: 3; stroke-dasharray: 8 7"
      />
      <path d="M436 328 L448 336 L436 344" fill="none" class="stroke-earth-deep transition-opacity duration-500 dark:stroke-earth-deep" :class="s >= 2 ? 'opacity-100' : 'opacity-0'" style="stroke-width: 3; stroke-linecap: round; stroke-linejoin: round" />

      <!-- ── Right: the layer stack ── -->
      <g
        v-for="l in strips" :key="l.id" class="transition-opacity duration-700"
        :class="s >= l.at ? 'opacity-100' : 'opacity-20'"
      >
        <rect
          :x="STRIP.x" :y="l.y" :width="STRIP.w" :height="STRIP.h" rx="12"
          :class="l.id === 'radio' ? 'fill-earth/25 stroke-focus dark:fill-earth/50 dark:stroke-focus' : 'fill-parchment stroke-ink dark:fill-parchment dark:stroke-ink'"
          :style="{ strokeWidth: l.id === 'radio' ? 4 : 2 }"
        />
        <text
          :x="STRIP.x + 20" :y="l.y + 50" class="fill-ink-strong dark:fill-ink-strong"
          style="font-size: 30px; font-weight: 700; font-style: italic; font-family: Georgia, 'Palatino Linotype', Palatino, serif"
        >{{ l.label }}</text>
        <text :x="STRIP.x + 20" :y="l.y + 84" class="fill-stone-deep dark:fill-stone-deep" style="font-size: 20px">{{ SUB[l.id] }}</text>

        <!-- the LoRa chip: one big label with a tiny wave mark -->
        <g v-if="l.id === 'radio'">
          <rect :x="STRIP.x + STRIP.w - 168" :y="l.y + 24" width="152" height="60" rx="30" class="fill-parchment-hi stroke-focus dark:fill-parchment-hi dark:stroke-focus" style="stroke-width: 3" />
          <path :d="`M${STRIP.x + STRIP.w - 150} ${l.y + 54} q 6 -12 12 0 t 12 0 t 12 0`" fill="none" class="stroke-focus dark:stroke-focus" style="stroke-width: 3; stroke-linecap: round" />
          <text :x="STRIP.x + STRIP.w - 66" :y="l.y + 66" text-anchor="middle" class="fill-focus dark:fill-focus" style="font-size: 34px; font-weight: 800">LoRa</text>
        </g>
        <g v-else>
          <!-- from FOCUS_AT the talk's projects get the focus colour (same as the
               LoRa chip) and the other Мрежа chips fade (Приложение chips never do); colour and opacity only -->
          <g
            v-for="(c, k) in l.chips" :key="c" class="transition-opacity duration-500"
            :class="l.id === 'network' && s >= FOCUS_AT && !FOCUS_CHIPS.includes(c) ? 'opacity-35' : 'opacity-100'"
          >
            <rect
              :x="chipPos(l.chips.length, k, l.y).x" :y="chipPos(l.chips.length, k, l.y).y" :width="chipW(l.chips.length)" height="36" rx="18"
              class="transition-[stroke,stroke-width] duration-500"
              :class="s >= FOCUS_AT && FOCUS_CHIPS.includes(c) ? 'fill-parchment-hi stroke-focus dark:fill-parchment-hi dark:stroke-focus' : 'fill-parchment-hi stroke-edge dark:fill-parchment-hi dark:stroke-edge'"
              :style="{ strokeWidth: s >= FOCUS_AT && FOCUS_CHIPS.includes(c) ? 3.5 : 1.5 }"
            />
            <text
              :x="chipPos(l.chips.length, k, l.y).x + chipW(l.chips.length) / 2" :y="chipPos(l.chips.length, k, l.y).y + 25" text-anchor="middle"
              :class="s >= FOCUS_AT && FOCUS_CHIPS.includes(c) ? 'fill-focus dark:fill-focus' : 'fill-ink-strong dark:fill-ink-strong'"
              :style="{ fontSize: chipFont(l.chips.length) + 'px', fontWeight: s >= FOCUS_AT && FOCUS_CHIPS.includes(c) ? 800 : 600 }"
            >{{ c }}</text>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
/* The chirp and the noise slide right by exactly one period (--d) and loop,
   so the wave travels from the left radio to the right one. Frozen by the
   global .lora-viz reduced-motion rule; the class is absent when still. */
.ll-travel {
  animation-name: ll-travel;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
@keyframes ll-travel {
  from { transform: translateX(0); }
  to { transform: translateX(var(--d)); }
}
.layers-still * {
  transition: none !important;
}
</style>
