#!/usr/bin/env bash
# =============================================================================
# base-config.sh: настройки на Meshtastic устройство по препоръките на
# българската общност за София, EU 868 MHz, плюс каналите от слайд 31.
#
# Слайд 33 „Първоначална настройка“ цитира региона `excerpt` по-долу.
# setup-node.sh (демото) го вика за двата възела.
#
# Канали (CLI __main__.py: --ch-add взима първия свободен индекс и го прави
# --ch-index за следващия --ch-set, util.py fromPSK: "default" = 1 байт AQ==,
# "base64:" = ключ в base64):
#   слот 1 Sofia, публичен ключ (mesh.motaba.net: „Optional extra Channel
#     (City locale name), PSK: AQ==“)
#   слот 2 openfest, 32 байта (AES256). Ключът е фиксиран и се вижда на
#     слайда: канал само за демото на лекцията, без тайни. Двата възела го
#     получават директно, без QR/URL.
# Скриптът е за пресен възел: --ch-add спира, ако каналът вече съществува.
#
# Препоръки (прочетени 2026-11-04): https://mesh.motaba.net/ (index_og.php)
#   EU 868 MHz, София: short_fast / Slot 1, „Recommended User Settings“:
#   Hop limit ≯3, OK to MQTT: Enabled, Ignore MQTT: Disabled, Role: CLIENT_MUTE.
#   Варна, Русе, В. Търново: medium_fast, Бургас, Пловдив: long_fast.
# Полета: фърмуер v2.7.26, protobufs meshtastic/config.proto (6b1ded4):
#   LoRaConfig.region, modem_preset (SHORT_FAST = 6), hop_limit (по
#   подразбиране 3, макс. 7),
#   config_ok_to_mqtt, ignore_mqtt (по подразбиране false, затова не го пипаме),
#   DeviceConfig.role (CLIENT_MUTE = 1: не препраща чужди пакети).
#   config_ok_to_mqtt е поле 105 на LoRaConfig, затова `lora.`, не `mqtt.`.
# Без lora.channel_num (честотен слот): EU_868 е 869.4–869.65 MHz (250 kHz) и
# SHORT_FAST е 250 kHz, така че има един слот, фърмуерът смята
# (channel_num - 1) % 1 = 0 при всяка стойност (RadioInterface.cpp). „Slot 1“
# на портала е точно този единствен слот, т.е. стойността по подразбиране.
# Име: CLI --set-owner / --set-owner-short (meshtastic/python __main__.py),
#   mesh.proto User.long_name до 24 байта UTF-8, short_name „ideally two
#   characters“ (приложението приема до 4).
# CLI: https://meshtastic.org/docs/software/python/cli/installation/
#   (macOS: brew install pipx && pipx ensurepath, [cli] добавя pyqrcode).
#
# Употреба:  ./base-config.sh [/dev/cu.usbmodemXXXX] ["Дълго име"] [КРАТКО]
#   Без порт CLI само намира единственото свързано устройство, при повече от
#   едно устройство подайте порта (CLI: --port).
#   Името се вижда от всички в мрежата: сложете вашето.
# =============================================================================
set -euo pipefail

PORT="${1:-}"
NAME="${2:-Ivan Petrov}"   # дълго име, до 24 байта
SHORT="${3:-IP}"           # кратко име, за малкия екран

# Обвивка: подава --port, ако е даден, и чака след всяко извикване, защото
# всяка `--set` команда записва настройката и рестартира устройството.
# Така редовете в excerpt-а на слайда са истински и изпълними едно след друго.
meshtastic() {
  command meshtastic ${PORT:+--port "$PORT"} "$@"
  sleep 15
}

# pipx install на вече инсталиран пакет само предупреждава, не спира скрипта.
pipx() { command pipx "$@" || true; }

# #region excerpt
# 1. CLI
pipx install "meshtastic[cli]"
# 2. Регион и preset: ShortFast за София
meshtastic --set lora.region EU_868 --set lora.modem_preset SHORT_FAST
# 3. Име на възела: дълго и кратко
meshtastic --set-owner "$NAME" --set-owner-short "$SHORT"
# 4. До 3 скока, пакетите ми може да минат през MQTT
meshtastic --set lora.hop_limit 3 --set lora.config_ok_to_mqtt true
# 5. Роля: не препраща чужди пакети
meshtastic --set device.role CLIENT_MUTE
# 6. Канали: Sofia в слот 1, openfest с ключ за демото в слот 2
meshtastic --ch-add Sofia --ch-set psk default
meshtastic --ch-add openfest \
  --ch-set psk base64:27XbTxpxbyHMAeO07a21lq6KLbQd5olHbfhuN9LfZJY=
# #endregion excerpt

echo "Проверка: meshtastic --get lora.modem_preset --get device.role"
