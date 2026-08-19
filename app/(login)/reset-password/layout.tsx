// The page itself is a client component, so its metadata lives here.
export const metadata = {
  title: 'Set a new password',
  robots: { index: false, follow: true },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
