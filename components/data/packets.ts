// Packet bars for <PacketAnatomy>. Sizes: research/T2-projects.md §3
// (Meshtastic: 16-byte unencrypted header, payload ≤ 239 B; default channel
// key „AQ==“ is published) and §2/§3 Reticulum (16-byte destination hash, no
// source address in the packet, forward secrecy on links).
// Meshtastic header fields: firmware v2.7.26 src/mesh/RadioInterface.h,
// PacketHeader (wire layout): to 4, from 4, id 4, flags 1 (hop limit, want_ack,
// via_mqtt, hop_start), channel hash 1, next_hop 1, relay_node 1 = 16 B
// (MESHTASTIC_HEADER_LENGTH); MAX_LORA_PAYLOAD_LEN 255 → data ≤ 239 B.
import type { Tone } from './tones'

export interface PacketSegment {
  label: string
  /** Relative width on the bar (bytes where meaningful). */
  weight: number
  tone: Tone
  /** Wire fields of the segment, zoomed out under the bar (label + size in bytes). */
  parts?: { label: string, bytes: number }[]
  locked?: boolean
  at: number
}

export interface KeyChip { text: string, tone: Tone, note: string, flipTo?: { text: string, tone: Tone, note: string, at: number }, at: number }

export interface PacketPreset {
  segments: PacketSegment[]
  keyChip?: KeyChip
  /** Largest whole packet in bytes, drawn as a bracket over the bar with the last segment. */
  maxBytes?: number
  /** One line under the bar, shown with the last segment. */
  note?: string
  total: number
}

export const PACKET_PRESETS: Record<'meshtastic' | 'rns', PacketPreset> = {
  meshtastic: {
    segments: [
      // The header is drawn 6× wider than its bytes so its label fits; its
      // fields are zoomed out full width under the bar.
      {
        label: 'хедър 16 B', weight: 16 * 6, tone: 'amber', at: 1,
        parts: [
          { label: 'до', bytes: 4 },
          { label: 'от', bytes: 4 },
          { label: 'id', bytes: 4 },
          { label: 'флагове', bytes: 1 },
          { label: 'канал', bytes: 1 },
          { label: 'next hop', bytes: 1 },
          { label: 'relay', bytes: 1 },
        ],
      },
      { label: 'данни ≤ 239 B', weight: 239, tone: 'emerald', locked: true, at: 2 },
    ],
    // No key chip: public vs private keys live on the channels slide (31).
    maxBytes: 255,
    total: 2,
  },
  rns: {
    segments: [
      // Wire format (manual, understanding.html): only destination addresses,
      // 16 B each. HEADER_2 adds the next transport node, never the sender.
      { label: 'До: адрес 16 байта', weight: 160, tone: 'blue', at: 2 },
      { label: 'данни (криптирани)', weight: 300, tone: 'slate', locked: true, at: 2 },
    ],
    note: 'в хедъра няма поле „От:“',
    total: 3,
  },
}
