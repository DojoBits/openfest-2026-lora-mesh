// Slide 22 „Готови устройства“: the four card texts of DeviceKinds.vue (tested
// in tests/deviceKinds.test.ts). Named `readyDevices`, not `deviceKinds`: a data
// file must never share a name with a component (CLAUDE.md).
//
// Prices and models are in the speaker notes (shop.shtf.bg, 10.2026).

export type DeviceKind = 'tracker' | 'keyboard' | 'solar' | 'base'
export interface ReadyDevice { id: DeviceKind, title: string, use: string, example: string, at: number }

/** One card per click, in story order. */
export const READY_DEVICES: readonly ReadyDevice[] = [
  { id: 'tracker', title: 'Тракер', use: 'в джоба, праща позиция', example: 'T1000-E, Wio Tracker L1', at: 1 },
  { id: 'keyboard', title: 'С клавиатура', use: 'пишете без телефон', example: 'LilyGO T-Deck', at: 2 },
  { id: 'solar', title: 'Соларен възел', use: 'на високо: препраща, разширява мрежата', example: 'RAK4631 + соларен панел', at: 3 },
  { id: 'base', title: 'Базова станция', use: 'у дома, на ток: мост към интернет (MQTT)', example: 'Station G2', at: 4 },
]
