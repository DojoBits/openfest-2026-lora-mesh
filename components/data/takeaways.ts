// Text of the closing recap strip (slide 59). One entry per panel, in click order.
import type { ProjectColour } from './tones'
import type { ProjectId } from './projectLogos'

export interface RelayRow {
  project: ProjectId
  colour: ProjectColour
  name: string
  who: string
}

export interface Takeaway {
  id: 'lora' | 'relay' | 'start'
  label: string
  /** Short fact under the scene, empty when the scene says it all. */
  fact: string
}

export const TAKEAWAYS: readonly Takeaway[] = [
  { id: 'lora', label: 'LoRa', fact: 'Километри с миливати, без SIM' },
  { id: 'relay', label: 'Кой препраща', fact: '' },
  { id: 'start', label: 'Първи стъпки', fact: 'Едно устройство и preset-ът на общността' },
]

export const RELAY_ROWS: readonly RelayRow[] = [
  { project: 'meshtastic', colour: 'cyan', name: 'Meshtastic', who: 'всеки възел' },
  { project: 'meshcore', colour: 'indigo', name: 'MeshCore', who: 'repeater-ите' },
  { project: 'reticulum', colour: 'fuchsia', name: 'Reticulum', who: 'транспортните възли' },
]
