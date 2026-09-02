import type { MetadataRoute } from 'next';

const BASE = process.env.BASE_URL || 'https://academyminds.com';

export default function sitemap(): MetadataRoute.Sitemap {
  // Date-only lastmod: Google's sitemap parser is happiest with plain
  // YYYY-MM-DD. Sub-second precision is legal W3C datetime but has a long
  // history of being rejected.
  const now = new Date().toISOString().slice(0, 10);
  // Public, indexable routes only. Auth pages are deliberately absent: they
  // carry no search value and competed with the homepage for the same query.
  const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '', priority: 1, freq: 'weekly' },
    { path: '/grade-5-math', priority: 0.9, freq: 'monthly' },
    { path: '/grade-6-math', priority: 0.9, freq: 'monthly' },
    { path: '/grade-7-math', priority: 0.9, freq: 'monthly' },
    { path: '/enquiry', priority: 0.8, freq: 'monthly' },
    { path: '/payment', priority: 0.7, freq: 'monthly' },
    { path: '/privacy', priority: 0.3, freq: 'yearly' },
    { path: '/terms', priority: 0.3, freq: 'yearly' },
    { path: '/refund', priority: 0.3, freq: 'yearly' },
  ];
  return routes.map((r) => ({
    // Trailing slash on the root URL — a bare origin with no path is ambiguous
    // to some sitemap parsers.
    url: r.path === '' ? `${BASE}/` : `${BASE}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
