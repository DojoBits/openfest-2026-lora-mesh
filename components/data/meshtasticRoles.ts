// Role data for slide 29 „Роли на устройствата“ (NodeRoles.vue): the Meshtastic
// device roles, one per click, drawn where each one lives in the landscape.
// Verified 2026-11-04:
//  - firmware v2.7.26 src/mesh/generated/meshtastic/config.pb.h,
//    meshtastic_Config_DeviceConfig_Role_*: CLIENT = 0 … CLIENT_BASE = 12 (MAX);
//  - meshtastic.org/docs/configuration/radio/device/ (Roles):
//    CLIENT „app connected or stand alone messaging device“, rebroadcasts
//    packets when no other node has done so; CLIENT_BASE „personal base station“
//    (attic / roof), acts as ROUTER_LATE for favorited nodes, CLIENT otherwise;
//    ROUTER „infrastructure node for extending network coverage … always
//    rebroadcasts packets once“, for high, fixed places; SENSOR broadcasts
//    telemetry packets as priority;
//  - REPEATER deprecated in 2.7.11 (breaks the rebroadcast chain), ROUTER_CLIENT
//    deprecated in 2.3.15. Docs show 2.8 (alpha), this deck follows 2.7.26.
// Name rule (CLAUDE.md): this file must not share a name with a component.

/** meshtastic_Config_DeviceConfig_Role, firmware 2.7.26 (config.pb.h). */
export const MT_ROLE_ENUM = {
  CLIENT: 0,
  CLIENT_MUTE: 1,
  ROUTER: 2,
  ROUTER_CLIENT: 3,
  REPEATER: 4,
  TRACKER: 5,
  SENSOR: 6,
  TAK: 7,
  CLIENT_HIDDEN: 8,
  LOST_AND_FOUND: 9,
  TAK_TRACKER: 10,
  ROUTER_LATE: 11,
  CLIENT_BASE: 12,
} as const

export type MtRole = keyof typeof MT_ROLE_ENUM
export type MtRoleId = 'client' | 'base' | 'router' | 'sensor'

export interface MtRoleStation {
  id: MtRoleId
  role: MtRole
  /** Click step at which the role appears in the scene and lights up in the strip. */
  at: number
  /** Plain fact under the role name (Bulgarian, no slogan). */
  sub: string
}

export const MT_ROLES: readonly MtRoleStation[] = [
  { id: 'client', role: 'CLIENT', at: 1, sub: 'носи се, с телефон' },
  { id: 'base', role: 'CLIENT_BASE', at: 2, sub: 'на покрива у дома' },
  { id: 'router', role: 'ROUTER', at: 3, sub: 'на високо, постоянно' },
  { id: 'sensor', role: 'SENSOR', at: 4, sub: 'праща телеметрия' },
]

export const MT_ROLE_CLICKS = MT_ROLES[MT_ROLES.length - 1].at

/** Other live roles, named on the slide in one caption line (details in the notes). */
export const MT_MORE_ROLES: readonly MtRole[] = ['CLIENT_MUTE', 'CLIENT_HIDDEN', 'ROUTER_LATE', 'TRACKER', 'LOST_AND_FOUND', 'TAK']

/** Deprecated roles: only in the speaker notes, never offered on the slide. */
export const MT_DEPRECATED_ROLES: readonly { role: MtRole, since: string }[] = [
  { role: 'ROUTER_CLIENT', since: '2.3.15' },
  { role: 'REPEATER', since: '2.7.11' },
]
