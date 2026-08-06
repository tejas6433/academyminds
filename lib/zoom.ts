// lib/zoom.ts
// Zoom Server-to-Server OAuth integration.
// Creates scheduled meetings with cloud recording enabled, fetches recordings,
// and verifies inbound webhooks. Degrades gracefully when credentials are absent
// so the app still runs (meetings fall back to a placeholder join link).

import crypto from 'crypto';

const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const ZOOM_WEBHOOK_SECRET = process.env.ZOOM_WEBHOOK_SECRET_TOKEN;

const ZOOM_OAUTH_URL = 'https://zoom.us/oauth/token';
const ZOOM_API_BASE = 'https://api.zoom.us/v2';

export function isZoomConfigured(): boolean {
  return Boolean(ZOOM_ACCOUNT_ID && ZOOM_CLIENT_ID && ZOOM_CLIENT_SECRET);
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (!isZoomConfigured()) {
    throw new Error('Zoom is not configured (missing ZOOM_ACCOUNT_ID / ZOOM_CLIENT_ID / ZOOM_CLIENT_SECRET).');
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const basic = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(
    `${ZOOM_OAUTH_URL}?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Zoom OAuth failed: ${res.status} ${body}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

export interface ZoomMeeting {
  meetingId: string;
  joinUrl: string;
  startUrl: string;
  passcode?: string;
}

export interface CreateMeetingInput {
  topic: string;
  startTimeIso: string; // ISO 8601
  durationMinutes: number;
  /** iCal-style weekly recurrence, e.g. weekly on Mon/Wed/Fri */
  recurringWeeklyDays?: number[]; // 1=Sun..7=Sat per Zoom
  agenda?: string;
}

/**
 * Create a scheduled Zoom meeting with automatic cloud recording.
 * Returns a deterministic placeholder when Zoom is not configured so local/dev
 * environments stay fully functional.
 */
export async function createZoomMeeting(input: CreateMeetingInput): Promise<ZoomMeeting> {
  if (!isZoomConfigured()) {
    const fakeId = String(Math.floor(100000000 + Math.random() * 899999999));
    return {
      meetingId: fakeId,
      joinUrl: `https://zoom.us/j/${fakeId}`,
      startUrl: `https://zoom.us/s/${fakeId}`,
      passcode: undefined,
    };
  }

  const token = await getAccessToken();

  const body: Record<string, unknown> = {
    topic: input.topic,
    type: input.recurringWeeklyDays && input.recurringWeeklyDays.length ? 8 : 2, // 8=recurring fixed time, 2=scheduled
    start_time: input.startTimeIso,
    duration: input.durationMinutes,
    timezone: 'UTC',
    agenda: input.agenda ?? '',
    settings: {
      auto_recording: 'cloud', // record to Zoom cloud automatically
      join_before_host: false,
      waiting_room: true,
      mute_upon_entry: true,
    },
  };

  if (input.recurringWeeklyDays && input.recurringWeeklyDays.length) {
    body.recurrence = {
      type: 2, // weekly
      repeat_interval: 1,
      weekly_days: input.recurringWeeklyDays.join(','),
    };
  }

  const res = await fetch(`${ZOOM_API_BASE}/users/me/meetings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Zoom create meeting failed: ${res.status} ${errBody}`);
  }

  const data = (await res.json()) as {
    id: number;
    join_url: string;
    start_url: string;
    password?: string;
  };

  return {
    meetingId: String(data.id),
    joinUrl: data.join_url,
    startUrl: data.start_url,
    passcode: data.password,
  };
}

export interface ZoomRecordingFile {
  playUrl: string;
  downloadUrl?: string;
  durationMinutes: number;
  recordingStartIso: string;
}

/**
 * Delete a meeting's cloud recordings from Zoom. Called AFTER we've copied the
 * MP4 to our own R2 bucket — this frees Zoom cloud storage immediately so it
 * never fills up (Zoom cloud is small + billed; R2 is our cheap durable home).
 * `action=delete` hard-deletes (safe: we already have our own copy).
 */
export async function deleteZoomRecording(meetingId: string): Promise<void> {
  if (!isZoomConfigured()) return; // no-op in dev
  const token = await getAccessToken();
  const res = await fetch(`${ZOOM_API_BASE}/meetings/${meetingId}/recordings?action=delete`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  // 200/204 = deleted, 404 = already gone. Anything else is a real error.
  if (!res.ok && res.status !== 404) {
    const body = await res.text();
    throw new Error(`Zoom delete recording failed: ${res.status} ${body}`);
  }
}

/**
 * Open an authenticated stream to a Zoom recording file. Zoom's per-event
 * `download_token` (sibling of `payload` in the webhook body) authorizes the
 * download for ~24h. Returns the response body as a Node Readable for piping
 * straight into R2 without buffering the whole file.
 */
export async function fetchZoomRecordingStream(
  downloadUrl: string,
  downloadToken: string
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${downloadToken}` },
    redirect: 'follow',
  });
  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => '');
    throw new Error(`Zoom recording download failed: ${res.status} ${body}`);
  }
  return res.body;
}

/**
 * Verify a Zoom webhook request. Zoom signs each event with
 * `x-zm-signature: v0=HMAC_SHA256(secret, "v0:" + timestamp + ":" + rawBody)`.
 */
export function verifyZoomWebhook(rawBody: string, signature: string | null, timestamp: string | null): boolean {
  if (!ZOOM_WEBHOOK_SECRET || !signature || !timestamp) return false;
  const message = `v0:${timestamp}:${rawBody}`;
  const hash = crypto.createHmac('sha256', ZOOM_WEBHOOK_SECRET).update(message).digest('hex');
  const expected = `v0=${hash}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

/**
 * Build the response token Zoom requires for the one-time endpoint URL
 * validation challenge (event: endpoint.url_validation).
 */
export function buildZoomUrlValidationResponse(plainToken: string): {
  plainToken: string;
  encryptedToken: string;
} {
  const encryptedToken = crypto
    .createHmac('sha256', ZOOM_WEBHOOK_SECRET ?? '')
    .update(plainToken)
    .digest('hex');
  return { plainToken, encryptedToken };
}
