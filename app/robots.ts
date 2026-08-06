import type { MetadataRoute } from 'next';

const BASE = process.env.BASE_URL || 'https://academyminds.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep private/authed + API surfaces out of the index.
      disallow: ['/dashboard/', '/api/', '/payment/success', '/error'],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
