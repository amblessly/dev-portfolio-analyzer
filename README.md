# Dev Portfolio Analyzer

AI-powered SaaS that analyzes a developer's GitHub portfolio and produces a
hiring-readiness score, career roadmap, and actionable improvements.

## Stack

- **Next.js 15** (App Router) · React 19 · TypeScript (strict)
- **Tailwind CSS v4** + shadcn-style primitives · Framer Motion
- **Prisma + PostgreSQL (Neon)** · Redis
- **Better Auth** (email + GitHub OAuth)
- **OpenAI / OpenRouter / LangChain** via an AI gateway port
- **Recharts** · TanStack Query · React Hook Form + Zod
- **Vercel Blob / UploadThing** · Resend · Arcjet

## Architecture

Feature-based, Clean Architecture with domain / application / infrastructure
layers. See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

```
src/
  app/            Next.js routes (composition root)
  features/       business verticals
  domain/         framework-agnostic entities, scoring rules, ports
  application/    use cases / services
  lib/            infra adapters (db, ai, auth, redis, storage)
  components/     design system + ui primitives
  server/         tRPC + server actions
  config/         env (zod) + site config
```

## Setup

```bash
pnpm install
cp .env.example .env   # fill values (see Neon DATABASE_URL below)
pnpm prisma generate
pnpm prisma db push    # creates tables in Neon
pnpm dev
```

### Database (Neon)

The schema is already pushed to the Neon project `divine-snow-13292795`.
To recreate manually, paste [`scripts/push-schema.sql`](./scripts/push-schema.sql)
into the Neon SQL console, or run `pnpm prisma db push`.

Required env: `DATABASE_URL` (Neon pooled connection string).

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | Next lint |
| `pnpm prisma:studio` | Inspect DB |
| `pnpm seed` | Seed admin user |

## Deployment

- **Vercel**: import repo, set env vars, build runs `prisma generate && next build`.
- **Docker**: `docker compose up --build` (Postgres + Redis + app).

## Status

Foundation + analysis engine + dashboard + auth + admin are functional.
Career coach, resume analyzer, reports (PDF/share), and GitHub ingestion
are scaffolded via services and routes; expand as needed.
