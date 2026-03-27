import { useEffect, useState } from 'react'
import type { Session, Message } from '@spool/core'
import MessageBubble from './MessageBubble.js'

interface Props {
  sessionUuid: string
}

export default function SessionDetail({ sessionUuid }: Props) {
  const [session, setSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    window.spool.getSession(sessionUuid).then((result) => {
      if (result) {
        setSession(result.session)
        setMessages(result.messages)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [sessionUuid])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-400">
        <p className="text-sm">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-400">
        <p className="text-sm">Session not found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Session header */}
      <div className="flex-none px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
        <p className="text-xs font-medium text-neutral-500 truncate">{session.projectDisplayPath}</p>
        <p className="text-sm text-neutral-800 dark:text-neutral-200 mt-0.5 truncate">{session.title ?? '(no title)'}</p>
        <p className="text-xs text-neutral-400 mt-0.5">
          {formatDate(session.startedAt)} · {session.messageCount} messages
          {session.model && ` · ${session.model}`}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-50 dark:divide-neutral-800/50">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-32 text-neutral-400">
            <p className="text-sm">No messages to display.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}
