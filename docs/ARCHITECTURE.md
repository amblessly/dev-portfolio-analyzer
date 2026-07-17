# Dev Portfolio Analyzer — Enterprise Architecture

> Production-grade SaaS that uses AI to analyze developer portfolios & GitHub accounts,
> producing scoring, career coaching, and actionable roadmaps.

---

## 1. Product Overview

| Layer | Decision |
| --- | --- |
| Type | B2C SaaS (freemium → paid) targeting developers seeking hiring readiness |
| Core value | AI-driven portfolio analysis → scores, strengths/weaknesses, career roadmap |
| Multi-tenant | Single database, `userId` scoping on every row (row-level ownership) |
| Billing | (future) Stripe — schema预留 `subscription`, `plan` fields |

---

## 2. High-Level Architecture (Clean Architecture + Feature-Based)

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│   Next.js App Router · Server Components first · RSC + ISR   │
│   TanStack Query (client cache) · Framer Motion (motion)     │
└───────────────┬───────────────────────────┬─────────────────┘
                │                           │
        ┌───────▼────────┐          ┌───────▼────────┐
        │  Server Actions │          │   tRPC Router  │   (mutations / realtime-ish)
        └───────┬────────┘          └───────┬────────┘
                │                           │
                ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       Application Layer                       │
│   Use Cases / Service Layer (orchestration, transactions)    │
│   - AnalysisService  - CareerCoachService                    │
│   - ResumeService    - ReportService    - UserService        │
└───────────────┬───────────────────────────┬─────────────────┘
                │                           │
        ┌───────▼────────┐          ┌───────▼────────┐
        │ Repository I/F │          │   AI Gateway   │
        │ (ports)        │          │ (OpenAI/OR/LC) │
        └───────┬────────┘          └───────┬────────┘
                │                           │
                ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                         Domain Layer                          │
│   Entities, Value Objects, Domain Services, Scoring Rules    │
│   (framework-agnostic, zero infra deps)                      │
└───────────────┬───────────────────────────┬─────────────────┘
                │                           │
        ┌───────▼────────┐          ┌───────▼────────┐
        │  Prisma Repo   │          │  Redis Cache   │
        │  (adapters)    │          │  (rate limit)  │
        └───────┬────────┘          └───────┬────────┘
                │                           │
                ▼                           ▼
        ┌──────────────┐          ┌──────────────────┐
        │ PostgreSQL   │          │   Neon / Vercel  │
        │  (Prisma)    │          │  Blob / Upload   │
        └──────────────┘          └──────────────────┘
```

**Dependency rule:** Outer layers depend on inner layers. Domain never imports Prisma,
Next.js, or AI SDK. Adapters implement ports defined in domain/application.

---

## 3. Folder Structure (Feature-Based)

```
dev-portfolio-analyzer/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── scripts/
│   └── push-schema.sql            # raw DDL fallback for Neon console
├── public/
├── src/
│   ├── app/                       # Next.js App Router (composition root)
│   │   ├── (auth)/
│   │   │   ├── sign-in/page.tsx
│   │   │   └── sign-up/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx         # sidebar + topbar shell
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── analyzer/page.tsx
│   │   │   ├── coach/page.tsx
│   │   │   ├── resume/page.tsx
│   │   │   ├── checklist/page.tsx
│   │   │   ├── activity/page.tsx
│   │   │   └── reports/page.tsx
│   │   ├── admin/
│   │   │   ├── analytics/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   └── feedback/page.tsx
│   │   ├── share/[token]/page.tsx
│   │   ├── api/
│   │   │   ├── trpc/[trpc]/route.ts
│   │   │   ├── auth/[...all]/route.ts
│   │   │   └── webhooks/resend/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx               # marketing landing
│   │
│   ├── features/                  # business verticals (bounded contexts)
│   │   ├── auth/
│   │   ├── github/                # GitHub OAuth + API client + ingestion
│   │   ├── analysis/              # scoring engine + AI orchestration
│   │   ├── career-coach/          # AI coach + roadmap
│   │   ├── resume/                # resume parse + analyze
│   │   ├── reports/               # PDF export + public share
│   │   ├── activity/              # coding activity + skill graph
│   │   ├── subscription/          # plans (future Stripe)
│   │   └── admin/
│   │
│   ├── lib/                       # cross-cutting infra (adapters)
│   │   ├── db/prisma.ts           # singleton client
│   │   ├── redis.ts
│   │   ├── auth.ts                # Better Auth config
│   │   ├── ai/
│   │   │   ├── provider.ts        # AI gateway (OpenAI/OpenRouter)
│   │   │   ├── langchain.ts
│   │   │   └── prompts/
│   │   ├── storage/blob.ts
│   │   ├── email/resend.ts
│   │   ├── security/arcjet.ts
│   │   └── utils.ts
│   │
│   ├── domain/                    # framework-agnostic core
│   │   ├── analysis/
│   │   │   ├── entities.ts
│   │   │   ├── scoring-rules.ts   # pure scoring functions
│   │   │   └── ports.ts           # interfaces (IAnalysisRepository, IAIProvider)
│   │   ├── user/
│   │   └── shared/
│   │
│   ├── application/               # use cases / services
│   │   ├── analysis/
│   │   │   ├── analysis.service.ts
│   │   │   └── dtos.ts
│   │   ├── career-coach/
│   │   ├── resume/
│   │   ├── reports/
│   │   └── user/
│   │
│   ├── components/                # shared UI (design system + shadcn)
│   │   ├── ui/                    # shadcn primitives
│   │   ├── layout/
│   │   ├── charts/                # Recharts wrappers
│   │   └── feedback/
│   │
│   ├── server/                    # tRPC + server actions plumbing
│   │   ├── trpc.ts
│   │   ├── routers/
│   │   └── actions/
│   │
│   ├── config/                    # env schema (zod), site config
│   │   ├── env.ts
│   │   └── site.ts
│   │
│   ├── styles/globals.css         # Tailwind v4 + design tokens
│   └── types/
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── README.md
└── package.json
```

---

## 4. Domain Model & Entity Relationships

```
User 1──1 AuthAccount (Better Auth)
  │
  ├── 1──* GitHubConnection (oauth tokens, username)
  │        └── 1──* Repository (ingested repos)
  │                 └── 1──1 Analysis (scores + breakdown)
  │
  ├── 1──* Resume (uploaded / pasted text)
  │        └── 1──1 ResumeAnalysis
  │
  ├── 1──* CareerRoadmap (generated)
  │
  ├── 1──* Report (PDF exports / public shares w/ token)
  │
  ├── 1──* ActivitySnapshot (weekly coding metrics)
  │        └── 1──* SkillProgress
  │
  └── 1──* Feedback
```

---

## 5. Scoring Engine (Domain Pure Functions)

`domain/analysis/scoring-rules.ts` exports deterministic, unit-testable functions:

- `computeRepositoryQualityScore(metrics)` — structure, tests, CI, README
- `computeCommitConsistencyScore(commits)` — frequency, regularity (std-dev of gaps)
- `computeDocumentationScore(readme, docs/)` — length, sections, examples
- `computeComplexityScore(loc, deps, modules)` — weighted
- `computePortfolioCompletenessScore(projects, ...)` — checklist coverage
- `computeDeploymentScore()` — detected deploy badges / vercel.json / CI deploy
- `computeOverallScore(breakdown)` — weighted aggregate (0–100)
- `estimateLevel(scores)` → Junior | Mid | Senior (threshold-based, explainable)
- `computeHiringReadiness(scores, resume)` — weighted (0–100)

All AI results are **validated with Zod** and merged with deterministic scores
(reduces hallucination, guarantees score bounds).

---

## 6. AI Gateway (Ports & Adapters)

```ts
// domain/analysis/ports.ts
export interface IAIProvider {
  analyzeRepository(input: RepoInput): Promise<RepoAnalysisResult>;
  coach(input: CoachInput): Promise<CoachResult>;
  analyzeResume(input: ResumeInput): Promise<ResumeResult>;
}
```

- Adapter `lib/ai/provider.ts` routes to OpenAI **or** OpenRouter via env flag.
- LangChain used for structured-output chains + prompt composition.
- Every AI call wrapped in `withRetry + withTimeout + token accounting`.
- Cost tracked into `AIUsage` table for admin analytics.

---

## 7. Tech Stack Mapping

| Concern | Tech |
| --- | --- |
| Framework | Next.js 15 App Router, React 19, TS (strict) |
| Styling | Tailwind v4, shadcn/ui, CSS vars for theming |
| Motion | Framer Motion |
| API | Server Actions + tRPC (TanStack Query) |
| Data | Prisma + PostgreSQL (Neon), Redis (cache/rate-limit) |
| Auth | Better Auth (GitHub OAuth) |
| AI | OpenAI / OpenRouter / LangChain |
| Charts | Recharts |
| Storage | Vercel Blob + UploadThing (resumes) |
| Email | Resend |
| Security | Arcjet (rate limit / bot / shield) |
| Forms | React Hook Form + Zod |
| Deploy | Vercel + Docker |

---

## 8. Database Schema (Prisma → Neon)

See `prisma/schema.prisma`. Key tables:
`User, Account, Session, GitHubConnection, Repository, Analysis,
Resume, ResumeAnalysis, CareerRoadmap, Report, ActivitySnapshot,
SkillProgress, Feedback, AIUsage, AdminLog`.

Deployment to Neon: run `pnpm prisma db push` OR paste
`scripts/push-schema.sql` into the Neon SQL console (project
`divine-snow-13292795`).

---

## 9. Security & Compliance

- Arcjet on all public/server actions (shield + rate limit + bot detection).
- Better Auth session cookies, CSRF protection, secure flags.
- All user data row-scoped by `userId`; tRPC/auth middlewares enforce.
- Secrets via env only; never logged. AI tokens redacted.
- Public share reports use unguessable UUID tokens, revocable.

---

## 10. Roadmap / Build Phases

1. **Foundation**: scaffold, env, Prisma, Neon push, auth, design system.
2. **GitHub ingestion + analysis engine + scoring**.
3. **Dashboard, charts, activity, skill graph**.
4. **Career coach, resume analyzer, reports (PDF + share)**.
5. **Admin analytics, feedback, AI usage**.
6. **Polish**: animations, a11y, responsive, Docker, deploy.

---

## 11. Non-Functional Requirements

- Core Web Vitals green; RSC-first to minimize JS.
- AI calls async (background job via Redis queue later) + streaming UX.
- 99.9% target; Neon autoscale; Redis for hot caches.
- WCAG 2.1 AA; keyboard nav; prefers-reduced-motion respected.
