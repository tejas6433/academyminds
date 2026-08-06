import type { MetadataRoute } from 'next';

const BASE = process.env.BASE_URL || 'https://academyminds.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // Public, indexable routes only.
  const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '', priority: 1, freq: 'weekly' },
    { path: '/enquiry', priority: 0.8, freq: 'monthly' },
    { path: '/payment', priority: 0.7, freq: 'monthly' },
    { path: '/sign-up', priority: 0.6, freq: 'monthly' },
    { path: '/sign-in', priority: 0.4, freq: 'yearly' },
    { path: '/privacy', priority: 0.3, freq: 'yearly' },
    { path: '/terms', priority: 0.3, freq: 'yearly' },
    { path: '/refund', priority: 0.3, freq: 'yearly' },
  ];
  return routes.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));
}
