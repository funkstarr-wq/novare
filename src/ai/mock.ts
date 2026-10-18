import type {
  BetaContentBlock,
  BetaMessage,
  BetaMessageParam,
  BetaStopReason,
} from '@anthropic-ai/sdk/resources/beta/messages/messages'

import { matchingPhrases } from './claims'
import type { MessageParams, ModelClient } from './model'

/**
 * A scripted stand-in for the Anthropic API, for the e2e suite (`AI_MOCK=1`, never on Railway).
 * It understands one request, "change the hero heading to "…"", and plays it the way the real
 * model does: read the document, propose `update_fields`, then summarise. The claims check gets
 * a verdict from the phrase rules. Anything else gets a polite refusal.
 */
let counter = 0

export function message(
  content: BetaContentBlock[],
  stopReason: BetaStopReason,
  model = 'mock-model',
): BetaMessage {
  counter += 1
  return {
    id: `msg_mock_${counter}`,
    type: 'message',
    role: 'assistant',
    model,
    content,
    stop_reason: stopReason,
    stop_sequence: null,
    usage: {
      input_tokens: 1000,
      output_tokens: 100,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
    },
  } as unknown as BetaMessage
}

export const text = (value: string): BetaContentBlock =>
  ({ type: 'text', text: value, citations: null }) as BetaContentBlock

export const toolUse = (name: string, input: Record<string, unknown>): BetaContentBlock =>
  ({ type: 'tool_use', id: `toolu_mock_${(counter += 1)}`, name, input }) as BetaContentBlock

const textOf = (content: BetaMessageParam['content']): string =>
  typeof content === 'string'
    ? content
    : content
        .map((block) =>
          block.type === 'text'
            ? block.text
            : block.type === 'tool_result'
              ? String(block.content)
              : '',
        )
        .join('\n')

export function scriptedClient(): ModelClient {
  return {
    async create(params: MessageParams, onText) {
      if (params.output_config?.format) {
        const copy = textOf(params.messages[params.messages.length - 1].content)
        const hits = matchingPhrases(copy)
        return message(
          [
            text(
              JSON.stringify({
                contains_claim: hits.length > 0,
                reason: hits.length ? `Mentions ${hits.join(', ')}.` : 'No claims.',
              }),
            ),
          ],
          'end_turn',
          params.model,
        )
      }

      const reply = script(params.messages)
      for (const block of reply.content) if (block.type === 'text') onText?.(block.text)
      return { ...reply, model: params.model }
    },
  }
}

function script(messages: BetaMessageParam[]): BetaMessage {
  // The conversation since the person's latest request.
  let start = messages.length - 1
  while (
    start > 0 &&
    !(messages[start].role === 'user' && typeof messages[start].content === 'string')
  ) {
    start -= 1
  }
  const request = textOf(messages[start].content)
  const step = messages.slice(start).filter((entry) => entry.role === 'assistant').length

  const heading = /hero heading to ["“]([^"”]+)["”]/i.exec(request)?.[1]
  const target = /<document_data source="([a-z-]+):(\d+)">/.exec(textOf(messages[0].content))
  if (!heading || !target) {
    return message(
      [text('This test assistant can only change the hero heading of the page you are editing.')],
      'end_turn',
    )
  }
  const [, collection, id] = target
  if (step === 0) {
    return message(
      [
        text('I will update the hero heading.'),
        toolUse('get_document', { collection, id: Number(id) }),
      ],
      'tool_use',
    )
  }
  if (step === 1) {
    return message(
      [toolUse('update_fields', { collection, id: Number(id), fields: { hero: { heading } } })],
      'tool_use',
    )
  }
  return message(
    [
      text(
        `I proposed changing the hero heading to “${heading}”. Apply it to the draft to preview it.`,
      ),
    ],
    'end_turn',
  )
}
