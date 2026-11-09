/**
 * Generates drawings/*.svg from the scene definitions below, using Excalidraw's
 * own export pipeline in headless Chromium.
 *
 *   node scripts/gen-drawings.mjs
 *
 * Why a script instead of drawing by hand and exporting from excalidraw.com:
 *
 *  - Reveal sequences are multi-state. Excalidraw crops each export to
 *    its content bounds, so separately-drawn exports would each be a
 *    different size and the stacked overlays would jump on every click. Here
 *    all states share one element set and differ only in per-element
 *    `opacity`, so the bounds are identical by construction.
 *  - Every element gets a fixed `seed`, so rough.js draws the same wobble on
 *    every run. Without it the states would each sketch differently and
 *    the diagram would jitter as you click through.
 *
 * Editing: the scenes are also written out as drawings/*.excalidraw. Open one
 * at excalidraw.com, edit, save over the file, and re-run — or just edit the
 * definitions below, which is usually easier for these box-and-arrow shapes.
 *
 * Requires network on the machine running it (Excalidraw is loaded from esm.sh
 * and it fetches font files to subset them). That is author-time only; the
 * emitted SVGs embed their fonts as base64 and fetch nothing at render time.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { chromium } from 'playwright-chromium'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'drawings')

const INK = '#1e1e1e'
const GHOST = 10 // excalidraw opacity is 0-100
const FONT_EXCALIFONT = 5

let seedCounter = 1

/** Shared defaults. `seed` is deliberately sequential, never random. */
const base = (o) => ({
  angle: 0,
  strokeColor: INK,
  backgroundColor: 'transparent',
  fillStyle: 'solid',
  strokeWidth: 2,
  strokeStyle: 'solid',
  roughness: 1,
  opacity: 100,
  groupIds: [],
  frameId: null,
  roundness: { type: 3 },
  seed: seedCounter++ * 1000,
  version: 1,
  versionNonce: seedCounter * 7919,
  isDeleted: false,
  boundElements: null,
  updated: 1,
  link: null,
  locked: false,
  ...o,
})

const box = (id, x, y, width, height) =>
  base({ id, type: 'rectangle', x, y, width, height })

/**
 * Text is positioned by giving it the box's own x/width plus textAlign:center,
 * so Excalidraw centres each line for us and we never have to measure glyphs.
 */
const label = (id, text, { x, y, width, height }, fontSize = 28) => {
  const lines = text.split('\n').length
  const lineHeight = 1.25
  const textHeight = lines * fontSize * lineHeight
  return base({
    id,
    type: 'text',
    x,
    y: y + (height - textHeight) / 2,
    width,
    height: textHeight,
    text,
    originalText: text,
    fontSize,
    fontFamily: FONT_EXCALIFONT,
    textAlign: 'center',
    verticalAlign: 'top',
    containerId: null,
    lineHeight,
    roundness: null,
  })
}

/**
 * Free-standing text, i.e. a label that is not centred inside a box. `label()`
 * above derives its position from a container; this one is placed directly and
 * is what callouts ("Trace", "context", "attributes") are made of.
 */
const text = (id, str, x, y, width, fontSize = 20, textAlign = 'left') => {
  const lines = str.split('\n').length
  const lineHeight = 1.25
  return base({
    id,
    type: 'text',
    x,
    y,
    width,
    height: lines * fontSize * lineHeight,
    text: str,
    originalText: str,
    fontSize,
    fontFamily: FONT_EXCALIFONT,
    textAlign,
    verticalAlign: 'top',
    containerId: null,
    lineHeight,
    roundness: null,
  })
}

/**
 * `points` is relative to x1/y1, so a multi-segment elbow is just extra points —
 * that is how the parent→child "context" connectors turn a corner without
 * needing two separate arrows that would each draw their own head.
 */
const arrow = (id, x1, y1, x2, y2, { double = false, points, dashed = false } = {}) => {
  const pts = points ?? [[0, 0], [x2 - x1, y2 - y1]]
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  return base({
    id,
    type: 'arrow',
    x: x1,
    y: y1,
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
    points: pts,
    strokeStyle: dashed ? 'dashed' : 'solid',
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: double ? 'arrow' : null,
    endArrowhead: 'arrow',
    elbowed: false,
    roundness: { type: 2 },
  })
}

/** Plain line — no arrowheads. Used for separators and chart axes. */
const line = (id, x1, y1, x2, y2, { dashed = false } = {}) =>
  base({
    id,
    type: 'line',
    x: x1,
    y: y1,
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
    points: [[0, 0], [x2 - x1, y2 - y1]],
    strokeStyle: dashed ? 'dashed' : 'solid',
    lastCommittedPoint: null,
    startArrowhead: null,
    endArrowhead: null,
    roundness: { type: 2 },
  })

// ----------------------------------------------------------------- scenes
// Example scene (Cyrillic smoke test). Replace with the real talk drawings.
// Fonts: see CLAUDE.md "Cyrillic and fonts" for the Excalifont finding.

const nodeA = box('na', 0, 40, 220, 100)
const nodeB = box('nb', 380, 40, 220, 100)
const example = [
  nodeA, label('na-t', 'Възел A', nodeA, 28),
  nodeB, label('nb-t', 'Възел B', nodeB, 28),
  arrow('ex-a', 225, 90, 375, 90),
]

const exampleReveal = [
  [],
  ['na', 'na-t'],
  ['ex-a', 'nb', 'nb-t'],
]

/**
 * One export per reveal state, cumulative: everything revealed so far is at
 * full opacity, everything else is ghosted rather than removed. That is what
 * keeps every state the same size, so the stacked overlays never jump.
 */
const states = (slug, elements, reveal) =>
  reveal.map((_, i) => {
    const shown = new Set(reveal.slice(0, i + 1).flat())
    return {
      name: `${slug}-${i + 1}`,
      elements: elements.map((el) => ({ ...el, opacity: shown.has(el.id) ? 100 : GHOST })),
    }
  })

const jobs = [
  ...states('example', example, exampleReveal),
]

const asScene = (elements) => ({
  type: 'excalidraw',
  version: 2,
  source: 'scripts/gen-drawings.mjs',
  elements,
  appState: { viewBackgroundColor: '#ffffff', gridSize: null },
  files: {},
})

/**
 * Namespace ids and the font family so two drawings can be inlined on the same
 * page without clobbering each other. Both are real collisions: SVG ids are
 * document-global, and two @font-face rules sharing a family name but carrying
 * different glyph subsets means the last one wins and the earlier drawing
 * loses characters.
 */
function isolate(svg, slug) {
  return svg
    .replace(/ id="([^"]+)"/g, ` id="$1--${slug}"`)
    .replace(/url\(#([^)]+)\)/g, `url(#$1--${slug})`)
    .replace(/href="#([^"]+)"/g, `href="#$1--${slug}"`)
    .replace(/Excalifont/g, `Excalifont--${slug}`)
}

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('about:blank')

for (const { name, elements } of jobs) {
  const scene = asScene(elements)
  writeFileSync(join(OUT, `${name}.excalidraw`), `${JSON.stringify(scene, null, 2)}\n`)

  const svg = await page.evaluate(async (scene) => {
    const { exportToSvg } = await import(
      'https://esm.sh/@excalidraw/excalidraw@0.18.0?bundle&exports=exportToSvg'
    )
    const el = await exportToSvg({
      elements: scene.elements,
      appState: { exportWithDarkMode: false, exportBackground: false },
      files: null,
    })
    return el.outerHTML
  }, scene)

  writeFileSync(join(OUT, `${name}.svg`), `${isolate(svg, name)}\n`)
  console.log(`${name}.svg  ${(svg.length / 1024).toFixed(0)} KB`)
}

await browser.close()
