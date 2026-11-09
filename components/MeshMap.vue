<script setup lang="ts">
// The shared „Sofia-ish“ map (storyboard §1) used by every routing slide.
// Geometry comes from data/sofia.ts, every frame (who transmits, counts,
// paths) from data/meshScenarios.ts, which derives them from the flood
// simulator. Nothing on this map is typed by hand.
//
// Layers, bottom-up: links → flood state (fades as one group when a later
// step uses the flood as a backdrop) → learned path / ACK → nodes → labels.
// Mini mode lights only the relaying set (amber), per storyboard slide 36.
// Chips, counters, legend and captions are DOM overlays positioned in % of
// the 1000×560 viewBox, so they keep deck typography (≥ text-lg).
import type { CSSProperties } from 'vue'
import { computed } from 'vue'
import type { MeshChip, MeshMode } from './data/meshScenarios'
import { MINI_MAX, MINI_SUMMARY, ROLE_LEGENDS, framesFor, miniRows } from './data/meshScenarios'
import type { MeshLink, MeshNode, NodeId } from './data/sofia'
import { SOFIA, linkBetween, node, textLabel } from './data/sofia'
import type { Project } from './data/tones'
import { INK, PROJECT_COLOUR, PROJECT_META, TONE, VIS } from './data/tones'
import { fmt } from './data/format'
import { useStep } from './data/useStep'
import MapGlyphs from './MapGlyphs.vue'
import BeaconFire from './BeaconFire.vue'
import Hobbit from './Hobbit.vue'
import Elf from './Elf.vue'

const props = withDefaults(defineProps<{
  mode?: MeshMode
  /** Mini mode only: which project's relay set to light up. */
  project?: Project
  step?: number
  startAt?: number
}>(), { mode: 'static', project: 'meshtastic' })

const frames = computed(() => framesFor(props.mode))
const s = useStep(framesFor(props.mode).length - 1, () => props.step, () => props.startAt ?? 0)
const fr = computed(() => frames.value[s.value])
const mini = computed(() => props.mode === 'mini')

const W = 1000
const H = 560
const HALF = 18 // client radius = half the infra square

// ── per-node state lookups ──────────────────────────────────────────────────
const has = (list: NodeId[], id: NodeId): boolean => list.includes(id)
const isGhost = (id: NodeId): boolean => {
  if (mini.value)
    return node(id).reticulumOnly === true && props.project !== 'reticulum'
  return has(fr.value.ghost, id)
}
const miniRelays = computed(() => MINI_SUMMARY[props.project].relays)
const miniLit = (id: NodeId): boolean => mini.value && miniRelays.value.includes(id)

/** Name label shown? (a frame may limit labels to the key nodes) */
const showLabel = (id: NodeId): boolean => fr.value.labels === null || fr.value.labels.includes(id)

// ── DM focus: the path stands out, everything else is dimmed ───────────────
const onPath = (a: NodeId, b: NodeId): boolean => fr.value.path.some((id, i) => {
  const next = fr.value.path[i + 1]
  return next !== undefined && ((id === a && next === b) || (id === b && next === a))
})
const offPath = (id: NodeId): boolean => fr.value.focus && !fr.value.path.includes(id)
const offPathLink = (a: NodeId, b: NodeId): boolean => fr.value.focus && !onPath(a, b)

// The Internet link from the beacon hill to the far city is a quadratic curve
// that passes under the hobbit and above the signal peak's fire, so it never
// reads as part of the hobbit's links or as relayed by the peak. Links,
// routes and arrows all use the same curve.
const TCP_CTRL = { x: 560, y: 440 }
const isTcp = (a: NodeId, b: NodeId): boolean => linkBetween(a, b)?.medium === 'tcp'
/** SVG segment from the current point (node a) to node b. */
const segTo = (a: NodeId, b: NodeId): string =>
  isTcp(a, b) ? `Q${TCP_CTRL.x},${TCP_CTRL.y} ${node(b).x},${node(b).y}` : `L${node(b).x},${node(b).y}`
/** A route through several nodes as one path, curved on the TCP hop. */
const routeD = (ids: NodeId[]): string =>
  ids.length ? `M${node(ids[0]).x},${node(ids[0]).y} ${ids.slice(1).map((id, i) => segTo(ids[i], id)).join(' ')}` : ''
const linkD = (l: MeshLink): string => routeD([l.a, l.b])
/** Point at t on the a to b segment. On the quadratic: (1-t)²A + 2t(1-t)C + t²B. */
function segPoint(a: NodeId, b: NodeId, t: number): { x: number, y: number } {
  const A = node(a)
  const B = node(b)
  if (!isTcp(a, b)) return { x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t }
  const u = 1 - t
  return { x: u * u * A.x + 2 * t * u * TCP_CTRL.x + t * t * B.x, y: u * u * A.y + 2 * t * u * TCP_CTRL.y + t * t * B.y }
}

/** One arrowhead in the middle of each directed hop, rotated along it. At
 * t = 0.5 a quadratic runs parallel to its chord, so a to b gives the angle. */
function arrowsFor(hops: [NodeId, NodeId][]) {
  return hops.map(([a, b]) => {
    const m = segPoint(a, b, 0.5)
    const deg = (Math.atan2(node(b).y - node(a).y, node(b).x - node(a).x) * 180) / Math.PI
    return { key: `${a}-${b}`, transform: `translate(${m.x} ${m.y}) rotate(${deg})` }
  })
}
const pathArrows = computed(() => (fr.value.focus ? arrowsFor(fr.value.path.slice(0, -1).map((id, i) => [id, fr.value.path[i + 1]])) : []))
const edgeArrows = computed(() => (fr.value.arrows ? arrowsFor(fr.value.edges) : []))
/** Arrowheads along the return path (Meshtastic ACK), pointing back to the sender. */
const ackArrowsD = computed(() => (fr.value.ackArrows ? arrowsFor(fr.value.ack.slice(0, -1).map((id, i) => [id, fr.value.ack[i + 1]])) : []))

const edgeOn = (a: NodeId, b: NodeId): boolean =>
  fr.value.edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a))

/** A frame with transmitting edges, a learned path or a return path is
 * "busy": idle links then fade back so the activity stands out. */
const busy = computed(() => fr.value.edges.length > 0 || fr.value.path.length > 0 || fr.value.ack.length > 0)

/** Radio links are never solid (a solid line reads as a cable): near, strong
 * links are short dashes, far, weak ones sparse dots, the Internet dash-dot. */
const linkDash = (l: MeshLink): string =>
  l.medium === 'tcp' ? '18 8 4 8' : l.far ? '2 14' : '10 8'


/** Label anchor per side. Side labels of infra squares sit further out so the
 * transport ring and the heard halo around the square do not cover them. */
function labelPos(n: MeshNode): { x: number, y: number, anchor: 'start' | 'middle' | 'end' } {
  switch (n.labelSide) {
    case 'above': return { x: n.x, y: n.y - 32, anchor: 'middle' }
    case 'below': return { x: n.x, y: n.y + 52, anchor: 'middle' }
    case 'left': return { x: n.x - (n.kind === 'infra' ? 44 : 32), y: n.y + 10, anchor: 'end' }
    case 'right': return { x: n.x + (n.kind === 'infra' ? 44 : 32), y: n.y + 10, anchor: 'start' }
  }
}

/** Sequence badge corner: away from a label drawn above the node. */
const seqDy = (n: MeshNode): number => (n.labelSide === 'above' ? 24 : -24)

// ── DOM overlay placement (percent of the viewBox) ─────────────────────────
const px = (x: number): string => `${(x / W) * 100}%`
const py = (y: number): string => `${(y / H) * 100}%`

/**
 * A chip sits on the side of the node away from its label, and is anchored
 * left/right near the map edges so it never leaves the canvas.
 */
function chipStyle(c: MeshChip): CSSProperties {
  const n = node(c.node)
  const side = c.side ?? (n.labelSide === 'above' ? 'below' : 'above')
  const y = n.y + (c.dy ?? 0)
  if (side === 'right')
    return { left: px(n.x + 30 + (c.dx ?? 0)), top: py(y), transform: 'translateY(-50%)' }
  if (side === 'left')
    return { left: px(n.x - 30 - (c.dx ?? 0)), top: py(y), transform: 'translate(-100%, -50%)' }
  const below = side === 'below'
  // Keep chips near the map edge inside the frame.
  const tx = n.x < 220 ? '-15%' : n.x > 780 ? '-85%' : '-50%'
  return {
    left: px(n.x),
    top: py(below ? y + 30 : y - 30),
    transform: `translate(${tx}, ${below ? '0' : '-100%'})`,
  }
}

// „Интернет (TCP)“ sits under the curve, ¾ of the way to the far city.
const tcpLabel = (() => {
  const m = segPoint('rLul', 'plo', 0.75)
  return { x: m.x, y: m.y + 40 }
})()

// The far city (node, link, „Интернет (TCP)“) matters only where a frame uses the
// TCP link, the Reticulum transport scenario. Elsewhere it is just clutter.
// Mini mode has its own reticulumOnly ghosting, so it keeps the far city.
const showPlo = computed(() => mini.value || frames.value.some(fr => fr.tcp))
/** True for the far city (and its link) when it must be fully hidden, not ghosted. */
const hidePlo = (...ids: NodeId[]): boolean => !showPlo.value && ids.includes('plo')
/** Opacity class of a node, shared by its figure so the two ghost together. */
const nodeVis = (id: NodeId): string =>
  hidePlo(id) ? VIS.hidden : offPath(id) ? VIS.ghost : isGhost(id) ? VIS.ghost : mini.value && !miniLit(id) ? VIS.ghost : VIS.shown

// Chips pinned to the bottom-left corner stack above the ring legend.
const nodeChips = computed(() => fr.value.chips.filter(c => !c.corner))
const cornerChips = computed(() => fr.value.chips.filter(c => c.corner === 'bottom-left'))

const counterLabel = computed(() => (props.mode === 'meshcore' ? 'Meshtastic' : props.mode === 'meshtastic' ? 'групово' : 'flood'))
const ringLegend = computed(() => {
  const r = fr.value.rings[0]
  return r ? { colour: r.colour, label: r.label ?? '' } : null
})

// ── managed-flooding clues (slide 28) ──────────────────────────────────────
/** Signal bar heights, bottom-aligned: one lit = weak (far), four = strong. */
const BARS = [8, 14, 20, 26]
const litBars = (weak: boolean): number => (weak ? 1 : BARS.length)
/**
 * Pie wedge from 12 o'clock, clockwise, covering `frac` of a circle of radius
 * r centred on the origin: how much of the longest wait this node waits.
 * A full share is drawn as two half arcs (one arc cannot close on itself).
 */
function wedge(frac: number, r: number): string {
  if (frac >= 0.999)
    return `M0,${-r} A${r},${r} 0 1 1 0,${r} A${r},${r} 0 1 1 0,${-r} Z`
  const a = frac * 2 * Math.PI
  const large = frac > 0.5 ? 1 : 0
  return `M0,0 L0,${-r} A${r},${r} 0 ${large} 1 ${(r * Math.sin(a)).toFixed(1)},${(-r * Math.cos(a)).toFixed(1)} Z`
}
const anyTimer = computed(() => fr.value.waits.some(w => w.timer !== null))
const anyCancel = computed(() => fr.value.waits.some(w => w.cancelled))
// Legend samples: the tower's share for the short timer, a full one for long.
const shortShare = computed(() => Math.min(...fr.value.waits.map(w => w.timer ?? 1)))

// Mini: the project's own colour marks who may relay, so the three maps on
// the comparison slide differ at a glance (all nodes / 3 repeaters / 3
// transport nodes plus the TCP link).
const miniTone = computed(() => PROJECT_COLOUR[PROJECT_META[props.project].colour])
const miniBars = computed(() => miniRows(props.project).map(r => ({
  ...r,
  // bar width in % of the widest number on the slide
  width: (r.value / MINI_MAX) * 100,
  text: fmt(r.value),
})))
</script>

<template>
  <div class="lora-viz w-full">
    <!-- parchment ground like the slide-5 journey map. The padding keeps the
         caption, counter and chips (overlays at the SVG edges) off its border -->
    <div data-parchment class="rounded-2xl border border-edge/50 bg-parchment dark:border-edge/50 dark:bg-parchment" :class="mini ? 'p-1' : 'px-4 py-3'">
    <!-- the overlay's % coordinates must be relative to the SVG alone, so the
         caption row below sits outside this wrapper -->
    <div class="relative">
    <svg class="w-full" :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="Карта на примерна mesh мрежа в Средната земя">
      <!-- map glyphs behind their nodes, so links and labels stay on top.
           Forest by the elf, stone tower under the tower square, a hill under
           the hill square, two summits under the peak. Each repeater carries a
           lit beacon fire (BeaconFire.vue). -->
      <g v-for="n in SOFIA.nodes.filter(x => x.glyph === 'forest')" :key="`fo-${n.id}`" data-glyph="forest" class="transition-opacity duration-500" :class="isGhost(n.id) ? VIS.ghost : mini ? VIS.faded : VIS.shown">
        <MapGlyphs kind="forest" :x="n.x" :y="n.y" :pts="[{ dx: -62, dy: 4, s: 1.8 }, { dx: -84, dy: 34, s: 1.7 }, { dx: -50, dy: 44, s: 1.6 }]" />
      </g>
      <!-- the three relays (and the two figures) are pictures, no text label (textLabel in sofia.ts).
           Ink outline in earth-deep so they read on parchment from the back row. -->
      <g v-for="n in SOFIA.nodes.filter(x => x.glyph === 'tower')" :key="`tw-${n.id}`" data-glyph="tower" class="transition-opacity duration-500" :class="isGhost(n.id) ? VIS.ghost : VIS.shown">
        <title>{{ n.label }}</title>
        <!-- tapering stone tower, three merlons, a door, two courses of stone.
             The node square sits in its head. -->
        <path :d="`M${n.x - 34},${n.y + 84} L${n.x - 26},${n.y - 14} L${n.x - 32},${n.y - 14} L${n.x - 32},${n.y - 34} L${n.x - 19},${n.y - 34} L${n.x - 19},${n.y - 24} L${n.x - 7},${n.y - 24} L${n.x - 7},${n.y - 34} L${n.x + 7},${n.y - 34} L${n.x + 7},${n.y - 24} L${n.x + 19},${n.y - 24} L${n.x + 19},${n.y - 34} L${n.x + 32},${n.y - 34} L${n.x + 32},${n.y - 14} L${n.x + 26},${n.y - 14} L${n.x + 34},${n.y + 84} Z`" class="fill-parchment-lo stroke-earth-deep dark:fill-parchment-lo dark:stroke-earth-deep" style="stroke-width: 3; stroke-linejoin: round" />
        <path :d="`M${n.x - 28},${n.y + 32} H${n.x + 28} M${n.x - 30},${n.y + 58} H${n.x + 30}`" fill="none" class="stroke-earth-deep/60 dark:stroke-earth-deep/60" style="stroke-width: 2" />
        <path :d="`M${n.x - 9},${n.y + 84} V${n.y + 70} A9,9 0 0 1 ${n.x + 9},${n.y + 70} V${n.y + 84} Z`" class="fill-earth-deep dark:fill-earth-deep" />
        <BeaconFire :x="n.x" :y="n.y - 38" />
      </g>
      <g v-for="n in SOFIA.nodes.filter(x => x.glyph === 'beacon')" :key="`bc-${n.id}`" data-glyph="beacon" class="transition-opacity duration-500" :class="isGhost(n.id) ? VIS.ghost : VIS.shown">
        <title>{{ n.label }}</title>
        <!-- grassy hill under the node, a pole up to the fire -->
        <path :d="`M${n.x - 120},${n.y + 50} Q${n.x},${n.y - 50} ${n.x + 120},${n.y + 50}`" class="fill-moss/25 stroke-earth-deep dark:fill-moss/25 dark:stroke-earth-deep" style="stroke-width: 3" />
        <path :d="`M${n.x},${n.y - 18} V${n.y - 36}`" class="stroke-earth-deep dark:stroke-earth-deep" style="stroke-width: 4; stroke-linecap: round" />
        <BeaconFire :x="n.x" :y="n.y - 36" />
      </g>

      <!-- signal peak: two inked summits behind the node, hatched shadow sides
           and the fire on the lower one, clear of the hobbit above -->
      <g v-for="n in SOFIA.nodes.filter(x => x.mountain)" :key="`mt-${n.id}`" data-glyph="peak" class="transition-opacity duration-500" :class="isGhost(n.id) ? VIS.ghost : VIS.shown">
        <title>{{ n.label }}</title>
        <path :d="`M${n.x - 120},${n.y + 50} L${n.x - 36},${n.y - 50} L${n.x - 6},${n.y - 18} L${n.x + 30},${n.y - 72} L${n.x + 130},${n.y + 50} Z`" class="fill-earth/30 stroke-earth-deep dark:fill-earth/30 dark:stroke-earth-deep" style="stroke-width: 3; stroke-linejoin: round" />
        <path :d="`M${n.x + 44},${n.y - 50} l-10,8 M${n.x + 58},${n.y - 30} l-14,10 M${n.x + 74},${n.y - 8} l-16,12 M${n.x - 24},${n.y - 34} l-9,8 M${n.x - 12},${n.y - 20} l-10,9`" fill="none" class="stroke-earth-deep/70 dark:stroke-earth-deep/70" style="stroke-width: 2; stroke-linecap: round" />
        <BeaconFire :x="n.x - 36" :y="n.y - 48" />
      </g>

      <!-- sender and receiver as the intro figures, beside their circles and
           ghosted with them. The hobbit stands left of its node facing it, the
           elf right of its node, mirrored to face it. -->
      <template v-if="!mini">
        <g data-figure="hobbit" class="transition-opacity duration-500" :class="nodeVis('me')">
          <Hobbit :x="node('me').x - 50" :y="node('me').y + 30" :scale="0.65" phone="pocket" />
        </g>
        <g data-figure="elf" class="transition-opacity duration-500" :class="nodeVis('pes')">
          <Elf :x="node('pes').x + 50" :y="node('pes').y + 22" :scale="0.65" phone="pocket" flip />
        </g>
      </template>

      <!-- links: near short dashes, far (weak) sparse dots, Internet dash-dot. Idle links fade (or hide) while a frame is busy -->
      <path
        v-for="l in SOFIA.links" :key="`${l.a}-${l.b}`"
        :d="linkD(l)" fill="none"
        class="transition-opacity duration-500"
        :class="[
          edgeOn(l.a, l.b) ? TONE.amber.stroke : l.medium === 'tcp' && (fr.tcp || (mini && project === 'reticulum')) ? PROJECT_COLOUR.fuchsia.stroke : mini && miniLit(l.a) && miniLit(l.b) ? miniTone.stroke : INK.line,
          hidePlo(l.a, l.b) || (fr.hideIdle && busy && !edgeOn(l.a, l.b)) ? VIS.hidden : offPathLink(l.a, l.b) ? VIS.ghost : busy && !edgeOn(l.a, l.b) ? VIS.faded : isGhost(l.a) || isGhost(l.b) ? VIS.ghost : mini && l.medium === 'tcp' && project === 'reticulum' ? VIS.shown : mini && !(miniLit(l.a) && miniLit(l.b)) ? VIS.ghost : VIS.shown,
        ]"
        :stroke-width="edgeOn(l.a, l.b) ? 6 : 3"
        :stroke-dasharray="linkDash(l)" stroke-linecap="round"
      />
      <text
        v-if="!mini && showPlo"
        :x="tcpLabel.x" :y="tcpLabel.y"
        text-anchor="middle" style="font-size: 24px" class="transition-opacity duration-500"
        :class="[fr.tcp ? PROJECT_COLOUR.fuchsia.label : INK.muted, isGhost('plo') ? VIS.ghost : VIS.shown]"
      >Интернет (TCP)</text>

      <!-- learned path and the dashed return (ACK / announce) -->
      <path v-for="a in edgeArrows" :key="`e-${a.key}`" d="M-12,-11 L14,0 L-12,11 Z" :transform="a.transform" :class="TONE.amber.fill" />
      <path v-if="fr.ack.length" :d="routeD(fr.ack)" fill="none" :class="TONE.emerald.stroke" stroke-width="6" stroke-dasharray="4 12" stroke-linecap="round" />
      <path v-for="a in ackArrowsD" :key="`ack-${a.key}`" d="M-14,-13 L16,0 L-14,13 Z" :transform="a.transform" :class="TONE.emerald.fill" />
      <path v-if="fr.path.length" :d="routeD(fr.path)" fill="none" :class="TONE[fr.pathTone].stroke" stroke-width="8" stroke-dasharray="16 10" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.9" />
      <path v-for="a in pathArrows" :key="a.key" d="M-14,-13 L16,0 L-14,13 Z" :transform="a.transform" :class="TONE[fr.pathTone].fill" />

      <!-- nodes -->
      <g v-for="n in SOFIA.nodes" :key="n.id" class="transition-opacity duration-500" :class="nodeVis(n.id)">
        <!-- project-role ring (Repeater / transport) -->
        <circle v-for="r in fr.rings.filter(x => x.node === n.id)" :key="`ring-${r.colour}`" :cx="n.x" :cy="n.y" r="32" fill="none" :class="PROJECT_COLOUR[r.colour].stroke" stroke-width="5" />

        <!-- mini: thick ring in the project colour on every node that may relay -->
        <circle v-if="miniLit(n.id)" data-mini-ring :cx="n.x" :cy="n.y" r="36" fill="none" :class="miniTone.stroke" stroke-width="10" />

        <!-- sender (ink) and receiver (emerald) rings -->
        <circle v-if="fr.from === n.id" :cx="n.x" :cy="n.y" r="30" fill="none" class="stroke-ink-strong dark:stroke-ink-strong" stroke-width="6" />
        <circle v-if="fr.to === n.id" :cx="n.x" :cy="n.y" r="30" fill="none" :class="TONE.emerald.stroke" stroke-width="6" />

        <!-- base shape: clients are circles, infrastructure is square -->
        <circle
          v-if="n.kind === 'client'" :cx="n.x" :cy="n.y" :r="HALF"
          :class="miniLit(n.id) ? miniTone.fill : TONE.blue.fill"
        />
        <rect
          v-else :x="n.x - HALF" :y="n.y - HALF" :width="HALF * 2" :height="HALF * 2" rx="6"
          :class="miniLit(n.id) ? miniTone.fill : TONE.slate.fill"
        />

        <!-- flood state, one group so a backdrop step can fade it as a whole -->
        <g v-if="!mini" class="transition-opacity duration-500" :class="fr.floodFaded ? VIS.faded : VIS.shown">
          <template v-if="has(fr.active, n.id) || has(fr.done, n.id)">
            <circle v-if="n.kind === 'client'" :cx="n.x" :cy="n.y" :r="HALF" :class="TONE.amber.fill" />
            <rect v-else :x="n.x - HALF" :y="n.y - HALF" :width="HALF * 2" :height="HALF * 2" rx="6" :class="TONE.amber.fill" />
          </template>
          <!-- transmitting now: two static rings, no looping motion -->
          <g v-if="has(fr.active, n.id)" fill="none" :class="TONE.amber.stroke" stroke-width="4">
            <circle :cx="n.x" :cy="n.y" r="34" stroke-opacity="0.7" />
            <circle :cx="n.x" :cy="n.y" r="50" stroke-opacity="0.35" />
          </g>
          <circle v-if="has(fr.wasted, n.id)" :cx="n.x" :cy="n.y" r="28" fill="none" :class="TONE.red.stroke" stroke-width="5" />
          <circle
            v-else-if="has(fr.heard, n.id) && !has(fr.active, n.id) && !has(fr.done, n.id) && !has(fr.delivered, n.id)"
            :cx="n.x" :cy="n.y" r="26" fill="none" :class="TONE.amber.stroke" stroke-width="3"
          />
          <g v-if="fr.seq[n.id] !== undefined">
            <circle :cx="n.x + 24" :cy="n.y + seqDy(n)" r="15" class="fill-ink-strong dark:fill-ink-strong" />
            <text :x="n.x + 24" :y="n.y + seqDy(n) + 7" text-anchor="middle" style="font-size: 19px" font-weight="700" class="fill-page dark:fill-page">{{ fr.seq[n.id] }}</text>
          </g>
        </g>

        <!-- managed-flooding clue right of the node: signal bars (SNR), then a
             timer filled by the share of the longest wait, then a red cross
             over the faded timer when the node hears another relay first -->
        <g v-for="w in fr.waits.filter(x => x.node === n.id)" :key="`w-${w.node}`" :transform="`translate(${n.x + w.dx} ${n.y + w.dy})`">
          <g data-snr>
            <rect v-for="(h, i) in BARS" :key="i" :x="i * 10" :y="16 - h" width="7" :height="h" rx="1.5" class="fill-ink-strong dark:fill-ink-strong" :style="{ opacity: i < litBars(w.weak) ? 1 : 0.22 }" />
          </g>
          <g v-if="w.timer !== null" data-timer transform="translate(62 2)" class="transition-opacity duration-500" :style="{ opacity: w.cancelled ? 0.4 : 1 }">
            <path d="M0,-18 V-23 M-4,-24 H4" class="stroke-ink-strong dark:stroke-ink-strong" style="stroke-width: 3; stroke-linecap: round" />
            <circle r="17" class="fill-parchment stroke-ink-strong dark:fill-parchment dark:stroke-ink-strong" style="stroke-width: 3" />
            <path :d="wedge(w.timer, 13)" :class="TONE.amber.fill" />
          </g>
          <path v-if="w.cancelled" data-cancel d="M48,-12 L76,16 M76,-12 L48,16" :class="TONE.red.stroke" style="stroke-width: 6; stroke-linecap: round" />
        </g>

        <!-- delivered: emerald with a tick, drawn above the flood layer -->
        <g v-if="!mini && has(fr.delivered, n.id)">
          <circle :cx="n.x" :cy="n.y" :r="HALF + 2" :class="TONE.emerald.fill" />
          <text :x="n.x" :y="n.y + 8" text-anchor="middle" style="font-size: 22px" font-weight="700" class="fill-page dark:fill-page">✓</text>
        </g>

        <!-- labels with a body-coloured halo so links never cut through text -->
        <template v-if="!mini">
          <text
            v-if="textLabel(n) && showLabel(n.id)"
            :x="labelPos(n).x" :y="labelPos(n).y" :text-anchor="labelPos(n).anchor"
            style="font-size: 28px"
            :font-weight="fr.from === n.id || fr.to === n.id ? 800 : 600" paint-order="stroke" stroke-width="7" stroke-linejoin="round"
            :class="[fr.to === n.id ? TONE.emerald.label : INK.text, 'stroke-parchment dark:stroke-parchment']"
          >{{ n.label }}</text>
        </template>
      </g>
    </svg>

    <!-- ── DOM overlays ──────────────────────────────────────────────────── -->
    <div v-if="!mini" class="pointer-events-none absolute inset-0 text-lg">
      <!-- chips anchored to nodes -->
      <div v-for="c in nodeChips" :key="`${c.node}-${c.text}`" class="absolute" :style="chipStyle(c)">
        <span class="inline-block whitespace-nowrap rounded-full border px-3 py-0.5 font-medium shadow-sm" :class="[TONE[c.tone].soft, TONE[c.tone].text, TONE[c.tone].border]">{{ c.text }}</span>
      </div>

      <!-- transmission counter (+ faint comparison) -->
      <div v-if="fr.count !== null" class="absolute right-0 top-0 text-right">
        <div class="text-2xl font-bold" :class="TONE.amber.text">Предавания: {{ fmt(fr.count) }}</div>
        <div v-if="fr.countGhost !== null" class="text-lg opacity-70">{{ counterLabel }}: {{ fmt(fr.countGhost) }}</div>
      </div>
      <div v-else-if="fr.countGhost !== null" class="absolute right-0 top-0 text-right text-lg opacity-70">
        {{ counterLabel }}: {{ fmt(fr.countGhost) }}
      </div>

      <!-- project badges: the same map for all three -->
      <div class="absolute left-0 top-0 flex items-center gap-2 transition-opacity duration-500" :class="fr.badges ? VIS.shown : VIS.hidden">
        <span v-for="p in (['meshtastic', 'meshcore', 'reticulum'] as Project[])" :key="p" class="rounded-full border-2 px-3 py-0.5 font-semibold" :class="[PROJECT_COLOUR[PROJECT_META[p].colour].text, PROJECT_COLOUR[PROJECT_META[p].colour].border]">{{ PROJECT_META[p].name }}</span>
        <span class="font-semibold">същата карта ×3</span>
      </div>

      <!-- bottom-left corner stack: corner chips, then legends. Kept to the
           west third of the map, clear of the signal peak label and mountain. -->
      <div class="absolute bottom-0 left-0 flex max-w-[30%] flex-col items-start gap-2">
        <span v-for="c in cornerChips" :key="`${c.node}-${c.text}`" class="inline-block rounded-2xl border px-3 py-0.5 font-medium leading-snug shadow-sm" :class="[TONE[c.tone].soft, TONE[c.tone].text, TONE[c.tone].border]">{{ c.text }}</span>

        <!-- ring legend (Repeater / transport) -->
        <div v-if="ringLegend && !fr.transportLegend && !fr.roleLegend" class="flex items-center gap-2 rounded-lg border border-edge/50 bg-page/85 px-3 py-1 dark:border-edge/50 dark:bg-page/85">
          <span class="inline-block h-5 w-5 rounded-full border-4" :class="PROJECT_COLOUR[ringLegend.colour].border" />
          <span :class="PROJECT_COLOUR[ringLegend.colour].text" class="font-semibold">{{ ringLegend.label }}</span>
        </div>
      </div>

      <!-- wait legend, bottom-left (empty under the beacon hill): what the
           bars, the timer and the cross mean. Rows grow with the clicks. -->
      <div v-if="fr.waits.length" data-wait-legend class="absolute bottom-0 left-0 flex flex-col gap-0.5 whitespace-nowrap rounded-lg border border-edge/50 bg-page/85 px-3 py-1.5 text-lg dark:border-edge/50 dark:bg-page/85">
        <div v-for="weak in [true, false]" :key="String(weak)" class="flex items-center gap-2">
          <svg width="22" height="20" viewBox="0 -12 37 30" class="shrink-0" aria-hidden="true">
            <rect v-for="(h, i) in BARS" :key="i" :x="i * 10" :y="16 - h" width="7" :height="h" rx="1.5" class="fill-ink-strong dark:fill-ink-strong" :style="{ opacity: i < litBars(weak) ? 1 : 0.22 }" />
          </svg>
          <svg v-if="anyTimer" width="20" height="20" viewBox="-20 -20 40 40" class="shrink-0" aria-hidden="true">
            <circle r="17" class="fill-parchment stroke-ink-strong dark:fill-parchment dark:stroke-ink-strong" style="stroke-width: 3" />
            <path :d="wedge(weak ? shortShare : 1, 13)" :class="TONE.amber.fill" />
          </svg>
          <!-- short words keep the box west of the signal peak -->
          <span v-if="weak">{{ anyTimer ? 'слаб: чака малко' : 'слаб сигнал' }}</span>
          <span v-else>{{ anyTimer ? 'силен: чака дълго' : 'силен сигнал' }}</span>
        </div>
        <div v-if="anyCancel" class="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" class="shrink-0" aria-hidden="true"><path d="M3,3 L17,17 M17,3 L3,17" :class="TONE.red.stroke" style="stroke-width: 4; stroke-linecap: round" /></svg>
          отказва се
        </div>
      </div>

      <!-- static-map legend: outside the map, to its right, so it never covers
           a node label (it used to hide the beacon hill label in the corner stack). -->
      <div v-if="mode === 'static'" class="absolute bottom-0 left-full ml-4 flex flex-col gap-0.5 whitespace-nowrap rounded-lg border border-edge/50 bg-page/85 px-3 py-1.5 transition-opacity duration-500 dark:border-edge/50 dark:bg-page/85" :class="fr.legend ? VIS.shown : VIS.hidden">
        <div class="flex items-center gap-2"><span class="inline-block h-4 w-4 shrink-0 rounded-full bg-water dark:bg-water" /> телефон + радио</div>
        <div class="flex items-center gap-2"><span class="inline-block h-4 w-4 shrink-0 rounded bg-stone dark:bg-stone" /> покрив / връх</div>
        <div class="flex items-center gap-2"><svg width="28" height="8" class="shrink-0" aria-hidden="true"><line x1="0" y1="4" x2="28" y2="4" :class="INK.line" stroke-width="3" stroke-dasharray="10 8" stroke-linecap="round" /></svg> близо, силен</div>
        <div class="flex items-center gap-2"><svg width="28" height="8" class="shrink-0" aria-hidden="true"><line x1="0" y1="4" x2="28" y2="4" :class="INK.line" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round" /></svg> далеч, слаб</div>
      </div>

      <!-- flood legend: amber = transmitted (relayed) the packet, blue = client
           that heard it and stayed quiet. Bottom-right corner is empty. -->
      <div v-if="fr.floodLegend" class="absolute bottom-0 right-0 flex flex-col gap-0.5 whitespace-nowrap rounded-lg border border-edge/50 bg-page/85 px-3 py-1.5 text-lg dark:border-edge/50 dark:bg-page/85">
        <div class="flex items-center gap-2"><svg width="18" height="18" class="shrink-0" aria-hidden="true"><circle cx="9" cy="9" r="8" :class="TONE.amber.fill" /></svg> препраща</div>
        <div class="flex items-center gap-2"><svg width="18" height="18" class="shrink-0" aria-hidden="true"><circle cx="9" cy="9" r="8" :class="TONE.blue.fill" /></svg> мълчи</div>
      </div>

      <!-- speech bubble from the hobbit -->
      <div class="absolute transition-opacity duration-500" :class="fr.bubble ? VIS.shown : VIS.hidden" :style="{ left: px(node('me').x + 20), top: py(node('me').y - 62), transform: 'translateY(-100%)' }">
        <div class="relative rounded-xl rounded-bl-none border px-4 py-1 text-xl font-semibold" :class="[TONE.blue.soft, TONE.blue.border, TONE.blue.text]">„Здравей, елфе“</div>
      </div>

      <!-- Room Server mailbox -->
      <div v-if="fr.mailbox" class="absolute flex items-center gap-1 rounded-lg border px-2 py-0.5" :class="[PROJECT_COLOUR.indigo.soft, PROJECT_COLOUR.indigo.border, PROJECT_COLOUR.indigo.text]" :style="{ left: px(node(fr.mailbox).x - 40), top: py(node(fr.mailbox).y + 60), transform: 'translateX(-100%)' }">
        <carbon-chat /> Room Server
      </div>

      <!-- traceroute export: CSV → pin -->
      <div class="absolute right-0 flex items-center gap-2 rounded-lg border border-edge/50 bg-page/85 px-3 py-1 text-xl transition-opacity duration-500 dark:border-edge/50 dark:bg-page/85" :class="fr.csv ? VIS.shown : VIS.hidden" style="top: 0">
        <carbon-document /> CSV <carbon-arrow-right /> <carbon-location :class="TONE.emerald.text" /> карта
      </div>

      <!-- caption -->
      <div v-if="fr.caption" class="absolute left-0 top-0 whitespace-nowrap text-2xl font-semibold" :class="TONE[fr.captionTone].text">
        {{ fr.caption }}
      </div>

    </div>
    </div>
    </div>
    <!-- role legend under the map (slides 28, 38, 45): the shape as drawn on
         the map, the role name, then what it does in plain words. A project
         ring around the square (Repeater, transport node) colours the name.
         Reticulum adds the amber outline: heard the announce. One line, centred,
         allowed wider than the map (flex centring overflows both sides). -->
    <div v-if="fr.roleLegend" class="mt-2 flex justify-center gap-8 whitespace-nowrap text-lg">
      <span v-for="r in ROLE_LEGENDS[fr.roleLegend]" :key="r.role" class="flex items-center gap-2">
        <svg width="28" height="28" class="shrink-0" aria-hidden="true">
          <circle v-if="r.shape === 'client'" cx="14" cy="14" r="9" :class="TONE.blue.fill" />
          <template v-else>
            <rect x="7" y="7" width="14" height="14" rx="3" :class="TONE.slate.fill" />
            <circle v-if="r.ring" cx="14" cy="14" r="12" fill="none" :class="PROJECT_COLOUR[r.ring].stroke" stroke-width="3" />
          </template>
        </svg>
        <span class="font-semibold" :class="r.ring ? PROJECT_COLOUR[r.ring].text : r.shape === 'client' ? TONE.blue.text : INK.text">{{ r.role }}:</span>
        {{ r.desc }}
      </span>
      <span v-if="fr.transportLegend" class="flex items-center gap-2">
        <svg width="24" height="24" class="shrink-0" aria-hidden="true"><circle cx="12" cy="12" r="6" :class="TONE.blue.fill" /><circle cx="12" cy="12" r="10" fill="none" :class="TONE.amber.stroke" stroke-width="2" /></svg>
        чу обявата
      </span>
    </div>
    <!-- mini: three labelled bars under the ⅓-scale map, same scale on all
         three cards, so the equal learned path and the different discovery
         cost reads at a glance -->
    <div v-if="mini" class="mt-2 flex flex-col gap-1 text-lg">
      <div v-for="b in miniBars" :key="b.label" class="flex items-center gap-2">
        <span class="w-[6.5rem] shrink-0 whitespace-nowrap">{{ b.label }}</span>
        <span class="relative h-4 flex-1 rounded-sm bg-edge/20 dark:bg-edge/30">
          <span class="absolute inset-y-0 left-0 rounded-sm" :class="miniTone.bg" :style="{ width: `${b.width}%` }" />
        </span>
        <span class="w-[2.75rem] shrink-0 whitespace-nowrap text-right font-semibold">{{ b.text }}</span>
      </div>
    </div>
  </div>
</template>
