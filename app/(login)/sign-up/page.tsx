import { Suspense } from 'react';
import { Login } from '../login';

export const metadata = {
  title: 'Create your account',
  robots: { index: false, follow: true },
};

export default function SignUpPage() {
  return (
    <Suspense>
      <Login mode="signup" />
    </Suspense>
  );
}
