// instrumentation.ts
// Next.js runs register() once when the server starts. Importing the env module
// here means a misconfigured deploy fails loudly at boot rather than surfacing
// as a broken request later.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./lib/env');
  }
}
