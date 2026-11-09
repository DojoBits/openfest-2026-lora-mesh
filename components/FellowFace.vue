<script setup lang="ts">
// Face of a slide-2 figure (FellowFigure): eyes, brows, nose, mouth and the
// three moods, crossfading by opacity like Hobbit.vue's face.
// Drawn in head-relative units for a head of radius 15 centred on (0, 0) —
// the hobbit's face, with Hobbit.vue's numbers shifted by +104 — then
// translated to (cx, cy) and scaled by r / 15, so every head size gets the
// same expression. Landmarks (unscaled): eyes y 0 at x ±5, brows y -5,
// cheeks (±8.5, 5.5), mouth y 9..10, sweat drop and shake marks just outside
// the head (r 15), so a hood or helmet drawn after the face must stay above
// y -10 or outside x ±12 to leave the panicked brows visible.
//   nose: 'small' = the hobbit's hook; 'big' = a round dwarf nose;
//   lashes: two short strokes at each outer eye corner (the elf);
//   cheeks: rosy cheeks (off for the stubbled ranger).
withDefaults(defineProps<{
  cx: number
  cy: number
  r: number
  /** Eyes turned towards a held phone (+x), in head units. */
  look?: number
  mood?: 'neutral' | 'panic' | 'calm'
  nose?: 'small' | 'big'
  lashes?: boolean
  cheeks?: boolean
  /** Fill class of the skin (big nose), from the parent. */
  skinFill?: string
  ol?: string
}>(), { look: 0, mood: 'neutral', nose: 'small', lashes: false, cheeks: true, skinFill: '', ol: '' })
</script>

<template>
  <g class="fellow-face" :transform="`translate(${cx} ${cy}) scale(${r / 15})`" stroke-linecap="round" stroke-linejoin="round">
    <!-- eyes (and lashes): hidden while panicked, when wide eyes take over -->
    <g class="transition-opacity duration-500" :class="mood === 'panic' ? 'opacity-0' : 'opacity-100'">
      <ellipse :cx="-5 + look" cy="0" rx="1.8" ry="2.4" class="fill-slate-800 dark:fill-slate-800" />
      <ellipse :cx="5 + look" cy="0" rx="1.8" ry="2.4" class="fill-slate-800 dark:fill-slate-800" />
      <path v-if="lashes" :d="`M${-6.6 + look} -1.6 l-2.2 -1.4 M${-6.9 + look} 0 l-2.4 -0.2 M${6.6 + look} -1.6 l2.2 -1.4 M${6.9 + look} 0 l2.4 -0.2`" class="stroke-slate-800 dark:stroke-slate-800" stroke-width="1.1" fill="none" />
    </g>
    <g v-if="cheeks">
      <circle cx="-8.5" cy="5.5" r="2.6" class="fill-rose-300 dark:fill-rose-300" style="fill-opacity: 0.7" />
      <circle cx="8.5" cy="5.5" r="2.6" class="fill-rose-300 dark:fill-rose-300" style="fill-opacity: 0.7" />
    </g>
    <!-- nose: small hook (hidden while panicked, like the hobbit's) or a big round one -->
    <path v-if="nose === 'small'" :d="`M${0.5 + look / 2} 2.5 q2.2 1.6 0 3.2`" class="stroke-slate-700 transition-opacity duration-500 dark:stroke-slate-700" :class="mood === 'panic' ? 'opacity-0' : 'opacity-100'" stroke-width="1.4" fill="none" />
    <ellipse v-else :cx="1 + look / 2" cy="3.6" rx="3.6" ry="3.2" :class="[skinFill, ol]" stroke-width="1.6" />
    <!-- neutral: level brows, small smile -->
    <g class="transition-opacity duration-500" :class="mood === 'neutral' ? 'opacity-100' : 'opacity-0'">
      <path :d="`M${-7.5 + look} -5 q2 -1.6 4 0 M${3.5 + look} -5 q2 -1.6 4 0`" class="stroke-slate-700 dark:stroke-slate-700" stroke-width="1.4" fill="none" />
      <path d="M-4 9 Q0 12.5 4 9" class="stroke-slate-800 dark:stroke-slate-800" stroke-width="1.8" fill="none" />
    </g>
    <!-- calm: one brow raised, a wider knowing smile -->
    <g class="transition-opacity duration-500" :class="mood === 'calm' ? 'opacity-100' : 'opacity-0'">
      <path :d="`M${-7.5 + look} -5 q2 -1.6 4 0 M${3.5 + look} -8 q3 -2.6 6 0`" class="stroke-slate-700 dark:stroke-slate-700" stroke-width="1.6" fill="none" />
      <path d="M-5.5 8.5 Q0 14 6 7.5" class="stroke-slate-800 dark:stroke-slate-800" stroke-width="2" fill="none" />
    </g>
    <!-- panicked: slanted worried brows, wide eyes with small pupils, open mouth, sweat drop, shake marks -->
    <g class="fellow-panic transition-opacity duration-500" :class="mood === 'panic' ? 'opacity-100' : 'opacity-0'">
      <path d="M-10.5 -4.5 L-3.5 -9 M3.5 -9 L10.5 -4.5" class="stroke-slate-800 dark:stroke-slate-800" stroke-width="2.4" fill="none" />
      <circle cx="-5.5" cy="0" r="4.2" class="fill-white stroke-slate-800 dark:fill-white dark:stroke-slate-800" stroke-width="1.4" />
      <circle cx="5.5" cy="0" r="4.2" class="fill-white stroke-slate-800 dark:fill-white dark:stroke-slate-800" stroke-width="1.4" />
      <circle :cx="-5.5 + look" cy="0" r="1.4" class="fill-slate-900 dark:fill-slate-900" />
      <circle :cx="5.5 + look" cy="0" r="1.4" class="fill-slate-900 dark:fill-slate-900" />
      <ellipse cx="0" cy="10" rx="3.4" ry="4.4" class="fill-slate-800 dark:fill-slate-800" />
      <path d="M17 -18 Q25 -4 17 1 Q9 -4 17 -18 Z" class="fill-sky-300 stroke-sky-600 dark:fill-sky-300 dark:stroke-sky-500" stroke-width="1.6" />
      <path d="M-19 -20 l-6 -6 M-22 -8 l-8 -2 M24 -22 l5 -6" class="stroke-slate-700 dark:stroke-slate-300" stroke-width="2" fill="none" />
    </g>
  </g>
</template>
