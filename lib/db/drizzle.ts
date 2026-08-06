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

export const client = postgres(url ?? 'postgres://build:build@127.0.0.1:5432/build');
export const db = drizzle(client, { schema });
