# RETROSPECTIVE APP

## Technical Architecture Document

**Version 1.0 — February 2026**

|                |                                         |
| -------------- | --------------------------------------- |
| **Stack**      | Next.js 16 + Supabase                   |
| **UI**         | shadcn/ui + Tailwind CSS                |
| **Deployment** | Vercel                                  |
| **i18n**       | Multi-language (EN default, extensible) |
| **License**    | Open Source                             |

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Application Architecture](#3-application-architecture)
4. [Database Schema](#4-database-schema)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Realtime Architecture](#6-realtime-architecture)
7. [Internationalization (i18n)](#7-internationalization-i18n)
8. [Page Structure & Routing](#8-page-structure--routing)
9. [Core Features](#9-core-features)
10. [MCP Integration](#10-mcp-integration)
11. [Development Phases](#11-development-phases)
12. [Project Structure](#12-project-structure)
13. [Environment & Configuration](#13-environment--configuration)
14. [Performance & Optimization](#14-performance--optimization)
15. [Testing Strategy](#15-testing-strategy)

---

## 1. Project Overview

The Retrospective App is an open-source, real-time web application designed for agile teams to conduct sprint retrospectives effectively. It provides a collaborative environment where team members can share feedback, vote on items, and track action items across sprints.

### 1.1 Key Objectives

- **Real-time Collaboration:** Instant card creation, editing, and voting visible to all participants simultaneously.
- **Anonymous Participation:** Option for team members to submit feedback anonymously, encouraging honest communication.
- **Team Management:** Full authentication system with team creation, member invitations, and role-based access.
- **Facilitator Controls:** Timer management, phase control, and moderation capabilities for meeting organizers.
- **Multi-language Support:** Internationalization architecture built in from the start (next-intl). Launching with English only; additional languages (Turkish, etc.) will be added later.
- **MCP Integration:** Supabase MCP server support for AI-assisted development and database management.

---

## 2. Technology Stack

### 2.1 Core Stack

| Layer              | Technology              | Purpose                                      |
| ------------------ | ----------------------- | -------------------------------------------- |
| Frontend Framework | Next.js 16 (App Router) | SSR/SSG, API routes, middleware              |
| UI Components      | shadcn/ui               | Accessible, customizable component library   |
| Styling            | Tailwind CSS 3.4+       | Utility-first CSS framework                  |
| State Management   | Zustand + React Query   | Client state + server state                  |
| Backend/BaaS       | Supabase                | PostgreSQL, Auth, Realtime, Storage          |
| ORM                | Supabase JS Client      | Type-safe database queries                   |
| i18n               | next-intl               | Internationalization with App Router support |
| Forms              | React Hook Form + Zod   | Form handling and validation                 |
| Deployment         | Vercel                  | Edge functions, preview deployments          |
| Package Manager    | pnpm                    | Fast, disk-efficient package management      |

### 2.2 Development Tools

| Tool                     | Purpose                                 |
| ------------------------ | --------------------------------------- |
| TypeScript 5.3+          | Type safety across the entire codebase  |
| ESLint + Prettier        | Code quality and formatting             |
| Husky + lint-staged      | Pre-commit hooks                        |
| Vitest + Testing Library | Unit and integration testing            |
| Playwright               | End-to-end testing                      |
| Supabase CLI             | Local development and migrations        |
| Supabase MCP Server      | AI-assisted development via Claude Code |

---

## 3. Application Architecture

### 3.1 High-Level Architecture

The application follows a client-heavy architecture with Supabase as the backend-as-a-service. Next.js handles server-side rendering for initial page loads and SEO, while real-time interactions are managed through Supabase Realtime channels.

**Architecture Flow:**

- Browser → Next.js (Vercel Edge) → Supabase (PostgreSQL + Realtime)
- Static pages served via ISR/SSG for landing, docs, and marketing pages
- Dynamic app pages use client-side Supabase subscriptions for real-time updates
- API Routes handle complex business logic (team invitations, email notifications)

### 3.2 Data Flow Pattern

The app uses an optimistic update pattern for the best user experience. When a user adds a card or votes, the UI updates immediately while the change syncs to Supabase in the background. Other participants receive the update through Supabase Realtime Broadcast/Presence channels.

1. User performs action (add card, vote, etc.)
2. Zustand store updates optimistically (instant UI feedback)
3. Supabase mutation sent to PostgreSQL
4. Realtime channel broadcasts change to all subscribers
5. Other clients receive and apply the update
6. On error, optimistic update is rolled back

---

## 4. Database Schema

### 4.1 Core Tables

#### profiles

Extends Supabase auth.users with application-specific data.

| Column       | Type                       | Description                      |
| ------------ | -------------------------- | -------------------------------- |
| id           | UUID (PK, FK → auth.users) | User identifier                  |
| display_name | TEXT                       | User display name                |
| avatar_url   | TEXT                       | Profile picture URL              |
| locale       | TEXT DEFAULT 'en'          | Preferred language (default: en) |
| created_at   | TIMESTAMPTZ                | Account creation time            |
| updated_at   | TIMESTAMPTZ                | Last profile update              |

#### teams

Team/workspace that owns retrospective boards.

| Column      | Type                 | Description             |
| ----------- | -------------------- | ----------------------- |
| id          | UUID (PK)            | Team identifier         |
| name        | TEXT NOT NULL        | Team display name       |
| slug        | TEXT UNIQUE          | URL-friendly identifier |
| owner_id    | UUID (FK → profiles) | Team creator/owner      |
| invite_code | TEXT UNIQUE          | Shareable invite code   |
| settings    | JSONB                | Team-level settings     |
| created_at  | TIMESTAMPTZ          | Creation timestamp      |

#### team_members

Junction table for team membership with roles.

| Column    | Type                                     | Description           |
| --------- | ---------------------------------------- | --------------------- |
| id        | UUID (PK)                                | Membership identifier |
| team_id   | UUID (FK → teams)                        | Team reference        |
| user_id   | UUID (FK → profiles)                     | User reference        |
| role      | ENUM (owner, admin, facilitator, member) | Member role in team   |
| joined_at | TIMESTAMPTZ                              | When the user joined  |

#### boards

A retrospective board/session belonging to a team.

| Column         | Type                                                  | Description                                     |
| -------------- | ----------------------------------------------------- | ----------------------------------------------- |
| id             | UUID (PK)                                             | Board identifier                                |
| team_id        | UUID (FK → teams)                                     | Owning team                                     |
| title          | TEXT NOT NULL                                         | Board title (e.g., Sprint 24 Retro)             |
| template       | ENUM (mad_sad_glad, start_stop_continue, 4ls, custom) | Board template type                             |
| status         | ENUM (draft, active, voting, discussing, completed)   | Current board phase                             |
| settings       | JSONB                                                 | Timer duration, anonymous mode, max votes, etc. |
| facilitator_id | UUID (FK → profiles)                                  | Current facilitator                             |
| created_at     | TIMESTAMPTZ                                           | Creation timestamp                              |
| completed_at   | TIMESTAMPTZ                                           | When the retro was completed                    |

#### columns

Columns within a board (e.g., Mad, Sad, Glad).

| Column     | Type               | Description                    |
| ---------- | ------------------ | ------------------------------ |
| id         | UUID (PK)          | Column identifier              |
| board_id   | UUID (FK → boards) | Parent board                   |
| title      | TEXT NOT NULL      | Column header text             |
| color      | TEXT               | Column accent color (hex)      |
| icon       | TEXT               | Optional emoji/icon identifier |
| sort_order | INTEGER            | Display position               |

#### cards

Individual feedback cards within a column.

| Column       | Type                  | Description                               |
| ------------ | --------------------- | ----------------------------------------- |
| id           | UUID (PK)             | Card identifier                           |
| column_id    | UUID (FK → columns)   | Parent column                             |
| board_id     | UUID (FK → boards)    | Parent board (denormalized)               |
| author_id    | UUID (FK → profiles)  | Card creator                              |
| content      | TEXT NOT NULL         | Card text content                         |
| is_anonymous | BOOLEAN DEFAULT false | Whether author is hidden                  |
| group_id     | UUID NULLABLE         | Card grouping (for merging similar cards) |
| sort_order   | INTEGER               | Position within column                    |
| created_at   | TIMESTAMPTZ           | Creation timestamp                        |

#### votes

Votes cast on cards by participants.

| Column     | Type                 | Description                       |
| ---------- | -------------------- | --------------------------------- |
| id         | UUID (PK)            | Vote identifier                   |
| card_id    | UUID (FK → cards)    | Voted card                        |
| user_id    | UUID (FK → profiles) | Voter                             |
| board_id   | UUID (FK → boards)   | Board reference (for vote limits) |
| created_at | TIMESTAMPTZ          | Vote timestamp                    |

> _Unique constraint on (card_id, user_id) prevents duplicate votes. Board-level max_votes enforced via RLS/trigger._

#### action_items

Actionable outcomes from retrospective discussions.

| Column      | Type                           | Description             |
| ----------- | ------------------------------ | ----------------------- |
| id          | UUID (PK)                      | Action item identifier  |
| board_id    | UUID (FK → boards)             | Source board            |
| team_id     | UUID (FK → teams)              | Owning team             |
| card_id     | UUID (FK → cards) NULLABLE     | Related card (optional) |
| title       | TEXT NOT NULL                  | Action item description |
| assignee_id | UUID (FK → profiles) NULLABLE  | Assigned person         |
| status      | ENUM (open, in_progress, done) | Current status          |
| due_date    | DATE NULLABLE                  | Target completion date  |
| created_at  | TIMESTAMPTZ                    | Creation timestamp      |

#### board_participants

Tracks who joined a board session, supporting anonymous access.

| Column        | Type                          | Description                             |
| ------------- | ----------------------------- | --------------------------------------- |
| id            | UUID (PK)                     | Participant record                      |
| board_id      | UUID (FK → boards)            | Board reference                         |
| user_id       | UUID (FK → profiles) NULLABLE | Authenticated user (null for anonymous) |
| display_name  | TEXT                          | Name shown during session               |
| is_anonymous  | BOOLEAN DEFAULT false         | Anonymous participant flag              |
| session_token | TEXT UNIQUE                   | Token for anonymous session tracking    |
| joined_at     | TIMESTAMPTZ                   | Join timestamp                          |

---

## 5. Authentication & Authorization

### 5.1 Authentication Methods

- **Email/Password:** Standard Supabase Auth with email confirmation
- **OAuth Providers:** Google, GitHub (configurable)
- **Magic Link:** Passwordless email authentication
- **Anonymous Access:** Supabase anonymous auth for guest participants joining via invite link

### 5.2 Role-Based Access Control (RBAC)

Authorization is enforced at the database level via Supabase Row Level Security (RLS) policies. The role hierarchy is:

| Role            | Permissions                                                    |
| --------------- | -------------------------------------------------------------- |
| owner           | Full control: manage team, members, billing, delete team       |
| admin           | Manage members, create/edit/delete boards, manage action items |
| facilitator     | Create boards, control board phases/timer, moderate cards      |
| member          | Create cards, vote, view boards, add action items              |
| anonymous/guest | Create cards, vote (within active session only)                |

### 5.3 Key RLS Policies

Every table has RLS enabled. Key policies include:

- Team data is only visible to team members (enforced via team_members lookup)
- Cards marked as anonymous hide the author_id from non-facilitator roles
- Vote counts are visible to all, but individual votes are private
- Board modifications are restricted based on board status and user role
- Anonymous participants can only access the specific board they joined

---

## 6. Realtime Architecture

### 6.1 Channel Strategy

Each active board creates a dedicated Supabase Realtime channel. The channel handles three types of communication:

| Type             | Use Case                                       | Implementation                     |
| ---------------- | ---------------------------------------------- | ---------------------------------- |
| Broadcast        | Timer sync, phase changes, facilitator actions | channel.send() → all clients       |
| Presence         | Online participants, typing indicators         | channel.track() with user metadata |
| Postgres Changes | Card CRUD, votes, action items                 | Realtime subscriptions on tables   |

### 6.2 Channel Naming Convention

`board:{board_id}` — Main channel for each active retrospective session.

### 6.3 Presence Data Structure

Each connected participant tracks the following presence state:

- `user_id`: Unique identifier (or anonymous session token)
- `display_name`: Shown name
- `role`: Current role in the board
- `is_typing`: Whether the user is actively typing a card
- `cursor_column`: Which column the user is currently viewing/editing

### 6.4 Optimistic Updates

All mutations use optimistic updates via Zustand with rollback on error. The Supabase Realtime subscription serves as the source of truth, reconciling any differences between optimistic state and server state.

---

## 7. Internationalization (i18n)

### 7.1 Strategy

The application uses next-intl with the Next.js App Router for full internationalization support. Languages are managed through JSON message files with namespace separation. The multi-language infrastructure is built in from the start, but **only English will be implemented initially**. Additional languages (Turkish, etc.) will be added in a later phase.

### 7.2 Supported Languages

- **English (en)** — Default and initially the only language
- **Turkish (tr)** — Planned for a future phase
- Additional languages can be added by creating new message files

### 7.3 Implementation Details

- **URL Strategy:** Prefix-based routing (`/en/boards`, `/tr/boards`)
- **Detection:** Accept-Language header → saved preference → default (en)
- **Message Files:** Organized by namespace (common, auth, board, settings)
- **Date/Time:** Locale-aware formatting via Intl API
- **RTL Ready:** Architecture supports future RTL languages

### 7.4 Directory Structure

Initially only the `en/` directory is created. New locale directories are added when those languages are implemented.

```
messages/
└── en/
    ├── common.json
    ├── auth.json
    ├── board.json
    └── settings.json
```

---

## 8. Page Structure & Routing

### 8.1 Route Map

| Route                           | Type               | Description                           |
| ------------------------------- | ------------------ | ------------------------------------- |
| /[locale]                       | SSG                | Landing page with feature overview    |
| /[locale]/auth/login            | Client             | Login page (email, OAuth, magic link) |
| /[locale]/auth/register         | Client             | Registration page                     |
| /[locale]/auth/callback         | API                | OAuth callback handler                |
| /[locale]/join/[code]           | Client             | Join team via invite link             |
| /[locale]/dashboard             | Client (Protected) | User dashboard with team overview     |
| /[locale]/teams/[slug]          | Client (Protected) | Team detail with boards list          |
| /[locale]/teams/[slug]/settings | Client (Protected) | Team settings (admin+)                |
| /[locale]/teams/[slug]/members  | Client (Protected) | Member management                     |
| /[locale]/boards/[id]           | Client (Protected) | Active retrospective board            |
| /[locale]/boards/[id]/summary   | Client (Protected) | Completed board summary/report        |
| /[locale]/action-items          | Client (Protected) | Cross-team action items tracker       |
| /[locale]/settings              | Client (Protected) | User profile and preferences          |

### 8.2 Middleware

Next.js middleware handles authentication checks, locale detection, and redirects. Protected routes redirect unauthenticated users to the login page with a return URL parameter.

---

## 9. Core Features

### 9.1 Board Templates

Pre-configured retrospective formats that teams can choose when creating a new board:

| Template              | Columns                                       | Best For                     |
| --------------------- | --------------------------------------------- | ---------------------------- |
| Mad, Sad, Glad        | Mad 😡 \| Sad 😢 \| Glad 😊                   | Emotional check-in retros    |
| Start, Stop, Continue | Start ✅ \| Stop 🛑 \| Continue ➡️            | Action-oriented retros       |
| 4Ls                   | Liked \| Learned \| Lacked \| Longed For      | Comprehensive reflection     |
| KALM                  | Keep \| Add \| Less \| More                   | Balanced improvement focus   |
| Sailboat              | Wind 💨 \| Anchor ⚓ \| Rocks 🪨 \| Island 🏖️ | Visual/metaphor-based retros |
| Custom                | User-defined columns                          | Flexible, any format         |

### 9.2 Board Phases

Each retrospective follows a structured flow controlled by the facilitator:

1. **Draft:** Board is being set up, not yet visible to participants
2. **Active (Writing):** Participants add cards to columns, optionally anonymous
3. **Voting:** Writing stops, participants allocate votes to cards
4. **Discussing:** Cards sorted by votes, facilitator guides discussion one by one
5. **Completed:** Retro is archived, summary and action items are finalized

### 9.3 Timer System

The facilitator can set and control timers for each phase. Timer state is synced via Supabase Realtime Broadcast to ensure all participants see the same countdown.

- **Server-authoritative time:** Timer start/end timestamps stored in board settings
- **Client display:** Local countdown derived from server timestamp
- **Actions:** Start, pause, resume, reset, extend (+1 min)
- **Auto-advance:** Optional automatic phase transition when timer expires

### 9.4 Voting System

- **Vote allocation:** Configurable max votes per participant (default: 5)
- **Vote types:** Single vote per card or multi-vote (dot voting)
- **Privacy:** Individual votes are not revealed; only totals are shown
- **Enforcement:** Vote limits enforced via database trigger + RLS policy

### 9.5 Card Grouping

During the discussion phase, the facilitator can group similar cards together. Grouped cards display as a stack with a combined vote count, streamlining the discussion.

### 9.6 Action Items

Action items can be created during or after a retrospective. They persist across sprints and are tracked at the team level, with optional assignment and due dates. Teams can review outstanding action items at the start of each new retro.

### 9.7 Anonymous Mode

When enabled on a board, anonymous mode allows participants to submit cards without revealing their identity. The facilitator can see card ownership for moderation purposes, but other participants cannot. Anonymous participants can join via a shareable link without creating an account, using Supabase anonymous authentication.

---

## 10. MCP Integration

The project leverages Supabase MCP (Model Context Protocol) server for AI-assisted development. This enables Claude Code and other MCP-compatible tools to directly interact with the database.

### 10.1 Capabilities

- **Schema Management:** Create, alter, and inspect database tables and relationships
- **Migration Generation:** AI-assisted creation of Supabase migration files
- **RLS Policy Development:** Generate and test Row Level Security policies
- **Seed Data:** Generate realistic test data for development
- **Query Optimization:** Analyze and improve query performance
- **Edge Function Development:** Develop Supabase Edge Functions with AI assistance

### 10.2 Configuration

The Supabase MCP server is configured in the project root for Claude Code integration:

- `.mcp.json` — MCP server configuration with Supabase project URL and service role key
- `supabase/` — Migrations, seed files, and config managed via Supabase CLI

---

## 11. Development Phases

### Phase 1: Foundation (Weeks 1–3)

- Next.js 16 project setup with App Router, TypeScript, Tailwind, shadcn/ui
- Supabase project creation and MCP server configuration
- Authentication system (email, OAuth, magic link)
- Database schema creation with migrations
- RLS policies for all tables
- Basic team CRUD (create, join, manage)
- i18n setup with next-intl (EN only initially, multi-lang infrastructure ready)
- Landing page and auth pages

### Phase 2: Core Board Experience (Weeks 4–6)

- Board creation with template selection
- Real-time card CRUD within board columns
- Supabase Realtime channel setup (Broadcast + Presence + Postgres Changes)
- Voting system with configurable limits
- Board phase management (draft → active → voting → discussing → completed)
- Optimistic updates with Zustand
- Responsive layout for board view

### Phase 3: Advanced Features (Weeks 7–9)

- Timer system with facilitator controls
- Anonymous mode and guest participation
- Card grouping and merging
- Discussion mode with card-by-card navigation
- Action items creation and tracking
- Board summary/report generation
- Cross-board action items dashboard

### Phase 4: Polish & Launch (Weeks 10–12+)

- Comprehensive testing (unit, integration, e2e)
- Performance optimization (lazy loading, code splitting)
- Accessibility audit (WCAG 2.1 AA compliance)
- SEO optimization for landing pages
- Documentation (README, contributing guide, API docs)
- Open-source setup (license, issue templates, CI/CD)
- Production deployment and monitoring

---

## 12. Project Structure

The project follows a feature-based organization within the Next.js App Router structure:

| Directory                | Purpose                                               |
| ------------------------ | ----------------------------------------------------- |
| `src/app/[locale]/`      | App Router pages with locale prefix                   |
| `src/app/api/`           | API routes (webhooks, complex logic)                  |
| `src/components/ui/`     | shadcn/ui base components                             |
| `src/components/board/`  | Board-specific components (Card, Column, Timer, etc.) |
| `src/components/team/`   | Team management components                            |
| `src/components/layout/` | Layout components (Navbar, Sidebar, Footer)           |
| `src/lib/supabase/`      | Supabase client (browser + server), types, helpers    |
| `src/lib/i18n/`          | i18n configuration and utilities                      |
| `src/stores/`            | Zustand stores (board, auth, ui)                      |
| `src/hooks/`             | Custom React hooks (useBoard, useRealtime, useTimer)  |
| `src/types/`             | TypeScript type definitions and database types        |
| `src/utils/`             | Utility functions                                     |
| `messages/`              | i18n translation JSON files (tr/, en/)                |
| `supabase/`              | Supabase CLI config, migrations, seed files           |
| `tests/`                 | Test files (unit, integration, e2e)                   |

---

## 13. Environment & Configuration

### 13.1 Environment Variables

| Variable                        | Description                   |
| ------------------------------- | ----------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only service role key  |
| `NEXT_PUBLIC_APP_URL`           | Application base URL          |
| `NEXT_PUBLIC_DEFAULT_LOCALE`    | Default language (en)         |

### 13.2 Supabase Local Development

The Supabase CLI enables a full local development environment with PostgreSQL, Auth, Realtime, and Storage running in Docker containers. This ensures parity between development and production.

- `supabase init` — Initialize project configuration
- `supabase start` — Start local Supabase stack
- `supabase db reset` — Reset database and apply migrations
- `supabase migration new` — Create a new migration file
- `supabase db push` — Push migrations to remote project

---

## 14. Performance & Optimization

- **Code Splitting:** Dynamic imports for board components (loaded only when entering a board)
- **Image Optimization:** Next.js Image component with Vercel CDN
- **Database Indexes:** Indexes on foreign keys, board_id + status, team_id + slug
- **Connection Pooling:** Supabase built-in PgBouncer for connection management
- **Caching:** React Query cache for server state, ISR for static pages
- **Bundle Analysis:** Regular bundle size monitoring via @next/bundle-analyzer
- **Realtime Efficiency:** Single channel per board, targeted subscriptions (not full table)

---

## 15. Testing Strategy

| Layer             | Tool                     | Scope                                               |
| ----------------- | ------------------------ | --------------------------------------------------- |
| Unit Tests        | Vitest                   | Utility functions, hooks, Zustand stores            |
| Component Tests   | Vitest + Testing Library | UI components, form validation                      |
| Integration Tests | Vitest + Supabase Local  | API routes, RLS policies, database functions        |
| E2E Tests         | Playwright               | Critical user flows (auth, board lifecycle, voting) |
| Accessibility     | axe-core + Playwright    | WCAG 2.1 AA compliance                              |

Testing focuses on critical paths: authentication flows, real-time card operations, voting logic, and role-based access. RLS policies are tested directly against the Supabase local instance to ensure security rules work as expected.
