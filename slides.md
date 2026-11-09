---
theme: seriph
title: 'Връзка без оператор: Meshtastic, MeshCore и Reticulum'
info: |
  OpenFest 2026: Връзка без оператор
  Meshtastic, MeshCore и Reticulum - LoRa mesh мрежи без GSM оператор.
colorSchema: auto
transition: slide-left
clickAnimation: fade-in
mdc: true
# Vendored favicon: the default is hot-linked from jsDelivr (T10, offline deck).
favicon: '/dojobits-logo.png'
# Fonts are self-hosted (setup/main.ts imports @fontsource-variable/*).
# `provider: none` stops Slidev from injecting a Google Fonts <link>; the
# family names are the ones @fontsource-variable registers.
fonts:
  provider: none
  sans: Inter Variable
  serif: Inter Variable
  mono: JetBrains Mono Variable
layout: cover
# Transparent *colour*, not an image: see CLAUDE.md (seriph cover trap).
# The artwork is applied in style.css via ::before.
background: '#00000000'
class: text-center
---

# Връзка без оператор

## Meshtastic · MeshCore · Reticulum

<div class="mt-10 flex items-center justify-center gap-4 text-xl">
  <span>Илиян Петков</span>
  <span class="opacity-30">/</span>
  <img src="/dojobits-logo.png" alt="DojoBits" class="h-8" />
</div>

<!-- OpenFest eye logo: vendored from openfest.org site icon (512px), trimmed. Brand blue in both schemes. -->
<div class="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-3 px-16 text-xl">
  <img src="/openfest-logo.png" alt="OpenFest" class="h-10" />
  <span class="font-semibold">OpenFest 2026</span>
</div>


---
src: ./pages/00-intro.md
---

---
src: ./pages/02-lora.md
stop: 1
---

---
src: ./pages/01-radio.md
stop: 2
---

---
src: ./pages/08-start.md
stop: 3
---

---
src: ./pages/12-connect.md
stop: 4
---

---
src: ./pages/03-meshtastic.md
---

---
src: ./pages/09-demo.md
---

---
src: ./pages/04-meshcore.md
---

---
src: ./pages/05-reticulum.md
---

---
src: ./pages/06-compare.md
---

---
src: ./pages/10-communities.md
---

---
src: ./pages/11-close.md
stop: 0
---

---
src: ./pages/13-qa.md
---

---
layout: end
---

<h1>Благодаря!</h1>

<div class="mt-4 flex justify-center">
  <QRCard id="repo" size="lg" />
</div>

<!-- Logo height is 1em of the row's text size, so the wordmark scales with the name. -->
<div class="mt-4 flex items-center justify-center gap-4 text-5xl leading-none">
  <span>Илиян Петков ·</span>
  <img src="/dojobits-logo.png" alt="DojoBits" class="h-[1em] w-auto" />
</div>


---
src: ./pages/components-gallery.md
hide: true
---

