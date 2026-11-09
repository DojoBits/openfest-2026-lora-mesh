---
layout: section
---

<SectionHero section="start">

# Как да започна?

От кутията до първото съобщение

</SectionHero>


---

# Хардуер под 30 € <span class="text-lg font-normal opacity-70">към 10.2026</span>

<div class="flex h-full flex-col justify-center gap-4">
  <div class="grid grid-cols-2 gap-4">
    <BoardCard v-click id="heltec-v4" />
    <BoardCard v-click id="xiao-s3" />
    <BoardCard v-click id="heltec-t114" />
    <BoardCard v-click id="rak4631" />
  </div>
  <div v-click class="rounded-xl border-2 border-moss/50 bg-moss/15 py-3 text-center text-2xl font-semibold text-moss dark:border-moss/40 dark:bg-moss/15 dark:text-moss">
    работят и с трите: Meshtastic · MeshCore · RNode
  </div>
</div>

<div class="absolute right-14 top-5 text-sm opacity-50">Снимки: Heltec Automation, Meshtastic (GPL-3.0)</div>


---

# Готови устройства

<DeviceKinds />


---

# Първо включване: четири проверки

<div class="mx-auto w-[820px]"><FirstPowerBoard /></div>


---

# Батерии: химия и напрежение

<div class="mx-auto w-[820px]"><BatteryVoltages /></div>


---
hide: true
layout: two-cols
---

# MeshCore и Reticulum: накратко

<div style="--slidev-code-font-size: 15px">

```bash
# MeshCore repeater: честота, регион, препоръки на meshcore.bg
set freq 869.618
region put bg
region save
set path.hash.mode 1
set loop.detect minimal
neighbors
```

</div>

::right::

<div class="mt-14" style="--slidev-code-font-size: 15px">

```ini
# пример — всички възли трябва да съвпадат
[[RNode LoRa Interface]]
  type = RNodeInterface
  frequency = 869525000
  bandwidth = 125000
  spreadingfactor = 8
  txpower = 14
```

</div>

