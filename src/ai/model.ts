import Anthropic from '@anthropic-ai/sdk'
import type {
  BetaMessage,
  BetaMessageStreamParams,
} from '@anthropic-ai/sdk/resources/beta/messages/messages'

import { scriptedClient } from './mock'

/**
 * The one door to the Anthropic API. Server-side only: the key is read from `ANTHROPIC_API_KEY`
 * in the server environment and never reaches the browser (brief §10.7). Tests and the e2e
 * suite swap in a scripted client with the same interface.
 */
export type MessageParams = BetaMessageStreamParams

export interface ModelClient {
  /** One Messages API request, streamed; `onText` gets the reply text as it arrives. */
  create(params: MessageParams, onText?: (delta: string) => void): Promise<BetaMessage>
}

/** The model the editor uses: AI settings, then `ANTHROPIC_MODEL`, then the brief's default. */
export const editorModel = (settingsModel?: null | string) =>
  settingsModel?.trim() || process.env.ANTHROPIC_MODEL?.trim() || 'claude-sonnet-5-5'

/** The cheap model behind the financial-claims check. */
export const classifierModel = () =>
  process.env.ANTHROPIC_CLASSIFIER_MODEL?.trim() || 'claude-haiku-5-5'

export function anthropicClient(apiKey: string): ModelClient {
  const client = new Anthropic({ apiKey })
  return {
    async create(params, onText) {
      const stream = client.beta.messages.stream(params)
      if (onText) stream.on('text', onText)
      return stream.finalMessage()
    },
  }
}

/**
 * `AI_MOCK=1` runs the scripted client instead of the API, for e2e tests. It is ignored on
 * Railway (which always sets `RAILWAY_ENVIRONMENT_NAME`), so a deployed site always uses the API.
 */
export const mockEnabled = () =>
  process.env.AI_MOCK === '1' && !process.env.RAILWAY_ENVIRONMENT_NAME

/** The client for this environment, or `null` when no API key is configured. */
export function defaultClient(): ModelClient | null {
  if (mockEnabled()) return scriptedClient()
  const key = process.env.ANTHROPIC_API_KEY
  return key ? anthropicClient(key) : null
}
