<script setup lang="ts">
// Slide 19 „Пряка видимост и препятствия“, drawn as a Middle-earth map scene in
// a framed parchment card (BandWorldMap recipe: ink frame, compass in a corner,
// the deck's red dragon): a town on the left (stone watchtower, timber inn,
// a round map tree), a bare hill in the middle (stone ruin, beacon tower), a
// farm on the right (pond with a raft, wooden solar pole, a smial in a grassy
// mound, crop field, barn). LoRa needs no line of sight: walls and trees cost
// range, the hill between town and farm stops it. Nodes and clear links stay
// once shown; a blocked line and its ✗ only on their own click:
//   1 a wizard (town, by the tower) and a hobbit (farm, at its smial), node in
//     hand. The wizard reaches a
//     client inside the inn through its wall: dotted moss line, thinner and
//     fainter past the wall entry (wallEntry). Wizard to hobbit: red dashed
//     line through the town (`l.soft`: walls don't count), ✗ on the hill;
//   2 antenna on a mast on the watchtower battlements, wooden solar pole on the
//     farm: over the town, cut by the hill;
//   3 router (amber = relay) on the beacon tower, its fire lit: dotted moss lines
//     from the tower, the pole and a dwarf walking up the hill path;
//   4 mesh: the tower and the pole become Routers too. Town: the wizard and the
//     inn client reach the tower. Farm: the hobbit, the raft on the pond and a gateway on the smial
//     chimney reach the pole; two soil sensors in the field, two on the barn and
//     the dog's GPS collar report to the gateway; the dragon high above the farm
//     carries a node that reaches the pole.
// Blocked lines run behind the scenery, so the obstacle visibly cuts them; ✗
// marks the first hit. Geometry and hit test: data/sightScene.ts (tested).
// Scenery uses map tokens only (parchment land, ink outlines, muted moss/gold/
// earth/stone fills; the figures' skin and the dwarf's beard are map-glyph hexes),
// so it carries no meaning; dark mode lights the slits. Readable, not to scale;
// no range numbers here (the next slide has them).
// Every SVG font-size / stroke width / opacity lives in style="" (attributify trap).
import { useNav } from '@slidev/client'
import type { Pt } from './data/sightScene'
import { BARN, BARN_SENSORS, BEACON, BUILDINGS, CHIMNEY, CLIENT, CROP_H, DOG, DOG_TIP, DRAGON, DRAGON_TIP, FIELD, FIG, FLORA_BUSH, FLORA_TREE, GATEWAY, GROUND, HILL_DWARF, HILL_FLORA, HILL_PATH, HILL_ROAD_PATH, HILL_ROUTER, INN_WIN_R, MERLON, PEOPLE, POLE, POLE_TIP, POND, RAFT, RAFT_TIP, ROAD_W, ROOF, RUIN, SENSORS, SIGHT_H, SIGHT_LINKS, SIGHT_W, SLIT, SMIAL, TREES, TREE_TRUNK_W, firstHit, smialY, wallEntry } from './data/sightScene'
import { INK, TONE } from './data/tones'
import { useStep } from './data/useStep'

// the town's two buildings, in drawing order: watchtower, inn
const [TOWER, INN] = BUILDINGS

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(4, () => props.step, () => props.startAt ?? 0)
const { isPrintMode } = useNav()

// `hit`: where a blocked line is cut (✗); a soft link ignores walls and trees.
// `wall`: where a through-wall link enters its building, drawn weaker past it.
const links = SIGHT_LINKS.map(l => ({ ...l, hit: l.ok ? null : firstHit(l.from, l.to, l.own, l.soft), wall: wallEntry(l) }))
const blocked = links.filter(l => !l.ok)
const clear = links.filter(l => l.ok)
const only = (at: number) => (s.value === at ? 'opacity-100' : 'opacity-0')
const from = (at: number) => (s.value >= at ? 'opacity-100' : 'opacity-0')

// Shared class strings, all map tokens with their dark twins. The tokens swap
// under html.dark by themselves; the twins only retune the alpha.
const OL = 'stroke-ink dark:stroke-ink'
const LAND = 'fill-parchment-lo/55 dark:fill-parchment-lo'
const STONE = 'fill-stone/35 dark:fill-stone/70'
const TIMBER = 'fill-earth/30 dark:fill-earth/70'
const THATCH = 'fill-gold/55 dark:fill-gold/45'
const GRASS = 'fill-moss/30 dark:fill-moss/30'
const WOOD = 'fill-earth-deep dark:fill-earth-deep'
const WOOD_STROKE = 'stroke-earth-deep dark:stroke-earth-deep'
const LIT = 'fill-gold dark:fill-gold'
// arrow slits: dark holes by day, lit by night
const SLIT_FILL = 'fill-ink/80 dark:fill-gold'
const SKIN = 'fill-[#f0c9a0] dark:fill-[#e8b98c]'
const SKIN_STROKE = 'stroke-[#f0c9a0] dark:stroke-[#e8b98c]'
const BEARD = 'fill-[#b8642c] dark:fill-[#d9884a]'
// labels get a parchment halo (stroke painted under the fill) so links never cut them
const LABEL = 'font-size: 22px; paint-order: stroke; stroke-width: 5px; stroke-linejoin: round'
const HALO = 'stroke-parchment-hi dark:stroke-parchment-hi'
const w = (n: number) => `stroke-width: ${n}`

// Every node pulses from the first click it takes part in and keeps pulsing:
// one ring set per point.
const pulseMap = new Map<string, Pt & { at: number }>()
for (const l of SIGHT_LINKS) {
  for (const pt of [l.from, l.to]) {
    const key = `${pt.x},${pt.y}`
    const old = pulseMap.get(key)
    if (!old || l.at < old.at) pulseMap.set(key, { x: pt.x, y: pt.y, at: l.at })
  }
}
const PULSES = [...pulseMap.values()]
// Crop: a stalk every 6 units across the field, alternating heights.
const CROPS = Array.from({ length: Math.floor((FIELD.to - FIELD.from) / 6) + 1 }, (_, i) => ({ x: FIELD.from + i * 6, h: i % 2 ? CROP_H : CROP_H - 3 }))

// Watchtower masonry: a course line every 16 units, with the vertical joints
// of alternate courses offset by half a block so it reads as laid stone.
const COURSE_H = 16
const BLOCK_W = 26
const TOWER_COURSES = Array.from({ length: Math.floor((GROUND - TOWER.top) / COURSE_H) }, (_, i) => TOWER.top + (i + 1) * COURSE_H).filter(y => y < GROUND)
const TOWER_JOINTS = TOWER_COURSES.flatMap((y, i) => {
  const off = i % 2 ? BLOCK_W / 2 : 0
  return Array.from({ length: 3 }, (_, k) => TOWER.x + off + (k + 1) * BLOCK_W - BLOCK_W / 2)
    .filter(x => x > TOWER.x + 4 && x < TOWER.x + TOWER.w - 4)
    .map(x => ({ x, y }))
})
// Battlements: a corbelled ledge slightly wider than the tower, four teeth on
// it; the mast rises through the middle gap.
const LEDGE = { x: TOWER.x - 4, w: TOWER.w + 8, h: 9 }
const MERLONS = [0, 1, 2, 3].map(i => LEDGE.x + i * ((LEDGE.w - MERLON.w) / 3))
// Inn: stone ground floor below `INN_FLOOR`, timber frame above, thatch roof
// overhanging the walls by `EAVE`.
const INN_FLOOR = INN.top + (GROUND - INN.top) / 2
const EAVE = 6
const INN_PEAK = INN.peak ?? INN.top
// Smial mound outline: half an ellipse sitting on the ground.
const MOUND = `M ${SMIAL.x},${GROUND} A ${SMIAL.w / 2},${GROUND - SMIAL.top} 0 0 1 ${SMIAL.x + SMIAL.w},${GROUND} Z`
const DOOR = { x: SMIAL.x + 18, y: GROUND - 14, r: 11.5 }
const CHIMNEY_FOOT = (smialY(CHIMNEY.x) ?? GROUND) + 4
// Ruin stubs: broken tops, a little lower in the middle than at the ends.
const RUIN_PATHS = RUIN.map(r => `M ${r.x},${r.base} V ${r.base - r.h + 2} L ${r.x + r.w * 0.35},${r.base - r.h} L ${r.x + r.w * 0.6},${r.base - r.h + 4} L ${r.x + r.w},${r.base - r.h + 1} V ${r.base} Z`)
// Dragon claws (MapPerils, flipped to face left): the cords run from both
// feet down to the node it carries.
const CLAWS = [-13, 9].map(dx => ({ x: DRAGON.x + dx * DRAGON.scale, y: DRAGON.y + 24 * DRAGON.scale }))
</script>

<template>
  <div class="lora-viz w-full select-none overflow-hidden rounded-[10px] border-2 border-ink/70 dark:border-ink/70 shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
    <svg class="block w-full" :viewBox="`0 0 ${SIGHT_W} ${SIGHT_H}`" role="img" aria-label="Карта: град с кула и хан, хълм с огнена кула, ферма с хобитска дупка; радио връзки между тях">
      <!-- sky: the map's light centre -->
      <rect x="0" y="0" :width="SIGHT_W" :height="SIGHT_H" class="fill-parchment-hi dark:fill-parchment-hi" />

      <!-- blocked links: behind the scenery -->
      <g v-for="l in blocked" :key="l.id" class="transition-opacity duration-500" :class="only(l.at)">
        <line :x1="l.from.x" :y1="l.from.y" :x2="l.to.x" :y2="l.to.y" stroke-dasharray="12 8" :class="TONE.red.stroke" :style="w(5)" />
      </g>

      <!-- compass rose in the top-left corner of the map -->
      <MapGlyphs kind="compass" :x="40" :y="42" :s="0.55" />

      <!-- land and hill: one parchment sheet, inked outline -->
      <rect x="0" :y="GROUND" :width="SIGHT_W" :height="SIGHT_H - GROUND" :class="LAND" />
      <!-- opaque underlay: the land tint is translucent, the hill must hide the lines it cuts -->
      <path :d="HILL_PATH" class="fill-parchment-hi dark:fill-parchment-hi" />
      <path :d="HILL_PATH" :class="[LAND, OL]" :style="w(2)" />
      <line x1="0" :x2="SIGHT_W" :y1="GROUND" :y2="GROUND" :class="OL" :style="w(2)" />

      <!-- switchback path up the hill face to the beacon: inked edges, pale track -->
      <path :d="HILL_ROAD_PATH" fill="none" class="stroke-ink/45 dark:stroke-ink/40" :style="`stroke-width: ${ROAD_W + 2}; stroke-linejoin: round; stroke-linecap: round`" />
      <path :d="HILL_ROAD_PATH" fill="none" class="stroke-parchment-hi dark:stroke-parchment-hi" :style="`stroke-width: ${ROAD_W - 1.5}; stroke-linejoin: round; stroke-linecap: round`" />

      <!-- map trees and bushes on the hill: texture, so it reads as a hill -->
      <g v-for="f in HILL_FLORA" :key="`${f.kind}-${f.x}-${f.y}`" :transform="`translate(${f.x} ${f.y})`" :class="OL">
        <!-- tree: round crown on a short trunk, a small arc of leaf shading -->
        <g v-if="f.kind === 'tree'">
          <path d="M 0,0 V -8" fill="none" :style="w(1.6)" />
          <circle cy="-17" :r="FLORA_TREE.w - 1" :class="GRASS" :style="w(1.4)" />
          <path d="M -3.5,-19 Q 0,-22.5 3.5,-19" fill="none" :style="w(1)" />
        </g>
        <!-- bush: two back clumps and one in front -->
        <g v-else :class="GRASS" :style="w(1.1)">
          <circle :cx="-FLORA_BUSH.r - 1" :cy="-FLORA_BUSH.r" :r="FLORA_BUSH.r" />
          <circle :cx="FLORA_BUSH.r + 1" :cy="-FLORA_BUSH.r" :r="FLORA_BUSH.r" />
          <circle cx="0" :cy="-FLORA_BUSH.h + FLORA_BUSH.r + 1" :r="FLORA_BUSH.r + 1" />
        </g>
      </g>

      <!-- the summit: broken ruin walls either side of a stone beacon tower -->
      <path v-for="(d, i) in RUIN_PATHS" :key="`ruin-${i}`" :d="d" :class="[STONE, OL]" :style="w(1.5)" />
      <g role="img" aria-label="огнена кула на хълма">
        <rect :x="BEACON.x - BEACON.w / 2" :y="BEACON.top" :width="BEACON.w" :height="BEACON.base - BEACON.top" :class="[STONE, OL]" :style="w(1.8)" />
        <rect :x="BEACON.x - BEACON.w / 2 - 2.5" :y="BEACON.top" :width="BEACON.w + 5" height="4" :class="[STONE, OL]" :style="w(1.5)" />
        <path :d="`M ${BEACON.x - BEACON.w / 2},${BEACON.top + 26} H ${BEACON.x + BEACON.w / 2}`" :class="OL" :style="w(0.9)" />
        <!-- fire opening under the battlements -->
        <path :d="`M ${BEACON.x - 5},${BEACON.top + 20} V ${BEACON.top + 12} Q ${BEACON.x},${BEACON.top + 6} ${BEACON.x + 5},${BEACON.top + 12} V ${BEACON.top + 20} Z`" class="fill-ink/80 dark:fill-parchment-lo" :class="OL" :style="w(1.2)" />
      </g>

      <!-- the farm: pond, crop field, smial, barn -->
      <ellipse :cx="POND.cx" :cy="GROUND + 1" :rx="POND.rx" :ry="POND.ry" class="fill-water/35 dark:fill-water/30" :class="OL" :style="w(1.5)" />
      <path :d="`M ${POND.cx - 16},${GROUND + 3} h 9 M ${POND.cx + 6},${GROUND + 4} h 9`" class="stroke-water dark:stroke-water" :style="w(1.2)" />
      <rect :x="FIELD.from - 3" :y="GROUND - 2" :width="FIELD.to - FIELD.from + 6" height="6" rx="2" class="fill-earth/60 dark:fill-earth" :class="OL" :style="w(1)" />
      <g class="stroke-moss dark:stroke-moss" style="stroke-width: 2; stroke-linecap: round">
        <path v-for="c in CROPS" :key="c.x" :d="`M ${c.x},${GROUND - 1} L ${c.x},${GROUND - c.h} M ${c.x},${GROUND - c.h + 5} L ${c.x - 3},${GROUND - c.h + 2} M ${c.x},${GROUND - c.h + 5} L ${c.x + 3},${GROUND - c.h + 2}`" fill="none" />
      </g>

      <!-- smial: grassy mound, stone chimney, round green door with a gold knob, a lit round window -->
      <g role="img" aria-label="хобитска дупка">
        <rect :x="CHIMNEY.x - CHIMNEY.w / 2" :y="CHIMNEY.top" :width="CHIMNEY.w" :height="CHIMNEY_FOOT - CHIMNEY.top" :class="[STONE, OL]" :style="w(1.5)" />
        <rect :x="CHIMNEY.x - CHIMNEY.w / 2 - 2" :y="CHIMNEY.top" :width="CHIMNEY.w + 4" height="4" :class="[STONE, OL]" :style="w(1.3)" />
        <path :d="MOUND" :class="[GRASS, OL]" :style="w(2)" />
        <path :d="`M ${SMIAL.x + 12},${SMIAL.top + 12} l 2,-5 l 2,5 M ${SMIAL.x + 26},${SMIAL.top + 3} l 2,-5 l 2,5 M ${SMIAL.x + 42},${SMIAL.top + 14} l 2,-5 l 2,5`" fill="none" class="stroke-moss dark:stroke-moss" :style="w(1.4)" />
        <circle :cx="DOOR.x" :cy="DOOR.y" :r="DOOR.r + 2.5" :class="[STONE, OL]" :style="w(1.5)" />
        <circle :cx="DOOR.x" :cy="DOOR.y" :r="DOOR.r" class="fill-moss dark:fill-moss" :class="OL" :style="w(1.5)" />
        <circle :cx="DOOR.x" :cy="DOOR.y" r="2" :class="LIT" />
        <circle :cx="SMIAL.x + 42" :cy="GROUND - 18" r="4.5" :class="[LIT, OL]" :style="w(1.3)" />
        <line :x1="SMIAL.x" :x2="SMIAL.x + SMIAL.w" :y1="GROUND" :y2="GROUND" :class="OL" :style="w(2)" />
      </g>

      <!-- barn: plank walls, thatch roof, braced double door, hayloft -->
      <g>
        <rect :x="BARN.x" :y="BARN.wallTop" :width="BARN.w" :height="GROUND - BARN.wallTop" :class="[TIMBER, OL]" :style="w(2)" />
        <path :d="Array.from({ length: 8 }, (_, i) => `M ${BARN.x + (i + 1) * 10},${BARN.wallTop} V ${GROUND}`).join(' ')" class="stroke-ink/25 dark:stroke-ink/30" :style="w(1)" />
        <path :d="`M ${BARN.x - 4},${BARN.wallTop + 2} L ${BARN.x + BARN.w / 2},${BARN.peak} L ${BARN.x + BARN.w + 4},${BARN.wallTop + 2} Z`" :class="[THATCH, OL]" :style="w(2)" />
        <rect :x="BARN.x + BARN.w / 2 - 16" :y="GROUND - 36" width="32" height="36" :class="[WOOD, OL]" :style="w(1.5)" />
        <path :d="`M ${BARN.x + BARN.w / 2},${GROUND - 36} V ${GROUND} M ${BARN.x + BARN.w / 2 - 16},${GROUND - 36} L ${BARN.x + BARN.w / 2},${GROUND} L ${BARN.x + BARN.w / 2 + 16},${GROUND - 36}`" fill="none" class="stroke-parchment-hi/70 dark:stroke-parchment-lo" :style="w(1.3)" />
        <rect :x="BARN.x + BARN.w / 2 - 7" :y="BARN.wallTop - 14" width="14" height="12" class="fill-ink/80 dark:fill-parchment-lo" :class="OL" :style="w(1.2)" />
      </g>

      <!-- watchtower: laid stone, arrow slits, arched door, corbelled battlements -->
      <g role="img" aria-label="каменна кула">
        <rect :x="TOWER.x" :y="TOWER.top" :width="TOWER.w" :height="GROUND - TOWER.top" :class="[STONE, OL]" :style="w(2)" />
        <path :d="TOWER_COURSES.map(y => `M ${TOWER.x},${y} H ${TOWER.x + TOWER.w}`).join(' ')" class="stroke-ink/25 dark:stroke-ink/30" :style="w(1)" />
        <path :d="TOWER_JOINTS.map(j => `M ${j.x},${j.y} v -${COURSE_H}`).join(' ')" class="stroke-ink/25 dark:stroke-ink/30" :style="w(1)" />
        <rect v-for="(win, i) in TOWER.windows" :key="i" :x="win.x - SLIT.w / 2" :y="win.y - SLIT.h / 2" :width="SLIT.w" :height="SLIT.h" :rx="SLIT.w / 2" :class="SLIT_FILL" />
        <path :d="`M ${ROOF.x - 9},${GROUND} V ${GROUND - 20} Q ${ROOF.x},${GROUND - 32} ${ROOF.x + 9},${GROUND - 20} V ${GROUND} Z`" :class="[WOOD, OL]" :style="w(1.5)" />
        <rect :x="LEDGE.x" :y="TOWER.top - LEDGE.h" :width="LEDGE.w" :height="LEDGE.h" :class="[STONE, OL]" :style="w(1.8)" />
        <rect v-for="mx in MERLONS" :key="mx" :x="mx" :y="TOWER.top - LEDGE.h - MERLON.h" :width="MERLON.w" :height="MERLON.h" :class="[STONE, OL]" :style="w(1.8)" />
      </g>

      <!-- inn: stone ground floor, timber-framed upper floor, thatch, hanging sign;
           the round window on the far side is lit (the client sits by it) -->
      <g role="img" aria-label="хан">
        <rect :x="INN.x" :y="INN_FLOOR" :width="INN.w" :height="GROUND - INN_FLOOR" :class="[STONE, OL]" :style="w(2)" />
        <rect :x="INN.x" :y="INN.top" :width="INN.w" :height="INN_FLOOR - INN.top" :class="[TIMBER, OL]" :style="w(2)" />
        <path :d="`M ${INN.x + INN.w / 2},${INN.top} V ${INN_FLOOR} M ${INN.x},${INN_FLOOR - 20} H ${INN.x + INN.w} M ${INN.x + 2},${INN_FLOOR - 2} L ${INN.x + INN.w / 2 - 2},${INN_FLOOR - 18} M ${INN.x + INN.w / 2 + 2},${INN_FLOOR - 18} L ${INN.x + INN.w - 2},${INN_FLOOR - 2}`" fill="none" :class="WOOD_STROKE" :style="w(3)" />
        <path :d="`M ${INN.x - EAVE},${INN.top + 3} L ${INN.x + INN.w / 2},${INN_PEAK} L ${INN.x + INN.w + EAVE},${INN.top + 3} Z`" :class="[THATCH, OL]" :style="w(2)" />
        <path :d="`M ${INN.x + 14},${INN.top - 4} l 6,-8 M ${INN.x + 50},${INN.top - 4} l -6,-8`" fill="none" class="stroke-ink/50 dark:stroke-ink/50" :style="w(1.2)" />
        <circle :cx="INN.windows[1].x" :cy="INN.windows[1].y" :r="INN_WIN_R" :class="[LIT, OL]" :style="w(2)" />
        <rect :x="INN.windows[0].x - 7" :y="INN.windows[0].y - 7" width="14" height="14" class="fill-gold/50 dark:fill-gold/80" :class="OL" :style="w(1.6)" />
        <path :d="`M ${INN.x + INN.w / 2 - 8},${GROUND} V ${GROUND - 20} Q ${INN.x + INN.w / 2},${GROUND - 29} ${INN.x + INN.w / 2 + 8},${GROUND - 20} V ${GROUND} Z`" :class="[WOOD, OL]" :style="w(1.5)" />
        <path :d="`M ${INN.x + INN.w},${INN_FLOOR + 8} h 12 M ${INN.x + INN.w + 4},${INN_FLOOR + 8} v 3 M ${INN.x + INN.w + 10},${INN_FLOOR + 8} v 3`" fill="none" :class="OL" :style="w(1.4)" />
        <rect :x="INN.x + INN.w + 2" :y="INN_FLOOR + 11" width="10" height="9" rx="1" :class="[THATCH, OL]" :style="w(1.2)" />
      </g>

      <!-- the street tree: a round map tree -->
      <g v-for="t in TREES" :key="t.x" :class="OL">
        <rect :x="t.x - TREE_TRUNK_W / 2" :y="t.cy" :width="TREE_TRUNK_W" :height="GROUND - t.cy" :class="WOOD" :style="w(1.4)" />
        <circle :cx="t.x" :cy="t.cy" :r="t.r" :class="GRASS" :style="w(2)" />
        <path :d="`M ${t.x - 9},${t.cy - 6} Q ${t.x},${t.cy - 14} ${t.x + 9},${t.cy - 6} M ${t.x - 4},${t.cy + 8} Q ${t.x + 3},${t.cy + 3} ${t.x + 10},${t.cy + 8}`" fill="none" :style="w(1.2)" />
      </g>

      <!-- people, drawn facing right and mirrored by `side`; the node's antenna
           tip is at (FIG.tipDx, FIG.tipDy) for both, so neither is taller where it counts -->
      <g v-for="p in PEOPLE" :key="p.kind" role="img" :aria-label="p.name">
        <g :transform="`translate(${p.x} ${GROUND}) scale(${p.side * FIG.scale} ${FIG.scale})`">
          <!-- hobbit: short, curly hair, big bare feet, brown coat, node held up over the head -->
          <g v-if="p.kind === 'hobbit'">
            <ellipse cx="-5" cy="-2" rx="6" ry="3" :class="[SKIN, OL]" :style="w(1)" />
            <ellipse cx="6" cy="-2" rx="6" ry="3" :class="[SKIN, OL]" :style="w(1)" />
            <rect x="-6" y="-11" width="5" height="9" :class="WOOD" />
            <rect x="1" y="-11" width="5" height="9" :class="WOOD" />
            <rect x="-8" y="-25" width="16" height="16" rx="4" class="fill-earth dark:fill-earth" :class="OL" :style="w(1.2)" />
            <circle cy="-32" r="7" :class="[SKIN, OL]" :style="w(1)" />
            <g class="fill-ink dark:fill-ink">
              <circle cx="-5" cy="-36" r="3.5" /><circle cy="-39" r="3.5" /><circle cx="5" cy="-36" r="3.5" />
            </g>
            <line x1="5" y1="-22" :x2="FIG.tipDx - 2" y2="-42" stroke-linecap="round" :class="SKIN_STROKE" :style="w(4)" />
          </g>
          <!-- wizard: grey robe, white beard, pointed hat, node on top of the staff -->
          <g v-else-if="p.kind === 'wizard'">
            <line :x1="FIG.tipDx" :x2="FIG.tipDx" y1="0" y2="-40" stroke-linecap="round" :class="WOOD_STROKE" :style="w(3)" />
            <path d="M -11,0 L 11,0 L 6,-38 L -6,-38 Z" :class="[STONE, OL]" :style="w(1.4)" />
            <circle cy="-45" r="6" :class="[SKIN, OL]" :style="w(1)" />
            <path d="M -5,-43 L 5,-43 L 0,-26 Z" class="fill-parchment-hi dark:fill-ink-strong" :class="OL" :style="w(1)" />
            <path d="M -7,-50 L 7,-50 L -9,-80 Z" class="fill-stone dark:fill-stone" :class="OL" :style="w(1.2)" />
            <ellipse cy="-50" rx="13" ry="2.5" class="fill-stone dark:fill-stone" :class="OL" :style="w(1.2)" />
            <circle cx="-2" cy="-60" r="2" :class="LIT" />
            <line x1="4" y1="-35" :x2="FIG.tipDx" y2="-28" stroke-linecap="round" class="stroke-stone dark:stroke-stone" :style="w(5)" />
          </g>
          <!-- the node itself, same for both -->
          <rect :x="FIG.tipDx - 5" :y="FIG.tipDy + 6" width="10" height="11" rx="2" :class="TONE.blue.fill" />
          <line :x1="FIG.tipDx" :x2="FIG.tipDx" :y1="FIG.tipDy + 6" :y2="FIG.tipDy" :class="TONE.blue.stroke" :style="w(3)" />
        </g>
      </g>

      <!-- click 1: the client node inside the inn, by the round window -->
      <g role="img" aria-label="възел в хана">
        <rect :x="CLIENT.x - 5" :y="CLIENT.y - 3" width="10" height="9" rx="1.5" :class="TONE.blue.fill" />
        <line :x1="CLIENT.x" :x2="CLIENT.x" :y1="CLIENT.y - 3" :y2="CLIENT.y - 9" :class="TONE.blue.stroke" :style="w(2)" />
      </g>

      <!-- click 2: antenna on a mast through the tower battlements and a wooden
           solar pole on the farm, stay; click 4: both become Routers -->
      <g class="transition-opacity duration-500" :class="from(2)">
        <line :x1="ROOF.x" :x2="ROOF.x" :y1="ROOF.y" :y2="TOWER.top - LEDGE.h" :class="WOOD_STROKE" :style="w(4)" />
        <rect :x="ROOF.x - 7" :y="ROOF.y - 7" width="14" height="14" rx="2" :class="TONE.blue.fill" />
        <rect :x="POLE.x - 3" :y="POLE_TIP.y + 6" width="6" :height="GROUND - POLE_TIP.y - 6" :class="[WOOD, OL]" :style="w(1)" />
        <line :x1="POLE.x - 9" :x2="POLE.x + 9" :y1="POLE_TIP.y + 16" :y2="POLE_TIP.y + 16" :class="WOOD_STROKE" :style="w(3)" />
        <!-- solar panel low on the pole, clear of the lines into its top -->
        <rect :x="POLE.x - 24" :y="GROUND - 50" width="22" height="12" rx="1" :transform="`rotate(-20 ${POLE.x - 13} ${GROUND - 44})`" class="fill-water dark:fill-water/80" :class="OL" :style="w(1.5)" />
        <rect :x="POLE.x - 7" :y="POLE_TIP.y - 7" width="14" height="14" rx="2" :class="TONE.blue.fill" />
      </g>
      <text class="transition-opacity duration-500" :class="[only(2), INK.text, HALO]" :x="ROOF.x - 45" :y="ROOF.y - 18" :style="LABEL">антена на кулата</text>
      <g class="transition-opacity duration-500" :class="from(4)">
        <rect :x="ROOF.x - 8" :y="ROOF.y - 8" width="16" height="16" rx="2" :class="TONE.amber.fill" />
        <rect :x="POLE.x - 8" :y="POLE_TIP.y - 8" width="16" height="16" rx="2" :class="TONE.amber.fill" />
      </g>

      <!-- click 4: a gateway on the smial
           chimney; soil sensors on stakes in the field; sensors on the barn wall
           and ridge; a raft on the pond; a dog with a GPS collar -->
      <g class="transition-opacity duration-500" :class="from(4)">
        <line :x1="GATEWAY.x" :x2="GATEWAY.x" :y1="GATEWAY.y" :y2="CHIMNEY.top" :class="WOOD_STROKE" :style="w(3)" />
        <rect :x="GATEWAY.x - 7" :y="GATEWAY.y - 7" width="14" height="14" rx="2" :class="TONE.blue.fill" />
        <text :x="GATEWAY.x + 10" :y="GATEWAY.y - 20" text-anchor="middle" :style="LABEL" font-weight="700" :class="[TONE.blue.label, HALO]">gateway</text>
        <g v-for="(t, i) in BARN_SENSORS" :key="`barn-${i}`" role="img" aria-label="сензор на плевнята">
          <line v-if="i === 0" :x1="t.x" :x2="BARN.x" :y1="t.y + 10" :y2="t.y + 10" :class="WOOD_STROKE" :style="w(2)" />
          <rect :x="t.x - 4" :y="t.y + 5" width="8" height="8" rx="1.5" :class="TONE.blue.fill" />
          <line :x1="t.x" :x2="t.x" :y1="t.y" :y2="t.y + 5" :class="TONE.blue.stroke" :style="w(2)" />
        </g>
        <g v-for="t in SENSORS" :key="t.x" role="img" aria-label="сензор в нивата">
          <line :x1="t.x" :x2="t.x" :y1="t.y + 14" :y2="GROUND + 2" :class="WOOD_STROKE" :style="w(2.5)" />
          <rect :x="t.x - 5" :y="t.y + 6" width="10" height="8" rx="1.5" :class="TONE.blue.fill" />
          <line :x1="t.x" :x2="t.x" :y1="t.y" :y2="t.y + 6" :class="TONE.blue.stroke" :style="w(2)" />
        </g>
        <!-- raft: lashed logs, a mast with a small sail, the node on the mast top -->
        <g role="img" aria-label="сал с възел">
          <line :x1="RAFT_TIP.x" :x2="RAFT_TIP.x" :y1="GROUND - 5" :y2="RAFT_TIP.y + 13" :class="WOOD_STROKE" :style="w(2.2)" />
          <path :d="`M ${RAFT_TIP.x + 2},${RAFT_TIP.y + 16} L ${RAFT_TIP.x + 2},${GROUND - 9} L ${RAFT_TIP.x + 15},${GROUND - 9} Z`" class="fill-parchment-hi dark:fill-ink-strong" :class="OL" :style="w(1.2)" />
          <rect :x="RAFT.x - RAFT.w / 2" :y="GROUND - 6" :width="RAFT.w" height="6" rx="2" class="fill-earth dark:fill-earth" :class="OL" :style="w(1.3)" />
          <path :d="`M ${RAFT.x - 7},${GROUND - 6} v 6 M ${RAFT.x},${GROUND - 6} v 6 M ${RAFT.x + 7},${GROUND - 6} v 6`" :class="OL" :style="w(1)" />
          <rect :x="RAFT_TIP.x - 3" :y="RAFT_TIP.y + 6" width="6" height="7" rx="1" :class="TONE.blue.fill" />
          <line :x1="RAFT_TIP.x" :x2="RAFT_TIP.x" :y1="RAFT_TIP.y" :y2="RAFT_TIP.y + 6" :class="TONE.blue.stroke" :style="w(2)" />
        </g>
        <g role="img" aria-label="куче с GPS нашийник" :class="OL">
          <path :d="`M ${DOG.x - 9},${GROUND - 8} L ${DOG.x - 9},${GROUND} M ${DOG.x + 5},${GROUND - 8} L ${DOG.x + 5},${GROUND} M ${DOG.x - 12},${GROUND - 12} L ${DOG.x - 18},${GROUND - 18}`" fill="none" stroke-linecap="round" :style="w(2.5)" />
          <ellipse :cx="DOG.x - 2" :cy="GROUND - 10" rx="11" ry="5" class="fill-stone dark:fill-stone" :style="w(1)" />
          <circle :cx="DOG.x + 13" :cy="GROUND - 17" r="4.5" class="fill-stone dark:fill-stone" :style="w(1)" />
          <rect :x="DOG_TIP.x - 3" :y="DOG_TIP.y + 4" width="6" height="5" rx="1" :class="TONE.blue.fill" style="stroke-width: 0" />
          <line :x1="DOG_TIP.x" :x2="DOG_TIP.x" :y1="DOG_TIP.y" :y2="DOG_TIP.y + 4" :class="TONE.blue.stroke" :style="w(2)" />
        </g>
      </g>

      <!-- click 3: the beacon fire is lit and the router stands on the tower -->
      <g class="transition-opacity duration-500" :class="from(3)">
        <path :d="`M ${BEACON.x},${BEACON.top + 19} Q ${BEACON.x - 4.5},${BEACON.top + 15} ${BEACON.x - 1},${BEACON.top + 9} Q ${BEACON.x},${BEACON.top + 12} ${BEACON.x + 1.5},${BEACON.top + 10} Q ${BEACON.x + 4.5},${BEACON.top + 15} ${BEACON.x},${BEACON.top + 19} Z`" class="fill-gold stroke-trail dark:fill-gold dark:stroke-trail" :style="w(0.9)" />
        <rect :x="HILL_ROUTER.x - 8" :y="HILL_ROUTER.y - 8" width="16" height="16" rx="2" :class="TONE.amber.fill" />
        <text :x="HILL_ROUTER.x + 18" :y="HILL_ROUTER.y + 6" :style="LABEL" font-weight="700" :class="[TONE.amber.label, HALO]">router</text>
      </g>

      <!-- click 3: a dwarf walks up the path, node raised in his hand -->
      <g class="transition-opacity duration-500" :class="from(3)">
        <g :transform="`translate(${HILL_DWARF.x} ${HILL_DWARF.y}) scale(${HILL_DWARF.scale})`" role="img" aria-label="джудже с възел" :class="OL" style="stroke-linejoin: round; stroke-linecap: round">
          <!-- axe on his back: handle and a single blade over the far shoulder -->
          <path d="M -3,-8 L -8,-23" fill="none" :class="WOOD_STROKE" :style="w(1.8)" />
          <path d="M -8,-23 L -12,-25 Q -13.5,-21 -11,-18.5 L -6.8,-19.5 Z" :class="STONE" :style="w(0.8)" />
          <!-- boots and short legs -->
          <rect x="-5" y="-7" width="3.6" height="6" :class="WOOD" style="stroke-width: 0" />
          <rect x="1.6" y="-7" width="3.6" height="6" :class="WOOD" style="stroke-width: 0" />
          <ellipse cx="-3.6" cy="-1.4" rx="3.6" ry="1.6" class="fill-ink dark:fill-ink" style="stroke-width: 0" />
          <ellipse cx="4.6" cy="-1.4" rx="3.6" ry="1.6" class="fill-ink dark:fill-ink" style="stroke-width: 0" />
          <!-- broad red tunic with a belt and a gold buckle -->
          <path d="M -7.5,-6 L 7.5,-6 L 6,-16.5 L -6,-16.5 Z" class="fill-trail dark:fill-trail" :style="w(0.8)" />
          <path d="M -7,-10 H 7" fill="none" :style="w(1.4)" />
          <rect x="-1.4" y="-11.2" width="2.8" height="2.4" :class="LIT" style="stroke-width: 0" />
          <!-- head, big ginger beard, round steel helmet -->
          <circle :cx="HILL_DWARF.head.x" :cy="HILL_DWARF.head.y" :r="HILL_DWARF.head.r" :class="SKIN" :style="w(0.8)" />
          <path d="M -3.8,-19.5 Q -4.4,-11 0,-9.4 Q 4.4,-11 3.8,-19.5 Q 0,-16.4 -3.8,-19.5 Z" :class="BEARD" :style="w(0.7)" />
          <path d="M -4.3,-20 Q -4.2,-25.5 0,-25.5 Q 4.2,-25.5 4.3,-20 Z" class="fill-stone dark:fill-stone" :style="w(0.8)" />
          <!-- raised arm holding the node up -->
          <path :d="`M 4.5,-15 L ${HILL_DWARF.node.x},${HILL_DWARF.node.y + 3}`" fill="none" :class="SKIN_STROKE" :style="w(2.2)" />
          <rect :x="HILL_DWARF.node.x - 3" :y="HILL_DWARF.node.y - 3" width="6" height="6" rx="1" :class="TONE.blue.fill" style="stroke-width: 0" />
          <line :x1="HILL_DWARF.tip.x" :x2="HILL_DWARF.tip.x" :y1="HILL_DWARF.node.y - 3" :y2="HILL_DWARF.tip.y" :class="TONE.blue.stroke" :style="w(1.4)" />
        </g>
      </g>

      <!-- click 4: the red dragon high above the farm, a node hanging from its claws -->
      <g class="transition-opacity duration-500" :class="from(4)" role="img" aria-label="дракон с възел">
        <path :d="CLAWS.map(c => `M ${c.x},${c.y} L ${DRAGON_TIP.x},${DRAGON_TIP.y - 5}`).join(' ')" fill="none" :class="OL" :style="w(1.3)" />
        <MapPerils kind="dragon" :x="DRAGON.x" :y="DRAGON.y" :scale="DRAGON.scale" :flip="true" :static="isPrintMode" />
        <rect :x="DRAGON_TIP.x - 5" :y="DRAGON_TIP.y - 5" width="10" height="10" rx="2" :class="TONE.blue.fill" />
      </g>

      <!-- radio pulses from every node that transmits on this click -->
      <g v-for="(pt, i) in PULSES" :key="i" class="transition-opacity duration-500" :class="from(pt.at)">
        <circle
          v-for="k in 2" :key="k" :cx="pt.x" :cy="pt.y" r="26" class="sight-pulse fill-none" :class="TONE.blue.stroke"
          :style="{ strokeWidth: 2.5, transformOrigin: `${pt.x}px ${pt.y}px`, animationDelay: `${-0.9 * k}s` }"
        />
      </g>

      <!-- clear links on top, dotted and flowing toward the router like a wave; ✗ over the first hit of a blocked one -->
      <g v-for="l in clear" :key="l.id" class="transition-opacity duration-500" :class="from(l.at)">
        <line :x1="l.from.x" :y1="l.from.y" :x2="(l.wall ?? l.to).x" :y2="(l.wall ?? l.to).y" stroke-linecap="round" stroke-dasharray="0.1 14" class="sight-wave" :class="TONE.emerald.stroke" :style="w(7)" />
        <!-- through the wall: the signal goes on, weaker (thinner, fainter dots) -->
        <line v-if="l.wall" :x1="l.wall.x" :y1="l.wall.y" :x2="l.to.x" :y2="l.to.y" stroke-linecap="round" stroke-dasharray="0.1 10" class="sight-wave" :class="TONE.emerald.stroke" style="stroke-width: 4; opacity: 0.55" />
      </g>
      <g v-for="l in blocked" :key="`${l.id}-x`" class="transition-opacity duration-500" :class="only(l.at)">
        <text v-if="l.hit" :x="l.hit.x" :y="l.hit.y - 14" text-anchor="middle" font-weight="700" :class="[TONE.red.label, HALO]" style="font-size: 40px; paint-order: stroke; stroke-width: 5px">✗</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
/* Radio pulses grow from the node and fade; the global .lora-viz
   reduced-motion rule stops them at their resting ring. */
.sight-pulse {
  transform-box: view-box;
  animation: sight-pulse 1.8s linear infinite;
}
@keyframes sight-pulse {
  from { transform: scale(0.25); opacity: 0.9; }
  to { transform: scale(1); opacity: 0; }
}
/* Dots travel along a clear link from the node to the router. */
.sight-wave {
  animation: sight-wave 0.7s linear infinite;
}
@keyframes sight-wave {
  to { stroke-dashoffset: -14.1; }
}
</style>
