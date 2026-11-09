// Slide 12 „AM, FM и FSK“ (ModulationWaves.vue, tested in tests/modulation.test.ts).
// Named `modulation`, not `modulationWaves`: a data file never shares a name
// with a component (CLAUDE.md name-clash trap).
//
// Three rows like a textbook figure, all over one window u = 0..1:
//   message  the slow wave we want to send (two cycles), or the bits 1 0 1 1 0 1
//   carrier  the fast radio wave (CARRIER_CYCLES cycles)
//   result   AM: the carrier's height follows the message
//            FM: the carrier's frequency follows the message (height fixed)
//            FSK: a 1 is a high tone, a 0 a low tone (two frequencies)
// Every wave holds whole cycles over the window, so nothing jumps at the edges.

/** Click plan: message → carrier → AM → FM → FSK. */
export const MOD_STEPS = { message: 1, carrier: 2, am: 3, fm: 4, fsk: 5 } as const
export const MOD_CLICKS = 5

export type ModMode = 'am' | 'fm' | 'fsk'
export const MOD_MODES: readonly ModMode[] = ['am', 'fm', 'fsk']

/** Which result the click shows: none before click 3, then AM, FM, FSK. */
export function modeAt(step: number): ModMode | null {
  if (step >= MOD_STEPS.fsk) return 'fsk'
  if (step >= MOD_STEPS.fm) return 'fm'
  if (step >= MOD_STEPS.am) return 'am'
  return null
}

/** SVG window the waves are drawn in (viewBox 900 × 400). */
export const MOD_WIN = { x0: 250, x1: 885 } as const

const TAU = 2 * Math.PI

/** Message: two slow cycles. */
export const MESSAGE_CYCLES = 2
export const messageY = (u: number) => Math.sin(TAU * MESSAGE_CYCLES * u)

/** Carrier: many fast cycles, still wide enough to see from the back of the hall. */
export const CARRIER_CYCLES = 22
export const carrierY = (u: number) => Math.sin(TAU * CARRIER_CYCLES * u)

/** AM: the height swings between 0.15 (message trough) and 1 (message peak). */
export const amEnvelope = (u: number) => 0.575 + 0.425 * messageY(u)
export const amY = (u: number) => amEnvelope(u) * carrierY(u)

/**
 * FM: instantaneous frequency CARRIER_CYCLES · (1 + DEV · message), in cycles
 * per window. The phase is its integral, written out so the wave is exact:
 * ∫ C(1 + D sin 2πkv) dv = C·u + C·D·(1 − cos 2πku) / (2πk).
 */
export const FM_DEV = 0.6
export const fmFreq = (u: number) => CARRIER_CYCLES * (1 + FM_DEV * messageY(u))
export const fmY = (u: number) => {
  const k = MESSAGE_CYCLES
  const phase = CARRIER_CYCLES * u + (CARRIER_CYCLES * FM_DEV * (1 - Math.cos(TAU * k * u))) / (TAU * k)
  return Math.sin(TAU * phase)
}

/** FSK: the bits on the slide, and whole cycles per bit for a 0 and a 1. */
export const BITS: readonly (0 | 1)[] = [1, 0, 1, 1, 0, 1]
export const FSK_CYCLES: Readonly<Record<0 | 1, number>> = { 0: 2, 1: 6 }
const bitAt = (u: number) => BITS[Math.min(BITS.length - 1, Math.max(0, Math.floor(u * BITS.length)))]
/** Square wave of the bits, ±1, for the message row in FSK mode. */
export const bitsY = (u: number) => (bitAt(u) === 1 ? 1 : -1)
/** Cycles per bit at u (the local tone). */
export const fskFreq = (u: number) => FSK_CYCLES[bitAt(u)]
export const fskY = (u: number) => {
  const i = Math.min(BITS.length - 1, Math.max(0, Math.floor(u * BITS.length)))
  const local = u * BITS.length - i // 0..1 inside the bit
  return Math.sin(TAU * FSK_CYCLES[BITS[i]] * local)
}

/** Polyline of f over the window, y = cy − amp · f(u), sampled every `px` pixels. */
export function wavePath(f: (u: number) => number, cy: number, amp: number, px = 1): string {
  const w = MOD_WIN.x1 - MOD_WIN.x0
  const pts: string[] = []
  for (let x = 0; x <= w + 1e-9; x += px) {
    const u = Math.min(x / w, 1)
    pts.push(`${+(MOD_WIN.x0 + x).toFixed(1)} ${+(cy - amp * f(u)).toFixed(1)}`)
  }
  if (!pts[pts.length - 1].startsWith(`${MOD_WIN.x1} `)) pts.push(`${MOD_WIN.x1} ${+(cy - amp * f(1)).toFixed(1)}`)
  return `M${pts.join(' L')}`
}
