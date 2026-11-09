// Author/build-time QR generator: components/data/links.json → qr/<id>.svg (inlined by QRCard; not public/, so Vite can import it raw).
// Runs offline (the qrcode package renders locally) and is deterministic, so
// tests/bands-qr.test.ts can assert the committed SVGs match the config.
//   node scripts/gen-qr.mjs        (also wired as npm predev / prebuild)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'

const root = new URL('..', import.meta.url)

export function renderQrSvg(url) {
  // Black on white with a 2-module quiet zone; QRCard always puts it on a
  // white tile so it scans in dark mode too.
  return QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  })
}

async function main() {
  const links = JSON.parse(readFileSync(new URL('components/data/links.json', root), 'utf8'))
  const out = new URL('qr/', root)
  mkdirSync(out, { recursive: true })
  for (const l of links) {
    writeFileSync(new URL(`${l.id}.svg`, out), await renderQrSvg(l.url))
    console.log(`qr: ${l.id} → ${l.url}`)
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url))
  await main()
