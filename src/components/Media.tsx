import Image from 'next/image'

import { fileURL } from '@/lib/urls'
import type { Media as MediaDoc } from '@/payload-types'

type Props = {
  media: MediaDoc | number | null | undefined
  /** How wide the image renders, for `next/image` to pick a size (brief §8.2). */
  sizes: string
  /** Only the hero image: it is usually the largest contentful paint. */
  priority?: boolean
  className?: string
}

/** An uploaded image, through `next/image` (lazy unless `priority`). */
export function Media({ media, sizes, priority = false, className }: Props) {
  if (!media || typeof media !== 'object' || !media.url) return null
  const { alt, width, height } = media
  const src = fileURL(media.url)
  if (!src || !width || !height) return null
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  )
}
