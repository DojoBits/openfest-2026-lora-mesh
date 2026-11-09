# snippets/ — споделени конфигурации за лекцията

Всички файлове са силно коментирани (български, техническите термини на английски).
Във всеки има header с URL на официалния източник и реда „Verified 2026-10-19 against vX“.
Няма истински тайни: ключът на openfest е демо ключ, показан на слайд 34, BLE PIN е случаен при изпълнение,
а `channel_url` в YAML примера е умишлено невалиден placeholder.

## Версии (последна проверка 2026-10-19)

| Проект | Версия | Забележка |
|---|---|---|
| Meshtastic firmware | v2.7.26 (stable) | 2.8.x е alpha, 2.8.0 е изтеглена; следваме stable линията |
| Meshtastic Python CLI | latest от `pip` | флаговете проверени в `meshtastic/__main__.py` |
| MeshCore | v1.18.0 (2026-10-15) | CLI справка: `docs/cli_commands.md` |
| Reticulum (RNS) | 1.5.5 | manual: `reticulum.network/manual/interfaces.html` |

## Файлове

| Файл | Какво е | Слайд | Excerpt (маркери в самия файл) |
|---|---|---|---|
| `meshtastic/setup-node.sh` | Пълна настройка на демо възел: BLE FIXED_PIN, MQTT изключен, после `base-config.sh` (имена, EU_868, preset, каналите Sofia и openfest с ключа от слайда). Един и същ скрипт за двата възела. | 34 | няма (слайд 34 цитира `base-config.sh#excerpt`, 14 реда) |
| `meshtastic/demo.sh` | Резервен терминален вариант на демото през USB: `--listen`, `--sendtext` по канал 1, `--traceroute`. Само една връзка на възел: затворете клиента преди това. | 46, 47 | 1 ред (traceroute), по желание |
| `meshtastic/channel-export.yaml` | Пример за `--export-config` / `--configure`. Реален износ съдържа PSK в `channel_url`: не се комитва. | 45/46b (по желание) | 7 реда между `slide excerpt start/end` |
| `meshcore/repeater.txt` | Команди за MeshCore repeater (`set freq`, `region put`, `region save`, `set path.hash.mode`, `neighbors`). Не е скрипт. `set radio` е коментиран (отворен въпрос за coding rate). | 46b (скрит) | 6 реда |
| `reticulum/config` | Минимален `~/.reticulum/config`: AutoInterface + RNodeInterface (EU 868, 125 kHz, SF8, airtime limit 10 %). Стойностите са пример: всички възли трябва да съвпадат. | 46b (скрит) | 8 реда |
| `reticulum/install.sh` | `pip install rns`, `rnodeconf --autoinstall`, `rnstatus`, `rnpath`. | 44 (само бележки) | няма |

## Маркери за excerpt

* `# --- slide excerpt start/end ---` показва на човека коя част отива на слайда (максимум 8 реда).
* В `setup-node.sh` има и `# #region excerpt` / `# #endregion excerpt`, които Slidev разбира.
* След всяка промяна преизчислете `{1-2|3-4|...}` диапазоните в `slides.md` (правилото от CLAUDE.md).

## Законност (EU868)

`EU_868` в Meshtastic е 869.4 до 869.65 MHz, duty cycle 10 %, до 27 dBm. Стойностите за MeshCore (869.618 MHz, 62.5 kHz)
и Reticulum (869.525 MHz, 125 kHz, 14 dBm) са в същия sub-band. Това не е правен съвет:
проверете националните правила.

## Какво още липсва

* `meshtastic/traceroute.txt`: реален изход, записва се от репетицията (виж `DEMO.md`).
* Скриптовете не са пускани на реален хардуер; синтаксисът е проверен с `bash -n`.
