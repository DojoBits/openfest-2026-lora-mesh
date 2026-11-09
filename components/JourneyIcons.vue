<script setup lang="ts">
// Small inked illustrations for the four stop medallions of the slide-5
// journey map, in the same sepia map-ink language as MapGlyphs.vue.
//   scroll   - „Какво е LoRa?“     an unrolled parchment with a radio tower sketch
//   beacon   - „Как работи?“  a lit beacon fire on a hill, radio arcs out
//   signpost - „Как да се свържем?“  a crossroads post with three blank boards
//   wizard   - „Как да започна?“   a grey wanderer before a round door in a hill
// Geometry is authored in a 64x64 box centred on (32, 32). The medallion is
// round, so every shape (stroke included) stays within r = 0.42 * 64 = 26.9 of
// the centre; the extreme points are noted next to each outline.
// Class names are literal (UnoCSS extracts from source text) and each colour
// has a dark: pair; stroke widths live in `style` (attributify trap).
const props = withDefaults(defineProps<{
  kind: 'scroll' | 'beacon' | 'wizard' | 'signpost'
  size?: number
}>(), { size: 64 })

// Radio arcs around a point: an arc of radius r spanning +-35 deg either side
// of horizontal, opening to the right (dir 1) or left (dir -1).
function arc(cx: number, cy: number, r: number, dir: 1 | -1): string {
  const a = (35 * Math.PI) / 180
  const x = cx + dir * r * Math.cos(a)
  const y1 = cy - r * Math.sin(a)
  const y2 = cy + r * Math.sin(a)
  // sweep flag: clockwise when opening right (top -> bottom on the right side)
  const sweep = dir === 1 ? 1 : 0
  return `M${x.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 0 ${sweep} ${x.toFixed(1)} ${y2.toFixed(1)}`
}

// Beacon waves centred on the flame's heart (32, 29), three rings per side;
// the outer ring's ends sit at (50, 16.4) / (50, 41.6), 22.6 from the centre.
const beaconWaves = [11, 16.5, 22].flatMap(r => [arc(32, 29, r, 1), arc(32, 29, r, -1)])
// Tiny waves off the scroll's tower tip (32, 24), two rings per side.
const towerWaves = [3.5, 6.5].flatMap(r => [arc(32, 24, r, 1), arc(32, 24, r, -1)])
</script>

<template>
  <svg
    :width="props.size" :height="props.size" viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
    style="stroke-linecap: round; stroke-linejoin: round"
  >
    <!-- 1. scroll: parchment sheet between two rolled ends, a lattice radio
         tower sketched on it with a couple of wave arcs off its tip -->
    <g v-if="kind === 'scroll'">
      <!-- sheet: x 18..46, hidden top/bottom edges under the rolls -->
      <rect
        x="18" y="17" width="28" height="30"
        class="fill-[#f0e1bb] stroke-[#4a3520] dark:fill-[#34271a] dark:stroke-[#e8d5b0]"
        style="stroke-width: 2"
      />
      <!-- rolls: x 15..49; outer corners (15, 13) / (15, 51) are 24.7 from centre -->
      <g class="fill-[#e2cc98] stroke-[#4a3520] dark:fill-[#4a3824] dark:stroke-[#e8d5b0]" style="stroke-width: 2">
        <rect x="15" y="13" width="34" height="6" rx="3" />
        <rect x="15" y="45" width="34" height="6" rx="3" />
      </g>
      <!-- roll ends: a short curl line inside each end shows the paper is wound -->
      <path
        d="M18 14.5 V17.5 M46 14.5 V17.5 M18 46.5 V49.5 M46 46.5 V49.5"
        class="stroke-[#4a3520] dark:stroke-[#e8d5b0]" fill="none" style="stroke-width: 1.2"
      />
      <!-- tower: an A-frame from (27, 41) / (37, 41) to the tip (32, 24), two cross-braces -->
      <path
        d="M27 41 L32 24 L37 41 M28.8 35 H35.2 M30.3 29.5 H33.7 M28.8 35 L33.7 29.5 M35.2 35 L30.3 29.5"
        class="stroke-[#4a3520] dark:stroke-[#e8d5b0]" fill="none" style="stroke-width: 1.6"
      />
      <path
        v-for="w in towerWaves" :key="w" :d="w"
        class="stroke-[#8b1e1e] dark:stroke-[#d9534f]" fill="none" style="stroke-width: 1.4"
      />
      <!-- ink lines of writing under the sketch -->
      <path
        d="M22 43 H42 M22 20.5 H27 M37 20.5 H42"
        class="stroke-[#4a3520] dark:stroke-[#e8d5b0]" fill="none" style="stroke-width: 1.1; opacity: 0.7"
      />
    </g>

    <!-- 2. beacon: a fire on a hilltop woodpile, radio arcs spreading from it -->
    <g v-else-if="kind === 'beacon'">
      <!-- hill: base (13, 50)..(51, 50), 25.6 from centre at the corners -->
      <path
        d="M13 50 C19 39, 45 39, 51 50 Z"
        class="fill-[#f0e1bb] stroke-[#4a3520] dark:fill-[#34271a] dark:stroke-[#e8d5b0]"
        style="stroke-width: 2"
      />
      <!-- shadow hatching on the right flank, as on the map's hills -->
      <path
        d="M40 44 L42 48.5 M44 45 L45.6 48.5 M36 43 L38 48.5"
        class="stroke-[#4a3520] dark:stroke-[#e8d5b0]" fill="none" style="stroke-width: 1.1"
      />
      <path
        v-for="w in beaconWaves" :key="w" :d="w"
        class="beacon-wave stroke-[#8b1e1e] dark:stroke-[#d9534f]" fill="none" style="stroke-width: 1.6"
      />
      <!-- woodpile: crossed logs on the crest -->
      <path
        d="M26.5 43.5 L37.5 37.5 M37.5 43.5 L26.5 37.5 M27 41 H37"
        class="stroke-[#4a3520] dark:stroke-[#e8d5b0]" fill="none" style="stroke-width: 2"
      />
      <!-- flame: an outer red teardrop tip at (32, 15), a smaller orange core -->
      <path
        class="beacon-flame fill-[#c0392b] stroke-[#4a3520] dark:fill-[#d9534f] dark:stroke-[#e8d5b0]"
        d="M32 15 C34 21, 39 25, 38.5 32 C38 37, 35 39.5, 32 39.5 C29 39.5, 25.5 37, 25.5 32.5 C25.5 28, 28 26, 29 22.5 C30 25, 30.5 26, 31.5 26.5 C31 22, 31 18.5, 32 15 Z"
        style="stroke-width: 1.6"
      />
      <path
        class="fill-[#f0a030] dark:fill-[#e8a640]"
        d="M32 26 C33.5 30, 35.5 32, 35 35 C34.6 37.4, 33.4 38, 32 38 C30.4 38, 29 37, 29 35 C29 32.5, 31 31, 32 26 Z"
      />
    </g>

    <!-- 3. signpost: a crossroads post on a small mound, three blank arrow boards -->
    <g v-else-if="kind === 'signpost'">
      <!-- mound: base (17, 51)..(47, 51), 24.2 from centre at the corners -->
      <path
        d="M17 51 C22 43, 42 43, 47 51 Z"
        class="fill-[#f0e1bb] stroke-[#4a3520] dark:fill-[#34271a] dark:stroke-[#e8d5b0]"
        style="stroke-width: 2"
      />
      <!-- post: x 30.2..33.8, from the cap at y 10 (22 from centre) into the mound -->
      <path
        d="M30.2 47 V11 L32 9.8 L33.8 11 V47"
        class="fill-[#b08a5a] stroke-[#4a3520] dark:fill-[#6e5434] dark:stroke-[#e8d5b0]"
        style="stroke-width: 2"
      />
      <!-- boards: each an arrow-shaped plank, slightly askew like a real
           crossroads post. Tips: (50, 16.5) 23.2, (14, 26) 19.0, (48, 37) 16.8. -->
      <g class="stroke-[#4a3520] dark:stroke-[#e8d5b0]" style="stroke-width: 1.8">
        <path class="sign-board fill-[#d4b07a] dark:fill-[#5a4429]" d="M29 13.5 H46 L50 16.5 L46 19.5 H29 Z" transform="rotate(-7 32 16.5)" />
        <path class="sign-board fill-[#d4b07a] dark:fill-[#5a4429]" d="M35 23 H18 L14 26 L18 29 H35 Z" transform="rotate(4 32 26)" />
        <path class="sign-board fill-[#d4b07a] dark:fill-[#5a4429]" d="M29 34 H44 L48 37 L44 40 H29 Z" transform="rotate(11 32 37)" />
      </g>
      <!-- ink scratches on the boards (no letters), each rotated with its board -->
      <g class="stroke-[#4a3520] dark:stroke-[#e8d5b0]" fill="none" style="stroke-width: 1; opacity: 0.75">
        <path d="M36 16.5 H43" transform="rotate(-7 32 16.5)" />
        <path d="M20 26 H28" transform="rotate(4 32 26)" />
        <path d="M36 37 H42" transform="rotate(11 32 37)" />
      </g>
      <!-- grass tufts on the mound -->
      <path
        d="M22 48 L21 46 M23 48 L23.5 45.8 M41 48 L40.5 45.8 M42 48 L43 46"
        class="stroke-[#4a3520] dark:stroke-[#e8d5b0]" fill="none" style="stroke-width: 1.1"
      />
    </g>

    <!-- 4. wizard: a grey wanderer with a tall pointed hat, beard and staff,
         standing before a round green door dug into a grassy hill -->
    <g v-else-if="kind === 'wizard'">
      <!-- hillside over a ground line y 46, x 13..53 (corners 25.2 from centre):
           it rises gently from the left to a crest near (40, 16.5) above the
           door, then drops steeply on the right, so the door sits deep in it -->
      <path
        d="M13 46 C16 28, 28 17, 40 16.5 C49 16.5, 53 28, 53 46 Z"
        class="fill-[#c3c48a] stroke-[#4a3520] dark:fill-[#2f3720] dark:stroke-[#e8d5b0]"
        style="stroke-width: 2"
      />
      <!-- grass tufts along the hill's back -->
      <path
        d="M45 19.5 L44.4 17.2 M46.6 20.4 L47.8 18.4 M31 20.3 L30.5 18 M32.5 19.6 L33.4 17.5 M39 18.5 L39.4 16.6"
        class="stroke-[#4a3520] dark:stroke-[#e8d5b0]" fill="none" style="stroke-width: 1.1"
      />
      <!-- door: stone ring r 10.5 and green door r 8.4, centred (41, 35.5) so
           the ring's foot rests on the ground line; right edge 51.5 -->
      <g class="hobbit-door">
        <circle
          cx="41" cy="35.5" r="10.5"
          class="fill-[#e2cc98] stroke-[#4a3520] dark:fill-[#4a3824] dark:stroke-[#e8d5b0]"
          style="stroke-width: 1.6"
        />
        <circle
          cx="41" cy="35.5" r="8.4"
          class="fill-[#5f7a3a] stroke-[#4a3520] dark:fill-[#6f8545] dark:stroke-[#e8d5b0]"
          style="stroke-width: 1.6"
        />
        <!-- planks: vertical chords of the door circle, 4 apart; a chord at
             dx 4 from the centre spans +-7.4, trimmed to stay inside the rim -->
        <path
          d="M37 29 V42 M41 28 V43 M45 29 V42"
          class="stroke-[#4a3520] dark:stroke-[#e8d5b0]" fill="none" style="stroke-width: 0.8; opacity: 0.6"
        />
        <!-- brass knob in the very middle, as on a hobbit door -->
        <circle
          cx="41" cy="35.5" r="1.8"
          class="fill-[#e0b23c] stroke-[#4a3520] dark:fill-[#c9962b] dark:stroke-[#e8d5b0]"
          style="stroke-width: 0.8"
        />
      </g>

      <!-- staff: x 13.5 from the crook at y 15 down to the ground; crook (13.5, 15)
           is 24.5 from centre, foot (13.5, 47) 23.8 -->
      <path
        class="wizard-staff stroke-[#4a3520] dark:stroke-[#e8d5b0]"
        d="M13.5 47 V18 C13.5 15, 16.5 14.5, 17 17"
        fill="none" style="stroke-width: 2.2"
      />
      <!-- cloak: shoulders (18, 25)..(26, 25) flaring to a hem 14..31 on the ground -->
      <path
        d="M18.5 24.5 C17 32, 15 40, 14 46 H31 C30 40, 28 32, 26 24.5 Z"
        class="fill-[#8c877d] stroke-[#4a3520] dark:fill-[#5e594f] dark:stroke-[#e8d5b0]"
        style="stroke-width: 1.8"
      />
      <!-- sleeve and hand reaching to the staff -->
      <path
        d="M19 27 C17 29, 15.5 30.5, 14.5 31"
        class="stroke-[#4a3520] dark:stroke-[#e8d5b0]" fill="none" style="stroke-width: 1.6"
      />
      <circle
        cx="13.8" cy="31" r="1.6"
        class="fill-[#e8c9a0] stroke-[#4a3520] dark:fill-[#a88a66] dark:stroke-[#e8d5b0]"
        style="stroke-width: 1"
      />
      <!-- face under the brim, then a long beard falling to mid-chest -->
      <circle
        cx="22.3" cy="23.3" r="2.6"
        class="fill-[#e8c9a0] stroke-[#4a3520] dark:fill-[#a88a66] dark:stroke-[#e8d5b0]"
        style="stroke-width: 1.2"
      />
      <path
        d="M19.6 24 C19.5 28, 20.5 32, 22.3 35.5 C24 32, 25 28, 25 24 C23.5 25.6, 21 25.6, 19.6 24 Z"
        class="fill-[#f6ecd0] stroke-[#4a3520] dark:fill-[#cbbf9f] dark:stroke-[#e8d5b0]"
        style="stroke-width: 1.2"
      />
      <!-- hat: a wide brim ellipse and a tall cone whose tip (24.5, 7.5) leans
           right; the tip is 25.6 from centre with the stroke -->
      <g class="wizard-hat fill-[#9a958c] stroke-[#4a3520] dark:fill-[#77726a] dark:stroke-[#e8d5b0]" style="stroke-width: 1.6">
        <path d="M18 21 C20 16, 22 11.5, 24.5 7.5 C24.6 12, 25.3 16.5, 26.8 21 Z" />
        <ellipse cx="22.3" cy="21.2" rx="7.2" ry="1.8" />
      </g>
    </g>
  </svg>
</template>
