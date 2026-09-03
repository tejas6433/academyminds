// lib/r2.ts
// Cloudflare R2 storage for class recordings. R2 is S3-compatible, so we drive
// it with the AWS SDK pointed at the R2 endpoint. R2 has ZERO egress fees, which
// is why students can rewatch lectures freely without per-view cost.
//
// Degrades gracefully when credentials are absent (like lib/zoom.ts) so the app
// still boots in local/dev without R2 configured — callers check isR2Configured().

import { S3Client, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable, Transform } from 'stream';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET;

export function isR2Configured(): boolean {
  return Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET);
}

let cachedClient: S3Client | null = null;

function client(): S3Client {
  if (!isR2Configured()) {
    throw new Error('R2 is not configured (missing R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET).');
  }
  if (cachedClient) return cachedClient;
  cachedClient = new S3Client({
    region: 'auto', // R2 ignores region, but the SDK requires a value
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID!,
      secretAccessKey: R2_SECRET_ACCESS_KEY!,
    },
  });
  return cachedClient;
}

/**
 * Hard ceiling on a single uploaded object. A 90-minute class recording is
 * typically well under 1 GB; anything past this is a runaway or a malformed
 * file, and streaming it would quietly grow the storage bill. The upload is
 * aborted mid-stream rather than after the fact, so we never pay to store it.
 */
export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024 * 1024; // 3 GB

export class UploadTooLargeError extends Error {
  constructor(limit: number) {
    super(`Upload exceeded the ${Math.round(limit / 1024 / 1024)} MB limit and was aborted.`);
    this.name = 'UploadTooLargeError';
  }
}

/**
 * Stream an arbitrary-length body straight into R2 using multipart upload.
 * `lib-storage`'s Upload buffers only one part (default 5 MB) at a time, so a
 * 1 GB lecture never sits in memory — this is what keeps the transfer from
 * OOM-crashing a serverless function. Returns the uploaded byte count.
 */
export async function uploadStreamToR2(
  key: string,
  body: Readable,
  contentType: string
): Promise<{ sizeBytes: number }> {
  // Count bytes as they flow through, without buffering the whole file and
  // without a competing 'data' listener (which would steal chunks from the
  // uploader). A pass-through Transform tallies size inside _transform.
  let sizeBytes = 0;
  const counter = new Transform({
    transform(chunk, _enc, cb) {
      sizeBytes += chunk.length;
      if (sizeBytes > MAX_UPLOAD_BYTES) {
        // Fail the stream so the multipart upload aborts instead of continuing
        // to push an oversized object into storage.
        cb(new UploadTooLargeError(MAX_UPLOAD_BYTES));
        return;
      }
      cb(null, chunk);
    },
  });
  // Propagate source errors to the counter so upload.done() rejects.
  body.on('error', (err) => counter.destroy(err));
  body.pipe(counter);

  const upload = new Upload({
    client: client(),
    params: {
      Bucket: R2_BUCKET!,
      Key: key,
      Body: counter,
      ContentType: contentType,
    },
    queueSize: 3, // up to 3 parts in flight — small memory, decent throughput
    partSize: 8 * 1024 * 1024, // 8 MB parts
  });

  await upload.done();
  return { sizeBytes };
}

/**
 * Generate a short-lived signed URL to stream/download an object. R2 honors HTTP
 * Range requests on the signed URL, so the HTML5 <video> player can seek.
 * Default TTL 4h — long enough to watch a lecture, short enough to not be a
 * durable public link if forwarded.
 */
export async function signedGetUrl(key: string, ttlSeconds = 4 * 60 * 60): Promise<string> {
  return getSignedUrl(
    client(),
    new GetObjectCommand({ Bucket: R2_BUCKET!, Key: key }),
    { expiresIn: ttlSeconds }
  );
}

/** Permanently delete an object. Used by the 30-day retention cron. */
export async function deleteFromR2(key: string): Promise<void> {
  await client().send(new DeleteObjectCommand({ Bucket: R2_BUCKET!, Key: key }));
}
