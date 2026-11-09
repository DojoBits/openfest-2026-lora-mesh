// Reticulum stack for <ReticulumStack>. Source: research/T2-projects.md §2
// (whatis / interfaces pages: works from 5 bit/s, MTU 500 B) and §4 (apps).
export interface StackLayer { name: string, desc?: string, items: string[], at: number }

export const RNS_MIN_BPS = 5
export const RNS_MTU_BYTES = 500

/** Top-down, the way it is drawn; `at` builds it from the bottom. */
export const RNS_STACK: StackLayer[] = [
  { name: 'Приложения', items: ['Sideband', 'NomadNet', 'MeshChatX', 'Columba'], at: 4 },
  { name: 'LXMF', desc: 'съобщения, файлове, офлайн доставка', items: [], at: 3 },
  { name: 'Reticulum', desc: 'адресиране, маршрутизация, криптиране', items: [], at: 2 },
  { name: 'Интерфейси', items: ['LoRa', 'Wi-Fi', 'TCP', 'I2P', 'packet radio', 'Serial'], at: 1 },
]

/** Interfaces the example packet leaves through on the last click. */
export const RNS_EXITS = ['LoRa', 'TCP']
