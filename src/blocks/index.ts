import type { Block } from 'payload'

import { AwardListBlock } from './AwardList'
import { ContactFormBlock } from './ContactForm'
import { CtaBandBlock } from './CtaBand'
import { DisclaimerStripBlock } from './DisclaimerStrip'
import { DocumentDownloadsBlock } from './DocumentDownloads'
import { FaqBlock } from './Faq'
import { FundFactsBlock } from './FundFacts'
import { HeroBlock } from './Hero'
import { InsightCardsBlock } from './InsightCards'
import { IntroStatsBlock } from './IntroStats'
import { OfficeCardsBlock } from './OfficeCards'
import { PressListBlock } from './PressList'
import { QuoteBlock } from './Quote'
import { RelatedLinksBlock } from './RelatedLinks'
import { RichTextBlock } from './RichText'
import { SolutionCardsBlock } from './SolutionCards'
import { TeamGridBlock } from './TeamGrid'
import { TimelineBlock } from './Timeline'
import { ValuesListBlock } from './ValuesList'

/** Every page section (brief §5.3), in the order editors see them. */
export const layoutBlocks: Block[] = [
  HeroBlock,
  RichTextBlock,
  IntroStatsBlock,
  SolutionCardsBlock,
  ValuesListBlock,
  TimelineBlock,
  TeamGridBlock,
  OfficeCardsBlock,
  AwardListBlock,
  PressListBlock,
  InsightCardsBlock,
  FundFactsBlock,
  DocumentDownloadsBlock,
  QuoteBlock,
  CtaBandBlock,
  FaqBlock,
  ContactFormBlock,
  DisclaimerStripBlock,
  RelatedLinksBlock,
]
