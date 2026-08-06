// app/api/recordings/[id]/play/route.ts
// Access-gated video delivery. A recording is NOT a public link — every playback
// goes through this route, which enforces:
//   1. signed in
//   2. the recording exists, is published, ready, and not expired
//   3. the viewer is entitled: an enrolled student WITH an active subscription,
//      or the class's teacher, or an admin
// Only then does it mint a short-lived signed R2 URL and redirect to it. The
// signed URL supports HTTP Range, so the browser's <video> can stream + seek.

import { NextRequest, NextResponse } from 'next/server';
import { getUser, getRecordingById, getClassById, getClassesForStudent, isUserSubscribed } from '@/lib/db/queries';
import { signedGetUrl, isR2Configured } from '@/lib/r2';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const recordingId = Number((await params).id);
  if (!Number.isInteger(recordingId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const rec = await getRecordingById(recordingId);
  if (!rec || rec.published !== 1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (rec.status !== 'ready' || !rec.r2Key) {
    // Still transferring, failed, or legacy row without an R2 object.
    return NextResponse.json({ error: 'Recording not available yet', status: rec.status }, { status: 409 });
  }
  if (rec.expiresAt && rec.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: 'Recording expired' }, { status: 410 });
  }

  // ── Entitlement ──
  let allowed = false;
  if (user.role === 'admin') {
    allowed = true;
  } else if (user.role === 'teacher') {
    const cls = await getClassById(rec.classId);
    allowed = cls?.teacherId === user.id;
  } else {
    // Student (or parent viewing on a student account): must be enrolled in the
    // class AND hold an active subscription.
    const enrolled = await getClassesForStudent(user.id);
    const isEnrolled = enrolled.some((c) => c.id === rec.classId);
    allowed = isEnrolled && (await isUserSubscribed(user.id));
  }

  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!isR2Configured()) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
  }

  const url = await signedGetUrl(rec.r2Key);
  // 302 so the <video src> / link follows straight to the signed stream.
  return NextResponse.redirect(url, 302);
}
