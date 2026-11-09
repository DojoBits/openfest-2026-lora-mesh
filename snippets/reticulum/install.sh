#!/usr/bin/env bash
# =============================================================================
# install.sh — Reticulum + RNode: инсталация и проверка (само бележки към слайд 46)
#
# Verified 2026-10-19 against Reticulum 1.5.5 manual.
# Sources: https://reticulum.network/manual/hardware.html
#          https://reticulum.network/manual/using.html
# =============================================================================
set -euo pipefail

pip install rns            # Reticulum Network Stack (rnsd, rnstatus, rnpath, rnodeconf, ...)

# Guided инсталатор: флашва RNode firmware, подписва и записва EEPROM.
# Свържете платката по USB и следвайте въпросите.
rnodeconf --autoinstall

# Копирайте snippets/reticulum/config в ~/.reticulum/config, после:
rnsd --service             # демон (по желание; приложения като Sideband стартират собствен)
rnstatus                   # интерфейси, трафик, airtime
rnpath DESTINATION_HASH    # път до дестинация (32 hex знака)
