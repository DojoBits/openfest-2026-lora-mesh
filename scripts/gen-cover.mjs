// Generates public/cover-light.svg: the title/closing slide artwork.
// Layers (back to front): soft gradient, topographic contours (the "mountain
// without coverage" hook), a sparse mesh of nodes + links, radio-wave arcs.
// Everything is computed here, deterministic, no network: re-run after edits.
//   node scripts/gen-cover.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const W = 1920
const H = 1080
const OUT = fileURLToPath(new URL('../public/cover-light.svg', import.meta.url))

// Tiny seeded PRNG (mulberry32) so the art is identical on every run.
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = rng(2026)

// ---- Height field: a few gaussian "peaks" placed off-centre (corners/edges)
// so contours crowd the edges and thin out behind the title.
const PEAKS = [
  { x: 220, y: 900, h: 1.0, s: 420 },   // bottom-left massif
  { x: 620, y: 1120, h: 0.6, s: 300 },
  { x: 1700, y: 160, h: 0.9, s: 380 },  // top-right massif
  { x: 1350, y: -60, h: 0.5, s: 260 },
  { x: 1820, y: 760, h: 0.45, s: 240 },
  { x: 80, y: 120, h: 0.35, s: 220 },
]
const height = (x, y) => PEAKS.reduce((z, p) => {
  const d2 = (x - p.x) ** 2 + (y - p.y) ** 2
  return z + p.h * Math.exp(-d2 / (2 * p.s * p.s))
}, 0) + 0.03 * Math.sin(x / 140) * Math.cos(y / 110) // a little terrain wobble

// ---- Marching squares: emit iso-line segments per level, then chain them
// into polylines so each contour is one smooth path, not hundreds of dashes.
const STEP = 12
const NX = Math.ceil(W / STEP) + 1
const NY = Math.ceil(H / STEP) + 1
const grid = []
for (let j = 0; j < NY; j++) {
  grid.push([])
  for (let i = 0; i < NX; i++) grid[j].push(height(i * STEP, j * STEP))
}

function segments(level) {
  const segs = []
  const lerp = (a, b, va, vb) => a + (b - a) * ((level - va) / (vb - va))
  for (let j = 0; j < NY - 1; j++) {
    for (let i = 0; i < NX - 1; i++) {
      const x = i * STEP, y = j * STEP
      const a = grid[j][i], b = grid[j][i + 1], c = grid[j + 1][i + 1], d = grid[j + 1][i]
      // Edge crossing points: top, right, bottom, left.
      const pts = []
      if ((a < level) !== (b < level)) pts.push([lerp(x, x + STEP, a, b), y])
      if ((b < level) !== (c < level)) pts.push([x + STEP, lerp(y, y + STEP, b, c)])
      if ((d < level) !== (c < level)) pts.push([lerp(x, x + STEP, d, c), y + STEP])
      if ((a < level) !== (d < level)) pts.push([x, lerp(y, y + STEP, a, d)])
      if (pts.length === 2) segs.push(pts)
      else if (pts.length === 4) segs.push([pts[0], pts[1]], [pts[2], pts[3]]) // saddle: either pairing reads fine at this scale
    }
  }
  return segs
}

// Chain segments that share endpoints (rounded keys) into polylines.
function chain(segs) {
  const key = ([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`
  const ends = new Map()
  segs.forEach((s, idx) => {
    for (const p of s) {
      const k = key(p)
      if (!ends.has(k)) ends.set(k, [])
      ends.get(k).push(idx)
    }
  })
  const used = new Set()
  const lines = []
  for (let s = 0; s < segs.length; s++) {
    if (used.has(s)) continue
    used.add(s)
    const line = [...segs[s]]
    // Grow forward from the tail, then backward from the head.
    for (const forward of [true, false]) {
      for (;;) {
        const tip = forward ? line[line.length - 1] : line[0]
        const next = (ends.get(key(tip)) || []).find(n => !used.has(n))
        if (next === undefined) break
        used.add(next)
        const [p, q] = segs[next]
        const far = key(p) === key(tip) ? q : p
        forward ? line.push(far) : line.unshift(far)
      }
    }
    if (line.length > 4) lines.push(line)
  }
  return lines
}

// Smooth a polyline into a path with quadratic curves through midpoints.
function smoothPath(pts) {
  const f = n => n.toFixed(1)
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2
    d += `Q${f(pts[i][0])} ${f(pts[i][1])} ${f(mx)} ${f(my)}`
  }
  const last = pts[pts.length - 1]
  return d + `L${f(last[0])} ${f(last[1])}`
}

const LEVELS = Array.from({ length: 14 }, (_, k) => 0.08 + k * 0.065)
const contours = LEVELS.map((lv, k) => {
  const index = k % 5 === 4 // every 5th line is an "index contour", drawn a bit bolder
  const d = chain(segments(lv)).map(smoothPath).join('')
  return `<path d="${d}" stroke-width="${index ? 2.6 : 1.4}" opacity="${index ? 0.5 : 0.32}"/>`
}).join('\n    ')

// ---- Mesh: nodes scattered in two edge bands (never behind the title block),
// linked to near neighbours like radios in range of each other.
const nodes = []
// Kept clear of mesh: cover title block, cover footer (OpenFest logo + year),
// and the closing slide's top-centre heading („Благодаря!“) and QR column.
const inTitleZone = (x, y) =>
  (x > 330 && x < 1590 && y > 300 && y < 870) ||
  (x > 600 && x < 1320 && (y > 880 || y < 280))
while (nodes.length < 26) {
  const x = 60 + rand() * (W - 120), y = 60 + rand() * (H - 120)
  if (inTitleZone(x, y)) continue
  if (nodes.some(n => Math.hypot(n.x - x, n.y - y) < 130)) continue
  nodes.push({ x, y, r: rand() < 0.25 ? 9 : 6 }) // a few bigger "repeaters"
}
const RANGE = 300
const links = []
nodes.forEach((a, i) => nodes.slice(i + 1).forEach(b => {
  const d = Math.hypot(a.x - b.x, a.y - b.y)
  if (d < RANGE && !(inTitleZone((a.x + b.x) / 2, (a.y + b.y) / 2))) links.push([a, b, d])
}))
const f = n => n.toFixed(1)
const linkSvg = links.map(([a, b, d]) =>
  `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" opacity="${(0.55 - d / RANGE * 0.35).toFixed(2)}"/>`).join('\n    ')
const nodeSvg = nodes.map(n =>
  `<circle cx="${f(n.x)}" cy="${f(n.y)}" r="${n.r}"/>` +
  (n.r > 6 ? `<circle cx="${f(n.x)}" cy="${f(n.y)}" r="${n.r + 9}" fill="none" stroke-width="2" opacity=".45"/>` : '')).join('\n    ')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
  <!-- Generated by scripts/gen-cover.mjs. Do not hand-edit. -->
  <defs>
    <linearGradient id="cover-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e6f2f4"/>
      <stop offset=".5" stop-color="#f8fafc"/>
      <stop offset="1" stop-color="#e3eef6"/>
    </linearGradient>
    <!-- Fades every layer out behind the title so text sits on clean ground. -->
    <radialGradient id="cover-clear" cx=".5" cy=".5" r=".62">
      <stop offset=".28" stop-color="#000"/>
      <stop offset=".75" stop-color="#fff"/>
    </radialGradient>
    <mask id="cover-mask"><rect width="${W}" height="${H}" fill="url(#cover-clear)"/></mask>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#cover-bg)"/>
  <g mask="url(#cover-mask)">
  <g fill="none" stroke="#5b8fa3" stroke-linecap="round" stroke-linejoin="round">
    ${contours}
  </g>
  <g stroke="#0f766e" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round">
    ${linkSvg}
  </g>
  <g fill="#0f766e" stroke="#0f766e" opacity=".75">
    ${nodeSvg}
  </g>
  </g>
  <g fill="none" stroke="#0f766e" stroke-linecap="round" stroke-width="6">
    <!-- radio-wave arcs radiating from the bottom-right corner -->
    <path d="M1920 880 A300 300 0 0 0 1620 1080" opacity=".35"/>
    <path d="M1920 700 A480 480 0 0 0 1440 1080" opacity=".25"/>
    <path d="M1920 520 A660 660 0 0 0 1260 1080" opacity=".16"/>
    <path d="M1920 340 A840 840 0 0 0 1080 1080" opacity=".1"/>
    <!-- and a smaller echo from the top-left -->
    <path d="M0 200 A200 200 0 0 0 200 0" opacity=".25"/>
    <path d="M0 360 A360 360 0 0 0 360 0" opacity=".15"/>
    <path d="M0 520 A520 520 0 0 0 520 0" opacity=".08"/>
  </g>
</svg>
`
writeFileSync(OUT, svg)
console.log(`cover-light.svg: ${LEVELS.length} contour levels, ${nodes.length} nodes, ${links.length} links, ${(svg.length / 1024).toFixed(0)} KB`)
