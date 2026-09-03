import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.POSTGRES_URL;

// `next build` imports this module while collecting page data — even for dynamic
// routes — so throwing here on a missing env var crashes the whole build. The DB
// isn't actually needed to BUILD, only at runtime, so during the build phase we
// fall back to a placeholder connection string (postgres.js connects lazily, so
// nothing actually dials out). At runtime a missing var still fails loudly.
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

if (!url && !isBuildPhase) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

// Serverless connection settings.
//
// Every Vercel invocation can spin up a fresh instance, and each one opening its
// own pool exhausts the database's connection limit fast ("max clients reached").
// So: exactly one connection per instance, and let it close when idle rather
// than holding the slot open.
//
// prepare:false is REQUIRED when talking to a transaction-mode pooler
// (Supabase port 6543 / pgbouncer): prepared statements are bound to a single
// backend connection, which transaction pooling does not guarantee you keep.
function createClient(connectionString: string) {
  return postgres(connectionString, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
}

// Reuse the client across hot reloads in development. Without this, every HMR
// cycle leaks another connection until the pool is full.
const globalForDb = globalThis as unknown as { __amClient?: ReturnType<typeof createClient> };

export const client =
  globalForDb.__amClient ??
  createClient(url ?? 'postgres://build:build@127.0.0.1:5432/build');

if (process.env.NODE_ENV !== 'production') globalForDb.__amClient = client;

export const db = drizzle(client, { schema });
