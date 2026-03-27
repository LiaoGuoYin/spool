export type Source = 'claude' | 'codex'

export interface ParsedMessage {
  uuid: string
  parentUuid: string | null
  role: 'user' | 'assistant' | 'system'
  contentText: string
  timestamp: string
  isSidechain: boolean
  toolNames: string[]
  seq: number
}

export interface ParsedSession {
  source: Source
  sessionUuid: string
  filePath: string
  title: string
  cwd: string
  model: string
  startedAt: string
  endedAt: string
  messages: ParsedMessage[]
}

export interface Session {
  id: number
  projectId: number
  sourceId: number
  sessionUuid: string
  filePath: string
  title: string | null
  startedAt: string
  endedAt: string
  messageCount: number
  hasToolUse: boolean
  cwd: string | null
  model: string | null
  source: Source
  projectDisplayPath: string
  projectDisplayName: string
}

export interface Message {
  id: number
  sessionId: number
  msgUuid: string | null
  parentUuid: string | null
  role: 'user' | 'assistant' | 'system'
  contentText: string
  timestamp: string
  isSidechain: boolean
  toolNames: string[]
  seq: number
}

export interface FragmentResult {
  rank: number
  sessionId: number
  sessionUuid: string
  sessionTitle: string
  source: Source
  project: string
  startedAt: string
  snippet: string
  messageRole: string
  messageTimestamp: string
}

export interface StatusInfo {
  dbPath: string
  totalSessions: number
  claudeSessions: number
  codexSessions: number
  lastSyncedAt: string | null
  dbSizeBytes: number
}

export interface SyncResult {
  added: number
  updated: number
  errors: number
}
