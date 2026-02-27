# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Real-time retrospective app for agile teams. Next.js 16 (App Router) + Supabase BaaS + shadcn/ui. Deployed on Vercel.

The project is in early development — see AGENTS.md for the full technical architecture document including database schema, RBAC roles, realtime architecture, and development phases.

## Commands

```bash
# Package manager: pnpm
pnpm install              # Install dependencies
pnpm dev                  # Start Next.js dev server
pnpm build                # Production build
pnpm lint                 # ESLint
pnpm format               # Prettier

# Testing
pnpm test                 # Vitest unit/component tests
pnpm test:e2e             # Playwright e2e tests
pnpm test -- path/to/file # Run a single test file

# Supabase
supabase start            # Start local Supabase (Docker)
supabase db reset          # Reset DB and apply all migrations
supabase migration new <name>  # Create new migration
supabase db push           # Push migrations to remote
```

## Architecture

### Data Flow (Optimistic Updates)
1. User action → Zustand store updates instantly (optimistic)
2. Supabase mutation sent to PostgreSQL
3. Realtime channel broadcasts to all subscribers
4. On error → optimistic update rolls back

### Key Patterns
- **State**: Zustand for client state, React Query for server state
- **Realtime**: One Supabase channel per board (`board:{board_id}`) — Broadcast (timer/phase sync), Presence (online users, typing), Postgres Changes (card/vote CRUD)
- **Auth**: Supabase Auth (email, OAuth, magic link, anonymous). RBAC enforced via RLS policies at DB level
- **i18n**: next-intl with URL prefix routing (`/en/...`). Translation files in `messages/{locale}/{namespace}.json`. Launching with English only; multi-lang infrastructure is in place for future languages
- **Forms**: React Hook Form + Zod for validation

### Project Structure
- `src/app/[locale]/` — App Router pages with locale prefix
- `src/app/api/` — API routes (webhooks, complex logic)
- `src/components/ui/` — shadcn/ui base components
- `src/components/board/` — Board-specific components (Card, Column, Timer)
- `src/components/team/` — Team management components
- `src/components/layout/` — Layout components (Navbar, Sidebar, Footer)
- `src/lib/supabase/` — Supabase client (browser + server), types, helpers
- `src/lib/i18n/` — i18n configuration
- `src/stores/` — Zustand stores (board, auth, ui)
- `src/hooks/` — Custom hooks (useBoard, useRealtime, useTimer)
- `src/types/` — TypeScript types and generated database types
- `messages/` — i18n translation JSON files
- `supabase/` — Migrations, seed files, CLI config

### Database (9 tables)
profiles, teams, team_members, boards, columns, cards, votes, action_items, board_participants. All tables have RLS enabled. Full schema documented in AGENTS.md §4.

### Board Lifecycle
draft → active (writing) → voting → discussing → completed

### RBAC Hierarchy
owner > admin > facilitator > member > anonymous/guest

## MCP Servers

Three MCP servers are configured (`.mcp.json`):
- **supabase** — Database management, migrations, RLS policies, Edge Functions
- **next-devtools** — Dev server diagnostics, error detection
- **shadcn** — Component discovery, installation, examples

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_DEFAULT_LOCALE  # default: en
```

## Conventions

- TypeScript strict mode
- Default locale is English (en). Multi-lang infrastructure ready, additional languages added later
- Feature-based component organization (board/, team/, layout/)
- Supabase JS Client as ORM (no separate ORM)
- All DB authorization via RLS policies, not application-level checks
