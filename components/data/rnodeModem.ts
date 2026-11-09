// Slide 48 „RNode е само модем“: where routing and encryption run.
// A Meshtastic or MeshCore node does the work inside the radio, the phone is
// only the screen. With RNode the radio only sends and receives LoRa, and the
// host (Sideband with RNS + LXMF) routes and encrypts.
// Sources (read 2026-11-04): RNode_Firmware README (GPLv3, © Mark Qvist,
// bands, uses), Sideband README (Android, Linux, macOS, Windows).

export interface RNodeBox {
  name: string
  icon: 'phone' | 'radio'
  /** Work done in this box. */
  jobs: string[]
}
export interface RNodeRow {
  label: string
  host: RNodeBox
  link: string
  radio: RNodeBox
  /** Click on which the row appears. */
  at: number
}

/** Jobs that change sides between the rows, drawn in the accent colour. */
export const MOVED_JOBS = ['маршрутизация', 'криптиране']

export const RNODE_ROWS: RNodeRow[] = [
  {
    label: 'Meshtastic, MeshCore',
    host: { name: 'телефон', icon: 'phone', jobs: ['екран'] },
    link: 'Bluetooth',
    radio: { name: 'радио', icon: 'radio', jobs: ['маршрутизация', 'криптиране', 'LoRa'] },
    at: 0,
  },
  {
    label: 'RNode',
    host: { name: 'Sideband', icon: 'phone', jobs: ['маршрутизация', 'криптиране'] },
    link: 'USB или Bluetooth',
    radio: { name: 'RNode', icon: 'radio', jobs: ['LoRa модем'] },
    at: 1,
  },
]

export const RNODE_FACTS = {
  at: 2,
  items: [
    'Mark Qvist, GPLv3',
    '433, 868, 915 MHz, 2,4 GHz',
    'и KISS TNC, sniffer, IP',
  ],
}

export const RNODE_IOS = {
  at: 3,
  text: 'iOS: няма Sideband, само ранни клиенти (Columba-iOS, inertia, Retichat)',
}
