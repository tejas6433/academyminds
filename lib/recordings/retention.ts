// lib/recordings/retention.ts
// Enforces the 30-day retention policy: once a recording's expiresAt has passed,
// delete the R2 object and remove the DB row so storage never grows without
// bound. Run daily by /api/cron/recordings-retention.

import { and, lt, isNotNull, eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { recordings } from '@/lib/db/schema';
import { deleteFromR2 } from '@/lib/r2';
import { deleteZoomRecording } from '@/lib/zoom';

export async function purgeExpiredRecordings(): Promise<{ purged: number }> {
  const now = new Date();

  const expired = await db
    .select()
    .from(recordings)
    .where(and(isNotNull(recordings.expiresAt), lt(recordings.expiresAt, now)))
    .limit(50); // bound per run

  let purged = 0;
  for (const rec of expired) {
    try {
      // Delete our own R2 copy if we have one.
      if (rec.r2Key) {
        await deleteFromR2(rec.r2Key);
      }
      // Belt-and-suspenders: if this row never finished transferring, the file
      // may still be on Zoom cloud. Clean that up too. Best-effort.
      if (rec.status !== 'ready' && rec.zoomMeetingId) {
        try {
          await deleteZoomRecording(rec.zoomMeetingId);
        } catch (err) {
          console.error(`[retention] Zoom cloud delete failed for meeting ${rec.zoomMeetingId}:`, err);
        }
      }
      // Remove the row only after storage is cleaned — if a delete throws, we
      // keep the row and retry next run rather than orphaning the object.
      await db.delete(recordings).where(eq(recordings.id, rec.id));
      purged++;
    } catch (err) {
      console.error(`[retention] failed to purge recording ${rec.id}:`, err);
    }
  }

  return { purged };
}
