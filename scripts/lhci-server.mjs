// Starts the production server for Lighthouse CI, then requests each audited page and its images
// once. Content pages render on their first request and are cached until the next publish
// (docs/decisions.md, M3), so Lighthouse should measure the cached page every later visitor
// gets, not the one-off first render. Prints "LHCI ready" (startServerReadyPattern) when done.
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'

const { ci } = JSON.parse(readFileSync(new URL('../lighthouserc.json', import.meta.url), 'utf8'))
const urls = ci.collect.url
const origin = new URL(urls[0]).origin

const server = spawn('pnpm', ['start'], { stdio: 'inherit' })
process.on('SIGTERM', () => server.kill('SIGTERM'))
process.on('SIGINT', () => server.kill('SIGINT'))
server.on('exit', (code) => process.exit(code ?? 0))

async function healthy() {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const response = await fetch(`${origin}/api/health/`).catch(() => null)
    if (response?.ok) return
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error('Server did not become healthy')
}

await healthy()
for (const url of urls) {
  const html = await (await fetch(url)).text()
  const images = new Set(
    [...html.matchAll(/(?:src|srcSet|imageSrcSet)="([^"]+)"/g)]
      .flatMap(([, value]) => value.split(','))
      .map((candidate) => candidate.trim().split(/\s+/)[0].replaceAll('&amp;', '&'))
      .filter((src) => src.startsWith('/_next/image')),
  )
  await Promise.all([...images].map((src) => fetch(`${origin}${src}`).then((r) => r.arrayBuffer())))
  console.log(`Warmed ${url} (${images.size} image sizes)`)
}
console.log('LHCI ready')
