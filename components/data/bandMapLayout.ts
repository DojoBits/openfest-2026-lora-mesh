// Layout of the slide „Различни ленти по света“ world map (BandWorldMap.vue):
// where each region band's callout card sits and which land it points at.
// No frequencies here: those stay in regionBands.ts. Card boxes are in map
// pixels (MAP_W × MAP_H from worldLand.ts) and are hand-placed over open sea
// or over land that is not highlighted; tests/bandWorldMap.test.ts keeps them
// inside the map, off each other and off their own anchor.
// (Named bandMapLayout, not after the component: name-clash trap in CLAUDE.md.)
import type { MapRegion } from './worldLand'
import { MAP_H, MAP_K, MAP_LAT_N, MAP_LON0, MAP_W } from './worldLand'

/** Equirectangular is linear, so lon/lat → px is one multiply per axis. */
export function lonLatToXY(lon: number, lat: number): { x: number, y: number } {
  return { x: MAP_W / 2 + (lon - MAP_LON0) * MAP_K, y: (MAP_LAT_N - lat) * MAP_K }
}

/** Card height: code row + big range row + mini spectrum strip. */
export const CARD_H = 72

export interface BandCallout {
  /** Land lit for this band (REGION_PATHS key). */
  region: MapRegion
  /** Where the leader line ends: [lon, lat]. */
  anchor: readonly [number, number]
  /** Card top-left and width, map px. Width fits the range label. */
  card: { x: number, y: number, w: number }
}

export const BAND_CALLOUTS: Readonly<Record<string, BandCallout>> = {
  // Europe: our card sits over North Africa, right under Bulgaria; the 433 MHz
  // card over the Atlantic, between Florida and West Africa.
  EU_868: { region: 'BG', anchor: [25.3, 42.7], card: { x: 436, y: 92, w: 120 } },
  EU_433: { region: 'EU', anchor: [2, 47], card: { x: 258, y: 120, w: 172 } },
  // Americas + Pacific: US card in the open Pacific south of Hawaii; ANZ card
  // in the Coral Sea, between Queensland and New Zealand.
  US: { region: 'US', anchor: [-98, 39], card: { x: 6, y: 132, w: 124 } },
  ANZ: { region: 'ANZ', anchor: [134, -25], card: { x: 768, y: 186, w: 108 } },
  // Asia: Korea over the Russian Far East, Japan in the Pacific east of it,
  // China over Kazakhstan, India in the Indian Ocean.
  JP: { region: 'JP', anchor: [138.5, 36.5], card: { x: 730, y: 96, w: 146 } },
  KR: { region: 'KR', anchor: [127.8, 36.4], card: { x: 750, y: 6, w: 124 } },
  IN: { region: 'IN', anchor: [79, 22], card: { x: 516, y: 166, w: 124 } },
  CN: { region: 'CN', anchor: [104, 35], card: { x: 470, y: 6, w: 124 } },
}

/** 2,4 GHz ribbon: one band wrapped round the whole map, just under it. */
export const RIBBON = { x0: 0, x1: MAP_W, y: MAP_H + 8, h: 40 }

/** Total component height: map plus ribbon. */
export const BAND_MAP_H = RIBBON.y + RIBBON.h

/** Point on a card's edge closest to (x, y): where its leader line starts. */
export function cardEdgePoint(card: BandCallout['card'], x: number, y: number): { x: number, y: number } {
  return {
    x: Math.min(Math.max(x, card.x), card.x + card.w),
    y: Math.min(Math.max(y, card.y), card.y + CARD_H),
  }
}

/** Open-sea spots for the map ornaments, clear of every card and the ribbon. */
export const COMPASS_AT = lonLatToXY(-18, -32)
export const DRAGON_AT = { ...lonLatToXY(-118, -30), scale: 0.9 }
