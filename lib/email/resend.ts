// lib/email/resend.ts
// One Resend client + typed senders. All app email goes through here so the
// sender address, error handling, and templates live in a single place.
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Until academyminds.ca is verified in Resend, the only address you can send
// FROM is the shared test sender. Override with EMAIL_FROM once your domain is
// verified (e.g. "AcademyMinds <noreply@academyminds.ca>").
const FROM = process.env.EMAIL_FROM || 'AcademyMinds <onboarding@resend.dev>';

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

interface SendArgs {
  to: string;
  subject: string;
  html: string;
}

/**
 * Low-level send. Never throws into the caller's happy path — email failures
 * should not break signup/reset flows, so we log and return a status instead.
 */
export async function sendEmail({ to, subject, html }: SendArgs): Promise<{ ok: boolean }> {
  if (!isEmailConfigured()) {
    console.warn('[email] RESEND_API_KEY not set — skipping send:', subject);
    return { ok: false };
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error('[email] send failed:', error);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error('[email] send threw:', err);
    return { ok: false };
  }
}

// ── Shared shell so every email looks on-brand ──────────────────────────────
function shell(heading: string, body: string, cta?: { label: string; url: string }): string {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#faf9f7;padding:32px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:14px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#764ba2,#5a3680);padding:20px 28px">
        <span style="color:#fff;font-weight:700;font-size:18px">Academy<span style="color:#c9a9e9">Minds</span></span>
      </div>
      <div style="padding:28px">
        <h1 style="margin:0 0 12px;color:#1a1a2e;font-size:20px">${heading}</h1>
        <div style="color:#4a4660;font-size:15px;line-height:1.6">${body}</div>
        ${
          cta
            ? `<a href="${cta.url}" style="display:inline-block;margin-top:20px;background:#764ba2;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px">${cta.label}</a>`
            : ''
        }
      </div>
      <div style="padding:16px 28px;color:#908ca0;font-size:12px;border-top:1px solid #f0f0f0">
        © ${new Date().getFullYear()} AcademyMinds · Grade 5–7 live math &amp; coding
      </div>
    </div>
  </div>`;
}

export function sendWelcomeEmail(to: string, name?: string | null) {
  return sendEmail({
    to,
    subject: 'Welcome to AcademyMinds',
    html: shell(
      `Welcome${name ? `, ${name}` : ''} 👋`,
      `Your account is ready. You can sign in any time to see your schedule, join live classes, and catch up on recordings.`,
      { label: 'Go to your dashboard', url: `${process.env.BASE_URL}/sign-in` }
    ),
  });
}

export function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: 'Reset your AcademyMinds password',
    html: shell(
      'Reset your password',
      `We got a request to reset your password. This link works once and expires in 1 hour. If you didn’t ask for this, you can safely ignore this email.`,
      { label: 'Reset password', url: resetUrl }
    ),
  });
}

/** Sent to a teacher when an admin creates their account. */
export function sendTeacherCredentialsEmail(
  to: string,
  teacher: { name: string; email: string; tempPassword: string }
) {
  return sendEmail({
    to,
    subject: 'Your AcademyMinds teacher account',
    html: shell(
      `Welcome to the team, ${teacher.name} 👋`,
      `Your teacher account is ready. Sign in to see your classes, start live sessions, and manage recordings.<br/><br/>
       <strong>Email:</strong> ${teacher.email}<br/>
       <strong>Temporary password:</strong> ${teacher.tempPassword}<br/><br/>
       Please change your password after the first sign-in.`,
      { label: 'Sign in', url: `${process.env.BASE_URL}/sign-in` }
    ),
  });
}

/** Sent to the parent when an admin creates their child's student login. */
export function sendStudentCredentialsEmail(
  parentEmail: string,
  student: { studentName: string; studentEmail: string; tempPassword: string }
) {
  return sendEmail({
    to: parentEmail,
    subject: `${student.studentName}'s AcademyMinds login is ready`,
    html: shell(
      `${student.studentName}'s account is ready 🎓`,
      `We've set up your child's student login. They can sign in to join live classes and watch recordings.<br/><br/>
       <strong>Email:</strong> ${student.studentEmail}<br/>
       <strong>Temporary password:</strong> ${student.tempPassword}<br/><br/>
       Please change the password after the first sign-in for security.`,
      { label: 'Sign in', url: `${process.env.BASE_URL}/sign-in` }
    ),
  });
}
