import { defineAppSetup } from '@slidev/types'

// Self-hosted fonts (Cyrillic + Latin subsets are in the variable files).
// Importing here, instead of using Slidev's `fonts:` Google provider, means the
// build contains the woff2 files and makes no request to fonts.googleapis.com.
// The CSS only downloads the subset files whose unicode-range is actually used.
import '@fontsource-variable/inter/wght.css'
import '@fontsource-variable/jetbrains-mono/wght.css'

export default defineAppSetup(() => {})
