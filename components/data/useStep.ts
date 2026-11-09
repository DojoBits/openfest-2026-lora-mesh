// How every animated component turns Slidev clicks into a step number.
//
// A component that needs N clicks registers itself with the slide's clicks
// context (the same API `v-click` uses), so the slide's click total grows by N
// with no frontmatter, presenter mode shows the right count, and
// `slidev export --with-clicks` renders every step.
//
// Passing an explicit `step` prop bypasses clicks entirely: the gallery and any
// static use pin a component to one frame without registering anything.
import type { ComputedRef } from 'vue'
import { computed, onUnmounted, useId } from 'vue'
import { useSlideContext } from '@slidev/client'

export function useStep(
  total: number,
  stepProp: () => number | undefined,
  /** Clicks already used on the slide before this component starts animating. */
  startAt: () => number = () => 0,
): ComputedRef<number> {
  const fixed = stepProp()
  if (fixed !== undefined)
    return computed(() => Math.min(stepProp() ?? fixed, total))

  const { $clicks, $clicksContext } = useSlideContext()
  const id = `lora-viz-${useId()}`
  // `delta: 0`: we do not advance the auto-numbered v-click counter, we only
  // raise the slide's maximum, exactly like a numeric `v-click="N"`.
  $clicksContext?.register(id, { max: startAt() + total, delta: 0 })
  onUnmounted(() => $clicksContext?.unregister(id))

  return computed(() => Math.max(0, Math.min(total, $clicks.value - startAt())))
}
