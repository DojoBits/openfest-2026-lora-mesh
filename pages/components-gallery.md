---
layout: default
---

<!-- Components gallery (T5). Hidden in slides.md; served alone by
     `npm run gallery`. Every component is click-driven here (no `step`
     prop), so /N?clicks=K walks each one exactly as a real slide would. -->

<div class="text-lg opacity-60">gallery · PhoneStatus (lg, caption@1, board@2) + corner/delivered</div>
<div class="flex items-center justify-around">
  <PhoneStatus caption="Няма покритие." :caption-at="1" :board-at="2" />
  <PhoneStatus size="corner" state="delivered" :step="0" />
</div>


---

<div class="text-lg opacity-60">gallery · AgendaJourney (4 clicks: each click inks the next leg and lights the stop)</div>
<AgendaJourney />


---

<div class="text-lg opacity-60">gallery · HookSwitch (4 clicks: tower, tower down, LoRa mesh, message) + PhoneStatus md/lora</div>
<HookSwitch />


---

<div class="text-lg opacity-60">gallery · LinkChain end=phone / end=laptop + caption</div>
<div class="mx-auto flex w-[760px] flex-col gap-6">
  <LinkChain />
  <LinkChain end="laptop" caption="Bluetooth до радиото, LoRa между радиата" />
</div>


---

<div class="text-lg opacity-60">gallery · SpectrumRuler</div>
<div class="mx-auto w-[820px]"><SpectrumRuler /></div>

---

<div class="text-lg opacity-60">gallery · EmSpectrum</div>
<div class="mx-auto w-[900px]"><EmSpectrum :step="8" /></div>

---

<div class="text-lg opacity-60">gallery · BandStrip preset=eu868</div>
<BandStrip preset="eu868" />

---

<div class="text-lg opacity-60">gallery · BandStrip preset=lte</div>
<BandStrip preset="lte" />

---

<div class="text-lg opacity-60">gallery · AntennaTypes</div>
<div class="mx-auto w-[900px]"><AntennaTypes :step="4" /></div>

---

<div class="text-lg opacity-60">gallery · AntennaScale</div>
<div class="mx-auto w-[820px]"><AntennaScale /></div>

---

<div class="text-lg opacity-60">gallery · ReachBars</div>
<div class="mx-auto w-[860px]"><ReachBars :step="4" /></div>

---

<div class="text-lg opacity-60">gallery · Why868 (4 clicks: power, 433 occupancy, antenna, compatibility)</div>
<div class="mx-auto w-[900px]"><Why868 :step="4" /></div>

---

<div class="text-lg opacity-60">gallery · BandWorldMap</div>
<div class="mx-auto w-[880px]"><BandWorldMap :step="4" /></div>

---

<div class="text-lg opacity-60">gallery · DbLadder</div>
<div class="mx-auto w-[820px]"><DbLadder /></div>

---

<div class="text-lg opacity-60">gallery · DecibelLight</div>
<div class="mx-auto w-full"><DecibelLight :step="3" /></div>

---

<div class="text-lg opacity-60">gallery · HorizonCurve</div>
<div class="mx-auto w-[860px]"><HorizonCurve /></div>

---

<div class="text-lg opacity-60">gallery · LineOfSight</div>
<div class="mx-auto w-[900px]"><LineOfSight :step="3" /></div>

---

<div class="text-lg opacity-60">gallery · FresnelZone</div>
<div class="mx-auto w-[860px]"><FresnelZone /></div>

---

<div class="text-lg opacity-60">gallery · ScaleBars (no longer on a slide)</div>
<ScaleBars />

---

<div class="text-lg opacity-60">gallery · RangeZones (slide 18, 4 clicks: town, forest, open land, records)</div>
<div class="mx-auto w-[860px]"><RangeZones :step="4" /></div>

---

<div class="text-lg opacity-60">gallery · FirstPowerBoard (slide 23, 4 clicks: antenna, 868, battery, firmware + region)</div>
<div class="mx-auto w-[820px]"><FirstPowerBoard :step="4" /></div>

---

<div class="text-lg opacity-60">gallery · BatteryVoltages (slide 24, 4 clicks: Li-ion, LiFePO4, 2S, solar card)</div>
<div class="mx-auto w-[820px]"><BatteryVoltages :step="4" /></div>

---

<div class="text-lg opacity-60">gallery · ModulationWaves (message, carrier and result, 5 clicks: message, carrier, AM, FM, FSK, buttons switch the result)</div>
<div class="mx-auto w-[900px]"><ModulationWaves :step="5" /></div>

---

<div class="text-lg opacity-60">gallery · ChirpSpread (frequency over time, 5 clicks: up-chirps, noise, the template matches, SF2 bits, SF7 vs SF12)</div>
<div class="mx-auto w-[900px]"><ChirpSpread :step="5" /></div>

---

<div class="text-lg opacity-60">gallery · ChirpWave</div>
<div class="mx-auto w-[820px]"><ChirpWave /></div>

---

<div class="text-lg opacity-60">gallery · NoiseFloor</div>
<div class="mx-auto w-[820px]"><NoiseFloor /></div>

---

<div class="text-lg opacity-60">gallery · AirtimeBars variant=sf</div>
<AirtimeBars variant="sf" />

---

<div class="text-lg opacity-60">gallery · AirtimeBars variant=sms (static)</div>
<div class="mx-auto w-[600px]"><AirtimeBars variant="sms" /></div>

---

<div class="text-lg opacity-60">gallery · MeshMap mode=static</div>
<div class="mx-auto w-[760px]"><MeshMap mode="static" /></div>

---

<div class="text-lg opacity-60">gallery · MeshMap mode=meshtastic</div>
<div class="mx-auto w-[760px]"><MeshMap mode="meshtastic" /></div>

---

<div class="text-lg opacity-60">gallery · MeshMap mode=meshcore</div>
<div class="mx-auto w-[760px]"><MeshMap mode="meshcore" /></div>

---

<div class="text-lg opacity-60">gallery · MeshMap mode=transport</div>
<div class="mx-auto w-[760px]"><MeshMap mode="transport" /></div>

---

<div class="text-lg opacity-60">gallery · MeshMap mode=trace</div>
<div class="mx-auto w-[760px]"><MeshMap mode="trace" /></div>

---

<div class="text-lg opacity-60">gallery · MeshMap mode=mini ×3</div>
<div class="grid grid-cols-3 gap-4">
  <MeshMap mode="mini" project="meshtastic" />
  <MeshMap mode="mini" project="meshcore" />
  <MeshMap mode="mini" project="reticulum" />
</div>

---

<div class="text-lg opacity-60">gallery · PacketAnatomy variant=meshtastic</div>
<PacketAnatomy variant="meshtastic" />

---

<div class="text-lg opacity-60">gallery · PacketAnatomy variant=rns</div>
<PacketAnatomy variant="rns" />

---

<div class="text-lg opacity-60">gallery · ReticulumStack</div>
<ReticulumStack />

---

<div class="text-lg opacity-60">gallery · DemoRig variant=demo</div>
<DemoRig />

---

<div class="text-lg opacity-60">gallery · RNodeModem (all clicks)</div>
<div class="mx-auto w-[860px]"><RNodeModem :step="3" /></div>

---

<div class="text-lg opacity-60">gallery · ComparisonGrid mode=license</div>
<ComparisonGrid mode="license" />

---

<div class="text-lg opacity-60">gallery · ComparisonGrid mode=proscons</div>
<ComparisonGrid mode="proscons" />

---

<div class="text-lg opacity-60">gallery · IconCard ×4 (v-click on each) + Badge tones</div>
<div>
<div class="grid grid-cols-2 gap-4">
  <IconCard v-click icon="flood-warning" title="Бедствия: когато мрежата падне" tag="международен пример" />
  <IconCard v-click icon="mountain" title="Походи и фестивали" body="групата без обхват" tag="международен пример" />
  <IconCard v-click icon="warning-alt" tone="red" title="Антената — преди захранването" />
  <IconCard v-click icon="battery-full" tone="emerald" title="Батерия: проверете + и −" />
</div>
<div class="mt-3 flex justify-center gap-2">
  <Badge text="red" tone="red" /><Badge text="amber" tone="amber" /><Badge text="emerald" tone="emerald" /><Badge text="blue" tone="blue" /><Badge text="илюстративно" />
</div>
</div>

---

<div class="text-lg opacity-60">gallery · BoardCard ×4</div>
<div class="grid grid-cols-2 gap-4">
  <BoardCard v-click id="heltec-v4" />
  <BoardCard v-click id="xiao-s3" />
  <BoardCard v-click id="heltec-t114" />
  <BoardCard v-click id="rak4631" />
</div>

---

<div class="text-lg opacity-60">gallery · StepFlow</div>
<StepFlow />

---

<div class="text-lg opacity-60">gallery · BgMap + QRCard sm</div>
<div class="flex items-end gap-6">
  <BgMap class="w-[640px]" />
  <QRCard id="meshcore-bg" size="sm" />
</div>

---

<div class="text-lg opacity-60">gallery · QRCard (all links)</div>
<div class="flex flex-wrap justify-center gap-8">
  <QRCard id="repo" size="sm" />
  <QRCard id="meshcore-bg" size="sm" />
  <QRCard id="varna" size="sm" />
  <QRCard id="meshmap" size="sm" />
  <QRCard id="reticulum" size="sm" />
  <QRCard id="meshtastic-fb" size="sm" />
</div>
