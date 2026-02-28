# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Real-time retrospective app for agile teams. Next.js 16 (App Router) + Supabase BaaS + shadcn/ui. Deployed on Vercel.

**Current status:** Phase 1 (Foundation) complete. Phase 2 (Core Board Experience) next.

See AGENTS.md for the full technical architecture document including database schema, RBAC roles, realtime architecture, and development phases.

## Commands

```bash
# Package manager: pnpm
pnpm install              # Install dependencies
pnpm dev                  # Start Next.js dev server
pnpm build                # Production build
pnpm lint                 # ESLint
pnpm format               # Prettier

# Testing (not yet configured — Phase 4)
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
- **State**: Zustand for client state (`src/stores/`), React Query for server state (`src/hooks/`)
- **Realtime**: One Supabase channel per board (`board:{board_id}`) — Broadcast (timer/phase sync), Presence (online users, typing), Postgres Changes (card/vote CRUD)
- **Auth**: Supabase Auth (email/password, Google OAuth). RBAC enforced via RLS policies at DB level. Auth state in `src/stores/auth-store.ts`, listener in `src/components/auth/auth-listener.tsx`
- **i18n**: next-intl with URL prefix routing (`/en/...`). Translation files in `messages/{locale}/{namespace}.json`. Config in `src/lib/i18n/`. Launching with English only; multi-lang infrastructure is in place for future languages
- **Forms**: React Hook Form + Zod for validation (`src/lib/validations/`)
- **Supabase Clients**: Browser (`src/lib/supabase/client.ts`), Server (`server.ts`), Middleware (`middleware.ts`), Admin (`admin.ts`)

### Project Structure
- `src/app/[locale]/` — App Router pages with locale prefix
- `src/app/[locale]/auth/` — Login, register, OAuth callback
- `src/app/[locale]/dashboard/` — User dashboard with team list
- `src/app/[locale]/teams/[slug]/` — Team detail, members, settings
- `src/app/[locale]/join/[code]/` — Join team via invite link
- `src/components/ui/` — shadcn/ui base components (button, card, input, label, form, dialog, dropdown-menu, avatar, badge, separator, sheet, sonner, tabs)
- `src/components/auth/` — Auth forms and listener
- `src/components/team/` — Team management (create dialog, card, members list, invite link)
- `src/components/layout/` — Navbar, user menu
- `src/components/providers/` — React Query provider
- `src/lib/supabase/` — Supabase clients (browser, server, middleware, admin)
- `src/lib/i18n/` — i18n config and request handler
- `src/lib/validations/` — Zod schemas (auth, team)
- `src/stores/` — Zustand stores (auth-store)
- `src/hooks/` — React Query hooks (use-teams)
- `src/types/database.ts` — Generated Supabase TypeScript types
- `messages/en/` — English translations (common, auth, dashboard, teams)

### Database (9 tables, 8 migrations applied)
profiles, teams, team_members, boards, columns, cards, votes, action_items, board_participants. All tables have RLS enabled. Full schema documented in AGENTS.md §4.

**Helper functions** (SECURITY DEFINER, fixed search_path):
- `is_team_member(team_id, user_id)` — Boolean membership check
- `get_team_role(team_id, user_id)` — Returns team_role enum
- `has_team_role(team_id, user_id, min_role)` — Role hierarchy check (owner=4 > admin=3 > facilitator=2 > member=1)

### Board Lifecycle
draft → active (writing) → voting → discussing → completed

### RBAC Hierarchy
owner > admin > facilitator > member > anonymous/guest

## Supabase Project

- **Project ID:** `oxarxloeimzvxuuwhuok`
- **Region:** eu-central-1
- **Migrations managed via:** Supabase MCP `apply_migration`
- **Types regenerated via:** Supabase MCP `generate_typescript_types` → `src/types/database.ts`

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
- Feature-based component organization (auth/, board/, team/, layout/)
- Supabase JS Client as ORM (no separate ORM)
- All DB authorization via RLS policies, not application-level checks
- shadcn/ui uses `sonner` for toasts (not deprecated `toast` component)
- Database migrations applied via Supabase MCP, not local CLI
- After schema changes: regenerate types with `generate_typescript_types` and update `src/types/database.ts`
