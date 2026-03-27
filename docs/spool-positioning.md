# Spool

> A local search engine for your thinking.

## One-liner

Open-source macOS app that captures your thinking as it happens across Claude Code, Codex CLI, and ChatGPT — and makes it searchable, instantly, on your machine.

---

## Problem

You think out loud with AI. That thinking disappears.

Last Tuesday you worked through a database sharding strategy with Claude Code. Two hours of real reasoning — tradeoffs evaluated, edge cases surfaced, a decision reached. Today you're in a new session and none of that exists. You re-explain. You re-reason. You reach the same conclusion again.

This isn't a "session management" problem. It's a compounding problem. Your thinking doesn't build on itself because it has no memory. Every AI session is day one.

The tools that hold your thinking don't help you find it:

- **Claude Code** stores sessions in `~/.claude/projects/` as undocumented JSONL. No search. No export button.
- **Codex CLI** stores in `~/.codex/`. New, poorly documented, no tooling.
- **ChatGPT / Gemini web** is trapped in the browser. Export is a manual zip download, once a month if you remember.

And none of them talk to each other. The architectural decision you made in ChatGPT last month never reaches Claude Code today.

---

## Solution

**Spool** captures your thinking as it happens, across every AI tool you use, and gives you a local search engine to find and continue it.

Three things Spool does:

### Capture — silent, continuous

Spool runs in the background and captures your thinking as it happens:

- Watches `~/.claude/` and `~/.codex/` for new sessions, indexes in real time
- Imports ChatGPT / Gemini history via [OpenCLI](https://github.com/jackwener/opencli) browser bridge
- Parses official data exports (ChatGPT zip, Gemini takeout) as fallback
- Normalizes everything into a unified, searchable index — with full metadata: timestamps, tool, project, files touched

No commands to remember. No export step. Your thinking is captured the moment it happens.

### Search — fragment-level, instant

The search box is the product.

Not session titles. Not file names. Spool searches the content of your thinking — the actual words, decisions, and reasoning inside every conversation. Results show the matching fragment directly, like Spotlight, not a session card that makes you dig again.

Full-text and semantic. "数据库选型" finds the conversation where you debated PostgreSQL vs. MySQL. "race condition" finds the debug session where you spent two hours before finding the goroutine issue.

The search box is the first thing you see when Spool opens. There is no other primary interface.

### Search from CLI — the `/spool` skill

If you're already inside Claude Code, you don't need to open the GUI. Spool installs a `/spool` skill into `~/.claude/skills/` and a `spool` CLI binary at install time. The skill calls the binary, which queries the local index and returns matching fragments directly as context.

```
> /spool last month's auth token refresh architecture discussion
> Based on that, let's redesign the refresh flow for the new service
```

The thinking is recalled mid-session without switching apps. The GUI is for when you're not yet in an agent and need to find something first.

### Continue — three ways to use what you find

Finding your thinking is only half of it. Three buttons live next to every search result:

- **Copy** — the matching fragment goes to your clipboard, usable anywhere
- **Resume** — runs `claude --resume <session-id>` in your terminal, dropping you back into that exact conversation (only active for Claude Code sessions; grayed out for ChatGPT/Gemini results)
- **New session** — writes the fragment to `~/.spool/buffer.md` and opens a new `claude` session with it as starting context; the right move when you found something in ChatGPT and want to continue the thinking in Claude Code

No detail page. Find it → use it, two steps.

---

## Why local-first

The data sources Spool needs to index are already local. Claude Code sessions live in `~/.claude/`. Codex sessions live in `~/.codex/`. ChatGPT and Gemini run in a browser on the same machine — a local browser bridge can read them directly without routing anything through a server.

Local-first isn't a privacy stance. It's the architecturally correct answer when everything you're capturing is already on your computer. A cloud intermediary would add latency, a sync step, an account, and a point of failure — for no benefit.

Cloud sync will be offered in a future phase as an opt-in for multi-device access. The default will always be local-only, because local is simpler.

---

## Why open source

You shouldn't have to trust us that nothing leaves your machine. Open source means you can verify it.

Every byte of the index lives in `~/.spool/`. The ingest code is readable. The skill and CLI binary are auditable. If Spool ever shipped telemetry, anyone could see it.

This also means the format is yours forever. No lock-in. No deprecation that orphans your data.

---

## The search-first UX

Most tools that handle your AI history are session browsers: a sidebar of sessions, click to open, scroll to find. This is the wrong model.

200 sessions is not a browsing problem. It's a search problem.

Three reasons people open Spool:

**80%: "I'm looking for something specific."**
They remember a fragment — "we debated the auth approach" or "that race condition debug" — not a session ID or date. Spool's search box is the first and only focus when the app opens. Results show the matching fragment immediately, not a card that requires another click.

**~15%: "I found it — now I need to use it."**
Copy, Resume, or New session. Three buttons, next to the result, always visible. No detail page required.

**~5%: "Did everything sync?"**
A single status line at the bottom: `● Synced · 2 minutes ago · 203 sessions`. Tap to expand source-by-source status. Red only when something needs attention.

This hierarchy — search first, action second, status ambient — is the full product.

---

## Why now

- Claude Code and Codex CLI are the first agent CLIs good enough that people accumulate hundreds of meaningful sessions. A year ago this wasn't true.
- Both ecosystems are growing fast and are mutually incompatible. Neither Anthropic nor OpenAI will build cross-agent tooling — it's against their incentives.
- The web platforms (ChatGPT, Gemini) are where most research and brainstorming happens, but that thinking never flows back into CLI workflows.
- OpenCLI has solved the hard browser ingestion problem, making ChatGPT/Gemini import viable without brittle scrapers.
- The "AI native" productivity tool wave (Obsidian plugins, Roam extensions, Mem.ai) is attacking note-taking. None of them capture thinking that already happened inside AI tools. That gap is open.

---

## Competitive landscape

| Tool | What it does | The gap |
|---|---|---|
| **Claude.ai search** | Searches claude.ai conversations | Claude only, web only, no CLI sessions |
| **ChatGPT search** | Searches ChatGPT conversations | ChatGPT only, no CLI sessions |
| **Obsidian / Roam** | Searches notes you wrote | Requires you to write things down |
| **Mem.ai** | AI-powered note search | Requires input, cloud, subscription |
| **Claudebin** | Share Claude Code sessions as URLs | No search, no cross-tool, no local |
| **claude-conversation-extractor** | CLI export of Claude Code → Markdown | One-shot export, no sync, no search |
| **AI Exporter** (Chrome ext) | Export web chats to PDF/MD | No CLI sessions, no search |
| **claude-backup** | Scrape claude.ai to local JSON | Fragile, claude.ai only, no search |

The gap none of these fill: **a search engine that indexes thinking from every AI tool, runs locally, and requires zero manual input.**

Note-taking tools require you to write things down. That's not capture — that's transcription. Spool captures thinking that already happened, in the medium where it happened.

---

## User persona

**The developer who thinks with AI, daily.**

- Uses Claude Code for architecture and implementation, ChatGPT for research and brainstorming, Codex for secondary implementation
- Has 100–300 Claude Code sessions across 5+ projects
- Has re-explained the same system context to AI agents dozens of times this month
- Has at least once reached a decision in ChatGPT that they then lost and had to re-derive in Claude Code
- Knows the pain. Has tried exporting. Has a folder of markdown files they never open.

This persona expands in Phase 2: researchers, writers, and designers who use AI web tools for thinking but have no CLI workflow. The wedge is developers because their sessions are the most structured and most recoverable.

---

## Phases

```
Phase 1 (now)     Capture: Claude Code + Codex CLI (local file watching)
                  Search: Full-text across all indexed sessions
                  Continue: Copy · Resume · New session with context
                  CLI skill: /spool <query> from inside Claude Code
                  Status: Ambient sync indicator
                  → macOS app, open source, local-first

Phase 2           Capture: ChatGPT + Gemini web via OpenCLI bridge
                  Search: Semantic (cross-tool, concept-level)
                  → Thinking from web platforms enters the same index

Phase 3           Mobile: Read and search your thinking on iPhone
                  Cloud sync: Opt-in, E2EE, user-controlled keys

Phase 4           Capture: Any agent CLI that ships
                  (Grok CLI, Gemini CLI, open-source agents)
                  → Spool becomes tool-agnostic infrastructure
```

The expansion logic: capture more thinking, make search smarter, make the index available everywhere. The core product — local search for your thinking — stays constant across all phases.

---
