#!/usr/bin/env bash
# =============================================================================
# setup-node.sh: пълна настройка на един демо възел (EU_868 + каналите от слайд 31)
#
# Verified 2026-10-19 against Meshtastic firmware v2.7.26 (latest stable) and
# the `meshtastic` Python CLI (macOS: brew install pipx && pipx ensurepath && pipx install "meshtastic[cli]").
# Sources:
#   https://meshtastic.org/docs/software/python/cli/            (CLI flags)
#   https://meshtastic.org/docs/configuration/radio/lora/       (region, preset)
#   https://meshtastic.org/docs/configuration/radio/bluetooth/  (pairing modes)
#   https://meshtastic.org/docs/configuration/module/mqtt/      (mqtt.enabled)
#   https://github.com/meshtastic/python/blob/master/meshtastic/__main__.py
#     (--ch-add, --ch-set psk, --set-owner)
# NOT yet run on real hardware: изпълнете го веднъж на репетиционните възли.
#
# Употреба (един и същ скрипт за двата възела, само порт и имена се сменят):
#   ./setup-node.sh /dev/cu.usbmodem1101 "OF-A" "OFA"
#   ./setup-node.sh /dev/cu.usbmodem2101 "OF-B" "OFB"
#
# Каналите и ключът на openfest идват от base-config.sh (слайд 34). Ключът е
# фиксиран и показан на слайда: канал само за демото, без тайни. Затова двата
# възела получават същия ключ директно, без QR или URL.
# Единствената тайна е BLE PIN: генерира се тук, по време на изпълнение.
# =============================================================================
set -euo pipefail

PORT="${1:?serial port, напр. /dev/cu.usbmodemXXXX}"
LONG_NAME="${2:?дълго име, напр. OF-A}"
SHORT_NAME="${3:?кратко име (до 4 знака), напр. OFA}"

# 6-цифрен BLE PIN, случаен при всяко пускане (никога hard-code-нат).
BLE_PIN="${BLE_PIN:-$(python3 -c 'import secrets; print(secrets.randbelow(900000) + 100000)')}"

# Обвивка: всяко `meshtastic ...` по-долу автоматично получава --port.
meshtastic() { command meshtastic --port "$PORT" "$@"; }

# --- 1. Bluetooth, мощност, без интернет -------------------------------------
# Всяка `--set` команда рестартира възела, затова верижим в едно извикване.
# lora.tx_power 0 = "максималната мощност, легална за региона" (docs).
# mqtt.enabled false = нищо от демото не излиза в интернет (privacy).
meshtastic \
  --set lora.tx_power 0 \
  --set bluetooth.enabled true \
  --set bluetooth.mode FIXED_PIN \
  --set bluetooth.fixed_pin "$BLE_PIN" \
  --set mqtt.enabled false
sleep 15   # възелът се рестартира

# --- 2. Слайд 34: регион, preset, име, скокове, MQTT флаг, роля, канали -------
# Композиция: същият скрипт, който слайдът цитира (сам чака след всяко --set).
# Каналите: Sofia в слот 1 (AQ==), openfest в слот 2 (ключът от слайда).
"$(dirname "$0")/base-config.sh" "$PORT" "$LONG_NAME" "$SHORT_NAME"

echo "BLE PIN за $LONG_NAME: $BLE_PIN   (запишете го, въвежда се при сдвояване)"
echo "Проверка: meshtastic --info | head -40   # region EU_868, 3 канала, fw 2.7.x"
