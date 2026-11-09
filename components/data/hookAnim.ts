// Slide 2, click 3: the message „Здравей, OpenFest“ travels radio by radio.
// A pure function of elapsed time, so it is testable and HookSwitch only has
// to feed it a clock. Positions come from the radio antenna tips (hookFrames),
// never from typed copies. Past HOOK_ANIM_END (or with no clock: print,
// overview, reduced motion) the state is the final picture.

import { HOOK_PATH, hookNodeTip } from './hookFrames'

export interface Pt { x: number, y: number }

/** Antenna tips in travel order: dwarf's belt (sender), roof router, ranger's backpack, elf's phone case. */
export const HOOK_WAYPOINTS: readonly Pt[] = HOOK_PATH.map((i) => {
  const t = hookNodeTip(i)
  return { x: t.x, y: t.y }
})

/** Timeline, ms (3 hops: 400 + 3 × (250 + 500) + 250 + 250 = 3150; the fade fits inside half a hop). */
export const HOOK_ANIM = { bubble: 400, travel: 500, dwell: 250, fade: 250 } as const

/** Start of the dwell at radio i (the token is there, the radio flashes). */
const dwellStart = (i: number) => HOOK_ANIM.bubble + i * (HOOK_ANIM.dwell + HOOK_ANIM.travel)
/** The token reaches the last radio and the receiver bubble appears. */
const ARRIVE = dwellStart(HOOK_WAYPOINTS.length - 1)
export const HOOK_ANIM_END = ARRIVE + HOOK_ANIM.dwell + HOOK_ANIM.fade

export interface HookAnimState {
  /** 0..1 opacities. */
  sender: number
  receiver: number
  delivered: number
  /** Status under the sender bubble: which stage, its crossfade opacities, hop number (1..3) while in transit. */
  status: 'sending' | 'transit' | 'delivered'
  statusOpacity: { sending: number, transit: number, delivered: number }
  hop: number
  /** Token position, null when it is not on the way. */
  token: Pt | null
  /** Per radio: 0..1 flash progress (0 = idle, 1 = just flashed), null-like 0 when idle. */
  pulse: number[]
  /** Per hop: 0..1 highlight of its dotted line. */
  glow: number[]
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const easeInOut = (v: number) => (v < 0.5 ? 2 * v * v : 1 - ((-2 * v + 2) ** 2) / 2)
const lerp = (a: number, b: number, k: number) => a + (b - a) * k

export function hookAnimFinal(): HookAnimState {
  return {
    sender: 1, receiver: 1, delivered: 1, token: null,
    status: 'delivered', statusOpacity: { sending: 0, transit: 0, delivered: 1 }, hop: HOOK_WAYPOINTS.length - 1,
    pulse: HOOK_WAYPOINTS.map(() => 0),
    glow: HOOK_WAYPOINTS.slice(1).map(() => 0),
  }
}

export function hookAnimAt(ms: number): HookAnimState {
  if (ms >= HOOK_ANIM_END) return hookAnimFinal()
  const { bubble, travel, dwell, fade } = HOOK_ANIM
  const n = HOOK_WAYPOINTS.length
  const pulse = HOOK_WAYPOINTS.map((_, i) => {
    const k = (ms - dwellStart(i)) / dwell
    return k >= 0 && k <= 1 ? k : 0
  })
  const glow: number[] = []
  let token: Pt | null = null
  for (let h = 0; h < n - 1; h++) {
    const t0 = dwellStart(h) + dwell
    const k = (ms - t0) / travel
    if (k >= 0 && k <= 1) {
      const e = easeInOut(k)
      token = { x: lerp(HOOK_WAYPOINTS[h].x, HOOK_WAYPOINTS[h + 1].x, e), y: lerp(HOOK_WAYPOINTS[h].y, HOOK_WAYPOINTS[h + 1].y, e) }
    }
    // lit from the moment the token enters the hop, fading over 400 ms after it leaves
    glow.push(k < 0 ? 0 : k <= 1 ? 1 : clamp01(1 - (ms - t0 - travel) / 400))
  }
  // at a radio (dwell) or before the first hop the token sits on the tip
  if (!token && ms >= bubble) {
    const i = Math.min(n - 1, Math.max(0, Math.floor((ms - bubble) / (dwell + travel))))
    token = ms <= ARRIVE + dwell ? HOOK_WAYPOINTS[i] : null
  }
  // Status line: „изпраща се“ until the token leaves the sender radio, „на път“
  // until it reaches the last radio (where the receiver bubble appears), then
  // „доставено“. Neighbouring stages crossfade over `fade`.
  const leave = bubble + dwell
  const status = ms < leave ? 'sending' : ms < ARRIVE ? 'transit' : 'delivered'
  const sendingOp = clamp01(ms / fade) * (1 - clamp01((ms - leave) / fade))
  const transitOp = clamp01((ms - leave) / fade) * (1 - clamp01((ms - ARRIVE) / fade))
  const hop = Math.min(n - 1, Math.max(1, Math.floor((ms - leave) / (dwell + travel)) + 1))
  return {
    sender: clamp01(ms / fade),
    receiver: clamp01((ms - ARRIVE) / fade),
    delivered: clamp01((ms - ARRIVE) / fade),
    status, statusOpacity: { sending: sendingOp, transit: transitOp, delivered: clamp01((ms - ARRIVE) / fade) }, hop,
    token, pulse, glow,
  }
}
