import type { Office } from '@/payload-types'

/** An office's address and contacts, with a map link when it has coordinates. */
export function OfficeCard({ office }: { office: Office }) {
  const { latitude, longitude } = office.geo ?? {}
  const mapHref =
    typeof latitude === 'number' && typeof longitude === 'number'
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : null
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-6">
      <h3 className="text-xl font-semibold">{office.name}</h3>
      <address className="not-italic text-ink-muted">
        {office.addressLines?.map((line) => (
          <span key={line.id ?? line.line} className="block">
            {line.line}
          </span>
        ))}
        <span className="block">{[office.city, office.postcode].filter(Boolean).join(' ')}</span>
        <span className="block">{office.country}</span>
      </address>
      {office.phone && (
        <p>
          <a href={`tel:${office.phone.replace(/\s+/g, '')}`} className="text-brand underline">
            {office.phone}
          </a>
        </p>
      )}
      {office.email && (
        <p>
          <a href={`mailto:${office.email}`} className="text-brand underline">
            {office.email}
          </a>
        </p>
      )}
      {mapHref && (
        <p>
          <a href={mapHref} rel="noopener" className="text-brand underline">
            View {office.name} on a map
          </a>
        </p>
      )}
    </li>
  )
}
