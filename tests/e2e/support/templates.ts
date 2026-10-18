// Every front-end template (brief §7) with a URL that `pnpm seed` fills, and the JSON-LD types it
// adds to the site-wide Organization and WebSite (brief §8.3). Used by the smoke and SEO tests
// (templates.e2e.ts, seo.e2e.ts) and the axe checks (a11y.e2e.ts).
type Template = { name: string; path: string; jsonld?: string[]; canonical?: string }

export const templates: readonly Template[] = [
  { name: 'home', path: '/' },
  { name: 'page', path: '/about/' },
  { name: 'nested page', path: '/about/history/' },
  { name: 'leadership', path: '/about/leadership/' },
  { name: 'person', path: '/about/leadership/alex-example/', jsonld: ['Person'] },
  { name: 'solutions hub', path: '/solutions/' },
  { name: 'solution', path: '/solutions/investment-consulting/', jsonld: ['FinancialService'] },
  { name: 'solution with funds', path: '/solutions/multi-management/' },
  { name: 'fund', path: '/solutions/multi-management/example-fund-of-hedge-funds/' },
  { name: 'project', path: '/solutions/real-estate/example-mixed-use-development/' },
  { name: 'research hub', path: '/research/hedge-fund-survey/' },
  { name: 'research year', path: '/research/hedge-fund-survey/2025/', jsonld: ['Report'] },
  { name: 'insights', path: '/insights/' },
  { name: 'insight', path: '/insights/placeholder-article-one/', jsonld: ['Article'] },
  { name: 'insight category', path: '/insights/category/market-commentary/' },
  { name: 'press', path: '/news/in-the-press/' },
  { name: 'awards', path: '/awards/' },
  { name: 'locations', path: '/locations/' },
  { name: 'country', path: '/locations/exampleland/', jsonld: ['FinancialService'] },
  { name: 'careers', path: '/careers/' },
  { name: 'vacancy', path: '/careers/example-analyst/', jsonld: ['JobPosting'] },
  { name: 'contact', path: '/contact/', jsonld: ['FAQPage'] },
  { name: 'legal', path: '/legal/privacy-notice/' },
  { name: 'search', path: '/search/?q=placeholder', canonical: '/search/' },
]
