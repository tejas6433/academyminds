// app/api/zoom/webhook/route.ts
// Receives Zoom event notifications. On `recording.completed` it matches the
// meeting to a class and inserts a PENDING recording row, then kicks off a
// background transfer that copies the MP4 from Zoom cloud into our own R2 bucket
// (see lib/recordings/transfer.ts). The recording becomes watchable once the
// transfer finishes (status='ready'). Also answers the one-time endpoint URL
// validation challenge.

import { NextRequest, NextResponse, after } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { classes, recordings } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { verifyZoomWebhook, buildZoomUrlValidationResponse } from '@/lib/zoom';
import { transferRecording } from '@/lib/recordings/transfer';

// How long students can rewatch a recording before it's purged.
const RETENTION_DAYS = 30;

// Zoom's payloads are untrusted input from the network. Parse them with schemas
// rather than reaching into `any`, so a malformed or hostile body is rejected at
// the boundary instead of producing undefined deep inside the handler.
const recordingFileSchema = z.object({
  file_type: z.string().optional(),
  recording_type: z.string().optional(),
  play_url: z.string().optional(),
  download_url: z.string().optional(),
  recording_start: z.string().optional(),
  recording_end: z.string().optional(),
});

const urlValidationSchema = z.object({
  event: z.literal('endpoint.url_validation'),
  payload: z.object({ plainToken: z.string().min(1) }),
});

const recordingCompletedSchema = z.object({
  event: z.literal('recording.completed'),
  download_token: z.string().min(1).optional(),
  payload: z.object({
    object: z.object({
      id: z.union([z.string(), z.number()]).optional(),
      share_url: z.string().optional(),
      password: z.string().optional(),
      recording_play_passcode: z.string().optional(),
      recording_files: z.array(recordingFileSchema).optional(),
    }),
  }),
});

// Every event carries `event`; we only act on the two we handle.
const envelopeSchema = z.object({ event: z.string() });

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-zm-signature');
  const timestamp = request.headers.get('x-zm-request-timestamp');

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const envelope = envelopeSchema.safeParse(parsed);
  if (!envelope.success) {
    return NextResponse.json({ error: 'Malformed event' }, { status: 400 });
  }

  // 1) URL validation challenge (sent once when you save the webhook URL).
  //    This necessarily runs BEFORE signature verification — it is how Zoom
  //    establishes trust — so the token is schema-checked to be a real string
  //    before it reaches the HMAC.
  if (envelope.data.event === 'endpoint.url_validation') {
    const challenge = urlValidationSchema.safeParse(parsed);
    if (!challenge.success) {
      return NextResponse.json({ error: 'Malformed challenge' }, { status: 400 });
    }
    return NextResponse.json(buildZoomUrlValidationResponse(challenge.data.payload.plainToken));
  }

  // 2) Verify signature for all real events.
  if (!verifyZoomWebhook(rawBody, signature, timestamp)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // 3) Handle recording completion → auto-publish to students.
  if (envelope.data.event === 'recording.completed') {
    const evt = recordingCompletedSchema.safeParse(parsed);
    if (!evt.success) {
      // Signature was valid but the shape isn't what we handle — ack so Zoom
      // stops retrying a payload we can never process.
      return NextResponse.json({ ok: true, note: 'unrecognised recording payload' });
    }
    const payload = evt.data;
    const obj = payload.payload.object;
    const meetingId = obj.id != null ? String(obj.id) : null;
    if (!meetingId) {
      return NextResponse.json({ ok: true, note: 'no meeting id' });
    }

    const cls = (await db.select().from(classes).where(eq(classes.zoomMeetingId, meetingId)).limit(1))[0];
    if (!cls) {
      // Unknown meeting — acknowledge so Zoom stops retrying.
      return NextResponse.json({ ok: true, note: 'no matching class' });
    }

    const files = obj.recording_files ?? [];
    // Prefer the shared video recording.
    const video =
      files.find((f) => f.file_type === 'MP4' && f.recording_type === 'shared_screen_with_speaker_view') ??
      files.find((f) => f.file_type === 'MP4') ??
      files[0];

    if (!video || !video.download_url) {
      return NextResponse.json({ ok: true, note: 'no downloadable video file' });
    }

    // A malformed timestamp yields an Invalid Date, whose toISOString() throws.
    // Fall back to "now" rather than 500-ing on a payload we mostly understand.
    const parseDate = (value: string | undefined): Date | null => {
      if (!value) return null;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    };
    const start = parseDate(video.recording_start) ?? new Date();
    const end = parseDate(video.recording_end) ?? start;
    const durationMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
    const recordedDate = start.toISOString().slice(0, 10);

    // Zoom's per-event download token authorizes an authenticated download of
    // the file for ~24h. It's a sibling of `payload`, not inside the object.
    const downloadToken = payload.download_token;
    if (!downloadToken) {
      return NextResponse.json({ ok: true, note: 'no download token' });
    }

    const expiresAt = new Date(start.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000);

    // Idempotent by construction: Zoom retries events, and the unique
    // (zoom_meeting_id, recorded_at) constraint makes a duplicate a no-op
    // instead of a second row. Returns nothing when the row already existed.
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
      .onConflictDoNothing({ target: [recordings.zoomMeetingId, recordings.recordedAt] })
      .returning({ id: recordings.id });

    if (!inserted[0]) {
      return NextResponse.json({ ok: true, note: 'already ingested' });
    }
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
