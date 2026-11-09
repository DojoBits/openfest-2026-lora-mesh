// Merged by Slidev on top of its own UnoCSS config (node/setups/unocss.ts).
// UnoCSS only extracts classes it sees as literal text in scanned files, and
// plain .ts data modules are not scanned, so the semantic tone classes that
// components look up from components/data/tones.ts are safelisted here.
import { defineConfig } from 'unocss'
import { allToneClasses } from './components/data/tones'

// Theme colours = the journey-map palette. The values live once, as CSS
// variables in style.css (`--c-*`, light in :root, dark in html.dark); here they
// only get names. `<alpha-value>` is UnoCSS's placeholder for the opacity
// modifier, so `bg-trail/10` becomes `rgb(var(--c-trail) / 0.1)`.
const v = (name: string): string => `rgb(var(--c-${name}) / <alpha-value>)`

export default defineConfig({
  theme: {
    colors: {
      page: v('page'),
      parchment: { DEFAULT: v('parchment'), hi: v('parchment-hi'), lo: v('parchment-lo') },
      ink: { DEFAULT: v('ink'), strong: v('ink-strong') },
      trail: v('trail'),
      earth: { DEFAULT: v('earth'), deep: v('earth-deep') },
      gold: { DEFAULT: v('gold'), deep: v('gold-deep') },
      stone: { DEFAULT: v('stone'), deep: v('stone-deep') },
      moss: v('moss'),
      water: v('water'),
      // project identity hues: Meshtastic, MeshCore, Reticulum
      verdigris: v('verdigris'),
      dusk: v('dusk'),
      wine: v('wine'),
      // Role tokens: which map colour fills a role is decided per slide in
      // style.css, never here. `accent` = the journey stop's colour (`ink` is the
      // text-safe shade), `edge` = card and chip outline, `focus` = the one
      // highlighted card / strip on a slide.
      accent: { DEFAULT: v('accent'), ink: v('accent-ink') },
      edge: v('edge'),
      focus: v('focus'),
    },
  },
  shortcuts: {
    // The deck's card recipe (was bg-gray-100 / border-gray-300 everywhere):
    // a piece of map parchment with an earth-brown edge. Components add their
    // own padding/radius/border width; `card` is the full recipe for pages.
    'card-surface': 'bg-parchment dark:bg-parchment border-edge/60 dark:border-edge/80',
    'card': 'card-surface rounded-xl p-6 border',
    // Small rounded label in the neutral ink.
    'chip': 'rounded-full border px-3 bg-parchment-hi border-edge/60 text-ink dark:bg-parchment-hi dark:border-edge/80 dark:text-ink',
  },
  safelist: allToneClasses(),
})
