import 'dotenv/config';
import type { Config } from 'drizzle-kit';

// Migration target:
//   default            → POSTGRES_URL      (local Supabase, for dev)
//   MIGRATE_TARGET=prod → POSTGRES_URL_PROD (cloud Supabase, for production)
// The password is baked into the connection string in .env once, so migrations
// never prompt for it. `pnpm db:migrate` hits local, `pnpm db:migrate:prod` hits cloud.
const url =
  process.env.MIGRATE_TARGET === 'prod'
    ? process.env.POSTGRES_URL_PROD
    : process.env.POSTGRES_URL;

if (!url) {
  throw new Error(
    process.env.MIGRATE_TARGET === 'prod'
      ? 'POSTGRES_URL_PROD is not set in .env (cloud Supabase connection string).'
      : 'POSTGRES_URL is not set in .env.'
  );
}

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url },
} satisfies Config;
