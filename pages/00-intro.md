---
layout: center
---

<!-- Slide 2 · Hook. HookSwitch registers its own clicks (frames in data/hookFrames.ts):
     Shire theme: the tower is a dark tower with an eye (closes on click 1), dwarf, hobbit, human and elf (left to right) hold rings on clicks 1 and 2 (bound to the eye tower) and phones from click 3, when a cell tower takes the eye tower's place (it falls on click 4, the mesh arrives on click 5), spread over the Shire at different depths (the dwarf, the sender, in front), each radio carried by its figure (belt, phone case, backpack, phone case; the elf carries a bow), plus a fixed router on a mast on the green hobbit hole's roof (left of the hobbit), the mesh hub: dwarf, hobbit and human all link to it, hobbit village behind.
     0 = only the Shire and the dwarf, hobbit, human and elf (arms down, no phones, no tower); 1 = tower, rings and the links to the tower fade in (no label);
     2 = tower down, links red, rings go dull;
     3 = tower ghosts, rings give way to phones, each phone gets a LoRa radio (on the phone, or over Bluetooth), the roof router appears, the radios link (dwarf, hobbit and human to the router, human to elf);
     4 = message hops dwarf → roof router → human → elf, delivered.
     The same „Здравей, OpenFest“ bubble returns in the demo (slide 35) as delivered. -->
<HookSwitch :captions="false" />


---
layout: full
---

<!-- Slide 3 · whoami. Copied verbatim from the OpenClaw reference deck (both speakers, uncut). -->
<!-- #whoami intro. Every image is vendored in public/ (photos from dojobits.io,
     badges from Credly, QR generated for https://dojobits.io/) — nothing fetched
     at render, per the wifi-safe rule. Social marks are Carbon logo icons, no
     assets. layout: full owns the whole canvas (no forced centring/padding);
     the root flex column spreads header + columns across it. Reveal order:
     only Iliyan is on screen at entry, then Valentin (1), then the DojoBits
     logo header together with the shared creds + QR (2) — clicksTotal is 2. justify-center centres
     the whole block vertically so top and bottom whitespace stay equal; the
     narrow px + wide column gap spread the three columns across the canvas. -->
<div class="h-full w-full flex flex-col justify-center gap-10 px-12">

<!-- Header is the DojoBits logo alone (no #whoami title), centred. Logo keeps its brand colour in both schemes, like on the cover. -->
<div v-click="2" class="flex justify-center">
  <img src="/dojobits-logo.png" alt="DojoBits" class="h-16" />
</div>

<div class="grid grid-cols-3 gap-16 items-center">

  <div class="flex flex-col items-center gap-3">
    <div class="text-2xl font-serif text-ink dark:text-ink">Iliyan Petkov</div>
    <img src="/speaker-iliyan.webp" alt="Iliyan Petkov" class="w-44 h-44 object-cover rounded-lg shadow-md" />
    <div class="flex flex-col gap-1.5 text-lg">
      <div class="flex items-center gap-2"><carbon-logo-linkedin class="text-water dark:text-water" /> iliyan-s-petkov</div>
      <div class="flex items-center gap-2"><carbon-logo-github /> @Iliyan-s-petkov</div>
    </div>
  </div>

  <div v-click="2" class="flex flex-col items-center gap-3">
    <!-- Diamond: kubestronaut is the top point, aws + pca splay out to the
         left/right points (the wide gap is what makes the shape), QR below is
         the bottom point. -->
    <img src="/badge-kubestronaut.png" alt="Kubestronaut" class="h-20" />
    <div class="flex items-center gap-12">
      <img src="/badge-aws-mle.png" alt="AWS Certified Machine Learning Engineer – Associate" class="h-16" />
      <img src="/badge-pca.png" alt="Prometheus Certified Associate" class="h-16" />
    </div>
    <!-- White card is scheme-independent so the QR keeps its contrast in dark mode. -->
    <div class="bg-white p-2 rounded-lg border border-gray-300">
      <img src="/qr-dojobits.svg" alt="Scan for dojobits.io" class="h-24 w-24" />
    </div>
    <a href="https://dojobits.io/" class="text-water dark:text-water underline text-2xl">https://dojobits.io</a>
  </div>

  <div v-click="1" class="flex flex-col items-center gap-3">
    <div class="text-2xl font-serif text-ink dark:text-ink">Valentin Hristev</div>
    <img src="/speaker-valentin.webp" alt="Valentin Hristev" class="w-44 h-44 object-cover rounded-lg shadow-md" />
    <div class="flex flex-col gap-2 text-lg">
      <div class="flex items-center gap-2"><carbon-logo-linkedin class="text-water dark:text-water" /> valentin-hristev</div>
      <div class="flex items-center gap-2"><carbon-logo-github /> @vhristev</div>
    </div>
  </div>

</div>
</div>


---

<!-- Slide 4 · Kanarche: the speaker's own open-source project. Screenshots of kanarche.eu
     (desktop + iPhone 13 viewport with the map tilted 50° via its Ориентация panel, light theme, 2026-10-27) vendored in public/kanarche-map.webp and -mobile.webp, QR codes from links.json:
     nothing fetched on stage. No bullets, no clicks: images left, QR right, hosting line centred at the bottom; the detail is in the notes.
     The address shows once, as the QR label. -->
# Канарче

<div class="flex h-full flex-col justify-center gap-4">
<div class="flex items-center justify-between">
  <!-- Desktop view with the tilted (3D) phone view overlapping its bottom-right corner. -->
  <div class="relative h-[340px] w-[540px]">
    <img src="/kanarche-map.webp" alt="Карта на kanarche.eu: качество на въздуха по области" class="absolute left-0 top-0 w-[450px] rounded-lg shadow-md ring-1 ring-gray-300 dark:ring-gray-600" />
    <div class="absolute bottom-0 right-0 w-[170px] overflow-hidden rounded-[1.8rem] border-[6px] border-slate-700 bg-white shadow-xl dark:border-slate-300">
      <img src="/kanarche-mobile.webp" alt="kanarche.eu на телефон, наклонена 3D карта" class="block w-full" />
    </div>
  </div>
  <!-- Project mascot (kanarche.eu/static/kanarche-mascot.svg), vendored. It perches on the QR card:
       bottom-full puts its box just above the card, and the translate pulls it down by the empty
       margin under its feet in the SVG so the feet rest on the card's top edge. -->
  <div class="relative">
    <img src="/kanarche-logo.svg" alt="Канарче" class="absolute bottom-full right-6 h-[110px] translate-y-[18px]" />
    <QRCard id="kanarche" size="xl" label="" />
  </div>
</div>
<div class="text-center text-lg opacity-80">Хостинг: Hostellation · hostellation.com</div>
</div>


---
layout: center
class: map
---

<!-- Slide 5 · Agenda as a journey map (AgendaJourney), no title: the map is centred and fills the slide.
     Four numbered question stops up to the summit flag, one click each. The whole trail is dashed
     from frame 0; each click inks the next leg solid red and lights the stop. -->
<AgendaJourney />

