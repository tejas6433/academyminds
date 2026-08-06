import { ImageResponse } from 'next/og';

// Dynamically-rendered Open Graph image used for link previews (social, chat,
// search). 1200×630 is the standard OG size. No external assets — pure layout.
export const runtime = 'edge';
export const alt = 'AcademyMinds — live math & coding for Grade 5–7';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #4a2d6b 55%, #764ba2 100%)',
          color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 6, color: '#c9a9e9', fontWeight: 700 }}>
          LIVE CLASSES · GRADE 5–7
        </div>
        <div style={{ fontSize: 78, fontWeight: 800, lineHeight: 1.05, marginTop: 24, maxWidth: 980 }}>
          Math &amp; coding that puts your child two grades ahead.
        </div>
        <div style={{ fontSize: 34, color: '#d9d3ea', marginTop: 32 }}>
          academyminds.com
        </div>
      </div>
    ),
    { ...size }
  );
}
