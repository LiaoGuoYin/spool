import { useState, useEffect } from 'react'

interface AgentInfo {
  id: string
  name: string
  path: string
}

interface Props {
  onClose: () => void
}

export default function SettingsPanel({ onClose }: Props) {
  const [agents, setAgents] = useState<AgentInfo[]>([])
  const [dbPath] = useState('~/.spool/spool.db')

  useEffect(() => {
    if (!window.spool?.getAiAgents) return
    window.spool.getAiAgents().then(setAgents).catch(console.error)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[460px] max-h-[80vh] bg-warm-bg dark:bg-dark-bg border border-warm-border dark:border-dark-border rounded-[10px] shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-warm-border dark:border-dark-border">
          <h2 className="text-base font-semibold text-warm-text dark:text-dark-text">Settings</h2>
          <button onClick={onClose} className="text-warm-faint dark:text-dark-muted hover:text-warm-text dark:hover:text-dark-text transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Coding Agents */}
          <div className="mb-6">
            <h3 className="text-[11px] font-medium text-warm-faint dark:text-dark-muted tracking-[0.04em] uppercase mb-3">
              Coding Agents
            </h3>
            {agents.length === 0 ? (
              <p className="text-xs text-warm-muted dark:text-dark-muted">
                No agents detected. Install{' '}
                <a href="https://docs.anthropic.com/en/docs/claude-code" target="_blank" rel="noopener noreferrer" className="text-accent dark:text-accent-dark hover:underline">Claude Code</a>
                {' '}or{' '}
                <a href="https://github.com/openai/codex" target="_blank" rel="noopener noreferrer" className="text-accent dark:text-accent-dark hover:underline">Codex CLI</a>
                {' '}to use Agent mode.
              </p>
            ) : (
              <div className="space-y-2">
                {agents.map(agent => (
                  <div key={agent.id} className="flex items-center gap-3 px-3 py-2.5 bg-warm-surface dark:bg-dark-surface border border-warm-border dark:border-dark-border rounded-[8px]">
                    <span className="w-2 h-2 rounded-full flex-none bg-green-500" />
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-warm-text dark:text-dark-text">{agent.name}</span>
                      <span className="block text-[11px] font-mono text-warm-faint dark:text-dark-muted truncate">{agent.path}</span>
                    </div>
                    <span className="text-[10px] text-green-500 font-medium flex-none">ready</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-warm-faint dark:text-dark-muted mt-2">
              Spool detects installed agents automatically. Agent mode uses ACP to query your local data.
            </p>
          </div>

          {/* Data */}
          <div className="mb-6">
            <h3 className="text-[11px] font-medium text-warm-faint dark:text-dark-muted tracking-[0.04em] uppercase mb-3">
              Data
            </h3>
            <div className="px-3 py-2.5 bg-warm-surface dark:bg-dark-surface border border-warm-border dark:border-dark-border rounded-[8px]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-warm-muted dark:text-dark-muted">Database</span>
                <span className="text-[11px] font-mono text-warm-faint dark:text-dark-muted">{dbPath}</span>
              </div>
            </div>
            <p className="text-[11px] text-warm-faint dark:text-dark-muted mt-2">
              All data stays local. Sessions are indexed from ~/.claude and ~/.codex.
            </p>
          </div>

          {/* About */}
          <div>
            <h3 className="text-[11px] font-medium text-warm-faint dark:text-dark-muted tracking-[0.04em] uppercase mb-3">
              About
            </h3>
            <p className="text-xs text-warm-muted dark:text-dark-muted">
              Spool — a local search engine for your thinking.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
