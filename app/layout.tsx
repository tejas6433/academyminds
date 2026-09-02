import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import { Analytics } from '@vercel/analytics/react';

const SITE_DESCRIPTION =
  'BC-owned live small-group math classes for Grade 5–7. Our own accelerated curriculum, 3 classes a week plus reviewed assignments — building the foundation every AI and STEM career is built on.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'AcademyMinds - Live Math Classes for Grade 5-7',
    template: '%s · AcademyMinds',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'AcademyMinds',
  keywords: [
    'online math classes',
    'math tutoring for kids',
    'Grade 5 math',
    'Grade 6 math',
    'Grade 7 math',
    'accelerated math program',
    'math tutoring BC',
    'online math tutor British Columbia',
    'advanced math for kids',
    'gifted math program BC',
    'after school math program',
    'math foundation for AI',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'AcademyMinds',
    title: 'AcademyMinds - Live Math Classes for Grade 5-7',
    description: SITE_DESCRIPTION,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AcademyMinds - Live Math Classes for Grade 5-7',
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
  // Set GOOGLE_SITE_VERIFICATION in env to the token Google Search Console gives
  // you (HTML-tag method) — proves you own the domain so you can submit the sitemap.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
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
        {/* WebSite entity — the signal Google reads to show "Academy Minds" as
            the site name above a result instead of falling back to the bare
            domain. Must carry the site's root URL to be eligible. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Academy Minds',
              alternateName: ['AcademyMinds', 'Academy Minds Canada'],
              url: process.env.BASE_URL || 'https://academyminds.com',
            }),
          }}
        />
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
              areaServed: { '@type': 'State', name: 'British Columbia' },
              audience: {
                '@type': 'EducationalAudience',
                educationalRole: 'student',
                audienceType: 'Grade 5–7 students',
              },
              offers: {
                '@type': 'Offer',
                category: 'Live math classes',
                priceCurrency: 'CAD',
                price: '79',
              },
            }),
          }}
        />
        {/* FAQ structured data — can earn an expandable FAQ result on Google. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What does AcademyMinds teach?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Live small-group mathematics for Grade 5–7 taught on the AcademyMinds curriculum — our own accelerated sequence, built to take a student from their current grade level to a genuinely advanced standard. Three live classes a week, with a reviewed assignment after every class.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How much does it cost?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'CAD $99/month, or $79/month billed quarterly ($237 every 3 months). Both include three live math classes a week, an assignment after every class with feedback, class recordings, and a monthly progress report. A free trial class is available with no card required.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Are classes live or recorded?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Classes are live with a real teacher, three times a week. Every class is recorded and students can rewatch for 30 days. On the days between classes, students complete a practice assignment that we review and return.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Can we try a class before paying?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes — you can book a free trial class with no credit card required.',
                  },
                },
              ],
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
        <Analytics />
      </body>
    </html>
  );
}
