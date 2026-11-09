<script setup lang="ts">
// Slide 18 „Обхват според терена“: how far a router on a tower reaches over
// different ground, as a Middle-earth map scene in a framed parchment card.
// A stone beacon tower on a small hill stands about a third in from the left,
// router (amber = relay) and antenna on its battlements. Background strips:
// town to the left of the tower, forest to its right, open land and far
// hilltops further right. Each strip shows only the part of its own dome.
// Clicks (data/rangeZoneScene.ts, tested):
//   1 town dome + double arrow and km label (arrow points left)
//   2 forest dome + its label
//   3 open-land dome over the fields to the hills + its label
//   4 a dashed arrow off the right edge and a parchment tag with the records
// Domes stay once shown; earlier ones dim a little when the next appears.
// The scene is NOT to scale (the labels carry the km, pixels only the order).
// Map tokens only, each class with its dark: twin; every SVG font-size, stroke
// width and opacity lives in style="" (attributify trap).
import { computed, useId } from 'vue'
import type { RangeZone } from './data/rangeZoneScene'
import {
  ANTENNA, FAR_HILLS, FOREST_TREES, HILL, HOUSES, RANGE_RECORDS_TAG, RANGE_ZONES, RANGE_ZONE_CLICKS,
  RZ_GROUND, RZ_H, RZ_W, TOWER, arrowEnd, dome, domeEdgeX, domeOpacity, zoneStrips,
} from './data/rangeZoneScene'
import { TONE } from './data/tones'
import { vis } from './data/format'
import { useStep } from './data/useStep'

const props = defineProps<{ step?: number, startAt?: number }>()
const s = useStep(RANGE_ZONE_CLICKS, () => props.step, () => props.startAt ?? 0)

// clipPath ids are document-global: one prefix per instance (deck + gallery)
const uid = `rz-${useId()}`
const STRIPS = zoneStrips()
const G = RZ_GROUND

// Shared class strings: map tokens with their dark twins (the tokens swap under
// html.dark by themselves; the twins only retune the alpha).
const OL = 'stroke-ink dark:stroke-ink'
const STONE = 'fill-stone/40 dark:fill-stone/70'
const THATCH = 'fill-gold/55 dark:fill-gold/45'
const WOOD = 'fill-earth-deep dark:fill-earth-deep'
const GRASS = 'fill-moss/40 dark:fill-moss/35'
const GRASS_BACK = 'fill-moss/25 dark:fill-moss/20'
const INK_FILL = 'fill-ink-strong dark:fill-ink-strong'
const INK_LINE = 'stroke-ink-strong dark:stroke-ink-strong'
const HALO = 'stroke-parchment-hi dark:stroke-parchment-hi'
const STRIP_FILL: Record<string, string> = {
  town: 'fill-stone/15 dark:fill-stone/25',
  forest: 'fill-moss/12 dark:fill-moss/15',
  open: 'fill-earth/15 dark:fill-earth/25',
}
// label text: big, with a parchment halo painted under the fill
const LABEL = 'font-size: 30px; font-weight: 700; paint-order: stroke; stroke-width: 7px; stroke-linejoin: round'
const SMALL = 'font-size: 24px; font-weight: 700; paint-order: stroke; stroke-width: 6px; stroke-linejoin: round'
const w = (n: number) => `stroke-width: ${n}`

// One entry per zone: its strip, its dome and its double arrow. The arrows are
// map dimension lines in the land band under the ground: from the tower foot
// (x = antenna) to the point where the dome touches the ground, with a dashed
// drop line from that point down to the arrow end.
const HEAD = 13
const zones = computed(() => RANGE_ZONES.map((z: RangeZone, i) => {
  const strip = STRIPS[i]
  const dir = z.side === 'left' ? -1 : 1
  const x1 = TOWER.x + dir * 4
  const x2 = arrowEnd(z)
  const y = z.arrowY
  return {
    z,
    strip,
    d: dome(z),
    line: { x1: x1 + dir * HEAD, x2: x2 - dir * HEAD, y },
    // two filled heads: one at the tower pointing back at it, one at the edge
    heads: [
      `M ${x1},${y} l ${dir * HEAD},${-HEAD / 2} v ${HEAD} Z`,
      `M ${x2},${y} l ${-dir * HEAD},${-HEAD / 2} v ${HEAD} Z`,
    ],
    labelX: (x1 + x2) / 2,
    drop: { x: x2, y1: G, y2: y + HEAD },
  }
}))

// Strip headers: a small map icon left of the word, centred together.
const headers = STRIPS.map((st, i) => {
  const text = RANGE_ZONES[i].header
  // ~0.62 em per bold Cyrillic letter at 24px; icon box 28 + gap 8
  const textW = text.length * 15
  const left = (st.x0 + st.x1) / 2 - (textW + 36) / 2
  return { id: st.id, text, iconX: left + 12, textX: left + 36 }
})

// Hill under the tower: a quadratic bump whose apex is the tower base
// (apex of a quadratic Bézier sits halfway between the ends and the control
// point, so the control point is 2·top − ground).
const HILL_PATH = `M ${HILL.from},${G} Q ${TOWER.x},${2 * HILL.top - G} ${HILL.to},${G} Z`
// Tower masonry: a course line every 17 units; battlements: four merlons.
const COURSES = Array.from({ length: Math.floor((TOWER.base - TOWER.top) / 17) }, (_, i) => TOWER.top + (i + 1) * 17).filter(y => y < TOWER.base - 4)
const TL = TOWER.x - TOWER.w / 2
const MERLONS = [0, 1, 2, 3].map(i => TL - 3 + i * ((TOWER.w + 6 - 7) / 3))
// Router box on the battlements, antenna whip up to the dome centre.
const ROUTER = { x: TOWER.x - 10, y: TOWER.top - 22, w: 20, h: 14 }

// Open land: crop stalks along the ground between the forest and the far hills.
const OPEN = STRIPS[2]
const CROPS = Array.from({ length: Math.floor((850 - OPEN.x0 - 20) / 9) }, (_, i) => ({ x: OPEN.x0 + 20 + i * 9, h: i % 2 ? 9 : 6 }))

// Click 4: dashed arrow at antenna height from just past the open-land dome
// edge off the right edge of the scene; the tag sits right above it.
const REC = RANGE_RECORDS_TAG.box
const REC_Y = ANTENNA.y
const REC_FROM = domeEdgeX(RANGE_ZONES[2], REC_Y) + 8
</script>

<template>
  <div class="lora-viz w-full select-none overflow-hidden rounded-[10px] border-2 border-ink/70 dark:border-ink/70 shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
    <svg class="block w-full" :viewBox="`0 0 ${RZ_W} ${RZ_H}`" role="img" aria-label="Кула с router; обхват над град, гора и открито поле">
      <defs>
        <!-- one clip per strip, above the ground: a dome shows only in its own strip -->
        <clipPath v-for="st in STRIPS" :id="`${uid}-${st.id}`" :key="st.id">
          <rect :x="st.x0" y="0" :width="st.x1 - st.x0" :height="G" />
        </clipPath>
      </defs>

      <!-- sky, strip tints, land -->
      <rect x="0" y="0" :width="RZ_W" :height="RZ_H" class="fill-parchment-hi dark:fill-parchment-hi" />
      <rect v-for="st in STRIPS" :key="`bg-${st.id}`" :x="st.x0" y="0" :width="st.x1 - st.x0" :height="G" :class="STRIP_FILL[st.id]" />
      <rect x="0" :y="G" :width="RZ_W" :height="RZ_H - G" class="fill-parchment-lo/60 dark:fill-parchment-lo" />

      <!-- signal domes: clipped to their strip, newest full, earlier dimmed -->
      <g v-for="{ z, d, strip } in zones" :key="`dome-${z.id}`" class="transition-opacity duration-700" :style="{ opacity: domeOpacity(s, z.at) }">
        <ellipse
          :cx="d.cx" :cy="d.cy" :rx="d.rx" :ry="d.ry" :clip-path="`url(#${uid}-${strip.id})`"
          class="fill-water/30 stroke-water dark:fill-water/30 dark:stroke-water" :style="w(3.5)"
        />
      </g>

      <!-- strip borders: thin dashed ink -->
      <line
        v-for="st in STRIPS.slice(1)" :key="`sep-${st.id}`" :x1="st.x0" :x2="st.x0" y1="0" :y2="G"
        stroke-dasharray="6 6" class="stroke-ink/35 dark:stroke-ink/40" :style="w(1.5)"
      />

      <!-- strip headers: icon + word -->
      <g v-for="h in headers" :key="`h-${h.id}`">
        <g :transform="`translate(${h.iconX} 34)`" :class="OL" :style="w(1.6)">
          <g v-if="h.id === 'town'">
            <rect x="-8" y="-12" width="16" height="12" :class="STONE" />
            <path d="M -11,-12 L 0,-22 L 11,-12 Z" :class="THATCH" />
          </g>
          <g v-else-if="h.id === 'forest'">
            <path d="M 0,0 V -6" fill="none" />
            <circle cx="0" cy="-14" r="8" :class="GRASS" />
          </g>
          <g v-else>
            <path d="M -12,0 L -2,-18 L 8,0 Z M 2,0 L 9,-11 L 16,0 Z" :class="STONE" />
          </g>
        </g>
        <text :x="h.textX" y="34" :style="SMALL" :class="[INK_FILL, HALO]">{{ h.text }}</text>
      </g>

      <!-- open land: far hilltops, low downs, crop stalks -->
      <MapGlyphs kind="mountains" :x="0" :y="G" :pts="FAR_HILLS.map(p => ({ dx: p.x, dy: 0, s: p.s }))" />
      <MapGlyphs kind="hills" :x="0" :y="G" :pts="[{ dx: 742, dy: 0, s: 1.3 }, { dx: 812, dy: 0, s: 1 }]" />
      <path :d="CROPS.map(c => `M ${c.x},${G} v -${c.h}`).join(' ')" class="stroke-moss dark:stroke-moss" :style="w(2)" />

      <!-- forest: a back row of pale map trees and a front row -->
      <g v-for="(t, i) in FOREST_TREES" :key="`tree-${i}`" :transform="`translate(${t.x} ${t.y})`" :class="OL">
        <path d="M 0,0 V -12" fill="none" :style="w(2)" />
        <circle cy="-26" r="15" :class="t.y < G ? GRASS_BACK : GRASS" :style="w(1.8)" />
        <path d="M -6,-30 Q 0,-36 6,-30" fill="none" :style="w(1.2)" />
      </g>

      <!-- town: stone houses with thatch roofs and doors, one small keep -->
      <g v-for="(hs, i) in HOUSES" :key="`house-${i}`" :class="OL">
        <rect :x="hs.x" :y="G - hs.h" :width="hs.w" :height="hs.h" :class="STONE" :style="w(1.8)" />
        <template v-if="hs.keep">
          <rect v-for="k in 3" :key="k" :x="hs.x - 2 + (k - 1) * ((hs.w - 3) / 2)" :y="G - hs.h - 7" width="7" height="7" :class="STONE" :style="w(1.6)" />
          <rect :x="hs.x + hs.w / 2 - 2" :y="G - hs.h + 10" width="4" height="10" rx="2" class="fill-ink/80 dark:fill-gold" />
        </template>
        <path v-else :d="`M ${hs.x - 4},${G - hs.h} L ${hs.x + hs.w / 2},${G - hs.h - 16} L ${hs.x + hs.w + 4},${G - hs.h} Z`" :class="THATCH" :style="w(1.8)" />
        <path :d="`M ${hs.x + hs.w / 2 - 5},${G} V ${G - 10} Q ${hs.x + hs.w / 2},${G - 16} ${hs.x + hs.w / 2 + 5},${G - 10} V ${G} Z`" :class="WOOD" :style="w(1.2)" />
      </g>

      <!-- the hill and the stone beacon tower -->
      <path :d="HILL_PATH" class="fill-parchment-lo/70 dark:fill-parchment-lo" :class="OL" :style="w(2)" />
      <g role="img" aria-label="каменна кула с router">
        <rect :x="TL" :y="TOWER.top" :width="TOWER.w" :height="TOWER.base - TOWER.top" :class="[STONE, OL]" :style="w(2)" />
        <path :d="COURSES.map(y => `M ${TL},${y} H ${TL + TOWER.w}`).join(' ')" class="stroke-ink/30 dark:stroke-ink/35" :style="w(1)" />
        <rect :x="TL - 3" :y="TOWER.top - 4" :width="TOWER.w + 6" height="5" :class="[STONE, OL]" :style="w(1.6)" />
        <rect v-for="mx in MERLONS" :key="mx" :x="mx" :y="TOWER.top - 11" width="7" height="7" :class="[STONE, OL]" :style="w(1.6)" />
        <path :d="`M ${TOWER.x - 5},${TOWER.top + 30} V ${TOWER.top + 22} Q ${TOWER.x},${TOWER.top + 15} ${TOWER.x + 5},${TOWER.top + 22} V ${TOWER.top + 30} Z`" class="fill-ink/80 dark:fill-gold" :class="OL" :style="w(1.2)" />
        <!-- router (amber) and its antenna whip -->
        <line :x1="TOWER.x + 4" :x2="TOWER.x + 4" :y1="ROUTER.y" :y2="ANTENNA.y - 18" :class="OL" :style="w(2.5)" />
        <rect :x="ROUTER.x" :y="ROUTER.y" :width="ROUTER.w" :height="ROUTER.h" rx="2" :class="[TONE.amber.fill, OL]" :style="w(1.6)" />
      </g>

      <!-- double arrows and big labels, one per zone: dimension lines under the ground -->
      <line :x1="TOWER.x" :x2="TOWER.x" :y1="G" :y2="RANGE_ZONES[2].arrowY + HEAD" class="stroke-ink/60 dark:stroke-ink/60" :style="w(2)" />
      <g v-for="a in zones" :key="`arrow-${a.z.id}`" class="transition-opacity duration-500" :class="vis(s, a.z.at)">
        <line :x1="a.drop.x" :x2="a.drop.x" :y1="a.drop.y1" :y2="a.drop.y2" stroke-dasharray="5 5" :class="INK_LINE" :style="w(2)" />
        <circle :cx="a.drop.x" :cy="G" r="5" class="fill-water stroke-ink dark:fill-water dark:stroke-ink" :style="w(1.5)" />
        <line :x1="a.line.x1" :x2="a.line.x2" :y1="a.line.y" :y2="a.line.y" :class="INK_LINE" :style="w(3.5)" />
        <path v-for="hd in a.heads" :key="hd" :d="hd" :class="INK_FILL" />
        <text :x="a.labelX" :y="a.line.y - 14" text-anchor="middle" :style="LABEL" :class="[INK_FILL, HALO]">{{ a.z.label }}</text>
      </g>

      <!-- click 4: dashed arrow off the right edge, parchment tag with the records -->
      <g class="transition-opacity duration-500" :class="vis(s, RANGE_RECORDS_TAG.at)">
        <line :x1="REC_FROM" :x2="RZ_W - 14" :y1="REC_Y" :y2="REC_Y" stroke-dasharray="10 7" :class="TONE.red.stroke" :style="w(3.5)" />
        <path :d="`M ${RZ_W - 2},${REC_Y} l -15,-9 v 18 Z`" :class="TONE.red.fill" />
        <!-- scroll: a sheet with a rolled edge at each end -->
        <rect :x="REC.x" :y="REC.y" :width="REC.w" :height="REC.h" rx="6" class="fill-parchment stroke-ink dark:fill-parchment dark:stroke-ink" :style="w(2)" />
        <rect :x="REC.x - 6" :y="REC.y - 4" width="12" :height="REC.h + 8" rx="6" class="fill-parchment-lo stroke-ink dark:fill-parchment-lo dark:stroke-ink" :style="w(1.6)" />
        <rect :x="REC.x + REC.w - 6" :y="REC.y - 4" width="12" :height="REC.h + 8" rx="6" class="fill-parchment-lo stroke-ink dark:fill-parchment-lo dark:stroke-ink" :style="w(1.6)" />
        <text :x="REC.x + 20" :y="REC.y + 34" :class="TONE.red.label" style="font-size: 24px; font-weight: 700">{{ RANGE_RECORDS_TAG.title }}</text>
        <text
          v-for="(ln, i) in RANGE_RECORDS_TAG.lines" :key="ln" :x="REC.x + 20" :y="REC.y + 70 + i * 36"
          :class="INK_FILL" style="font-size: 22px; font-weight: 700"
        >{{ ln }}</text>
      </g>
    </svg>
  </div>
</template>
