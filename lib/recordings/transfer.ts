// lib/recordings/transfer.ts
// Moves a class recording from Zoom cloud into our own R2 bucket, then deletes
// the Zoom copy. Designed to be crash-proof on serverless:
//
//   • Atomic claim — a row is flipped pending/failed → 'transferring' in ONE
//     UPDATE, so two overlapping runs (webhook + cron) never transfer the same
//     file twice.
//   • Idempotent — re-running a completed/claimed row is a no-op.
//   • Retryable — a crash/timeout leaves the row 'transferring'; the retry cron
//     reclaims stale ones and tries again, up to MAX_ATTEMPTS, until Zoom's
//     download token expires (~24h). Nothing is lost to a single failure.

import { Readable } from 'stream';
import type { ReadableStream as NodeReadableStream } from 'stream/web';
import { and, eq, lt, isNotNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { recordings } from '@/lib/db/schema';
import { fetchZoomRecordingStream, deleteZoomRecording } from '@/lib/zoom';
import { uploadStreamToR2, isR2Configured } from '@/lib/r2';

const MAX_ATTEMPTS = 5;
// A row stuck in 'transferring' longer than this is assumed crashed and reclaimable.
const STALE_MS = 15 * 60 * 1000; // 15 min

function objectKey(classId: number, recordingId: number, recordedAt: Date): string {
  const date = recordedAt.toISOString().slice(0, 10);
  return `recordings/${classId}/${recordingId}-${date}.mp4`;
}

/**
 * Transfer a single recording. Safe to call multiple times / concurrently.
 * Returns what happened so callers (webhook, cron) can log it.
 */
export async function transferRecording(
  recordingId: number
): Promise<'ready' | 'skipped' | 'failed'> {
  if (!isR2Configured()) return 'skipped';

  const staleBefore = new Date(Date.now() - STALE_MS);

  // Atomic claim: succeeds only if the row is transferable and under the attempt
  // cap. Transferable = pending/failed, OR a 'transferring' row whose claim went
  // stale (a crashed run). `.returning()` tells us whether WE won the claim, so
  // two overlapping runs never transfer the same file.
  const claimed = await db
    .update(recordings)
    .set({
      status: 'transferring',
      transferAttempts: sql`${recordings.transferAttempts} + 1`,
      transferStartedAt: new Date(),
    })
    .where(
      and(
        eq(recordings.id, recordingId),
        isNotNull(recordings.zoomDownloadUrl),
        lt(recordings.transferAttempts, MAX_ATTEMPTS),
        sql`(${recordings.status} IN ('pending','failed') OR (${recordings.status} = 'transferring' AND (${recordings.transferStartedAt} IS NULL OR ${recordings.transferStartedAt} < ${staleBefore})))`
      )
    )
    .returning();

  const rec = claimed[0];
  if (!rec) return 'skipped'; // someone else claimed it, or it's done / capped out

  try {
    const webStream = await fetchZoomRecordingStream(rec.zoomDownloadUrl!, rec.zoomDownloadToken!);
    // fetch() yields the DOM ReadableStream type while Readable.fromWeb expects
    // Node's structurally identical stream/web type. Cast to the precise target
    // type rather than `any` so a genuine mismatch would still be caught.
    const nodeStream = Readable.fromWeb(webStream as NodeReadableStream<Uint8Array>);
    const key = objectKey(rec.classId, rec.id, rec.recordedAt);

    const { sizeBytes } = await uploadStreamToR2(key, nodeStream, 'video/mp4');

    // Mark ready and drop the Zoom credentials — we no longer need them.
    await db
      .update(recordings)
      .set({
        status: 'ready',
        r2Key: key,
        sizeBytes,
        zoomDownloadUrl: null,
        zoomDownloadToken: null,
      })
      .where(eq(recordings.id, rec.id));

    // Free Zoom cloud storage. Best-effort: our copy is already safe, so a
    // delete failure must not fail the transfer.
    if (rec.zoomMeetingId) {
      try {
        await deleteZoomRecording(rec.zoomMeetingId);
      } catch (err) {
        console.error(`[recordings] Zoom cloud delete failed for meeting ${rec.zoomMeetingId}:`, err);
      }
    }

    return 'ready';
  } catch (err) {
    console.error(`[recordings] transfer failed for recording ${rec.id} (attempt ${rec.transferAttempts + 1}):`, err);
    // Back to 'failed' so the retry cron picks it up again (unless capped).
    await db.update(recordings).set({ status: 'failed' }).where(eq(recordings.id, rec.id));
    return 'failed';
  }
}

/**
 * Sweep for transferable recordings and process them. Called by the retry cron.
 * Reclaims rows that are pending, failed, or stuck 'transferring' (crashed),
 * as long as they still have a Zoom download URL and haven't hit the attempt cap.
 */
export async function processPendingTransfers(): Promise<{ processed: number; ready: number; failed: number }> {
  if (!isR2Configured()) return { processed: 0, ready: 0, failed: 0 };

  const staleBefore = new Date(Date.now() - STALE_MS);

  const candidates = await db
    .select({ id: recordings.id })
    .from(recordings)
    .where(
      and(
        isNotNull(recordings.zoomDownloadUrl),
        lt(recordings.transferAttempts, MAX_ATTEMPTS),
        sql`(${recordings.status} IN ('pending','failed') OR (${recordings.status} = 'transferring' AND (${recordings.transferStartedAt} IS NULL OR ${recordings.transferStartedAt} < ${staleBefore})))`
      )
    )
    .limit(20); // bound the batch so a cron run stays within time limits

  let ready = 0;
  let failed = 0;
  // Sequential: keeps memory + Zoom rate-limit pressure low. Video is big; one
  // at a time is the reliable choice over parallel.
  for (const c of candidates) {
    const result = await transferRecording(c.id);
    if (result === 'ready') ready++;
    else if (result === 'failed') failed++;
  }

  return { processed: candidates.length, ready, failed };
}
