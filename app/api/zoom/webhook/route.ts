// app/api/zoom/webhook/route.ts
// Receives Zoom event notifications. On `recording.completed` it matches the
// meeting to a class and inserts a published recording row — which makes the
// recording immediately visible to every enrolled student. Also answers the
// one-time endpoint URL validation challenge.

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { classes, recordings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyZoomWebhook, buildZoomUrlValidationResponse } from '@/lib/zoom';

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

    if (!video) {
      return NextResponse.json({ ok: true, note: 'no video file' });
    }

    const start = video.recording_start ? new Date(video.recording_start) : new Date();
    const end = video.recording_end ? new Date(video.recording_end) : start;
    const durationMinutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));

    // share_url + password live on the object, not per-file.
    const playUrl = obj.share_url || video.play_url || '';
    const recordedDate = start.toISOString().slice(0, 10);

    await db.insert(recordings).values({
      classId: cls.id,
      title: `${cls.name} — ${recordedDate}`,
      playUrl,
      downloadUrl: video.download_url ?? null,
      passcode: obj.recording_play_passcode ?? obj.password ?? null,
      durationMinutes,
      zoomMeetingId: meetingId,
      recordedAt: start,
      published: 1,
    });

    return NextResponse.json({ ok: true, published: true });
  }

  // Acknowledge any other event.
  return NextResponse.json({ ok: true });
}
