---
layout: section
---

<SectionHero section="meshtastic">

# Meshtastic

</SectionHero>


---

# Какво е Meshtastic

<div class="mx-auto w-[880px]"><MeshtasticStory /></div>


---

# Managed Flood Routing

<div>
<div class="mx-auto w-[640px]"><MeshMap mode="meshtastic" /></div>
<div class="mt-2 text-center text-lg opacity-70">групово: 3 скока по подразбиране, настройва се до 7 · директно: научен път (от 2.6)</div>
</div>


---

# Роли на устройствата

<div>
<div class="mx-auto w-[820px]"><NodeRoles /></div>
<div v-click="4" class="mt-1 text-center text-lg opacity-70">още: CLIENT_MUTE · CLIENT_HIDDEN · ROUTER_LATE · TRACKER · LOST_AND_FOUND · TAK</div>
</div>


---
layout: default
---

# Структура на пакета

<div>
<div class="mx-auto w-[860px]"><PacketAnatomy variant="meshtastic" /></div>
<div class="mx-auto mt-4 grid w-[860px] grid-cols-2 gap-x-4 gap-y-3 text-2xl font-semibold">
  <div v-click="1" class="flex items-center gap-2 rounded-xl border-2 border-gold/50 bg-gold/10 px-3 py-2 dark:border-gold/60 dark:bg-gold/20"><carbon-unlocked class="shrink-0 text-gold-deep dark:text-gold-deep" />Хедърът не е криптиран</div>
  <div v-click="2" class="flex items-center gap-2 rounded-xl border-2 border-moss/50 bg-moss/10 px-3 py-2 dark:border-moss/60 dark:bg-moss/20"><carbon-locked class="shrink-0 text-moss dark:text-moss" />AES с ключа на канала</div>
  <div v-click="3" class="flex items-center gap-2 rounded-xl border-2 border-trail/50 bg-trail/10 px-3 py-2 dark:border-trail/60 dark:bg-trail/20"><carbon-hashtag class="shrink-0 text-trail dark:text-trail" />1 байт: хеш на канала</div>
  <div v-click="4" class="flex items-center gap-2 rounded-xl border-2 border-water/50 bg-water/10 px-3 py-2 dark:border-water/60 dark:bg-water/20"><carbon-user class="shrink-0 text-water dark:text-water" />DM: X25519 (от 2.5)</div>
</div>
</div>


---

# Канали

<div>
<div class="mx-auto w-[860px]"><ChannelSlots /></div>
<div class="mx-auto mt-4 grid w-[860px] grid-cols-2 gap-x-4 gap-y-3 text-2xl font-semibold">
  <div v-click="1" class="flex items-center gap-2 rounded-xl border-2 border-gold/50 bg-gold/10 px-3 py-2 dark:border-gold/60 dark:bg-gold/20"><carbon-tag class="shrink-0 text-gold-deep dark:text-gold-deep" />Канал = име + ключ</div>
  <div v-click="2" class="flex items-center gap-2 rounded-xl border-2 border-stone/50 bg-stone/10 px-3 py-2 dark:border-stone/60 dark:bg-stone/20"><carbon-arrows-horizontal class="shrink-0 text-stone-deep dark:text-stone-deep" />Без ключ: само препраща</div>
  <div v-click="3" class="flex items-center gap-2 rounded-xl border-2 border-trail/50 bg-trail/10 px-3 py-2 dark:border-trail/60 dark:bg-trail/20"><carbon-view class="shrink-0 text-trail dark:text-trail" /><span>Публичен: ключ <code style="font-variant-ligatures: none">AQ==</code></span></div>
  <div v-click="4" class="flex items-center gap-2 rounded-xl border-2 border-moss/50 bg-moss/10 px-3 py-2 dark:border-moss/60 dark:bg-moss/20"><carbon-qr-code class="shrink-0 text-moss dark:text-moss" />Частен: ключ по QR или URL</div>
</div>
</div>


---

# Какво е preset

<div class="mx-auto w-[880px]"><PresetTable /></div>


---

# Флашване на фърмуер

<div class="flex items-center justify-center gap-8">
  <!-- landing page in a browser frame; the device picker lands over it on click 1 -->
  <div class="relative h-[410px] w-[640px] shrink-0">
    <div class="absolute left-0 top-0 w-[540px] overflow-hidden rounded-lg border border-edge/60 shadow-lg">
      <div class="flex items-center gap-1.5 border-b border-stone/30 bg-parchment-lo px-3 py-1.5">
        <span class="h-2.5 w-2.5 rounded-full bg-trail/70" /><span class="h-2.5 w-2.5 rounded-full bg-gold/70" /><span class="h-2.5 w-2.5 rounded-full bg-moss/70" />
        <span class="ml-3 font-mono text-sm opacity-70">flasher.meshtastic.org</span>
      </div>
      <img src="/flasher/landing.webp" alt="Meshtastic Web Flasher: устройство, фърмуер, флашване" class="block w-full" />
    </div>
    <div v-click="1" class="absolute bottom-0 right-0 w-[440px] overflow-hidden rounded-lg border border-edge/60 shadow-2xl">
      <img src="/flasher/devices.webp" alt="Избор на устройство: 95 платки по марка и чип" class="block w-full" />
    </div>
  </div>
  <div v-click="2" class="flex shrink-0 flex-col items-center gap-4">
    <QRCard id="meshtastic-flasher" label="" />
    <p class="text-center text-xl">nRF52: копирате <code>.uf2</code> файл</p>
  </div>
</div>


---

# Първоначална настройка

<div class="mx-auto w-[860px]" style="--slidev-code-font-size: 18px">

<<< @/snippets/meshtastic/base-config.sh#excerpt bash {1-2|3-4|5-6|7-8|9-10|11-14|all}

</div>

