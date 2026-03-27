import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import type { ParsedSession, ParsedMessage } from '../types.js'

interface CodexRecord {
  timestamp: string
  type: string
  payload?: Record<string, unknown>
}

export function parseCodexSession(filePath: string): ParsedSession | null {
  let raw: string
  try {
    raw = readFileSync(filePath, 'utf8')
  } catch {
    return null
  }

  const lines = raw.split('\n').filter(l => l.trim().length > 0)
  const eventMessages: ParsedMessage[] = []
  const responseMessages: ParsedMessage[] = []
  let sessionUuid = ''
  let cwd = ''
  let model = ''

  // Extract UUID from filename: rollout-2026-03-23T17-13-24-{uuid}.jsonl
  const fileMatch = basename(filePath).match(/rollout-.+-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.jsonl$/)
  if (fileMatch?.[1]) sessionUuid = fileMatch[1]

  for (const line of lines) {
    let record: CodexRecord
    try {
      record = JSON.parse(line) as CodexRecord
    } catch {
      continue
    }

    const { type, payload, timestamp } = record
    if (!timestamp) continue

    if (type === 'session_meta' && payload) {
      if (!sessionUuid && payload['id']) sessionUuid = payload['id'] as string
      if (payload['cwd']) cwd = payload['cwd'] as string
      continue
    }

    if (type === 'turn_context' && payload) {
      if (payload['model']) model = payload['model'] as string
      if (!cwd && payload['cwd']) cwd = payload['cwd'] as string
      continue
    }

    if (type === 'event_msg' && payload) {
      const msgType = payload['type'] as string | undefined
      if (msgType === 'user_message' && payload['message']) {
        const text = String(payload['message']).trim()
        if (text) {
          eventMessages.push({
            uuid: `codex-${sessionUuid}-u-${eventMessages.length}`,
            parentUuid: null,
            role: 'user',
            contentText: text,
            timestamp,
            isSidechain: false,
            toolNames: [],
            seq: eventMessages.length,
          })
        }
      } else if (msgType === 'agent_message' && payload['message']) {
        const text = String(payload['message']).trim()
        if (text) {
          eventMessages.push({
            uuid: `codex-${sessionUuid}-a-${eventMessages.length}`,
            parentUuid: null,
            role: 'assistant',
            contentText: text,
            timestamp,
            isSidechain: false,
            toolNames: [],
            seq: eventMessages.length,
          })
        }
      }
      continue
    }

    if (type === 'response_item' && payload) {
      const role = payload['role'] as string | undefined
      if (role === 'assistant') {
        const content = payload['content']
        if (Array.isArray(content)) {
          const text = (content as Array<{ type?: string; text?: string }>)
            .filter(c => c.type === 'output_text' || c.type === 'text')
            .map(c => c.text ?? '')
            .join('\n')
            .trim()
          if (text) {
            responseMessages.push({
              uuid: `codex-${sessionUuid}-ri-${responseMessages.length}`,
              parentUuid: null,
              role: 'assistant',
              contentText: text,
              timestamp,
              isSidechain: false,
              toolNames: [],
              seq: responseMessages.length,
            })
          }
        }
      }
      continue
    }
  }

  // Strategy: use event_msg for UI (concise); supplement with response_items for
  // FTS richness when event_msgs are sparse. We index both but deduplicate.
  //
  // If we have event_msgs, use them as the primary message list.
  // response_items are added as system-level messages for FTS indexing only.
  let messages: ParsedMessage[]
  if (eventMessages.length > 0) {
    messages = [...eventMessages]
    // Add response_items as sidechain messages for FTS richness
    for (const rm of responseMessages) {
      messages.push({ ...rm, isSidechain: true, seq: messages.length })
    }
  } else {
    messages = responseMessages
  }

  if (messages.length === 0) return null

  // Re-number seq
  messages = messages.map((m, i) => ({ ...m, seq: i }))

  const firstUserMsg = messages.find(m => m.role === 'user' && !m.isSidechain)
  const title = firstUserMsg?.contentText.slice(0, 120) ?? '(no title)'
  const timestamps = messages.filter(m => !m.isSidechain).map(m => m.timestamp).sort()

  return {
    source: 'codex',
    sessionUuid: sessionUuid || filePath,
    filePath,
    title,
    cwd,
    model,
    startedAt: timestamps[0] ?? new Date().toISOString(),
    endedAt: timestamps[timestamps.length - 1] ?? new Date().toISOString(),
    messages,
  }
}
