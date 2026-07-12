# Customer Care Registry

A centralized system for support teams to log customer interactions, track issues through resolution, and analyze satisfaction trends.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- Frontend: `artifacts/customer-care-registry` (React + Vite, pages under `src/pages`)
- API routes: `artifacts/api-server/src/routes` (agents, customers, tickets, feedback, dashboard)
- DB schema: `lib/db/src/schema` (agents, customers, tickets, ticketNotes, feedback)
- API contract: `lib/api-spec/openapi.yaml`

## Architecture decisions

- Tickets carry a denormalized `customerName`/`assignedAgentName` in list/detail responses so the frontend never needs extra joins.
- Ticket `resolvedAt` is set server-side the first time status transitions to `resolved` or `closed`, used to compute average resolution time.
- Feedback is tied to a ticket + its customer (denormalized) for the global feedback log and per-customer satisfaction stats.

## Product

Support teams can log customers, open and triage tickets (status/priority/category/assignment), keep a timeline of notes per ticket, collect post-resolution feedback, and view dashboard analytics (open/urgent counts, average resolution time, satisfaction score, recurring issue categories, recent activity feed).

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
