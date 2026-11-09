// Vite rewrites static src="/x.png" for a sub path base, but not values bound
// through :src. withBase() adds the base so those images load on GitHub Pages too.
export function withBase(path: string, base: string = import.meta.env.BASE_URL ?? '/'): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path
  return base.replace(/\/$/, '') + path
}
