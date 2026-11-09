// Scene data for slide 40 „Лицензи в MeshCore“ (OpenCoreStory.vue).
// Facts (T2§1 licence, T2§4 apps, 2026-10, licences rechecked on GitHub 2026-11-04):
//  - meshcore-dev/MeshCore firmware: MIT
//  - meshcore-dev/meshcore-cli, meshcore_py, meshcore.js: MIT
//  - the official mobile app of the authors is closed, part of it is paid
//  - zjs81/meshcore-open (MeshCore Open): MIT, Flutter, community project,
//    Android, iOS, Linux, Windows, macOS and web
// Each tag names the software it labels, so a licence never floats over a
// bare device (the phone must not read as running MIT firmware).
// Name rule (CLAUDE.md): this file must not share a name with a component.

export type OcStationId = 'firmware' | 'tools' | 'app' | 'open-app'

/** Device a tag hangs over. */
export type OcDevice = 'radio' | 'laptop' | 'phone'

export interface OcStation {
  id: OcStationId
  /** Click step at which the tag appears. */
  at: number
  device: OcDevice
  /** Which software the tag is about. */
  tagName: string
  /** Its licence, said once, on the tag only. */
  tagLicence: string
  /** Open source (moss tag) or closed (gold-deep tag with a lock). */
  open: boolean
}

export const OC_STATIONS: readonly OcStation[] = [
  { id: 'firmware', at: 1, device: 'radio', tagName: 'фърмуер', tagLicence: 'MIT', open: true },
  { id: 'tools', at: 2, device: 'laptop', tagName: 'meshcore-cli, Python, JS', tagLicence: 'MIT', open: true },
  { id: 'app', at: 3, device: 'phone', tagName: 'официално приложение', tagLicence: 'затворено, част е платена', open: false },
  { id: 'open-app', at: 4, device: 'phone', tagName: 'приложение MeshCore Open', tagLicence: 'MIT, от общността', open: true },
]

export const OC_STORY_CLICKS = Math.max(...OC_STATIONS.map(s => s.at))
