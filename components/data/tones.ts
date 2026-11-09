// Deck-wide colour language (CLAUDE.md "semantic colour language").
//
// UnoCSS only generates classes it finds as *literal text*. Plain .ts files are
// not in its scan pipeline, so `uno.config.ts` imports this module and puts
// every string below on the safelist. Rule: components never build class names
// from bindings; they look up one of these literal strings.

/** Semantic tones: meaning, not decoration. */
export type Tone = 'red' | 'amber' | 'emerald' | 'blue' | 'slate'
/** Project identity hues (wayfinding only, never meaning). */
export type ProjectColour = 'cyan' | 'indigo' | 'fuchsia'
export type Project = 'meshtastic' | 'meshcore' | 'reticulum'

interface ToneClasses {
  /** Readable accent text: -600 on light, -400 on dark. */
  text: string
  /** Solid fill for bars / dots (DOM). */
  bg: string
  /** Soft tinted tile for chips and panels. */
  soft: string
  /** Border tinted to the accent (card recipe). */
  border: string
  /** SVG fill / stroke equivalents. */
  fill: string
  stroke: string
  /** SVG text in the accent (same shades as `text`). */
  label: string
}

// Keys keep their historic Tailwind names (components and tests look them up by
// key), but every value is a journey-map token (style.css `--c-*`, named in
// uno.config.ts). The token swaps under html.dark by itself, so the `dark:`
// twins differ only in alpha where the dark parchment needs a touch more.
//   red → trail · amber → gold · emerald → moss · blue → water · slate → stone
// Gold and stone are pale as text on parchment, so their text/label use -deep.
export const TONE: Record<Tone, ToneClasses> = {
  red: {
    text: 'text-trail dark:text-trail',
    bg: 'bg-trail dark:bg-trail/90',
    soft: 'bg-trail/10 dark:bg-trail/20',
    border: 'border-trail/50 dark:border-trail/60',
    fill: 'fill-trail dark:fill-trail',
    stroke: 'stroke-trail dark:stroke-trail',
    label: 'fill-trail dark:fill-trail',
  },
  amber: {
    text: 'text-gold-deep dark:text-gold-deep',
    bg: 'bg-gold dark:bg-gold/90',
    soft: 'bg-gold/10 dark:bg-gold/20',
    border: 'border-gold/50 dark:border-gold/60',
    fill: 'fill-gold dark:fill-gold',
    stroke: 'stroke-gold dark:stroke-gold',
    label: 'fill-gold-deep dark:fill-gold-deep',
  },
  emerald: {
    text: 'text-moss dark:text-moss',
    bg: 'bg-moss dark:bg-moss/90',
    soft: 'bg-moss/10 dark:bg-moss/20',
    border: 'border-moss/50 dark:border-moss/60',
    fill: 'fill-moss dark:fill-moss',
    stroke: 'stroke-moss dark:stroke-moss',
    label: 'fill-moss dark:fill-moss',
  },
  blue: {
    text: 'text-water dark:text-water',
    bg: 'bg-water dark:bg-water/90',
    soft: 'bg-water/10 dark:bg-water/20',
    border: 'border-water/50 dark:border-water/60',
    fill: 'fill-water dark:fill-water',
    stroke: 'stroke-water dark:stroke-water',
    label: 'fill-water dark:fill-water',
  },
  slate: {
    text: 'text-stone-deep dark:text-stone-deep',
    bg: 'bg-stone dark:bg-stone/90',
    soft: 'bg-stone/10 dark:bg-stone/20',
    border: 'border-stone/50 dark:border-stone/60',
    fill: 'fill-stone dark:fill-stone',
    stroke: 'stroke-stone dark:stroke-stone',
    label: 'fill-stone-deep dark:fill-stone-deep',
  },
}

// Three earthy hues, distinct from each other and from the semantic set:
// verdigris (Meshtastic), dusk violet (MeshCore), wine (Reticulum).
export const PROJECT_COLOUR: Record<ProjectColour, ToneClasses> = {
  cyan: {
    text: 'text-verdigris dark:text-verdigris',
    bg: 'bg-verdigris dark:bg-verdigris/90',
    soft: 'bg-verdigris/10 dark:bg-verdigris/20',
    border: 'border-verdigris/50 dark:border-verdigris/60',
    fill: 'fill-verdigris dark:fill-verdigris',
    stroke: 'stroke-verdigris dark:stroke-verdigris',
    label: 'fill-verdigris dark:fill-verdigris',
  },
  indigo: {
    text: 'text-dusk dark:text-dusk',
    bg: 'bg-dusk dark:bg-dusk/90',
    soft: 'bg-dusk/10 dark:bg-dusk/20',
    border: 'border-dusk/50 dark:border-dusk/60',
    fill: 'fill-dusk dark:fill-dusk',
    stroke: 'stroke-dusk dark:stroke-dusk',
    label: 'fill-dusk dark:fill-dusk',
  },
  fuchsia: {
    text: 'text-wine dark:text-wine',
    bg: 'bg-wine dark:bg-wine/90',
    soft: 'bg-wine/10 dark:bg-wine/20',
    border: 'border-wine/50 dark:border-wine/60',
    fill: 'fill-wine dark:fill-wine',
    stroke: 'stroke-wine dark:stroke-wine',
    label: 'fill-wine dark:fill-wine',
  },
}

export const PROJECT_META: Record<Project, { name: string, colour: ProjectColour }> = {
  meshtastic: { name: 'Meshtastic', colour: 'cyan' },
  meshcore: { name: 'MeshCore', colour: 'indigo' },
  reticulum: { name: 'Reticulum', colour: 'fuchsia' },
}

/** Shared neutral ink for axes, labels and links (light-first + dark). */
export const INK = {
  text: 'fill-ink-strong dark:fill-ink-strong',
  muted: 'fill-stone-deep dark:fill-stone-deep',
  line: 'stroke-stone dark:stroke-stone',
  faint: 'stroke-earth/40 dark:stroke-earth/60',
  card: 'card-surface border',
  /** Opaque page colour, for SVG halos behind labels. */
  halo: 'stroke-page dark:stroke-page',
} as const

/** Reveal / ghost states. Ghosting is always opacity, never a colour swap. */
export const VIS = {
  hidden: 'opacity-0',
  shown: 'opacity-100',
  ghost: 'opacity-20',
  faded: 'opacity-40',
} as const

/** Every literal class string in this module, for the UnoCSS safelist. */
export function allToneClasses(): string[] {
  const groups = [...Object.values(TONE), ...Object.values(PROJECT_COLOUR)]
  const strings = [
    ...groups.flatMap(g => Object.values(g)),
    ...Object.values(INK),
    ...Object.values(VIS),
  ]
  return [...new Set(strings.flatMap(s => s.split(/\s+/)).filter(Boolean))]
}
