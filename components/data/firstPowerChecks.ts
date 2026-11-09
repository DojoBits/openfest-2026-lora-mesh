// Slide 23 „Първо включване: четири проверки“: geometry and texts of
// FirstPowerBoard.vue (tested in tests/firstPower.test.ts). Named
// `firstPowerChecks`, not `firstPowerBoard`: a data file must never share a
// name with a component (CLAUDE.md „Name-clash trap“).
//
// Facts behind the four checks: research/T10-first-power-batteries.md, verified
// items only (antenna before power, band variant, battery wiring differs by
// vendor, exact firmware + region). The board is a generic drawing, not one
// vendor's layout.
import type { Tone } from './tones'

/** SVG viewBox, ~1000 wide like the other map scenes. */
export const FP_W = 1000
export const FP_H = 470

/** The PCB, top view, centred. Every part below is placed relative to it. */
export const FP_BOARD = { x: 290, y: 120, w: 420, h: 220, r: 14 } as const

const B = FP_BOARD
/** Mounting holes, one per corner. */
export const FP_HOLES = [
  { x: B.x + 16, y: B.y + 16 }, { x: B.x + B.w - 16, y: B.y + 16 },
  { x: B.x + 16, y: B.y + B.h - 16 }, { x: B.x + B.w - 16, y: B.y + B.h - 16 },
] as const
/** Small OLED screen, upper left. */
export const FP_SCREEN = { x: B.x + 40, y: B.y + 34, w: 140, h: 88 } as const
/** LoRa module (metal can) marked „868“, right half. */
export const FP_LORA = { x: B.x + 250, y: B.y + 32, w: 112, h: 104 } as const
/** Antenna connector on the right edge, the stub antenna lies flat outward. */
export const FP_ANT = { x: B.x + B.w, y: B.y + 56, stubLen: 170, stubW: 30 } as const
/** 2-pin battery connector on the bottom edge, leads hang down and left. */
export const FP_BATT = { x: B.x + 70, y: B.y + B.h - 34, w: 54, h: 26 } as const
/** USB-C receptacle sticking out of the bottom edge, right. */
export const FP_USB = { x: B.x + 320, y: B.y + B.h - 10, w: 60, h: 22 } as const

export type FirstPowerPart = 'antenna' | 'lora' | 'battery' | 'usb'

export interface FirstPowerCheck {
  part: FirstPowerPart
  /** Exact callout text (tested). */
  text: string
  /** Optional line split for long texts; joined with spaces it equals `text`. */
  lines?: readonly string[]
  tone: Tone
  /** Click that reveals this callout. */
  at: number
  /** Badge centre; the text starts right of it. */
  x: number
  y: number
  /** SVG font size of the callout text. */
  size: number
  /** Leader line: from `from` (next to the text) to `target` (the part). */
  from: { x: number, y: number }
  target: { x: number, y: number }
  /** Soft highlight rings drawn while this callout is the current click. */
  rings: readonly { x: number, y: number, rx: number, ry: number }[]
}

/** Lines to draw for a callout: its split, or the whole text on one line. */
export function calloutLines(c: FirstPowerCheck): readonly string[] {
  return c.lines ?? [c.text]
}

const antCx = FP_ANT.x + 12 + FP_ANT.stubLen / 2
const loraCx = FP_LORA.x + FP_LORA.w / 2
const loraCy = FP_LORA.y + FP_LORA.h / 2
const battCx = FP_BATT.x + FP_BATT.w / 2
const usbCx = FP_USB.x + FP_USB.w / 2

/** One callout per click, in story order: antenna, band, battery, firmware. */
export const FIRST_POWER_CHECKS: readonly FirstPowerCheck[] = [
  {
    part: 'antenna',
    text: 'антената — преди тока',
    tone: 'red',
    at: 1,
    x: 560,
    y: 48,
    size: 28,
    from: { x: 738, y: 74 },
    target: { x: FP_ANT.x + 6, y: FP_ANT.y - 12 },
    rings: [{ x: FP_ANT.x + 6, y: FP_ANT.y, rx: 30, ry: 30 }],
  },
  {
    part: 'lora',
    text: '868 MHz: радио и антена',
    tone: 'amber',
    at: 2,
    x: 70,
    y: 48,
    size: 28,
    from: { x: 470, y: 74 },
    target: { x: FP_LORA.x + 14, y: FP_LORA.y - 2 },
    rings: [
      { x: loraCx, y: loraCy, rx: 76, ry: 70 },
      { x: antCx, y: FP_ANT.y, rx: FP_ANT.stubLen / 2 + 20, ry: 32 },
    ],
  },
  {
    part: 'battery',
    text: 'батерия: + и − по надписа',
    tone: 'amber',
    at: 3,
    x: 40,
    y: 420,
    size: 28,
    from: { x: 440, y: 398 },
    target: { x: FP_BATT.x + FP_BATT.w + 4, y: FP_BATT.y + FP_BATT.h + 8 },
    rings: [{ x: battCx, y: FP_BATT.y + 4, rx: 50, ry: 40 }],
  },
  {
    part: 'usb',
    text: 'точният фърмуер + регион EU_868',
    lines: ['точният фърмуер', '+ регион EU_868'],
    tone: 'amber',
    at: 4,
    x: 640,
    y: 404,
    size: 28,
    from: { x: 640, y: 380 },
    target: { x: usbCx, y: FP_USB.y + FP_USB.h + 2 },
    rings: [{ x: usbCx, y: FP_USB.y + 8, rx: 46, ry: 30 }],
  },
]
