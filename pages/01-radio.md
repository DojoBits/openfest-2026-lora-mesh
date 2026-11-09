---
layout: section
---

<!-- Slide 10 · Section radio (water, carbon-radio), titled with its stop-2 question. -->
<SectionHero section="radio">

# Как работи?

</SectionHero>


---

# Електромагнитният спектър

<!-- Slide 11. EmSpectrum: the whole spectrum as one arrow, not to scale. It registers 8 clicks (7 bands long to short, then the LoRa mark). SpectrumRuler stays in the gallery. -->
<div class="mx-auto mt-8 w-[900px]"><EmSpectrum /></div>


---

# AM, FM и FSK

<!-- Slide 12. ModulationWaves: how a radio wave carries information, before the chirp. Three rows (message, carrier, result), 5 clicks: message, carrier, AM, FM, FSK. AM / FM / FSK buttons switch the result live, a cursor links the message to the result. Waves and click plan: components/data/modulation.ts. -->
<div class="mx-auto w-[900px]"><ModulationWaves /></div>


---

# Chirp модулация

<!-- Slide 13. ChirpSpread: frequency over time (LoRa spectrogram), 5 clicks (up-chirp ramps plus an inset with the first ramp as a time-domain wave, grey speckle noise over them, a dashed template with the same slope lands and the ramps light up, a toy SF2 with 4 start frequencies for the bits 00 01 10 11, SF7 vs SF12 to true scale with bandwidth, bits per chirp, symbol time and sweep rate), small ambulance icon for the siren analogy on clicks 1 to 3. Numbers and geometry: components/data/chirpSignal.ts. ChirpWave and NoiseFloor stay in the gallery. -->
<div class="mx-auto mt-2 w-[900px]"><ChirpSpread /></div>

<!-- Sources:
  Semtech SX1276/77/78/79 datasheet, Table 13 „Range of Spreading Factors“: LoRa demodulator SNR SF7 −7,5 dB, SF8 −10, SF9 −12,5, SF10 −15, SF11 −17,5, SF12 −20 dB.
  Semtech AN1200.22 „LoRa Modulation Basics“: chirp spread spectrum, symbol time 2^SF / BW (125 kHz: SF7 1,024 ms, SF12 32,768 ms), data = cyclic shift of the chirp, SF bits per symbol, sweep rate BW / symbol time (SF7 122 kHz/ms, SF12 3,8 kHz/ms), bit rate SF · BW / 2^SF · CR (CR 4/5: SF7 5469 bit/s, SF12 293 bit/s). -->


---
hide: true
---

# На 1 MHz от телефона ви

<!-- Hidden slide · CUT candidate. BandStrip preset=lte; 1 click for the 1 MHz gap bracket. -->
<div class="mx-auto w-full"><BandStrip preset="lte" /></div>


---

# Какво са dB, dBm и dBi

<!-- Slide 14. DecibelLight: 3 clicks (dB, dBm, dBi), light bulb analogy. -->

<div class="mx-auto w-full"><DecibelLight /></div>


---

# Какви антени ползваме

<!-- Slide 15. AntennaTypes: 4 clicks, one antenna type each (whip, PCB, DIY ground plane, rooftop omni), real photos with their radiation pattern pulsing behind. Quarter-wave lengths for other bands: AntennaScale, gallery only. -->
<div class="mx-auto mt-6 w-[900px]"><AntennaTypes /></div>


---

# Честота, обхват и мощност

<!-- Slide 16. ReachBars, one baseline = 868 MHz: click 1 = 868 MHz arrow (1×) with a 1× power bulb, click 2 = 2,4 GHz arrow (0,36×, bulb 8×), click 3 = 433 MHz arrow (2×, bulb ¼×), click 4 = European limit tag beside each bulb (до 100 / 500 / 10 mW), 868 highlighted, the others dim. Rows stay by frequency (2,4 / 868 / 433). A wave per radio shows the frequency. No caption text: it is all in the notes. Limits: 500 mW is e.r.p. in 869,4–869,65 MHz; 2,4 GHz 100 mW is e.i.r.p. -->
<div class="mx-auto w-[900px]"><ReachBars /></div>


---

# Защо в Европа ползваме 868 MHz

<!-- Slide 17. Why868: 2×2 cards, one per click (power, 433 occupancy, antenna, compatibility). Numbers: components/data/why868Facts.ts. -->
<div class="mx-auto w-[900px]"><Why868 /></div>

<!-- Sources (not re-fetched for this slide; same numbers as slides 14, 15 and 17, research/T1 and T2):
  CEPT ERC Recommendation 70-03, Annex 1 (non-specific SRD): 433,05–434,79 MHz 10 mW e.r.p.; 869,4–869,65 MHz 500 mW e.r.p., 10 % duty cycle; 25 mW in most of 863–870 MHz.
  IARU Region 1 VHF/UHF band plan: 70 cm amateur band 430–440 MHz.
  LoRa Alliance RP002 Regional Parameters: EU863-870.
  Meshtastic region docs: EU_868 (default 869,525 MHz), EU_433.
  MeshCore EU presets: EU/UK Narrow 869,618 MHz (companion-v1.18.0). -->


---

# Различни ленти по света

<!-- Slide 18. BandWorldMap: click 1 Europe, 2 Americas + Pacific, 3 Asia, 4 2,4 GHz (LORA_24). -->
<div class="mx-auto w-[880px]"><BandWorldMap /></div>


---

# Обхват според терена

<!-- Slide 19 · CUT candidate (kept visible). RangeZones, a map scene (not to scale): beacon tower with a router a third in from the left, town to its left, forest and open land to its right. Click 1 = town dome, click 2 = forest dome, click 3 = open-land dome to the far hills, click 4 = dashed arrow off the edge and a parchment tag with the records. -->
<div class="mx-auto w-[860px]"><RangeZones /></div>


---
layout: center
title: Пряка видимост и препятствия
---

<!-- Slide 20. LineOfSight, a Middle-earth map scene: town left (stone watchtower, inn, map tree), bare hill middle (ruin, beacon tower), farm right (pond, wooden solar pole, smial, crop field, barn). Click 1 = in hand: LoRa needs no line of sight, the wizard (town, by the tower) reaches a client inside the inn through its wall (drawn weaker past the wall); wizard to hobbit (farm, by the smial) passes the town and is cut by the hill; click 2 = antenna on the watchtower and solar pole, blocked by the hill; click 3 = router on the beacon tower: watchtower, pole and a dwarf on the path reach it; click 4 = mesh: watchtower and pole become Routers; wizard and the inn client also use the watchtower; hobbit, raft and the gateway on the smial chimney use the pole; field sensors, barn sensors and dog collar report to the gateway; the dragon over the farm carries a node that reaches the pole. -->

<div class="mx-auto w-[900px]"><LineOfSight /></div>


---
hide: true
---

# Видимостта е наденица, не лъч

<!-- Hidden slide · CUT candidate. FresnelZone: click 1 = obstacles, click 2 = masts raised. -->
<div class="mx-auto w-[860px]"><FresnelZone /></div>

