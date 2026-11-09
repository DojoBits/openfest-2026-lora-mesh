<script setup lang="ts">
// A link as a QR tile + printed short URL. URLs live in data/links.json;
// `npm run qr` (also run before dev/build) renders qr/<id>.svg from it, and
// the SVG is inlined here at build time — nothing is fetched on stage.
import { computed } from 'vue'
import { link, shortUrl } from './data/links'

const props = withDefaults(defineProps<{
  id: string
  /** Override the label from links.json. */
  label?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}>(), { size: 'md' })

const dev = import.meta.env.DEV
const svgs = import.meta.glob<string>('../qr/*.svg', { query: '?raw', import: 'default', eager: true })

const l = computed(() => link(props.id))
const svg = computed(() => svgs[`../qr/${props.id}.svg`] ?? '')
const box = computed(() => ({ sm: 'w-28 h-28', md: 'w-40 h-40', lg: 'w-56 h-56', xl: 'w-64 h-64' })[props.size])
// Text column is bound to the QR tile width plus slack, so long URLs wrap
// (break-all) instead of pushing the card wider than its parent.
// xl is for a QR that must be scanned and a URL read from the back of a hall:
// 256px tile and a large, near-opaque URL. Other sizes keep their look.
const urlCls = computed(() => (props.size === 'xl' ? 'text-3xl font-semibold opacity-90' : 'text-lg opacity-75'))
const textW = computed(() => ({ sm: 'max-w-[220px]', md: 'max-w-[260px]', lg: 'max-w-[330px]', xl: 'max-w-[340px]' })[props.size])
// Printed URL. A URL with a path (e.g. liamcottle.github.io/rnode-flasher) is
// split into segments, each keeping its trailing "/" and held nowrap, with a
// <wbr> between them. <wbr> is a break opportunity, so the line can only break
// after a "/" and never mid-word ("rnode-fla / sher"). Slash-free URLs keep
// the old break-all behaviour, so the other QR cards render as before.
const urlText = computed(() => shortUrl(l.value.url))
const hasPath = computed(() => urlText.value.includes('/'))
const urlSegments = computed(() => {
  const parts = urlText.value.split('/')
  return parts.map((p, i) => (i < parts.length - 1 ? `${p}/` : p))
})
</script>

<template>
  <div class="lora-viz inline-flex max-w-full flex-col items-center gap-2">
    <!-- QR stays black-on-white in both schemes: phones need the contrast -->
    <div class="rounded-lg bg-page p-1 shadow-sm ring-1 ring-earth/50 dark:ring-stone [&>svg]:h-full [&>svg]:w-full" :class="box" v-html="svg" />
    <div class="w-full text-center text-lg font-semibold leading-tight" :class="textW">{{ label ?? l.label }}</div>
    <div class="w-full text-center font-mono leading-tight" :class="[textW, urlCls, hasPath ? '' : 'break-all']">
      <template v-if="hasPath">
        <template v-for="(seg, i) in urlSegments" :key="i"><wbr v-if="i > 0" /><span class="whitespace-nowrap">{{ seg }}</span></template>
      </template>
      <template v-else>{{ urlText }}</template>
    </div>
    <span v-if="l.verify && dev" class="rounded-full border border-gold/50 bg-gold/10 px-2 text-lg text-gold-deep dark:border-gold/40 dark:bg-gold/10 dark:text-gold-deep">провери</span>
  </div>
</template>
