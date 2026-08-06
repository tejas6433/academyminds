import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';

const SITE_DESCRIPTION =
  'Live small-group math and coding classes for Grade 5–7, taught by experienced educators on the Indian curriculum — typically 2–3 years ahead of Canadian grade level.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'AcademyMinds — live math & coding for Grade 5–7',
    template: '%s · AcademyMinds',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'AcademyMinds',
  openGraph: {
    type: 'website',
    siteName: 'AcademyMinds',
    title: 'AcademyMinds — live math & coding for Grade 5–7',
    description: SITE_DESCRIPTION,
    url: '/',
  },
  twitter: {
    card: 'summary',
    title: 'AcademyMinds — live math & coding for Grade 5–7',
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  maximumScale: 1
};

// Body: Inter — clean, highly readable. Headings: Fraunces — warm editorial serif.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['SOFT', 'opsz']
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable}`}
    >
      <body className="min-h-[100dvh]">
        {/* Structured data — helps search engines understand the business. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              name: 'AcademyMinds',
              url: process.env.BASE_URL || 'https://academyminds.com',
              description: SITE_DESCRIPTION,
              email: 'support@academyminds.com',
              areaServed: 'CA',
              audience: {
                '@type': 'EducationalAudience',
                educationalRole: 'student',
                audienceType: 'Grade 5–7 students',
              },
              offers: {
                '@type': 'Offer',
                category: 'Live math & coding classes',
                priceCurrency: 'CAD',
                price: '79.99',
              },
            }),
          }}
        />
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              '/api/user': getUser(),
              '/api/team': getTeamForUser()
            }
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
