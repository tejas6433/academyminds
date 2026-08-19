import { Suspense } from 'react';
import { Login } from '../login';

// Auth pages carry no search value and previously inherited the site-wide title
// verbatim, so Google saw them as duplicates of the homepage and ranked
// /sign-in in its place. noindex keeps them out of results entirely.
export const metadata = {
  title: 'Sign in',
  robots: { index: false, follow: true },
};

export default function SignInPage() {
  return (
    <Suspense>
      <Login mode="signin" />
    </Suspense>
  );
}
