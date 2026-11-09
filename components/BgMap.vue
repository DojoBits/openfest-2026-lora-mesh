<script setup lang="ts">
// Slide 58 „MeshCore България“: schematic outline (hand-traced, see
// data/bgmap.ts) with pins for the cities with repeaters. One click draws the dashed
// amber cross-border radio links to Craiova and Niš.
import type { MapLink, MapPin } from './data/bgmap'
import { BG_LINKS, BG_PINS, BG_VIEW, outlinePath, project } from './data/bgmap'
import { INK, TONE } from './data/tones'
import { maxAt, vis } from './data/format'
import { useStep } from './data/useStep'

const props = withDefaults(defineProps<{
  pins?: MapPin[]
  links?: MapLink[]
  linksAt?: number
  step?: number
  startAt?: number
}>(), { pins: () => BG_PINS, links: () => BG_LINKS, linksAt: 1 })

const s = useStep(maxAt(props.linksAt), () => props.step, () => props.startAt ?? 0)
const outline = outlinePath()
const pin = (city: string) => {
  const p = props.pins.find(x => x.city === city)
  return p ? project(p.lon, p.lat) : { x: 0, y: 0 }
}
</script>

<template>
  <div class="lora-viz relative w-full">
    <svg class="w-full" :viewBox="`0 0 ${BG_VIEW.w} ${BG_VIEW.h}`" role="img" aria-label="Схематична карта на България">
      <path :d="outline" class="fill-parchment dark:fill-earth/20" :class="INK.line" stroke-width="3" stroke-linejoin="round" />
      <g class="transition-opacity duration-500" :class="vis(s, linksAt)">
        <g v-for="l in links" :key="l.to">
          <line :x1="pin(l.from).x" :y1="pin(l.from).y" :x2="project(l.lon, l.lat).x" :y2="project(l.lon, l.lat).y" :class="TONE.amber.stroke" stroke-width="5" stroke-dasharray="14 10" stroke-linecap="round" />
          <circle :cx="project(l.lon, l.lat).x" :cy="project(l.lon, l.lat).y" r="9" :class="TONE.amber.fill" />
          <text
            :x="project(l.lon, l.lat).x + (project(l.lon, l.lat).x < 200 ? -10 : 18)"
            :y="project(l.lon, l.lat).y + (project(l.lon, l.lat).x < 200 ? -22 : 8)"
            text-anchor="start"
            style="font-size: 30px" font-weight="600" paint-order="stroke" stroke-width="6" :class="[TONE.amber.label, INK.halo]"
          >{{ l.to }}</text>
        </g>
      </g>
      <g v-for="p in pins" :key="p.city">
        <circle :cx="project(p.lon, p.lat).x" :cy="project(p.lon, p.lat).y" r="14" :class="TONE.blue.fill" />
        <text :x="project(p.lon, p.lat).x + 22" :y="project(p.lon, p.lat).y + 10" style="font-size: 32px" font-weight="600" paint-order="stroke" stroke-width="6" :class="[INK.text, INK.halo]">{{ p.city }}</text>
      </g>
    </svg>
  </div>
</template>
