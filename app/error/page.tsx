import Link from 'next/link';
import { CircleAlertIcon } from 'lucide-react';

// Landing page for recoverable failures (e.g. the Stripe checkout callback could
// not finalize). The subscription itself is reconciled by the Stripe webhook, so
// this reassures the user rather than alarming them.
export default function ErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-[100dvh]">
      <div className="max-w-md space-y-8 p-4 text-center">
        <div className="flex justify-center">
          <CircleAlertIcon className="size-12 text-orange-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Something went wrong
        </h1>
        <p className="text-base text-gray-500">
          We hit a snag completing your last action. If you just paid, your
          subscription is still safe — it syncs automatically, so check your
          dashboard in a moment. Otherwise, please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="max-w-48 mx-auto flex justify-center py-2 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="max-w-48 mx-auto flex justify-center py-2 px-4 rounded-full shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
