// The 8-slot channel table of a Meshtastic device, for <ChannelSlots> (slide 31).
//
// Sources (checked 2026-11-04):
//  - protobufs meshtastic/channel.proto (6b1ded4): Channel.index 0..MAX-1,
//    roles PRIMARY / SECONDARY / DISABLED; „Secondary channels are only used
//    for encryption/decryption/authentication purposes. Their radio settings
//    (freq etc) are ignored, only psk is used.“ → one frequency, one preset.
//  - deviceonly/channel options: max 8 channels (MAX_NUM_CHANNELS, firmware
//    v2.7.26 mesh-pb-constants.h derives it from the ChannelFile array).
//  - An empty channel name is shown as the modem preset name, so in Sofia
//    (SHORT_FAST, slide 34) the default channel reads „ShortFast“.

export const CHANNEL_SLOT_COUNT = 8

export interface SlotChannel {
  /** Channel name as the app shows it. */
  name: string
  /** Key as the audience should read it (AQ== shorthand or a description). */
  key: string
  /** true: random secret key; false: publicly known key. */
  private: boolean
  /** Click on which this channel appears in its slot. */
  at: number
}

export interface ChannelSlot {
  index: number
  role: 'primary' | 'secondary'
  channel?: SlotChannel
}

/** Click on which the role labels (основен / допълнителни) appear. */
export const ROLES_AT = 2

export const CHANNEL_SLOTS: ChannelSlot[] = Array.from({ length: CHANNEL_SLOT_COUNT }, (_, index) => ({
  index,
  role: index === 0 ? 'primary' : 'secondary',
  channel:
    index === 0 ? { name: 'ShortFast', key: 'AQ==', private: false, at: 3 }
    // City channel, public key (mesh.motaba.net: „Optional extra Channel
    // (City locale name), PSK: AQ==“); shown together with slot 0.
    : index === 1 ? { name: 'Sofia', key: 'AQ==', private: false, at: 3 }
    : index === 2 ? { name: 'openfest', key: '256-bit', private: true, at: 4 }
    : undefined,
}))

/** Clicks the strip needs: the last channel reveal. */
export const CHANNEL_SLOTS_TOTAL = Math.max(ROLES_AT, ...CHANNEL_SLOTS.map(s => s.channel?.at ?? 0))
