---
layout: section
---

<SectionHero section="meshcore">

# MeshCore

</SectionHero>


---

# Какво е MeshCore

<div class="mx-auto w-[880px]"><MeshCoreStory /></div>


---

# Първо flood, после път

<div>
<div class="mx-auto w-[640px]"><MeshMap mode="meshcore" /></div>
<div class="mt-2 text-center text-lg opacity-70">flood само през repeater‑ите · после научен път · след 3 неуспеха пак flood</div>
</div>


---

# Офлайн пощенска кутия

<div>
<div class="mx-auto w-[820px]"><RoomServerStory /></div>
</div>


---

# Лицензи в MeshCore

<div>
<div class="mx-auto w-[820px]"><OpenCoreStory /></div>
</div>


---

# Криптиране в MeshCore

<div class="mx-auto mt-4 w-[900px]">
  <div class="flex h-20 items-stretch gap-2 text-2xl font-bold">
    <div v-click="1" class="flex w-[150px] items-center justify-center rounded-xl border-2 border-edge/60 bg-parchment-hi dark:border-edge/60 dark:bg-parchment-hi">хедър</div>
    <div v-click="1" class="flex w-[150px] items-center justify-center rounded-xl border-2 border-edge/60 bg-parchment-hi dark:border-edge/60 dark:bg-parchment-hi">път</div>
    <div v-click="1" class="flex flex-1 items-center justify-center rounded-xl border-2 border-edge/60 bg-parchment-hi dark:border-edge/60 dark:bg-parchment-hi">съобщение</div>
    <div v-click="1" class="flex w-[150px] items-center justify-center rounded-xl border-2 border-edge/60 bg-parchment-hi dark:border-edge/60 dark:bg-parchment-hi">MAC</div>
  </div>
  <div v-click="2" class="mt-3 flex items-start gap-2 text-xl leading-tight">
    <div class="w-[150px] text-center text-trail dark:text-trail">некриптирано</div>
    <div class="w-[150px] text-center text-trail dark:text-trail">некриптирано</div>
    <div class="flex-1 text-center text-gold-deep dark:text-gold-deep"><div class="font-bold">AES-128 ECB</div><div class="text-lg">без IV, еднакви блокове личат</div></div>
    <div class="w-[150px] text-center"><div class="text-trail dark:text-trail">некриптирано</div><div class="text-lg text-gold-deep dark:text-gold-deep">само 2 байта</div></div>
  </div>
  <div class="mt-8 flex flex-col gap-3 text-2xl">
    <div v-click="3" class="flex items-center gap-3"><carbon-user class="shrink-0 text-ink dark:text-ink" />Лични съобщения: X25519, без forward secrecy</div>
    <div v-click="4" class="flex items-center gap-3"><carbon-user-multiple class="shrink-0 text-ink dark:text-ink" />Канали: общ ключ, подателят не е подписан</div>
    <div v-click="4" class="flex items-center gap-3"><carbon-unlocked class="shrink-0 text-trail dark:text-trail" />#public: ключът е публикуван</div>
    <div v-click="5" class="flex items-center gap-3"><carbon-roadmap class="shrink-0 text-gold-deep dark:text-gold-deep" />Предложение: ChaCha20-Poly1305, нов ключ за всяка сесия</div>
  </div>
</div>


---

# Флашване на фърмуер

<div class="flex items-center justify-center gap-8">
  <!-- device list in a browser frame, the role picker lands over it on click 1 -->
  <div class="relative h-[410px] w-[640px] shrink-0">
    <div class="absolute left-0 top-0 w-[540px] overflow-hidden rounded-lg border border-edge/60 shadow-lg">
      <div class="flex items-center gap-1.5 border-b border-stone/30 bg-parchment-lo px-3 py-1.5">
        <span class="h-2.5 w-2.5 rounded-full bg-trail/70" /><span class="h-2.5 w-2.5 rounded-full bg-gold/70" /><span class="h-2.5 w-2.5 rounded-full bg-moss/70" />
        <span class="ml-3 font-mono text-sm opacity-70">flasher.meshcore.io</span>
      </div>
      <img src="/flasher/meshcore-landing.webp" alt="MeshCore flasher: списък с платки" class="block w-full" />
    </div>
    <div v-click="1" class="absolute bottom-0 right-0 w-[440px] overflow-hidden rounded-lg border border-edge/60 shadow-2xl">
      <img src="/flasher/meshcore-roles.webp" alt="Избор на роля: Companion, Repeater, Room Server" class="block w-full" />
    </div>
  </div>
  <div v-click="2" class="flex shrink-0 flex-col items-center gap-4">
    <QRCard id="meshcore-flasher" label="" />
    <p class="text-center text-xl">Ролята се избира<br>при флашване</p>
  </div>
</div>

