// Section slides as checkpoints on the slide-5 trail (data/journey.ts): each
// section belongs to one agenda stop, and SectionHero lights that stop on a
// mini copy of the trail. Icons and accent classes stay literal in
// SectionHero.vue (UnoCSS extracts from source text only).
export type SectionId = 'lora' | 'radio' | 'meshtastic' | 'meshcore' | 'reticulum' | 'start' | 'communities' | 'connect'

/** 1-based agenda stop each section answers. */
export const SECTIONS: Record<SectionId, { stop: number }> = {
  lora: { stop: 1 }, // Какво е LoRa?
  radio: { stop: 2 }, // Как работи?
  start: { stop: 3 }, // Как да започна? (hardware, before power, test)
  connect: { stop: 4 }, // Как да се свържем? (opens stop 4: three networks, comparison, communities)
  meshtastic: { stop: 4 },
  meshcore: { stop: 4 },
  reticulum: { stop: 4 },
  communities: { stop: 4 },
}
