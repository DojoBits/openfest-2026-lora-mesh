// Carbon icons by name, for components whose icon comes from data.
// Templates can also use the component form directly (<carbon-radio />).
// Only the icons listed here are bundled; add an import to use a new one.
import type { Component } from 'vue'
import BatteryFull from '~icons/carbon/battery-full'
import Application from '~icons/carbon/application'
import ChartNetwork from '~icons/carbon/chart-network'
import Chat from '~icons/carbon/chat'
import CheckmarkOutline from '~icons/carbon/checkmark-outline'
import Chip from '~icons/carbon/chip'
import Cloud from '~icons/carbon/cloud'
import Flash from '~icons/carbon/flash'
import FloodWarning from '~icons/carbon/flood-warning'
import Laptop from '~icons/carbon/laptop'
import License from '~icons/carbon/license'
import Mountain from '~icons/carbon/mountain'
import Radio from '~icons/carbon/radio'
import Usb from '~icons/carbon/usb'
import WarningAlt from '~icons/carbon/warning-alt'
import WeatherStation from '~icons/carbon/weather-station'
import Wheat from '~icons/carbon/wheat'
import UserRole from '~icons/carbon/user-role'
import UserMultiple from '~icons/carbon/user-multiple'
import ToolKit from '~icons/carbon/tool-kit'

export const ICONS = {
  'battery-full': BatteryFull,
  'application': Application,
  'chart-network': ChartNetwork,
  'chat': Chat,
  'cloud': Cloud,
  'user-role': UserRole,
  'checkmark-outline': CheckmarkOutline,
  'chip': Chip,
  'flash': Flash,
  'flood-warning': FloodWarning,
  'laptop': Laptop,
  'license': License,
  'mountain': Mountain,
  'radio': Radio,
  'usb': Usb,
  'warning-alt': WarningAlt,
  'weather-station': WeatherStation,
  'wheat': Wheat,
  'user-multiple': UserMultiple,
  'tool-kit': ToolKit,
} satisfies Record<string, Component>

export type IconName = keyof typeof ICONS
