import type { Metadata } from 'next'

// Placeholder until M3 renders the `pages` document with slug `home` (brief §7). It reads nothing
// from Payload, so it prerenders at build time without a database.
export const metadata: Metadata = {
  title: { absolute: 'Novare' },
  description: 'The new Novare website is under construction.',
}

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-(--container-prose) flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold text-brand-strong sm:text-4xl">Novare</h1>
      <p className="text-lg text-ink-muted">The new Novare website is under construction.</p>
    </main>
  )
}
