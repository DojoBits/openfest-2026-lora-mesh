// Slide 19 „Пряка видимост и препятствия“, drawn as a Middle-earth map scene:
// a town on the left (stone watchtower, inn, a map tree), a bare hill in the
// middle (a stone ruin and a beacon tower on top), a farm on the right (pond,
// wooden solar pole, a smial in a grassy mound, crop field, barn).
// LoRa needs no line of sight: walls and trees only cost range, a whole hill
// between two nodes km apart does stop it. So, per click:
//   1 a wizard (town, by the stone tower) and a hobbit (farm, at its smial)
//     hold a node in hand. The wizard reaches a client inside the inn through
//     its wall (`through`: drawn weaker past the wall); the hand-to-hand line
//     passes the town (`soft`: walls and the tree don't count) and is cut by the hill;
//   2 the wizard puts an antenna on the watchtower battlements, the hobbit a
//     wooden solar pole on the farm: the line clears the town (more range), the
//     hill still blocks it;
//   3 a router (amber = relay) on the beacon tower on the hill: the tower, the
//     pole and a dwarf walking up the path all reach it;
//   4 mesh: the tower and the pole turn Router too. In town the wizard and the
//     inn client reach the tower (and still talk straight to each other); on
//     the farm the hobbit, the raft on the pond and a gateway on the
//     smial chimney reach the pole; the field and barn sensors and the dog's
//     GPS collar report to the gateway; the red dragon high above the farm
//     carries a node that reaches the pole.
// Proportions are readable, not to scale. Each link's `ok` flag is checked against
// this geometry by sightBlocked() in tests/lineOfSight.test.ts.
import { PERIL_BOX } from './perilBox'

export const SIGHT_W = 1000
export const SIGHT_H = 400
export const GROUND = 340

export interface Pt { x: number, y: number }
/** A window by its centre; the component draws each kind's own shape round it. */
export interface Win { x: number, y: number }
/** A town building, solid as a rectangle from `top` to the ground; `peak`, if
 *  set, adds a pitched roof (solid too) rising from `top` to `peak`. */
export interface Block { kind: 'tower' | 'inn', x: number, w: number, top: number, peak?: number, windows: Win[] }
export interface Tree { x: number, cy: number, r: number }

// The town: the tall watchtower at the edge, then the lower inn, then a map
// tree at the foot of the hill (clear of the inn, so its window sees the street),
// lower than both buildings but well above the people.
/** Watchtower arrow slits (centre, size) and the battlement teeth on top. */
export const SLIT = { w: 6, h: 16 }
export const MERLON = { w: 12, h: 11 }
export const TOWER: Block = {
  kind: 'tower',
  x: 36,
  w: 78,
  top: GROUND - 192,
  // two columns of slits on three storeys, the door below
  windows: [190, 236, 282].flatMap(y => [58, 92].map(x => ({ x, y }))),
}
/** The inn: stone ground floor, timber upper floor under a thatched roof. Its
 *  first window is the round, lit one nearest the tower: the client sits in it. */
export const INN_WIN_R = 10
export const INN: Block = {
  kind: 'inn',
  x: 250,
  w: 70,
  top: GROUND - 132,
  peak: GROUND - 160,
  windows: [{ x: 268, y: 234 }, { x: 302, y: 234 }],
}
export const BUILDINGS: [Block, Block] = [TOWER, INN]

export const TREE_TRUNK_W = 6
const TREE: Tree = { x: 346, cy: 252, r: 22 }
export const TREES: Tree[] = [TREE]

// Rounded hill: a parabola from `from` to `to` peaking at `top`. As an SVG
// quadratic Bézier the control point sits at twice the peak height.
const HILL_TOP_Y = 65
export const HILL = { from: 370, to: 630, top: { x: 500, y: HILL_TOP_Y } }
export const HILL_PATH = `M ${HILL.from},${GROUND} Q ${HILL.top.x},${2 * HILL_TOP_Y - GROUND} ${HILL.to},${GROUND} Z`

/** Hill surface y at x, or null off the hill. */
export function hillY(x: number): number | null {
  if (x < HILL.from || x > HILL.to) return null
  const half = (HILL.to - HILL.from) / 2
  const u = (x - HILL.top.x) / half
  return GROUND - (GROUND - HILL_TOP_Y) * (1 - u * u)
}

/** A switchback path up the front of the hill to the beacon: polyline,
 *  every bend inside the hill body. Texture plus the dwarf's way up. */
export const ROAD_W = 6
export const HILL_ROAD: [number, number][] = [[380, 338], [600, 292], [420, 244], [575, 206], [465, 168], [512, 132], [500, 78]]
export const HILL_ROAD_PATH = `M ${HILL_ROAD.map(p => p.join(',')).join(' L ')}`

/** Beacon tower on the summit: a stone turret `w` wide from `base` (sunk into
 *  the hill) up to `top`, a fire glowing in an opening under the battlements,
 *  the router node standing on top. Decoration: the hill under it already
 *  blocks, so it stays out of solid(). */
export const BEACON = { x: HILL.top.x, w: 18, top: 31, base: HILL_TOP_Y + 4 }
export const HILL_ROUTER: Pt = { x: BEACON.x, y: BEACON.top - 10 }
/** Broken wall stubs of a ruin either side of the beacon: left edge `x`,
 *  width `w`, height `h` above `base` (their foot, inside the hill). Low
 *  enough to stay under the links that arrive at the router. */
export interface Stub { x: number, w: number, h: number, base: number }
export const RUIN: Stub[] = [
  { x: 472, w: 12, h: 15, base: 80 },
  { x: 515, w: 9, h: 11, base: 77 },
]

/** Small trees and bushes on the hill, texture only: the hill under them already
 *  blocks, so they stay out of solid(). `y` is the root (on the surface or inside
 *  the hill body, between the road bends), `top` the height above it. Tested
 *  never to poke through a visible link line nor sit on the road. */
export interface Flora { kind: 'tree' | 'bush', x: number, y: number, top: number }
/** Map tree: a round crown on a short trunk. Bush: three round clumps. */
export const FLORA_TREE = { h: 26, w: 10 }
export const FLORA_BUSH = { h: 16, r: 6 }
const flora = (kind: Flora['kind'], x: number, y: number): Flora => ({
  kind, x, y, top: kind === 'tree' ? FLORA_TREE.h : FLORA_BUSH.h,
})
export const HILL_FLORA: Flora[] = [
  flora('tree', 535, 100), flora('bush', 450, 132),
  flora('tree', 560, 148), flora('bush', 525, 168), flora('tree', 430, 172),
  flora('tree', 570, 180), flora('tree', 420, 204), flora('bush', 590, 252),
  flora('bush', 545, 252), flora('bush', 395, 296), flora('bush', 440, 296),
  flora('bush', 485, 296), flora('bush', 615, 336), flora('bush', 570, 336),
]

/** A dwarf walking up the path on click 3, node raised in his right hand: on
 *  the hill itself he has the top in view. Drawn upright in local units (boots
 *  on y = 0, facing +x = uphill), scaled. He stands on the low end of the
 *  second ramp, where the next leg of the path is far above his head. */
const ROAD_RAMP = [HILL_ROAD[2], HILL_ROAD[3]]
const DWARF_X = 452
const rampY = (x: number): number => {
  const [[ax, ay], [bx, by]] = ROAD_RAMP
  return ay + ((x - ax) * (by - ay)) / (bx - ax)
}
export const HILL_DWARF = {
  x: DWARF_X,
  // boots on the top edge of the road stroke
  y: rampY(DWARF_X) - ROAD_W / 2,
  scale: 1.25,
  head: { x: 0, y: -19, r: 3.6 },
  /** node in the raised hand; `tip` is its antenna tip, local units */
  node: { x: 9, y: -27 },
  tip: { x: 9, y: -33 },
}
/** Outline of the drawing in local units: boots, tunic hem, head rim, helmet,
 *  axe head on the back, node and antenna tip. Tested to stay inside the hill
 *  body, off the plants and off the other legs of the path. */
export const HILL_DWARF_OUTLINE: [number, number][] = [
  [-7, 0], [8, 0], [-8, -6], [8, -6],
  ...Array.from({ length: 24 }, (_, i): [number, number] => [
    HILL_DWARF.head.x + HILL_DWARF.head.r * Math.cos((i * Math.PI) / 12),
    HILL_DWARF.head.y + HILL_DWARF.head.r * Math.sin((i * Math.PI) / 12)]),
  [0, -25], [-11, -22], [-6, -24],
  [HILL_DWARF.node.x - 3, HILL_DWARF.node.y - 3], [HILL_DWARF.node.x + 3, HILL_DWARF.node.y + 3],
  [HILL_DWARF.tip.x, HILL_DWARF.tip.y],
]
const DWARF_TIP: Pt = {
  x: HILL_DWARF.x + HILL_DWARF.scale * HILL_DWARF.tip.x,
  y: HILL_DWARF.y + HILL_DWARF.scale * HILL_DWARF.tip.y,
}

/** The two people: x of the feet; `side` is the hand that holds the node, its
 *  antenna tip up and to that side. Both tips sit at the same height, so the
 *  figures differ but neither gets a taller antenna. */
export interface Person { kind: 'hobbit' | 'wizard', name: string, x: number, side: 1 | -1 }
// town figure first (the wizard by the stone tower), farm figure second (the
// hobbit at the door of its smial); each holds the node toward the other
export const PEOPLE: Person[] = [
  { kind: 'wizard', name: 'Магьосник', x: 150, side: 1 },
  { kind: 'hobbit', name: 'Хобит', x: 735, side: -1 },
]
/** Figures are drawn in local units (feet at 0, facing +x) and scaled up;
 *  the node's antenna tip is at (tipDx, tipDy) in those units, `h` is the tallest
 *  point (the wizard's hat). Kept well below the trees. */
export const FIG = { scale: 0.95, tipDx: 17, tipDy: -54, h: 80 }
export const HAND_TIP_DX = FIG.tipDx * FIG.scale
export const HAND_TIP_Y = GROUND + FIG.tipDy * FIG.scale
const handTip = (p: { x: number, side: number }): Pt => ({ x: p.x + p.side * HAND_TIP_DX, y: HAND_TIP_Y })

export const ROOF_MAST = 44
/** Antenna on a mast on the watchtower battlements (click 2), router from click 4. */
export const ROOF: Pt = { x: TOWER.x + TOWER.w / 2, y: TOWER.top - ROOF_MAST }
/** A client node inside the inn by the round window on the far side from the
 *  wizard (click 1: the wizard's hand node reaches it through the near wall;
 *  click 4: it also reaches the tower Router). Its own walls cost a few dB and
 *  are not hit-tested; any other building is. */
export interface Client extends Pt { block: Block }
export const CLIENT: Client = { ...INN.windows[1], block: INN }

// The farm, left to right: pond, solar pole, smial, crop field, barn. Pond,
// field, crop and dog are not solid: flat or small next to the links that pass
// them; the smial mound and the barn are.
/** Pond on the ground right of the hill: water is open, nothing blocks over it. */
export const POND = { cx: 663, rx: 27, ry: 7 }
/** Log raft on the pond with a small sail; the node sits on top of its mast,
 *  `tip` is the antenna. */
export const RAFT = { x: 663, w: 28 }
export const RAFT_TIP: Pt = { x: 654, y: 300 }
/** Wooden solar pole: antenna at the top, a small panel low on it. */
export const POLE = { x: 704 }
export const POLE_TIP: Pt = { x: POLE.x, y: 225 }
/** Smial: a hobbit hole in a grassy mound, half an ellipse `w` wide rising to
 *  `top`, a round door in front and a stone chimney poking out of it. */
export const SMIAL = { x: 752, w: 54, top: 286 }
/** Mound surface y at x, or null off the mound. */
export function smialY(x: number): number | null {
  const half = SMIAL.w / 2
  const u = (x - SMIAL.x - half) / half
  if (Math.abs(u) > 1) return null
  return GROUND - (GROUND - SMIAL.top) * Math.sqrt(1 - u * u)
}
/** Chimney out of the right shoulder of the mound (thin: left out of solid()). */
export const CHIMNEY = { x: SMIAL.x + 38, w: 8, top: 266 }
/** Gateway on a short mast on the chimney: collects the farm sensors. */
export const GATEWAY: Pt = { x: CHIMNEY.x, y: CHIMNEY.top - 14 }
/** Crop field between the smial and the barn: rows of low plants; two soil
 *  sensors on stakes stick out of it. */
export const FIELD = { from: 812, to: 888 }
export const CROP_H = 12
export const SENSORS: Pt[] = [840, 875].map(x => ({ x, y: GROUND - 30 }))
/** Dog with a GPS collar, running in the field; `tip` is the collar antenna. */
export const DOG = { x: 858 }
export const DOG_TIP: Pt = { x: 864, y: 318 }
/** Barn: walls plus a pitched roof, solid. */
export interface Gable { x: number, w: number, wallTop: number, peak: number }
export const BARN: Gable = { x: 900, w: 90, wallTop: 272, peak: 236 }
/** Barn sensors: one on a bracket off the wall facing the field, one on the
 *  roof ridge. Both antennas stand clear of the barn's own walls. */
export const BARN_SENSORS: Pt[] = [
  { x: BARN.x - 6, y: 282 },
  { x: BARN.x + BARN.w / 2, y: BARN.peak - 14 },
]
/** The deck's red dragon (MapPerils, flying left) high over the farm: centre,
 *  scale and its native box; the node hangs below its claws, `tip` is the node. */
export const DRAGON = { x: 897, y: 33, scale: 1.1, box: PERIL_BOX.dragon }
export const DRAGON_TIP: Pt = { x: DRAGON.x, y: 77 }

/** Roof line of a gabled building at x (walls at wallTop, roof up to the peak). */
function gableTop(g: Gable, x: number): number | null {
  if (x < g.x || x > g.x + g.w) return null
  const half = g.w / 2
  return g.peak + ((g.wallTop - g.peak) * Math.abs(x - g.x - half)) / half
}

/** `onHill`: the link starts on the hill's front face (the dwarf), where the
 *  side view cannot hit-test it; it runs straight up to the top in view. */
/** `own`: the building a node sits in or stands beside, ignored by the hit test:
 *  at that range the wall or roof edge costs a few dB, not the link. */
/** `through`: the building the signal goes into through its wall (the inn for
 *  the client inside it); the part past the wall is drawn weaker. */
/** `soft`: walls and the tree only weaken this link, only terrain (the hill)
 *  counts for the hit test. */
export interface SightLink { id: string, from: Pt, to: Pt, at: number, ok: boolean, onHill?: boolean, own?: Block, through?: Block, soft?: boolean }
// hand tips: `town` is the wizard's, `farm` the hobbit's
const [town, farm] = PEOPLE.map(handTip)
export const SIGHT_LINKS: SightLink[] = [
  // in hand: the town costs range but the hill, km away, is what stops it
  { id: 'ground', from: town, to: farm, at: 1, ok: false, soft: true },
  // end node to end node, no router: the wizard's node reaches the client inside
  // the inn through the wall
  { id: 'direct-left', from: town, to: CLIENT, at: 1, ok: true, own: INN, through: INN },
  { id: 'roof', from: ROOF, to: POLE_TIP, at: 2, ok: false },
  { id: 'roof-hill', from: ROOF, to: HILL_ROUTER, at: 3, ok: true },
  { id: 'pole-hill', from: POLE_TIP, to: HILL_ROUTER, at: 3, ok: true },
  { id: 'dwarf', from: DWARF_TIP, to: HILL_ROUTER, at: 3, ok: true, onHill: true },
  // the town
  { id: 'client', from: CLIENT, to: ROOF, at: 4, ok: true, own: INN },
  { id: 'hand-left', from: town, to: ROOF, at: 4, ok: true, own: TOWER },
  // the farm: the hobbit, the raft and the smial gateway reach the solar
  // Router; the field and barn sensors and the dog collar report to the gateway
  { id: 'hand-right', from: farm, to: POLE_TIP, at: 4, ok: true },
  { id: 'gateway', from: GATEWAY, to: POLE_TIP, at: 4, ok: true },
  ...SENSORS.map((t, i): SightLink => ({ id: `sensor-${i + 1}`, from: t, to: GATEWAY, at: 4, ok: true })),
  ...BARN_SENSORS.map((t, i): SightLink => ({ id: `barn-${i + 1}`, from: t, to: GATEWAY, at: 4, ok: true })),
  { id: 'raft', from: RAFT_TIP, to: POLE_TIP, at: 4, ok: true },
  { id: 'dog', from: DOG_TIP, to: GATEWAY, at: 4, ok: true },
  // from high above, the dragon sees the whole farm
  { id: 'dragon', from: DRAGON_TIP, to: POLE_TIP, at: 4, ok: true },
]

/** True if p is inside a town building (walls or pitched roof), the tree
 *  (crown or trunk), the smial mound or the barn, or under the hill.
 *  `terrainOnly`: count the hill alone (walls and trees only weaken a signal). */
function solid(p: Pt, own?: Block, terrainOnly = false): boolean {
  if (terrainOnly) {
    const h = hillY(p.x)
    return h !== null && p.y >= h
  }
  if (BUILDINGS.some((b) => {
    if (b === own || p.x < b.x || p.x > b.x + b.w) return false
    if (p.y >= b.top) return true
    // pitched roof: the same gable test as the barn, walls topping out at b.top
    if (b.peak === undefined) return false
    const roof = gableTop({ x: b.x, w: b.w, wallTop: b.top, peak: b.peak }, p.x)
    return roof !== null && p.y >= roof
  })) return true
  if (TREES.some(t => Math.hypot(p.x - t.x, p.y - t.cy) <= t.r
    || (Math.abs(p.x - t.x) <= TREE_TRUNK_W / 2 && p.y >= t.cy))) return true
  const mound = smialY(p.x)
  if (mound !== null && p.y >= mound) return true
  const barn = gableTop(BARN, p.x)
  if (barn !== null && p.y >= barn) return true
  const h = hillY(p.x)
  return h !== null && p.y >= h
}

/** First solid point on the segment a → b (sampled every 1 px), or null if clear. */
export function firstHit(a: Pt, b: Pt, own?: Block, terrainOnly = false): Pt | null {
  const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y))
  // Skip the end points: antennas sit on their own roof or hill top.
  for (let i = 1; i < n; i++) {
    const p = { x: a.x + ((b.x - a.x) * i) / n, y: a.y + ((b.y - a.y) * i) / n }
    if (solid(p, own, terrainOnly)) return p
  }
  return null
}

export const sightBlocked = (a: Pt, b: Pt, own?: Block, terrainOnly = false): boolean => firstHit(a, b, own, terrainOnly) !== null

/** Where a `through` link enters its building's wall (the first solid point
 *  with nothing ignored), or null for every other link. */
export const wallEntry = (l: SightLink): Pt | null => (l.through ? firstHit(l.from, l.to) : null)
