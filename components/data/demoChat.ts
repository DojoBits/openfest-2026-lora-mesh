// Live demo script (slide 35): one channel, one message each way.
// The slide clicks follow the order the demo is done live.

export type DemoDevice = 'phone' | 'laptop'

/** How each screen talks to its node: phone ↔ A over Bluetooth, laptop ↔ B over USB (Web Serial). */
export const DEMO_LINK: Record<DemoDevice, 'bluetooth' | 'usb'> = { phone: 'bluetooth', laptop: 'usb' }

/** Node B, the laptop's radio. Not in BOARDS (slide 21 lists only the four picks). */
export const DEMO_NODE_B = { name: 'LilyGO T-LoRa V2.1-1.6', short: 'T-LoRa', img: '/boards/tlora-v2-1-1_6.webp' } as const

export interface DemoMessage {
  from: DemoDevice
  text: string
  /** Click at which it is sent. */
  at: number
}

/** Click steps: 1 channel on both screens, 2 phone sends, 3 laptop replies. */
export const DEMO_AT = { channel: 1, send: 2, reply: 3 } as const

/** Private channel set on both nodes (same name + random key). */
export const DEMO_CHANNEL = 'openfest'

export const DEMO_MESSAGES: readonly DemoMessage[] = [
  { from: 'phone', text: 'Здравей, OpenFest', at: DEMO_AT.send },
  { from: 'laptop', text: 'Получих го!', at: DEMO_AT.reply },
]

/** How long the packet takes to cross the chain (ms); incoming bubbles wait for it. */
export const PACKET_MS = 1400
