import { useEffect, useState, useCallback, useRef } from 'react'
import type { FragmentResult, Session } from '@spool/core'
import SearchBar from './components/SearchBar.js'
import FragmentResults from './components/FragmentResults.js'
import RecentSessions from './components/RecentSessions.js'
import SessionDetail from './components/SessionDetail.js'
import StatusBar from './components/StatusBar.js'

type View = 'search' | 'session'

export default function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FragmentResult[]>([])
  const [recentSessions, setRecentSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [view, setView] = useState<View>('search')
  const [isSearching, setIsSearching] = useState(false)
  const [syncStatus, setSyncStatus] = useState<{ phase: string; count: number; total: number } | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load recent sessions on mount
  useEffect(() => {
    window.spool.listSessions(30).then(setRecentSessions).catch(console.error)
  }, [])

  // Subscribe to sync progress and new sessions
  useEffect(() => {
    const offProgress = window.spool.onSyncProgress((e) => {
      setSyncStatus(e)
      if (e.phase === 'done') {
        setTimeout(() => setSyncStatus(null), 3000)
        // Refresh recent sessions
        window.spool.listSessions(30).then(setRecentSessions).catch(console.error)
        // Re-run search if active
        if (query.trim()) doSearch(query)
      }
    })
    const offNew = window.spool.onNewSessions(() => {
      window.spool.listSessions(30).then(setRecentSessions).catch(console.error)
      if (query.trim()) doSearch(query)
    })
    return () => { offProgress(); offNew() }
  }, [query])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    try {
      const res = await window.spool.search(q, 20)
      setResults(res)
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleQueryChange = useCallback((q: string) => {
    setQuery(q)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => doSearch(q), 200)
  }, [doSearch])

  const handleOpenSession = useCallback((uuid: string) => {
    setSelectedSession(uuid)
    setView('session')
  }, [])

  const handleBack = useCallback(() => {
    setView('search')
    setSelectedSession(null)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      {/* Header: outer div is the full title bar area (draggable).
          pt-10 ensures the search bar sits below the traffic light buttons (y:16).
          Interactive elements inside automatically opt out via styles.css. */}
      <div className="drag-region flex-none pt-10 px-4 pb-3">
        <SearchBar
          query={query}
          onChange={handleQueryChange}
          onBack={view === 'session' ? handleBack : undefined}
          isSearching={isSearching}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {view === 'session' && selectedSession ? (
          <SessionDetail sessionUuid={selectedSession} />
        ) : query.trim() ? (
          <FragmentResults
            results={results}
            query={query}
            onOpenSession={handleOpenSession}
          />
        ) : (
          <RecentSessions
            sessions={recentSessions}
            onOpenSession={handleOpenSession}
          />
        )}
      </div>

      {/* Status bar */}
      <StatusBar syncStatus={syncStatus} />
    </div>
  )
}
