// Native bounding boxes of the MapPerils.vue creatures, at scale 1.
// Each figure is drawn centred on its local origin, so the box spans
// [x - w/2, x + w/2] x [y - h/2, y + h/2] once placed (times `scale`).
// Kept in a plain module (not the .vue) so the journey-map placer and the
// tests can import it for collision checks. Named perilBox, not mapPerils,
// to dodge the component/data name-clash trap (see CLAUDE.md).
// Values are measured from the rendered SVG (getBBox, rounded up).

export const PERIL_KINDS = ['dragon', 'troll', 'spider', 'warg'] as const
export type PerilKind = typeof PERIL_KINDS[number]

export interface PerilBox { w: number, h: number }

export const PERIL_BOX: Readonly<Record<PerilKind, PerilBox>> = {
  dragon: { w: 92, h: 50 },
  troll: { w: 52, h: 34 },
  spider: { w: 40, h: 46 },
  warg: { w: 70, h: 30 },
}
