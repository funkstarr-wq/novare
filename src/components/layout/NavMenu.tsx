'use client'

import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useId, useRef, useState } from 'react'

export type NavItem = {
  label: string
  href: null | string
  children: { label: string; href: string }[]
}

type Props = {
  items: NavItem[]
  cta: { label: string; href: string } | null
  /** The home link with the logo, rendered on the server. */
  logo: ReactNode
}

const navLink =
  'block py-2 text-[0.95rem] underline-offset-[6px] decoration-1 hover:underline md:py-1'

/**
 * Primary navigation (brief §8.2), laid out after apollo.com (decision "Apollo-style theme"): a
 * top row with search, the centred logo and the call to action, and the menu on a row below.
 * Menus are disclosures with `aria-expanded`, closed by Escape (focus returns to the toggle) or a
 * click elsewhere; on desktop each opens as a floating panel, on small screens the same list is
 * a drawer.
 */
export function NavMenu({ items, cta, logo }: Props) {
  const [open, setOpen] = useState<null | number>(null)
  const [drawer, setDrawer] = useState(false)
  const nav = useRef<HTMLElement>(null)
  const toggles = useRef<(HTMLButtonElement | null)[]>([])
  const drawerToggle = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const id = useId()

  // A navigation closes everything (state adjusted while rendering, not in an effect).
  const [shownFor, setShownFor] = useState(pathname)
  if (shownFor !== pathname) {
    setShownFor(pathname)
    setOpen(null)
    setDrawer(false)
  }

  useEffect(() => {
    if (open === null && !drawer) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (open !== null) {
        toggles.current[open]?.focus()
        setOpen(null)
      } else {
        drawerToggle.current?.focus()
        setDrawer(false)
      }
    }
    const onClick = (event: MouseEvent) => {
      if (nav.current && !nav.current.contains(event.target as Node)) setOpen(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [open, drawer])

  return (
    <nav ref={nav} aria-label="Main" className="relative">
      <div className="mx-auto grid max-w-(--container-page) grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-3 md:py-5">
        <div>
          <NextLink
            href="/search/"
            className="hidden items-center gap-2 text-sm underline-offset-[6px] hover:underline md:inline-flex"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none">
              <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.6" />
              <path d="m13 13 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Search
          </NextLink>
        </div>
        {logo}
        <div className="flex items-center justify-end gap-3">
          {cta && (
            <NextLink
              href={cta.href}
              className="hidden rounded-full bg-brand px-5 py-2 text-sm font-medium text-on-brand transition-colors hover:bg-brand-strong md:inline-flex"
            >
              {cta.label}
            </NextLink>
          )}
          <button
            ref={drawerToggle}
            type="button"
            aria-expanded={drawer}
            aria-controls={`${id}-menu`}
            onClick={() => setDrawer((value) => !value)}
            className="rounded-full border border-brand px-4 py-2 text-sm font-medium md:hidden"
          >
            Menu
          </button>
        </div>
      </div>
      <ul
        id={`${id}-menu`}
        className={`${drawer ? 'flex' : 'hidden'} max-h-[calc(100dvh-4rem)] flex-col overflow-y-auto border-t border-border px-6 py-4 md:flex md:max-h-none md:flex-row md:justify-center md:gap-9 md:overflow-visible md:py-3`}
      >
        {items.map((item, index) => {
          const panel = `${id}-panel-${index}`
          if (item.children.length === 0) {
            return (
              <li key={item.label}>
                <NextLink href={item.href!} className={navLink}>
                  {item.label}
                </NextLink>
              </li>
            )
          }
          const expanded = open === index
          return (
            <li key={item.label}>
              <button
                ref={(element) => {
                  toggles.current[index] = element
                }}
                type="button"
                aria-expanded={expanded}
                aria-controls={panel}
                onClick={() => setOpen(expanded ? null : index)}
                className={`${navLink} flex w-full items-center gap-1.5 ${expanded ? 'underline' : ''}`}
              >
                {item.label}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 12 12"
                  className={`size-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
                  fill="none"
                >
                  <path d="m2 4 4 4 4-4" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </button>
              <div
                id={panel}
                hidden={!expanded}
                className="pb-2 pl-4 md:absolute md:left-1/2 md:top-full md:z-30 md:mt-1 md:w-[min(72rem,calc(100vw-3rem))] md:-translate-x-1/2 md:rounded-[5px] md:bg-white md:p-6 md:pl-6 md:shadow-[2px_2px_12px_rgba(0,0,0,0.1)]"
              >
                <div className="md:grid md:grid-cols-[3fr_9fr] md:gap-8">
                  <div className="hidden flex-col items-start gap-4 border-y border-border py-7 md:flex">
                    <p className="font-serif text-[2rem] leading-tight">{item.label}</p>
                    {item.href && (
                      <NextLink
                        href={item.href}
                        className="inline-flex items-center gap-2 rounded-full border border-brand px-5 py-2 text-sm font-medium transition-colors hover:bg-brand hover:text-on-brand"
                      >
                        {item.label} overview
                      </NextLink>
                    )}
                  </div>
                  <ul className="flex flex-col md:grid md:grid-cols-3 md:content-start md:gap-x-6 md:border-y md:border-border md:py-6">
                    {item.href && (
                      <li className="md:hidden">
                        <NextLink href={item.href} className={navLink}>
                          {item.label} overview
                        </NextLink>
                      </li>
                    )}
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <NextLink
                          href={child.href}
                          className="block py-2 underline-offset-[6px] hover:underline"
                        >
                          {child.label}
                        </NextLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          )
        })}
        {cta && (
          <li className="mt-3 md:hidden">
            <NextLink
              href={cta.href}
              className="inline-flex rounded-full bg-brand px-5 py-2 text-sm font-medium text-on-brand"
            >
              {cta.label}
            </NextLink>
          </li>
        )}
      </ul>
    </nav>
  )
}
