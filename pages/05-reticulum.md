---
layout: section
---

<SectionHero section="reticulum">

# Reticulum

</SectionHero>


---

# Какво е Reticulum

<div class="mx-auto w-[880px]"><ReticulumStory /></div>


---

# Как Reticulum намира път

<div class="mx-auto w-[640px]"><MeshMap mode="transport" /></div>


---

# <carbon-data-table class="inline text-ink dark:text-ink" /> Таблица с пътища

<div class="mx-auto w-[900px]"><PathTable /></div>


---

# Стек, независим от средата

<div class="mx-auto w-[860px]"><ReticulumStack /></div>


---

# Адресът е ключ

<div class="mx-auto w-[860px]"><PacketAnatomy variant="rns" /></div>


---

# RNode е само модем

<div class="mx-auto mt-2 w-[900px]"><RNodeModem /></div>


---

# Флашване на фърмуер

<div class="flex items-center justify-center gap-8">
  <!-- steps 1 and 2 in a browser frame, steps 3 to 5 land over them on click 1 -->
  <div class="relative h-[410px] w-[640px] shrink-0">
    <div class="absolute left-0 top-0 w-[540px] overflow-hidden rounded-lg border border-edge/60 shadow-lg">
      <div class="flex items-center gap-1.5 border-b border-stone/30 bg-parchment-lo px-3 py-1.5">
        <span class="h-2.5 w-2.5 rounded-full bg-trail/70" /><span class="h-2.5 w-2.5 rounded-full bg-gold/70" /><span class="h-2.5 w-2.5 rounded-full bg-moss/70" />
        <span class="ml-3 font-mono text-sm opacity-70">liamcottle.github.io/rnode-flasher</span>
      </div>
      <img src="/flasher/rnode-steps.webp" alt="RNode Flasher: избор на платка и фърмуер" class="block w-full" />
    </div>
    <div v-click="1" class="absolute bottom-0 right-0 w-[500px] overflow-hidden rounded-lg border border-edge/60 shadow-2xl">
      <img src="/flasher/rnode-finish.webp" alt="Стъпки 3 до 5: Provision EEPROM, Set Firmware Hash, Done" class="block w-full" />
    </div>
  </div>
  <div v-click="2" class="flex shrink-0 flex-col items-center gap-4">
    <QRCard id="rnode-flasher" label="" />
    <p class="text-center text-xl">CLI:<br><code>rnodeconf --autoinstall</code></p>
  </div>
</div>

