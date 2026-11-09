---
layout: section
---

<SectionHero section="communities">

# Общности

Мрежата е толкова добра, колкото общността

</SectionHero>


---

# Meshtastic България

<div class="flex h-full flex-col items-center justify-center">
  <div class="grid w-full grid-cols-3 items-start justify-items-center gap-x-8 gap-y-3">
    <div v-click><QRCard id="meshtastic-fb" size="sm" label="Facebook група" /></div>
    <div v-click><QRCard id="motaba" size="sm" label="Портал за цяла България" /></div>
    <div v-click><QRCard id="meshmap" size="sm" label="Карта + MQTT" /></div>
    <div v-click><QRCard id="local-groups" size="sm" label="Местни групи" /></div>
    <div v-click><QRCard id="meshtastic-discord" size="sm" label="Глобален Discord" /></div>
    <div v-click="5"><QRCard id="meshtastic-reddit" size="sm" label="Глобален Reddit" /></div>
  </div>
</div>


---
layout: two-cols
---

# MeshCore България

<div class="text-xl leading-snug">
  <ul>
    <li>Мрежи в София, Пловдив, Варна, Бургас</li>
    <li v-click="1">Радио до Румъния и Сърбия</li>
    <li v-click="2">Канали: <code>#bulgaria</code>, <code>#sofia</code>, <code>#emergency</code></li>
  </ul>
  <div v-click="3" class="mt-2 flex items-start gap-6">
    <QRCard id="meshcore-discord" size="sm" label="Глобален Discord" />
    <QRCard id="meshcore-reddit" size="sm" label="Глобален Reddit" />
  </div>
</div>

::right::

<div class="flex flex-col items-end gap-2">
  <div class="w-[82%]"><BgMap /></div>
  <div v-click="3" class="mt-[56px] flex items-start gap-6">
    <QRCard id="meshcore-bg-fb" size="sm" label="Facebook група" />
    <QRCard id="meshcore-bg" size="sm" />
  </div>
</div>

