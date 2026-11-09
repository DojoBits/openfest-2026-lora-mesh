// Facts and click plans for the three stop-1 slides after the „LoRa“ divider
// (pages/02-lora.md): what LoRa is, the radio trade-off an IoT sensor faces,
// and the Cycleo origin story. Verified 2026-11-02; sources are listed in the
// HTML comment on each slide and in tests/loraStory.test.ts.
//   - Semtech press release, 7 March 2012 (Business Wire, mirrored on
//     design-reuse.com): Semtech acquired Cycleo SAS, „headquartered in
//     Grenoble, France“; IP for long-range smart-metering radios; Francois
//     Sforza named as a Cycleo senior executive.
//   - Semtech blog „A Brief History of LoRa“, 2020-01-08: the story began in
//     2009 with Nicolas Sornin and Olivier Seller; François Sforza joined as
//     the third partner; first target gas, water and electricity meters; CSS
//     „widely in use for sonar … and radar in aviation“; Cycleo did not invent
//     CSS, it started using it for sending data. (The blog says „May 2012“,
//     the press release is dated 7 March 2012: both are 2012, so only the
//     year goes on the slide.)
//   - Semtech „What is LoRa“: physical layer, „battery lifetime of up to 10
//     years“ (a Semtech claim, phrased as such).
//   - EP2763321 / US9252834 „Low power long range transmitter“, inventors
//     Olivier Seller and Nicolas Sornin, filed by Semtech 2013-02-05.
// Name rule (CLAUDE.md): this file must not share a name with a component.

/** The three Cycleo founders, in the order Semtech's history tells it. */
export const FOUNDERS = ['Nicolas Sornin', 'Olivier Seller', 'François Sforza'] as const

export const ORIGIN = {
  company: 'Cycleo',
  city: 'Гренобъл',
  /** Semtech: „The story of LoRa began in 2009“. */
  ideaYear: 2009,
  acquirer: 'Semtech',
  /** Press release 7 March 2012. */
  acquiredYear: 2012,
  /** Semtech's own claim („up to 10 years“), never stated as a measured fact. */
  batteryYears: 10,
} as const

// ── Slide „Какво е LoRa“ (LoraLayers.vue) ──

/** One horizontal strip of the layer stack, bottom (radio) first. */
export interface Layer {
  id: 'radio' | 'network' | 'app'
  label: string
  /** What sits on this layer: chips drawn inside the strip. */
  chips: readonly string[]
  /** Click on which the strip lights up. */
  at: number
}

export const LAYERS: readonly Layer[] = [
  { id: 'radio', label: 'Радиовълни', chips: ['LoRa'], at: 2 },
  { id: 'network', label: 'Мрежа', chips: ['Meshtastic', 'MeshCore', 'Reticulum', 'LoRaWAN'], at: 3 },
  { id: 'app', label: 'Приложение', chips: ['съобщения', 'IoT', 'телеметрия'], at: 5 },
]

/** Click 1: the chirp between two radios; 2: the radio strip; 3: Мрежа; 4: the talk's three projects highlighted; 5: Приложение. */
export const LAYERS_CLICKS = 5

/** Network chips the talk is about, highlighted from FOCUS_AT on (LoRaWAN fades). */
export const FOCUS_CHIPS: readonly string[] = ['Meshtastic', 'MeshCore', 'Reticulum']
export const FOCUS_AT = 4

/**
 * The LoRa up-chirp, in units of one symbol: within each symbol the
 * instantaneous frequency sweeps linearly from f0 to f1 cycles per symbol,
 * then the next symbol starts the sweep again (the real modulation shifts the
 * start point to carry data; an unmodulated preamble looks exactly like this).
 * f0 + (f1 − f0) / 2 is a whole number, so every symbol holds whole cycles
 * and the wave joins up at the symbol edge (the frequency jumps, the line
 * does not).
 */
export const CHIRP = { f0: 1, f1: 9 } as const

/**
 * Drawn heights (SVG px) of the wave scene: the chirp peaks at chirpAmp; the
 * noise samples (in [−1, 1]) are scaled by noiseAmp. Typical noise stays at a
 * fifth of the signal so the two read apart from the back of a hall, while the
 * rare tall spikes still reach about 40 % of it: the band is never clean.
 */
export const WAVE = { chirpAmp: 25, noiseAmp: 11 } as const

/** Chirp symbols visible in the wave window: wide symbols make the sweep readable. */
export const SYMBOLS_IN_WINDOW = 1.5

/** Instantaneous frequency (cycles per symbol) at position u, in symbols. */
export function chirpFreq(u: number): number {
  const frac = u - Math.floor(u)
  return CHIRP.f0 + (CHIRP.f1 - CHIRP.f0) * frac
}

/**
 * Chirp amplitude in [−1, 1] at position u (symbols). The phase is the
 * integral of chirpFreq over the symbol: 2π·(f0·t + (f1 − f0)·t²/2).
 */
export function chirpValue(u: number): number {
  const t = u - Math.floor(u)
  return Math.sin(2 * Math.PI * (CHIRP.f0 * t + ((CHIRP.f1 - CHIRP.f0) * t * t) / 2))
}

/**
 * A jittery noise floor: n samples in [−1, 1] from a seeded mulberry32
 * generator, so every render (and the PDF) draws the same squiggle. Two
 * draws are mixed: a soft jitter plus a sparse taller spike, which reads as
 * a real spectrum-analyser floor rather than a regular zig-zag.
 */
export function noiseFloor(n: number, seed = 7): number[] {
  let a = seed >>> 0
  const rand = () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    const jitter = (rand() * 2 - 1) * 0.55
    const spike = rand() < 0.18 ? (rand() * 2 - 1) * 0.45 : 0
    out.push(Math.max(-1, Math.min(1, jitter + spike)))
  }
  return out
}

/** Inner width of the left scene card in LoraLayers (SVG x of its inner border). */
export const SCENE = { x0: 18, x1: 408 } as const

/** A scrolling noise trace: SVG path, one period (px) and the drawn x extent. */
export interface NoiseTrack { d: string, period: number, xStart: number, xEnd: number }

/**
 * A noise trace from x0 to x1 at height y: noiseFloor samples every `step` px,
 * scaled by `amp`. One period covers x0..x1; two copies are drawn back to back,
 * starting one period left of x0, so sliding the path right by `period` and
 * looping is seamless and the whole x0..x1 span is always covered.
 */
export function noiseTrack(x0: number, x1: number, y: number, amp: number, seed = 7, step = 3): NoiseTrack {
  const noise = noiseFloor(Math.ceil((x1 - x0) / step) + 1, seed)
  const period = (noise.length - 1) * step
  // the last sample of the first copy is the first of the second: drop it once
  const all = [...noise.slice(0, -1), ...noise]
  const xStart = x0 - period
  const pts = all.map((v, i) => `${(xStart + i * step).toFixed(1)} ${(y - amp * v).toFixed(1)}`)
  return { d: `M${pts.join(' L')}`, period, xStart, xEnd: xStart + (all.length - 1) * step }
}

// ── Slide „От какво се нуждае IoT“ (RadioTradeoff.vue) ──

export type Corner = 'power' | 'range' | 'cost'

/** Each property circle has its own map token (stroke, tinted fill, label). */
export const CORNERS: readonly { id: Corner, label: string, tone: 'moss' | 'water' | 'gold' }[] = [
  { id: 'power', label: 'малко ток', tone: 'moss' },
  { id: 'range', label: 'обхват', tone: 'water' },
  { id: 'cost', label: 'цена', tone: 'gold' },
]

/**
 * Venn geometry (SVG units of the 900×400 viewBox): three circles of radius
 * r on an equilateral triangle of side d, „малко ток“ on top. r > d/√3, so
 * all three share a centre region; r < d·√3/2 + a little, so each pair also
 * has a lens the third circle does not reach.
 */
export const VENN = {
  r: 108,
  d: 128,
  centres: {
    power: { x: 256, y: 154 },
    range: { x: 192, y: 154 + 128 * Math.sqrt(3) / 2 },
    cost: { x: 320, y: 154 + 128 * Math.sqrt(3) / 2 },
  } as Readonly<Record<Corner, { x: number, y: number }>>,
} as const

export interface Point { x: number, y: number }

/** Is point p inside the circle of property k? */
export function inCircle(p: Point, k: Corner): boolean {
  const c = VENN.centres[k]
  return Math.hypot(p.x - c.x, p.y - c.y) < VENN.r
}

/**
 * Where to put a badge for a region: two properties → the middle of their
 * lens, pushed away from the third circle (from the pair's midpoint, 38 % of
 * the lens half-length outwards, which centres it in the part the third
 * circle misses); all three → the centroid.
 */
export function vennRegion(keys: readonly Corner[]): Point {
  const cs = keys.map(k => VENN.centres[k])
  const mid = { x: cs.reduce((a, c) => a + c.x, 0) / cs.length, y: cs.reduce((a, c) => a + c.y, 0) / cs.length }
  if (keys.length !== 2) return mid
  const third = VENN.centres[(['power', 'range', 'cost'] as const).find(k => !keys.includes(k))!]
  const dx = mid.x - third.x
  const dy = mid.y - third.y
  const len = Math.hypot(dx, dy)
  const half = Math.sqrt(VENN.r ** 2 - (VENN.d / 2) ** 2)
  return { x: mid.x + (dx / len) * half * 0.48, y: mid.y + (dy / len) * half * 0.48 }
}

/**
 * Medallion and label of each circle. The medallion sits inside its own outer
 * lobe (the part no other circle reaches), clear of the technology badges.
 * The label sits just outside the circle's outer edge: „малко ток“ above the
 * top circle, the two others below-left and below-right of the bottom ones
 * (label points are text baselines, middle-anchored).
 */
export const VENN_LOBES: Readonly<Record<Corner, { med: Point, label: Point }>> = (() => {
  const c = VENN.centres
  return {
    power: { med: { x: c.power.x, y: c.power.y - 72 }, label: { x: c.power.x, y: c.power.y - VENN.r - 14 } },
    range: { med: { x: c.range.x - 42, y: c.range.y - 11 }, label: { x: c.range.x - 120, y: c.range.y + 113 } },
    cost: { med: { x: c.cost.x + 42, y: c.cost.y - 11 }, label: { x: c.cost.x + 104, y: c.cost.y + 113 } },
  }
})()

export interface Contender {
  id: 'wifi' | 'bluetooth' | 'cellular'
  name: string
  /** The two properties this radio has: its badge sits in their overlap. */
  pair: readonly [Corner, Corner]
  /** What it lacks, shown in the verdict list. */
  verdict: string
  at: number
}

// Judged for a small battery IoT sensor far from anyone: Bluetooth is frugal
// and cheap but short range; Wi-Fi is cheap and reaches further but draws a
// lot of current; cellular (LTE / 5G) reaches far, and its IoT variants NB-IoT
// and LTE-M run on little power, but every device needs a SIM card and a
// subscription.
export const CONTENDERS: readonly Contender[] = [
  { id: 'bluetooth', name: 'Bluetooth', pair: ['power', 'cost'], verdict: 'малък обхват', at: 1 },
  { id: 'wifi', name: 'Wi-Fi', pair: ['range', 'cost'], verdict: 'висока консумация', at: 2 },
  { id: 'cellular', name: 'LTE / 5G', pair: ['power', 'range'], verdict: 'SIM и абонамент', at: 3 },
]

/** Click on which LoRa lands in the centre, where all three overlap. */
export const LORA_AT = 4

/** Clicks 1–3: one technology each; click 4: LoRa in the centre. */
export const TRADEOFF_CLICKS = LORA_AT

/** Which radio is being judged at a given step, or null (opening view, or LoRa). */
export function contenderAt(step: number): Contender | null {
  return CONTENDERS.find(c => c.at === step) ?? null
}

/**
 * State of one property circle at a step: while a technology is on stage the
 * circle is ✓ (it has it) or ✗ (it lacks it); on the last click every circle
 * is the wish (gold); before click 1 it is neutral.
 */
export function cornerState(step: number, corner: Corner): 'neutral' | 'ok' | 'fail' | 'wish' {
  if (step >= TRADEOFF_CLICKS) return 'wish'
  const c = contenderAt(step)
  if (!c) return 'neutral'
  return c.pair.includes(corner) ? 'ok' : 'fail'
}

// ── Slide „История на LoRa“ (CycleoStory.vue) ──

export interface StoryStation {
  id: 'idea' | 'chirp' | 'cycleo' | 'semtech' | 'sensor'
  /** Big label under the station (≤ 3 words, Bulgarian). */
  title: string
  /** Optional year badge. */
  year?: number
  at: number
}

export const STATIONS: readonly StoryStation[] = [
  { id: 'idea', title: 'идеята', year: ORIGIN.ideaYear, at: 1 },
  { id: 'chirp', title: 'chirp от радара', at: 2 },
  { id: 'cycleo', title: ORIGIN.company, at: 3 },
  { id: 'semtech', title: ORIGIN.acquirer, year: ORIGIN.acquiredYear, at: 4 },
  { id: 'sensor', title: `до ${ORIGIN.batteryYears} години`, at: 5 },
]

export const STORY_CLICKS = STATIONS.length
