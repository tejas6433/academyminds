// The page itself is a client component, so its metadata lives here.
export const metadata = {
  title: 'Reset your password',
  robots: { index: false, follow: true },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
