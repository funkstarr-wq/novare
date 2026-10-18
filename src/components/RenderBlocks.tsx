import type { Page } from '@/payload-types'

import { AwardList } from './sections/AwardList'
import { ContactForm } from './sections/ContactForm'
import { CtaBand } from './sections/CtaBand'
import { DisclaimerStrip } from './sections/DisclaimerStrip'
import { DocumentDownloads } from './sections/DocumentDownloads'
import { Faq } from './sections/Faq'
import { FundFacts } from './sections/FundFacts'
import { Hero } from './sections/Hero'
import { InsightCards } from './sections/InsightCards'
import { IntroStats } from './sections/IntroStats'
import { OfficeCards } from './sections/OfficeCards'
import { PressList } from './sections/PressList'
import { Quote } from './sections/Quote'
import { RelatedLinks } from './sections/RelatedLinks'
import { RichTextSection } from './sections/RichTextSection'
import { SolutionCards } from './sections/SolutionCards'
import { TeamGrid } from './sections/TeamGrid'
import { Timeline } from './sections/Timeline'
import { ValuesList } from './sections/ValuesList'
import type { SectionProps } from './sections/types'

export type LayoutBlock = NonNullable<Page['layout']>[number]
type BlockType = LayoutBlock['blockType']

// One component per block (brief §5.3). The `satisfies` makes a new block type a type error
// until it has a component.
const components = {
  hero: Hero,
  richText: RichTextSection,
  introStats: IntroStats,
  solutionCards: SolutionCards,
  valuesList: ValuesList,
  timeline: Timeline,
  teamGrid: TeamGrid,
  officeCards: OfficeCards,
  awardList: AwardList,
  pressList: PressList,
  insightCards: InsightCards,
  fundFacts: FundFacts,
  documentDownloads: DocumentDownloads,
  quote: Quote,
  ctaBand: CtaBand,
  faq: Faq,
  contactForm: ContactForm,
  disclaimerStrip: DisclaimerStrip,
  relatedLinks: RelatedLinks,
} satisfies Record<BlockType, unknown>

type Props = {
  blocks: LayoutBlock[] | null | undefined
  draft: boolean
  parent?: SectionProps<unknown>['parent']
  /** Whether the template already rendered its `<h1>` above the blocks. */
  hasTitle?: boolean
}

export function RenderBlocks({ blocks, draft, parent = {}, hasTitle = true }: Props) {
  if (!blocks?.length) return null
  return blocks.map((block, index) => {
    const Component = components[block.blockType] as (
      props: SectionProps<LayoutBlock>,
    ) => React.ReactNode
    return (
      <Component
        key={block.id ?? index}
        block={block}
        first={!hasTitle && index === 0}
        draft={draft}
        parent={parent}
      />
    )
  })
}

/** Whether a page's sections open with a hero, which then renders the page's `<h1>`. */
export const opensWithHero = (blocks: LayoutBlock[] | null | undefined) =>
  blocks?.[0]?.blockType === 'hero'
