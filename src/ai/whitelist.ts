/**
 * What the AI editor may touch (brief §10.4). Everything not listed here is out of reach: the
 * assistant can read these collections, and change only the fields named for each one.
 *
 * Never editable: `fspLicenceNumber`, `disclaimer`, the compliance `review` group, the
 * `regulated` switch, relationships to users, page parents (they change URLs) and anything on
 * legal documents. Slugs (and a survey's year) are URL keys: editable only until the document
 * is first published, since changing a live URL needs a redirect (brief §14 rule 8).
 */
export const AI_COLLECTIONS = [
  'pages',
  'solutions',
  'funds',
  'projects',
  'people',
  'offices',
  'awards',
  'jobs',
  'insights',
  'categories',
  'press-mentions',
  'research',
  'legal-documents',
] as const

export type AiCollection = (typeof AI_COLLECTIONS)[number]

export const isAiCollection = (value: unknown): value is AiCollection =>
  typeof value === 'string' && (AI_COLLECTIONS as readonly string[]).includes(value)

/** Top-level fields the assistant may set, per collection. Page sections use the block tools. */
export const EDITABLE_FIELDS: Record<AiCollection, readonly string[]> = {
  pages: ['title', 'hero', 'meta', 'slug'],
  solutions: [
    'title',
    'shortName',
    'summary',
    'heroImage',
    'keyFacts',
    'contactPerson',
    'documents',
    'externalUrl',
    'meta',
    'slug',
  ],
  funds: [
    'name',
    'strategy',
    'inceptionDate',
    'minimumInvestment',
    'investorType',
    'factsheet',
    'summary',
    'body',
    'awards',
    'meta',
    'slug',
  ],
  projects: [
    'name',
    'country',
    'city',
    'type',
    'status',
    'sizeSqm',
    'edgeCertified',
    'gallery',
    'body',
    'meta',
    'slug',
  ],
  people: [
    'name',
    'role',
    'division',
    'photo',
    'bio',
    'linkedinUrl',
    'isLeadership',
    'order',
    'meta',
    'slug',
  ],
  offices: [
    'name',
    'country',
    'city',
    'addressLines',
    'postcode',
    'phone',
    'email',
    'geo',
    'openingHours',
    'isHeadOffice',
    'order',
    'slug',
  ],
  awards: ['year', 'title', 'awardingBody', 'logo', 'fund', 'solution', 'description'],
  jobs: [
    'title',
    'location',
    'department',
    'contractType',
    'closingDate',
    'body',
    'applyEmail',
    'applyUrl',
    'meta',
    'slug',
  ],
  insights: [
    'title',
    'heroImage',
    'excerpt',
    'body',
    'relatedSolutions',
    'publishedAt',
    'author',
    'category',
    'meta',
    'slug',
  ],
  categories: ['title', 'description', 'meta', 'slug'],
  'press-mentions': ['headline', 'outlet', 'publishedAt', 'url', 'thumbnail', 'excerpt', 'people'],
  research: ['title', 'summary', 'keyFindings', 'report', 'body', 'meta', 'slug', 'year'],
  'legal-documents': [],
}

/** Fields inside any group, array or block that are never editable, whatever the parent. */
export const NEVER_EDITABLE = new Set([
  'fspLicenceNumber',
  'disclaimer',
  'review',
  'regulated',
  'parent',
  'breadcrumbs',
  'path',
  'generateSlug',
  '_status',
])

/** URL keys: editable only while the document has never been published. */
export const URL_FIELDS: Partial<Record<AiCollection, readonly string[]>> = {
  research: ['slug', 'year'],
}
export const urlFieldsOf = (collection: AiCollection) => URL_FIELDS[collection] ?? ['slug']

/** Collections with a page-sections (`layout`) field the block tools work on. */
export const BLOCK_COLLECTIONS: readonly AiCollection[] = ['pages', 'solutions']

/** Collections the assistant may create documents in (always as drafts). */
export const CREATABLE: readonly AiCollection[] = [
  'pages',
  'insights',
  'press-mentions',
  'awards',
  'jobs',
  'people',
  'projects',
  'offices',
]

/** Collections whose SEO tab (`meta`) `update_seo` can change. */
export const hasSeo = (collection: AiCollection) => EDITABLE_FIELDS[collection].includes('meta')

export const MAX_WRITE_OPS = 50
