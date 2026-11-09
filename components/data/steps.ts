// Gallery only: the generic flashing flow with the three flasher URLs as chips.
// The flashing slides (33, 41, 48) show screenshots of each real web flasher.
// URLs: research/T2-projects.md §6.
import type { IconName } from './icons'
import type { ProjectColour, Tone } from './tones'

export interface FlowStep {
  icon?: IconName
  /** Draw a ✓ instead of an icon. */
  check?: boolean
  label: string
  tone: Tone
  chips?: { text: string, colour: ProjectColour }[]
}

export const FLASH_STEPS: FlowStep[] = [
  { icon: 'usb', label: 'USB кабел + Chrome/Edge', tone: 'blue' },
  { icon: 'flash', label: 'Уеб flasher', tone: 'blue' },
  { icon: 'chip', label: 'Платка + роля', tone: 'blue' },
  {
    check: true,
    label: 'Готово',
    tone: 'emerald',
    chips: [
      { text: 'flasher.meshtastic.org', colour: 'cyan' },
      { text: 'flasher.meshcore.io', colour: 'indigo' },
      { text: 'rnodeconf / уеб flasher', colour: 'fuchsia' },
    ],
  },
]
