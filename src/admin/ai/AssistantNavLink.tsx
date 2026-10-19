import Link from 'next/link'

/** "AI assistant" in the admin navigation, below the collections. */
export function AssistantNavLink() {
  return (
    <Link className="nav__link ai-nav-link" href="/admin/assistant/">
      <span className="nav__link-label">AI assistant</span>
    </Link>
  )
}
