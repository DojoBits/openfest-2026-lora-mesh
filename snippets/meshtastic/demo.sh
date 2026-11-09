#!/usr/bin/env bash
# =============================================================================
# demo.sh — командите за демото (резервен вариант през терминал/USB)
#
# Verified 2026-10-19 against Meshtastic firmware v2.7.26 (stable) + Python CLI.
# Sources: https://meshtastic.org/docs/software/python/cli/
#          https://github.com/meshtastic/python/blob/master/meshtastic/__main__.py
#          (--listen, --sendtext, --ch-index, --traceroute, --dest)
#
# Основното демо е телефон -> BLE -> LoRa -> BLE -> Mac клиент (виж DEMO.md).
# Този скрипт е "Plan B+": ако Bluetooth на Mac откаже, но възелът е на USB.
# Само ЕДНА връзка на възел: затворете клиента, преди да пуснете CLI.
# =============================================================================
set -euo pipefail

PORT="${1:?serial port на възел B}"
NODE_A_ID="${2:-}"          # !xxxxxxxx — за traceroute (виж `meshtastic --nodes`)

# --- slide excerpt start --- (слайд 47: само този 1 ред, по желание)
# meshtastic --traceroute '!xxxxxxxx'
# --- slide excerpt end ---

case "${3:-listen}" in
  listen)
    # Слуша потока от пакети (JSON) — на екрана се вижда пристигащото съобщение.
    meshtastic --port "$PORT" --listen ;;
  send)
    # Изпраща по канал 1 (частния). Същият текст като на слайд 2 и във видеото.
    meshtastic --port "$PORT" --ch-index 1 --sendtext "Здравей, OpenFest" ;;
  trace)
    # Показва пътя и SNR за всеки hop. Нужен е node ID на отсрещния възел.
    meshtastic --port "$PORT" --traceroute "${NODE_A_ID:?node id}" ;;
  *) echo "usage: $0 PORT [NODE_ID] listen|send|trace" >&2; exit 2 ;;
esac
