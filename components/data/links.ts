// Every URL shown on a slide (and turned into a QR code) lives in links.json:
// one config value per link, read by both the deck and scripts/gen-qr.mjs.
// Change a URL there, then run `npm run qr` (also runs before dev/build).
import raw from './links.json'

export interface DeckLink {
  id: string
  url: string
  label: string
  /** Not yet confirmed by the speaker; QRCard shows a „провери“ tag in dev. */
  verify?: boolean
  note?: string
}

export const LINKS: DeckLink[] = raw
export type LinkId = string

export function link(id: string): DeckLink {
  const l = LINKS.find(x => x.id === id)
  if (!l)
    throw new Error(`unknown link ${id}`)
  return l
}

/** URL without scheme / trailing slash, the way it is printed under a QR. */
export const shortUrl = (url: string): string => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
