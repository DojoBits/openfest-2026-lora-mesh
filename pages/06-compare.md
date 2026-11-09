# <carbon-compare class="inline text-ink dark:text-ink" /> Една карта, три отговора

<div>
<div class="grid grid-cols-3 gap-5">
  <div v-click class="card-surface rounded-xl border px-4 py-3">
    <div class="flex h-[4.5rem] items-center justify-center text-center text-2xl font-bold leading-tight text-verdigris dark:text-verdigris">Meshtastic: всеки</div>
    <div class="mx-auto w-[80%]"><MeshMap mode="mini" project="meshtastic" /></div>
  </div>
  <div v-click class="card-surface rounded-xl border px-4 py-3">
    <div class="flex h-[4.5rem] items-center justify-center text-center text-2xl font-bold leading-tight text-dusk dark:text-dusk">MeshCore: repeater-ите</div>
    <div class="mx-auto w-[80%]"><MeshMap mode="mini" project="meshcore" /></div>
  </div>
  <div v-click class="card-surface rounded-xl border px-4 py-3">
    <div class="flex h-[4.5rem] items-center justify-center text-center text-2xl font-bold leading-tight text-wine dark:text-wine">Reticulum: транспортни възли</div>
    <div class="mx-auto w-[80%]"><MeshMap mode="mini" project="reticulum" /></div>
  </div>
</div>
<div v-click="1" class="mt-2 text-center text-lg text-stone-deep dark:text-stone-deep">Брой предавания за едно съобщение</div>
<div class="mt-3 flex items-center justify-center gap-4">
  <div v-click class="text-2xl font-semibold text-moss dark:text-moss">Научен път струва еднакво. Разликата е в откриването.</div>
</div>
</div>


---

# Лицензи

<ComparisonGrid mode="license" />


---

# Кое да избера?

<ComparisonGrid mode="proscons" />


---

# Къде пасва всеки

<UseCaseGrid />


---

# <carbon-warning-alt class="inline text-ink dark:text-ink" /> Ограничения

<LimitsPanel />

