import config from '@payload-config'
import type { RichTextField } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { cleanHtml, htmlToLexical, plainText } from '@/migration/wordpress/html'
import { excerptOf, humanTitle, withoutTitleHeading } from '@/migration/wordpress/import'
import {
  internalArticleSlugs,
  outletOf,
  parseAwards,
  parseOffices,
  parsePressItems,
} from '@/migration/wordpress/parse'

// M6 (brief §11): the old site's HTML, with made-up text in the shape the site uses.
const ORIGIN = 'https://old.example.test'
let body: RichTextField

beforeAll(async () => {
  const sanitized = await config
  body = sanitized.collections
    .find((c) => c.slug === 'insights')!
    .flattenedFields.find((f) => f.name === 'body') as RichTextField
})

describe('HTML cleaning and conversion', () => {
  it('decodes WordPress entities in plain text', () => {
    expect(plainText('Novare&#8217;s <b>“test”</b> &amp; more&#8230;')).toBe(
      'Novare’s “test” & more…',
    )
  })

  it('keeps text and structure, drops builder markup, media and scripts', () => {
    const html =
      '<div class="fl-row"><h1 style="x">Big</h1><p class="a">One <span>two</span> [caption]x[/caption]</p>' +
      '<script>alert(1)</script><figure><img src="/a.png"></figure><h6>Small</h6><p>&nbsp;</p></div>'
    expect(cleanHtml(html)).toBe('<h2>Big</h2><p>One two x</p><h4>Small</h4>')
  })

  it('converts to Lexical inside the editor’s subset', () => {
    const state = htmlToLexical(
      '<h1>Title</h1><p>Some <strong>bold</strong>, <em>italic</em>, <u>underlined</u> and <a href="https://x.example/">linked</a> text.</p><ul><li>One</li></ul><table><tr><td>cell</td></tr></table>',
      body,
    )
    const json = JSON.stringify(state)
    for (const type of ['"heading"', '"paragraph"', '"list"', '"link"'])
      expect(json).toContain(type)
    expect(json).not.toContain('"table"')
    expect(json).not.toContain('"tag":"h1"')
    // Underline (format 8) is not part of the subset; bold (1) and italic (2) are.
    expect(json).not.toMatch(/"format":(8|9|10|11)\b/)
  })
})

describe('press list', () => {
  const html = `
    <figure><a href="https://news.example.test/a"><img src="${ORIGIN}/wp-content/uploads/a.png" alt="a"></a></figure>
    <h2><a href="https://news.example.test/a">Headline A<br></a></h2><p>A third party’s summary.</p>
    <figure><a href="${ORIGIN}/our-article/"><img src="${ORIGIN}/b.png"></a></figure>
    <h2><a href="${ORIGIN}/our-article/">Our own article</a></h2>
    <h3><a href="https://www.paper.example.test/b">Headline B</a></h3>
    <h2><a href="https://news.example.test/a">Headline A again</a></h2>`

  it('takes external headline links with their thumbnails, once each', () => {
    expect(parsePressItems(html, ORIGIN)).toEqual([
      {
        headline: 'Headline A',
        url: 'https://news.example.test/a',
        outlet: 'news.example.test',
        imageUrl: `${ORIGIN}/wp-content/uploads/a.png`,
      },
      {
        headline: 'Headline B',
        url: 'https://www.paper.example.test/b',
        outlet: 'paper.example.test',
        imageUrl: null,
      },
    ])
    expect(outletOf('https://www.businesstech.co.za/x')).toBe('businesstech.co.za')
  })

  it('finds links to the site’s own article pages', () => {
    expect(internalArticleSlugs(html, ORIGIN)).toEqual(['our-article'])
  })
})

describe('offices and awards', () => {
  it('reads "Our Presence" blocks', () => {
    const html = `<h2>Our Presence</h2>
      <h4>SOUTH AFRICA (Example City) Head Office</h4><p>First Floor<br />1 Example Road<br />0000<strong>Tel:</strong> +27 (0) 00 000 0000</p>
      <h4>MAURITIUS (Sample Town)</h4><p>Hub 1<br />Sample Town<strong>Tel: </strong>+230 0000 0000</p>`
    expect(parseOffices(html)).toEqual([
      {
        country: 'South Africa',
        city: 'Example City',
        addressLines: ['First Floor', '1 Example Road', '0000'],
        phone: '+27 (0) 00 000 0000',
        isHeadOffice: true,
      },
      {
        country: 'Mauritius',
        city: 'Sample Town',
        addressLines: ['Hub 1', 'Sample Town'],
        phone: '+230 0000 0000',
        isHeadOffice: false,
      },
    ])
  })

  it('reads award sentences, leaving the body TODO when the sentence does not name it', () => {
    const html = `<ul>
      <li>Example was awarded the <strong>&#8220;Test Award of the Year&#8221;</strong> at the Sample Awards 2024 award ceremony.</li>
      <li>Example won <strong>&#8220;Best Example&#8221;</strong> in the Category for the Fund at the Other Awards 2021</li>
      <li><strong>&#8220;Project of the year 2019&#8221;</strong> Some Conference (SC&#8217;19)</li>
      <li>No quoted award name here 2020</li></ul>`
    const awards = parseAwards(html)
    expect(
      awards.map(({ title, year, awardingBody, certain }) => ({
        title,
        year,
        awardingBody,
        certain,
      })),
    ).toEqual([
      { title: 'Test Award of the Year', year: 2024, awardingBody: 'Sample Awards', certain: true },
      { title: 'Best Example', year: 2021, awardingBody: 'Other Awards', certain: true },
      {
        title: 'Project of the year 2019',
        year: 2019,
        awardingBody: 'TODO-CONTENT: awarding body for "Project of the year 2019"',
        certain: false,
      },
    ])
    expect(awards[0].description).toContain('award ceremony')
  })
})

describe('import helpers', () => {
  it('turns PDF file names into titles', () => {
    expect(humanTitle('PAIAManualDecember2014')).toBe('PAIA Manual December 2014')
    expect(humanTitle('GroupConflictofInterestManagementPolicyFINAL020320152')).toBe(
      'Group Conflictof Interest Management Policy',
    )
    expect(humanTitle('disclaimer')).toBe('disclaimer')
  })

  it('drops a repeated title from the start of a page article and its excerpt', () => {
    const html = '<div><h2>Market Update: Q1</h2><p>Body.</p></div>'
    expect(withoutTitleHeading(html, 'Market update: Q1')).toBe('<div><p>Body.</p></div>')
    expect(withoutTitleHeading('<h2>Other</h2><p>x</p>', 'Market update')).toContain(
      '<h2>Other</h2>',
    )
    expect(
      excerptOf(
        { excerpt: { rendered: '<p>Market Update Q1 The market moved […]</p>' } },
        'Market Update Q1',
      ),
    ).toBe('The market moved')
  })
})
