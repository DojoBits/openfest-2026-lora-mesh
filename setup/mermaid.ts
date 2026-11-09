import { defineMermaidSetup } from '@slidev/types'

// Mermaid renders inside a shadow root, so external CSS cannot reach its
// labels. This hook is the only way to restyle them.
export default defineMermaidSetup(() => ({
  themeVariables: {
    fontSize: '24px',
  },
}))
