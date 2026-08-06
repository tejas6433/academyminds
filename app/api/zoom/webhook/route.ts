// app/api/zoom/webhook/route.ts
// Receives Zoom event notifications. On `recording.completed` it matches the
// meeting to a class and inserts a PENDING recording row, then kicks off a
// background transfer that copies the MP4 from Zoom cloud into our own R2 bucket
// (see lib/recordings/transfer.ts). The recording becomes watchable once the
// transfer finishes (status='ready'). Also answers the one-time endpoint URL
// validation challenge.

import { NextRequest, NextResponse, after } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { classes, recordings } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { verifyZoomWebhook, buildZoomUrlValidationResponse } from '@/lib/zoom';
import { transferRecording } from '@/lib/recordings/transfer';

// How long students can rewatch a recording before it's purged.
const RETENTION_DAYS = 30;

interface ZoomRecordingFile {
  file_type?: string;
  recording_type?: string;
  play_url?: string;
  download_url?: string;
  recording_start?: string;
  recording_end?: string;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-zm-signature');
  const timestamp = request.headers.get('x-zm-request-timestamp');

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 1) URL validation challenge (sent once when you save the webhook URL).
  if (payload.event === 'endpoint.url_validation') {
    const plainToken = payload.payload?.plainToken;
    return NextResponse.json(buildZoomUrlValidationResponse(plainToken));
  }

  // 2) Verify signature for all real events.
  if (!verifyZoomWebhook(rawBody, signature, timestamp)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // 3) Handle recording completion → auto-publish to students.
  if (payload.event === 'recording.completed') {
    const obj = payload.payload?.object ?? {};
    const meetingId = obj.id ? String(obj.id) : null;
    if (!meetingId) {
      return NextResponse.json({ ok: true, note: 'no meeting id' });
    }

    const cls = (await db.select().from(classes).where(eq(classes.zoomMeetingId, meetingId)).limit(1))[0];
    if (!cls) {
      // Unknown meeting — acknowledge so Zoom stops retrying.
      return NextResponse.json({ ok: true, note: 'no matching class' });
    }

    const files: ZoomRecordingFile[] = obj.recording_files ?? [];
    // Prefer the shared video recording.
    const video =
      files.find((f) => f.file_type === 'MP4' && f.recording_type === 'shared_screen_with_speaker_view') ??
      files.find((f) => f.file_type === 'MP4') ??
      files[0];

    if (!video || !video.download_url) {
      return NextResponse.json({ ok: true, note: 'no downloadable video file' });
    }

    const start = video.recording_start ? new Date(video.recording_start) : new Date();
    const end = video.recording_end ? new Date(video.recording_end) : start;
    const durationMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
    const recordedDate = start.toISOString().slice(0, 10);

    // Zoom's per-event download token authorizes an authenticated download of
    // the file for ~24h. It's a sibling of `payload`, not inside the object.
    const downloadToken: string | undefined = payload.download_token;
    if (!downloadToken) {
      return NextResponse.json({ ok: true, note: 'no download token' });
    }

    // Idempotency: Zoom retries webhooks. Don't create a second row for a
    // recording we've already ingested for this meeting + start time.
    const existing = await db
      .select({ id: recordings.id })
      .from(recordings)
      .where(and(eq(recordings.zoomMeetingId, meetingId), eq(recordings.recordedAt, start)))
      .limit(1);
    if (existing[0]) {
      return NextResponse.json({ ok: true, note: 'already ingested' });
    }

    const expiresAt = new Date(start.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000);

    const inserted = await db
      .insert(recordings)
      .values({
        classId: cls.id,
        title: `${cls.name} — ${recordedDate}`,
        durationMinutes,
        zoomMeetingId: meetingId,
        recordedAt: start,
        published: 1,
        status: 'pending',
        zoomDownloadUrl: video.download_url,
        zoomDownloadToken: downloadToken,
        expiresAt,
      })
      .returning({ id: recordings.id });

    const recordingId = inserted[0].id;

    // Best-effort immediate transfer AFTER we ack Zoom (keeps the webhook fast so
    // Zoom doesn't retry). If this run times out or crashes, the retry cron in
    // /api/cron/recordings-transfer reclaims the row — nothing is lost.
    after(async () => {
      try {
        await transferRecording(recordingId);
      } catch (err) {
        console.error(`[zoom webhook] transfer kickoff failed for recording ${recordingId}:`, err);
      }
    });

    return NextResponse.json({ ok: true, recordingId, status: 'pending' });
  }

  // Acknowledge any other event.
  return NextResponse.json({ ok: true });
}
