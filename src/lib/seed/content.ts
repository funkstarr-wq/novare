import type {
  CollectionSlug,
  DataFromCollectionSlug,
  Payload,
  RequiredDataFromCollectionSlug,
  Where,
} from 'payload'
import sharp from 'sharp'

import { richText } from '@/lib/lexical'

/**
 * Development content: enough of every collection, block and global to build and test against.
 * Names are obviously fake and every fact is a TODO-CONTENT placeholder; real Novare content
 * arrives with the WordPress import (M6). Each item is created once and then left alone, so
 * re-running never overwrites edits or piles up versions.
 */

const TODO = (what: string) => `TODO-CONTENT: ${what}`

async function ensure<S extends CollectionSlug>(
  payload: Payload,
  collection: S,
  where: Where,
  data: RequiredDataFromCollectionSlug<S>,
  file?: { data: Buffer; mimetype: string; name: string; size: number },
): Promise<DataFromCollectionSlug<S>> {
  const existing = await payload.find({
    collection,
    where,
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  })
  if (existing.docs[0]) return existing.docs[0] as DataFromCollectionSlug<S>

  return payload.create({
    collection,
    data,
    draft: false,
    file,
    overrideAccess: true,
    // Seeding is not an editorial event: no cache to refresh.
    context: { disableRevalidate: true },
  } as Parameters<Payload['create']>[0]) as Promise<DataFromCollectionSlug<S>>
}

const bySlug = (slug: string): Where => ({ slug: { equals: slug } })
const published = { _status: 'published' as const }

async function placeholderImage(width: number, height: number, name: string) {
  const data = await sharp({
    create: { width, height, channels: 3, background: '#d7dbe0' },
  })
    .png()
    .toBuffer()
  return { data, mimetype: 'image/png', name, size: data.length }
}

// A minimal but well-formed one-page PDF (header, objects, xref table, trailer), so document
// fields have a real file to point at.
function placeholderPdf(name: string) {
  const objects = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    '<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]>>',
  ]
  let body = '%PDF-1.4\n'
  const offsets = objects.map((object, i) => {
    const offset = body.length
    body += `${i + 1} 0 obj\n${object}\nendobj\n`
    return offset
  })
  const xrefOffset = body.length
  body +=
    `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` +
    offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('') +
    `trailer\n<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefOffset}\n%%EOF\n`

  const data = Buffer.from(body, 'latin1')
  return { data, mimetype: 'application/pdf', name, size: data.length }
}

const SOLUTIONS = [
  { title: 'Investment Consulting', slug: 'investment-consulting' },
  { title: 'Multi-Management', slug: 'multi-management' },
  { title: 'Real Estate', slug: 'real-estate' },
  { title: 'Impact Investments', slug: 'impact-investments' },
  { title: 'Wealth & Invest', slug: 'wealth-invest' },
]

export async function seedContent(payload: Payload): Promise<void> {
  const log = (message: string) => payload.logger.info(`Seed: ${message}`)

  // Library
  const heroImage = await ensure(
    payload,
    'media',
    { alt: { equals: 'Placeholder hero image' } },
    { alt: 'Placeholder hero image' },
    await placeholderImage(2400, 1200, 'placeholder-hero.png'),
  )
  const portrait = await ensure(
    payload,
    'media',
    { alt: { equals: 'Placeholder portrait' } },
    { alt: 'Placeholder portrait' },
    await placeholderImage(800, 1000, 'placeholder-portrait.png'),
  )
  const factsheet = await ensure(
    payload,
    'documents',
    { title: { equals: 'Example fund factsheet' } },
    { title: 'Example fund factsheet', type: 'factsheet', owner: TODO('document owner') },
    placeholderPdf('example-factsheet.pdf'),
  )
  log('media and documents')

  // Solutions, people, funds
  const solutions = await Promise.all(
    SOLUTIONS.map(({ title, slug }, order) =>
      ensure(payload, 'solutions', bySlug(slug), {
        ...published,
        title,
        slug,
        order,
        shortName: title,
        summary: TODO(`one-line summary of ${title}`),
        heroImage: heroImage.id,
        keyFacts: [{ label: TODO('fact label'), value: TODO('fact value') }],
        fspLicenceNumber: TODO('FSP licence number'),
        disclaimer: richText(TODO(`${title} regulatory disclaimer`)),
        layout: [
          { blockType: 'richText', content: richText(`## About ${title}`, TODO('overview')) },
          { blockType: 'disclaimerStrip' },
        ],
        documents: [factsheet.id],
      }),
    ),
  )
  const multiManagement = solutions[1]

  const people = await Promise.all(
    ['Alex Example', 'Sam Placeholder', 'Jordan Sample', 'Casey Testperson'].map((name, order) =>
      ensure(
        payload,
        'people',
        { name: { equals: name } },
        {
          ...published,
          name,
          slug: name.toLowerCase().replace(/ /g, '-'),
          role: TODO('job title'),
          division: solutions[order % solutions.length].id,
          photo: portrait.id,
          bio: richText(TODO(`biography of ${name}`)),
          isLeadership: order < 3,
          order,
        },
      ),
    ),
  )
  log('solutions and people')

  const awards = await Promise.all(
    [2024, 2025].map((year) =>
      ensure(
        payload,
        'awards',
        { title: { equals: `Example award ${year}` } },
        {
          ...published,
          year,
          title: `Example award ${year}`,
          awardingBody: 'Example Awards Body',
          solution: multiManagement.id,
          description: TODO('what the award recognised'),
        },
      ),
    ),
  )
  await ensure(payload, 'funds', bySlug('example-fund-of-hedge-funds'), {
    ...published,
    name: 'Example Fund of Hedge Funds',
    slug: 'example-fund-of-hedge-funds',
    solution: multiManagement.id,
    strategy: TODO('strategy'),
    minimumInvestment: TODO('minimum investment'),
    investorType: 'qualified',
    factsheet: factsheet.id,
    summary: TODO('fund summary'),
    body: richText(TODO('fund description')),
    awards: awards.map((award) => award.id),
    disclaimer: richText(TODO('fund disclaimer')),
  })
  await ensure(payload, 'projects', bySlug('example-mixed-use-development'), {
    ...published,
    name: 'Example Mixed-Use Development',
    slug: 'example-mixed-use-development',
    country: 'Exampleland',
    city: 'Example City',
    type: 'mixed-use',
    status: 'completed',
    sizeSqm: 10000,
    gallery: [heroImage.id],
    body: richText(TODO('project description')),
  })
  log('awards, funds and projects')

  // Offices and jobs
  const headOffice = await ensure(payload, 'offices', bySlug('example-head-office'), {
    ...published,
    name: 'Example Head Office',
    slug: 'example-head-office',
    country: 'Exampleland',
    city: 'Example City',
    addressLines: [{ line: TODO('street address') }],
    phone: TODO('phone'),
    email: 'office@example.com',
    isHeadOffice: true,
    order: 0,
  })
  await ensure(payload, 'offices', bySlug('example-regional-office'), {
    ...published,
    name: 'Example Regional Office',
    slug: 'example-regional-office',
    country: 'Otherland',
    city: 'Sample Town',
    addressLines: [{ line: TODO('street address') }],
    order: 1,
  })
  await ensure(payload, 'jobs', bySlug('example-analyst'), {
    ...published,
    title: 'Example Analyst',
    slug: 'example-analyst',
    location: headOffice.id,
    department: TODO('department'),
    contractType: 'permanent',
    closingDate: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    body: richText(TODO('job description')),
    applyEmail: 'careers@example.com',
  })
  log('offices and jobs')

  // Insights, press, research
  const category = await ensure(payload, 'categories', bySlug('market-commentary'), {
    ...published,
    title: 'Market commentary',
    slug: 'market-commentary',
    description: TODO('category description'),
  })
  await Promise.all(
    ['one', 'two', 'three'].map((n, i) =>
      ensure(payload, 'insights', bySlug(`placeholder-article-${n}`), {
        ...published,
        title: `Placeholder article ${n}`,
        slug: `placeholder-article-${n}`,
        publishedAt: new Date(Date.UTC(2026, 0, 10 * (i + 1))).toISOString(),
        author: people[i].id,
        category: category.id,
        heroImage: heroImage.id,
        excerpt: TODO('article excerpt'),
        body: richText(TODO('article body'), '## A section heading', TODO('more article body')),
        relatedSolutions: [solutions[i].id],
      }),
    ),
  )
  await ensure(
    payload,
    'press-mentions',
    { headline: { equals: 'Example headline about Novare' } },
    {
      ...published,
      headline: 'Example headline about Novare',
      outlet: 'Example News',
      publishedAt: new Date(Date.UTC(2026, 1, 1)).toISOString(),
      url: 'https://example.com/news/example-headline',
      excerpt: TODO('summary in our own words'),
      people: [people[0].id],
    },
  )
  await ensure(payload, 'research', bySlug('example-hedge-fund-survey'), {
    ...published,
    title: 'Example Hedge Fund Survey',
    slug: 'example-hedge-fund-survey',
    year: 2025,
    summary: TODO('survey summary'),
    keyFindings: [{ finding: TODO('key finding') }],
    body: richText(TODO('survey write-up')),
  })
  const privacy = await ensure(payload, 'legal-documents', bySlug('privacy-notice'), {
    ...published,
    title: 'Privacy notice',
    slug: 'privacy-notice',
    body: richText(TODO('privacy notice text from Novare')),
  })
  log('insights, press, research and legal documents')

  // Forms (brief §9)
  const enquiryForms = await Promise.all(
    ['General enquiry', 'Wealth & Invest enquiry', 'Institutional enquiry', 'Careers enquiry'].map(
      (title) =>
        ensure(
          payload,
          'forms',
          { title: { equals: title } },
          {
            title,
            submitButtonLabel: 'Send',
            // Example addresses only: Novare sets the real routing per form.
            routing: [{ topic: '*', emailTo: 'enquiries@example.test' }],
            emails: [
              {
                emailTo: '{{email}}',
                subject: 'We have received your enquiry',
                message: richText(
                  'Thank you for contacting Novare. We have received your message.',
                ),
              },
            ],
            confirmationType: 'message',
            confirmationMessage: richText('Thank you. We will be in touch.'),
            fields: [
              { blockType: 'text', name: 'name', label: 'Name', required: true },
              { blockType: 'email', name: 'email', label: 'Email', required: true },
              { blockType: 'text', name: 'phone', label: 'Phone (optional)' },
              { blockType: 'text', name: 'organisation', label: 'Organisation (optional)' },
              {
                blockType: 'select',
                name: 'topic',
                label: 'Topic',
                required: true,
                options: [{ label: TODO('topic'), value: 'general' }],
              },
              { blockType: 'textarea', name: 'message', label: 'Message', required: true },
              {
                blockType: 'checkbox',
                name: 'popiaConsent',
                label:
                  'I agree to Novare processing my details as described in the privacy notice.',
                required: true,
              },
            ],
          },
        ),
    ),
  )
  log('forms')

  // Pages: home and the hubs, with every layout block used at least once.
  const page = (
    slug: string,
    title: string,
    layout: RequiredDataFromCollectionSlug<'pages'>['layout'],
    parent?: number,
  ) =>
    ensure(payload, 'pages', bySlug(slug), {
      ...published,
      title,
      slug,
      parent,
      hero: { heading: title, subheading: TODO(`${title} introduction`), image: heroImage.id },
      layout,
    })

  await page('home', 'Home', [
    {
      blockType: 'hero',
      heading: TODO('home page headline'),
      subheading: TODO('home page introduction'),
      image: heroImage.id,
      ctas: [
        {
          link: {
            type: 'internal',
            label: 'Our solutions',
            reference: { relationTo: 'solutions', value: solutions[0].id },
          },
        },
      ],
    },
    {
      blockType: 'introStats',
      intro: richText(TODO('introduction')),
      stats: [{ value: TODO('figure'), label: TODO('what the figure measures') }],
    },
    { blockType: 'solutionCards', mode: 'all' },
    { blockType: 'insightCards', mode: 'latest', limit: 3 },
    { blockType: 'awardList', mode: 'latest', limit: 3 },
    { blockType: 'pressList', limit: 3 },
    {
      blockType: 'ctaBand',
      heading: TODO('call to action heading'),
      button: { type: 'external', label: 'Get in touch', url: 'https://example.com/contact' },
    },
  ])
  const about = await page('about', 'About', [
    { blockType: 'richText', content: richText(TODO('about Novare')) },
    {
      blockType: 'valuesList',
      heading: 'Our values',
      items: [{ title: TODO('value'), text: TODO('what the value means') }],
    },
    { blockType: 'quote', text: TODO('quote'), person: people[0].id },
  ])
  await page(
    'history',
    'History',
    [
      {
        blockType: 'timeline',
        items: [{ year: 2000, title: TODO('milestone'), text: TODO('detail') }],
      },
    ],
    about.id,
  )
  await page(
    'leadership',
    'Leadership',
    [{ blockType: 'teamGrid', filter: 'leadership' }],
    about.id,
  )
  await page('solutions', 'Solutions', [
    { blockType: 'solutionCards', mode: 'all' },
    {
      blockType: 'fundFacts',
      fund: (await payload.find({ collection: 'funds', limit: 1, depth: 0 })).docs[0].id,
    },
    { blockType: 'documentDownloads', heading: 'Downloads', documents: [factsheet.id] },
  ])
  // /insights/ lists every insight itself (paginated); its page only adds the intro.
  const insightsPage = await page('insights', 'Insights', [
    { blockType: 'richText', content: richText(TODO('insights introduction')) },
  ])
  const locationsPage = await page('locations', 'Locations', [
    { blockType: 'officeCards', scope: 'all' },
  ])
  const contactPage = await page('contact', 'Contact', [
    { blockType: 'contactForm', heading: 'Send us a message', form: enquiryForms[0].id },
    {
      blockType: 'faq',
      items: [{ question: TODO('frequently asked question'), answer: richText(TODO('answer')) }],
    },
    {
      blockType: 'relatedLinks',
      links: [
        {
          link: {
            type: 'internal',
            label: 'Privacy notice',
            reference: { relationTo: 'legal-documents', value: privacy.id },
          },
        },
      ],
    },
  ])
  log('pages')

  // Globals: filled once; later runs leave editors' changes alone.
  const solutionsPage = await payload.find({
    collection: 'pages',
    where: bySlug('solutions'),
    limit: 1,
    depth: 0,
  })
  const header = await payload.findGlobal({ slug: 'header', depth: 0 })
  if (!header.navItems?.length)
    await payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          {
            link: {
              type: 'internal',
              label: 'About',
              reference: { relationTo: 'pages', value: about.id },
            },
          },
          {
            link: {
              type: 'internal',
              label: 'Solutions',
              reference: { relationTo: 'pages', value: solutionsPage.docs[0].id },
            },
            children: solutions.map((solution) => ({
              link: {
                type: 'internal' as const,
                label: solution.title,
                reference: { relationTo: 'solutions' as const, value: solution.id },
              },
            })),
          },
          ...[
            ['Insights', insightsPage],
            ['Locations', locationsPage],
          ].map(([label, target]) => ({
            link: {
              type: 'internal' as const,
              label: label as string,
              reference: { relationTo: 'pages' as const, value: (target as { id: number }).id },
            },
          })),
        ],
        utilityCta: {
          type: 'internal',
          label: 'Contact us',
          reference: { relationTo: 'pages', value: contactPage.id },
        },
      },
    })
  const footer = await payload.findGlobal({ slug: 'footer', depth: 0 })
  if (!footer.columns?.length)
    await payload.updateGlobal({
      slug: 'footer',
      data: {
        columns: [
          {
            heading: 'Company',
            links: [
              {
                link: {
                  type: 'internal',
                  label: 'About',
                  reference: { relationTo: 'pages', value: about.id },
                },
              },
            ],
          },
        ],
        socialLinks: [{ platform: 'linkedin', url: 'https://www.linkedin.com/company/example' }],
        legalLinks: [privacy.id],
        offices: [headOffice.id],
      },
    })
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  if (!settings.organization?.legalName)
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        organisationName: 'Novare',
        defaultOgImage: heroImage.id,
        defaultDisclaimer: richText(TODO('default disclaimer')),
        // No founding year: it would be an invented fact (it feeds Organization JSON-LD).
        organization: { legalName: TODO('legal name') },
        // Off until analytics is chosen (brief §15); the wording comes from Novare.
        cookieBanner: {
          enabled: false,
          message: TODO('cookie banner wording (POPIA/GDPR)'),
          policy: privacy.id,
        },
      },
    })
  log('globals')
}
