import type { Message } from '@spool/core'

interface Props {
  message: Message
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="px-4 py-2">
        <div className="bg-neutral-100 dark:bg-neutral-800/60 rounded px-3 py-2 text-xs text-neutral-500 dark:text-neutral-400 italic">
          {message.contentText || '(summary)'}
        </div>
      </div>
    )
  }

  return (
    <div className={`px-4 py-2 ${isUser ? '' : ''}`}>
      <div className="flex items-start gap-2">
        <div className={`flex-none w-5 h-5 rounded-full mt-0.5 flex items-center justify-center text-[9px] font-bold ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-neutral-700 text-white dark:bg-neutral-300 dark:text-neutral-900'
        }`}>
          {isUser ? 'U' : 'A'}
        </div>
        <div className="flex-1 min-w-0">
          {message.toolNames.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {message.toolNames.map((name) => (
                <span key={name} className="text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded">
                  {name}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap break-words select-text cursor-text">
            {message.contentText || <span className="text-neutral-400 italic">(tool use)</span>}
          </p>
          <p className="text-[10px] text-neutral-400 mt-1">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    </div>
  )
}

function formatTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString() } catch { return '' }
}
