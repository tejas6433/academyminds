import type { NextConfig } from 'next';

// Baseline security headers applied to every response. Kept conservative on
// purpose — no Content-Security-Policy here, since a strict CSP can silently
// break Stripe Checkout, inline styles, and third-party embeds. These four are
// safe, high-value, and expected for a commercial site handling minors' data.
const securityHeaders = [
  // Force HTTPS for two years, including subdomains.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Block the site from being framed elsewhere (clickjacking).
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Stop browsers from MIME-sniffing responses into a different type.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Don't leak full URLs to other origins in the Referer header.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    clientSegmentCache: true
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  }
};

export default nextConfig;
