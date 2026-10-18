import type { Metadata } from 'next'

import type { Media } from '@/payload-types'

import { absoluteFileURL, absoluteURL, indexableHost } from './site'

type Meta = {
  title?: null | string
  description?: null | string
  image?: Media | number | null
  noindex?: boolean | null
}

type Options = {
  /** The document's own title, used when its SEO title is empty. */
  title: string
  /** The site path of the page, with a trailing slash (and query string, if it is part of the URL). */
  path: string
  /** The document's SEO tab (`meta`), if it has one. */
  meta?: Meta | null
  description?: null | string
  image?: Media | number | null
  /** Fallback share image (site settings). */
  defaultImage?: Media | number | null
  noindex?: boolean
  type?: 'website' | 'article' | 'profile'
  /** The home page: the title is used as is, without the " | Novare" suffix. */
  absoluteTitle?: boolean
}

const imageOf = (image: Media | number | null | undefined) =>
  image && typeof image === 'object' ? image : null

/**
 * Metadata for every public route (brief §8.3): title (`{title} | Novare`), description, absolute
 * canonical URL with a trailing slash, Open Graph and Twitter cards, and robots. Pages are
 * `noindex` when the document asks for it, when the caller says so (search, 404), and on every
 * host but production.
 */
export function pageMetadata(options: Options): Metadata {
  const title = options.meta?.title || options.title
  const description = options.meta?.description || options.description || undefined
  const canonical = absoluteURL(options.path)
  const image =
    imageOf(options.meta?.image) ?? imageOf(options.image) ?? imageOf(options.defaultImage)
  const imageURL = absoluteFileURL(image?.url)
  const images = imageURL
    ? [
        {
          url: imageURL,
          width: image?.width ?? undefined,
          height: image?.height ?? undefined,
          alt: image?.alt,
        },
      ]
    : undefined
  const index = indexableHost() && !options.noindex && !options.meta?.noindex
  const fullTitle = options.absoluteTitle ? title : `${title} | Novare`

  return {
    title: options.absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph: {
      type: options.type ?? 'website',
      url: canonical,
      siteName: 'Novare',
      title: fullTitle,
      description,
      images,
      locale: 'en_ZA',
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title: fullTitle,
      description,
      images: imageURL ? [imageURL] : undefined,
    },
    robots: index ? { index: true, follow: true } : { index: false, follow: true },
  }
}
