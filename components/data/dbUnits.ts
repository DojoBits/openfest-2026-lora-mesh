// Slide 13 „Какво са dB, dBm и dBi“: one light bulb explains the three units.
//   dBm — how strong the bulb is, measured against a tiny 1 mW bulb (0 dBm);
//   dB  — how many times brighter or dimmer: ×2 = +3 dB, ×10 = +10 dB;
//   dBi — a reflector: the same bulb, its light gathered forward; „i“ is the
//         ideal bare (isotropic) bulb that shines the same in every direction.
// Tested in tests/dbUnits.test.ts. (File name differs from the component on
// purpose: name-clash trap in CLAUDE.md.)

/** The base formula shown on the dB card (dBm is the same with P₁ = 1 mW). */
export const DB_FORMULA = 'dB = 10 · log₁₀(P₂ / P₁)'

/** Power ratio → decibels. */
export const dbFromRatio = (ratio: number): number => 10 * Math.log10(ratio)
/** Milliwatts → dBm (decibels above 1 mW). */
export const mwToDbm = (mw: number): number => dbFromRatio(mw)

export interface DbCard { unit: 'dBm' | 'dB' | 'dBi', title: string, at: number }
export const DB_CARDS: readonly DbCard[] = [
  { unit: 'dB', title: 'колко пъти', at: 1 },
  { unit: 'dBm', title: 'колко силно', at: 2 },
  { unit: 'dBi', title: 'накъде', at: 3 },
]

// 1 mW is the reference; 25 mW is the usual EU868 limit (slide 13 notes).
export const DBM_EXAMPLES = [1, 25].map(mw => ({ mw, dbm: Math.round(mwToDbm(mw)) }))

// Card 2 draws `bulbs` small bulbs next to one: twice as many, ten times as many.
export const DB_STEPS = [2, 10].map((bulbs) => {
  const db = Math.round(dbFromRatio(bulbs))
  return { bulbs, db, label: `×${bulbs} = +${db} dB` }
})

// The rooftop fiberglass omni from slide 14 starts at 5 dBi: 10^0,5 ≈ 3,2× forward.
export const DBI_EXAMPLE = { dbi: 5, times: `≈ ${Math.round(10 ** (5 / 10))}×` }
