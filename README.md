# AcademyMinds

Live small-group math and coding classes for Grade 5–7, taught on the Indian
curriculum — typically 2–3 years ahead of Canadian grade level. Parents enrol
and pay; students join live Zoom classes and rewatch recordings for 30 days.

## Features

- Live classes over Zoom, scheduled per grade and subject
- Automatic class recordings copied to private storage, watchable behind login +
  active subscription, auto-deleted after 30 days
- Role-based dashboards for parents, students, teachers, and admins
- Stripe subscriptions (monthly / quarterly) with self-serve checkout
- Email/password auth with JWT sessions
- Parental consent and privacy handling (PIPEDA)
- Transactional email (sign-up, password reset) via Resend

## Tech stack

- **Framework:** Next.js (App Router, React 19)
- **Database:** PostgreSQL via Drizzle ORM (hosted on Supabase)
- **Payments:** Stripe
- **Video:** Zoom cloud recording → Cloudflare R2 storage
- **Email:** Resend
- **Styling:** Tailwind CSS

## Local development

```bash
pnpm install
cp .env.example .env   # fill in your values
pnpm db:migrate        # apply migrations to the DB in POSTGRES_URL
pnpm dev
```

App runs at http://localhost:3000.

## Database migrations

- `pnpm db:generate` — generate a migration from schema changes
- `pnpm db:migrate` — apply migrations to the local DB (`POSTGRES_URL`)
- `pnpm db:migrate:prod` — apply migrations to the cloud DB (`POSTGRES_URL_PROD`)

## Environment

See `.env.example` for the full list. Core: `POSTGRES_URL`, `AUTH_SECRET`,
`BASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`.
Recordings additionally need the `ZOOM_*`, `R2_*`, and `CRON_SECRET` values.

## Deployment

Deployed on Vercel from the `main` branch. Set every variable from `.env.example`
in the Vercel project's environment settings. The recording transfer + 30-day
retention jobs run as daily Vercel Crons (`vercel.json`).
