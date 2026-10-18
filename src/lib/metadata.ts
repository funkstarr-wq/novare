import type { Metadata } from 'next'

import { getSiteSettings } from './queries'
import { pageMetadata } from './seo'

/** `pageMetadata` with the site's default share image; draft previews are never indexed. */
export async function routeMetadata(
  draft: boolean,
  options: Omit<Parameters<typeof pageMetadata>[0], 'defaultImage'>,
): Promise<Metadata> {
  const settings = await getSiteSettings(draft)
  return pageMetadata({
    ...options,
    defaultImage: settings.defaultOgImage,
    noindex: options.noindex || draft,
  })
}
