import type { BetaUsage } from '@anthropic-ai/sdk/resources/beta/messages/messages'

/**
 * US dollars per million tokens (Anthropic list prices, October 2026). Cache writes are the
 * 5-minute rate. Used to keep the monthly budget (brief §10.7); the Anthropic console is the
 * source of truth for the bill.
 */
type Rates = { input: number; output: number; cacheWrite: number; cacheRead: number }

const rates = (input: number, output: number): Rates => ({
  input,
  output,
  cacheWrite: input * 1.25,
  cacheRead: input * 0.1,
})

export const PRICES: Record<string, Rates> = {
  'claude-sonnet-5-5': rates(2, 10),
  'claude-sonnet-5': rates(2, 10),
  'claude-sonnet-4-6': rates(3, 15),
  'claude-haiku-5-5': rates(0.1, 0.5),
  'claude-haiku-4-5': rates(1, 5),
  'claude-opus-5-5': rates(4, 20),
  'claude-opus-5': rates(5, 25),
  'claude-fable-5-1': rates(10, 50),
}

/** An unknown model is costed at the most expensive rate, so the budget never under-counts. */
const FALLBACK = PRICES['claude-fable-5-1']

export function costUSD(model: string, usage: Partial<BetaUsage> | null | undefined): number {
  if (!usage) return 0
  const price = PRICES[model] ?? FALLBACK
  const perToken = (rate: number, tokens?: number | null) => ((tokens ?? 0) * rate) / 1_000_000
  return (
    perToken(price.input, usage.input_tokens) +
    perToken(price.output, usage.output_tokens) +
    perToken(price.cacheWrite, usage.cache_creation_input_tokens) +
    perToken(price.cacheRead, usage.cache_read_input_tokens)
  )
}

/** Running totals for a changeset. */
export class Usage {
  inputTokens = 0
  outputTokens = 0
  cost = 0

  add(model: string, usage: Partial<BetaUsage> | null | undefined) {
    if (!usage) return
    this.inputTokens +=
      (usage.input_tokens ?? 0) +
      (usage.cache_creation_input_tokens ?? 0) +
      (usage.cache_read_input_tokens ?? 0)
    this.outputTokens += usage.output_tokens ?? 0
    this.cost += costUSD(model, usage)
  }
}
