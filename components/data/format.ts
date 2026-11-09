// Bulgarian number formatting: decimal comma, no grouping below 10 000
// (bg-BG uses minimumGroupingDigits = 2, so 1319 stays "1319").
export function fmt(n: number, digits = 0): string {
  return new Intl.NumberFormat('bg-BG', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n)
}

/** Format a millisecond duration the way the slides say it: "57 ms", "1,3 s". */
export function fmtMs(ms: number): string {
  return ms < 1000 ? `${fmt(ms, 0)} ms` : `${fmt(ms / 1000, 1)} s`
}

/** Shown when step ≥ at; `undefined` means "always shown". */
export function isShown(step: number, at: number | undefined): boolean {
  return at === undefined || step >= at
}

/** Opacity class for a click-revealed element (opacity keeps geometry). */
export function vis(step: number, at: number | undefined): 'opacity-100' | 'opacity-0' {
  return isShown(step, at) ? 'opacity-100' : 'opacity-0'
}

/** Highest `at` in a list: the number of clicks a component needs. */
export function maxAt(...ats: (number | undefined)[]): number {
  return Math.max(0, ...ats.filter((a): a is number => a !== undefined))
}
