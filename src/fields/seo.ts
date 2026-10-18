import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import type { Tab } from 'payload'

/**
 * The SEO tab every public collection carries (brief §5): title, description and share image,
 * stored under `meta`, plus a switch that keeps the page out of search engines and the sitemap.
 * Titles over 60 characters and descriptions over 150 get a warning.
 */
export const seoTab: Tab = {
  name: 'meta',
  label: 'SEO',
  fields: [
    OverviewField({
      titlePath: 'meta.title',
      descriptionPath: 'meta.description',
      imagePath: 'meta.image',
    }),
    MetaTitleField({ hasGenerateFn: true }),
    MetaImageField({ relationTo: 'media' }),
    MetaDescriptionField({}),
    PreviewField({
      hasGenerateFn: true,
      titlePath: 'meta.title',
      descriptionPath: 'meta.description',
    }),
    {
      name: 'noindex',
      label: 'Hide from search engines',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Adds noindex and leaves the page out of the sitemap. Visitors can still open it.',
      },
    },
  ],
}
