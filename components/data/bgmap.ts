// Schematic Bulgaria outline for <BgMap> (slide 56). Hand-traced from
// approximate border lon/lat points (Danube, Dobrudzha, coast, Turkey,
// Greece, North Macedonia, Serbia) — good enough to place two cities, not a
// map. Equirectangular, x squeezed by cos(43°) ≈ 0,733.
export const BG_VIEW = { w: 1000, h: 640 }

export function project(lon: number, lat: number): { x: number, y: number } {
  return { x: 110 + (lon - 22) * 0.733 * 170, y: 70 + (44.4 - lat) * 170 }
}

/** [lon, lat], clockwise from the Timok mouth. */
export const BG_OUTLINE: [number, number][] = [
  [22.68, 44.21], [22.88, 43.99], [23.24, 43.83], [23.96, 43.74], [24.89, 43.70],
  [25.35, 43.62], [25.97, 43.85], [26.62, 44.05], [27.26, 44.12], [27.71, 43.98],
  [28.0, 43.84], [28.58, 43.74], [28.46, 43.36], [27.92, 43.2], [27.88, 42.87],
  [27.58, 42.47], [27.7, 42.42], [27.85, 42.17], [28.03, 41.98], [27.55, 41.92],
  [27.05, 42.08], [26.36, 41.71], [26.1, 41.36], [25.25, 41.24], [24.6, 41.43],
  [24.05, 41.48], [23.62, 41.37], [22.93, 41.34], [23.0, 41.75], [22.88, 42.0],
  [22.36, 42.31], [22.52, 42.55], [22.44, 42.82], [22.98, 43.12], [22.66, 43.2],
  [22.48, 43.62], [22.36, 43.82], [22.53, 44.05],
]

export interface MapPin { city: string, lon: number, lat: number }
export interface MapLink { to: string, from: string, lon: number, lat: number }

export const BG_PINS: MapPin[] = [
  // Cities with active MeshCore repeaters on map.meshcore.io (2026-11-07).
  { city: 'София', lon: 23.32, lat: 42.7 },
  { city: 'Пловдив', lon: 24.75, lat: 42.15 },
  { city: 'Враца', lon: 23.55, lat: 43.21 },
  { city: 'Русе', lon: 25.97, lat: 43.85 },
  // Coast: communities reported by the speaker, no nodes on map.meshcore.io (2026-11-07).
  { city: 'Варна', lon: 27.91, lat: 43.21 },
  { city: 'Бургас', lon: 27.47, lat: 42.5 },
]

/** meshcore.bg: standing radio links to Romania and Serbia. Craiova and Niš have repeaters on map.meshcore.io (2026-11-07). */
export const BG_LINKS: MapLink[] = [
  { to: 'Крайова (RO)', from: 'София', lon: 23.8, lat: 44.32 },
  { to: 'Ниш (RS)', from: 'София', lon: 21.9, lat: 43.32 },
]

export const outlinePath = (): string =>
  `${BG_OUTLINE.map(([lon, lat], i) => {
    const p = project(lon, lat)
    return `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`
  }).join(' ')} Z`
