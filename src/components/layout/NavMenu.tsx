'use client'

import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'

export type NavItem = {
  label: string
  href: null | string
  children: { label: string; href: string }[]
}

type Props = { items: NavItem[]; cta: { label: string; href: string } | null }

/**
 * Primary navigation (brief §8.2): disclosure menus with `aria-expanded`, closed by Escape (focus
 * returns to the toggle) or a click elsewhere, and the same list as a drawer on small screens.
 */
export function NavMenu({ items, cta }: Props) {
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
    <nav ref={nav} aria-label="Main" className="flex items-center">
      <button
        ref={drawerToggle}
        type="button"
        aria-expanded={drawer}
        aria-controls={`${id}-menu`}
        onClick={() => setDrawer((value) => !value)}
        className="rounded-md border border-border px-3 py-2 font-semibold md:hidden"
      >
        Menu
      </button>
      <ul
        id={`${id}-menu`}
        className={`${drawer ? 'flex' : 'hidden'} absolute inset-x-0 top-16 z-20 flex-col gap-1 border-b border-border bg-surface p-6 md:static md:flex md:flex-row md:items-center md:gap-2 md:border-0 md:p-0`}
      >
        {items.map((item, index) => {
          const panel = `${id}-panel-${index}`
          if (item.children.length === 0) {
            return (
              <li key={item.label}>
                <NextLink
                  href={item.href!}
                  className="block rounded-md px-3 py-2 font-semibold hover:bg-surface-muted"
                >
                  {item.label}
                </NextLink>
              </li>
            )
          }
          const expanded = open === index
          return (
            <li key={item.label} className="relative">
              <button
                ref={(element) => {
                  toggles.current[index] = element
                }}
                type="button"
                aria-expanded={expanded}
                aria-controls={panel}
                onClick={() => setOpen(expanded ? null : index)}
                className="flex w-full items-center gap-1 rounded-md px-3 py-2 font-semibold hover:bg-surface-muted"
              >
                {item.label}
                <span aria-hidden="true">{expanded ? '▴' : '▾'}</span>
              </button>
              <ul
                id={panel}
                hidden={!expanded}
                className="flex flex-col gap-1 py-2 pl-4 md:absolute md:left-0 md:top-full md:z-20 md:min-w-64 md:rounded-md md:border md:border-border md:bg-surface md:p-2 md:shadow-lg"
              >
                {item.href && (
                  <li>
                    <NextLink
                      href={item.href}
                      className="block rounded-md px-3 py-2 hover:bg-surface-muted"
                    >
                      {item.label} overview
                    </NextLink>
                  </li>
                )}
                {item.children.map((child) => (
                  <li key={child.href}>
                    <NextLink
                      href={child.href}
                      className="block rounded-md px-3 py-2 hover:bg-surface-muted"
                    >
                      {child.label}
                    </NextLink>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
        {cta && (
          <li>
            <NextLink
              href={cta.href}
              className="mt-2 inline-flex rounded-md bg-brand px-4 py-2 font-semibold text-on-brand hover:bg-brand-strong md:ml-2 md:mt-0"
            >
              {cta.label}
            </NextLink>
          </li>
        )}
      </ul>
    </nav>
  )
}
