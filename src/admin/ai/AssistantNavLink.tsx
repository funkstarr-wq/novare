import Link from 'next/link'

/** "AI assistant" in the admin navigation, below the collections, and the live site editor. */
export function AssistantNavLink() {
  return (
    <>
      <Link className="nav__link ai-nav-link" href="/admin/assistant/">
        <span className="nav__link-label">AI assistant</span>
      </Link>
      {/* A full page load, not <Link>: /api/edit/ is a route handler that turns on draft mode
          and redirects to the site, where the live AI bar appears. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a className="nav__link ai-nav-link" href="/api/edit/?path=/">
        <span className="nav__link-label">Edit the site live</span>
      </a>
    </>
  )
}
