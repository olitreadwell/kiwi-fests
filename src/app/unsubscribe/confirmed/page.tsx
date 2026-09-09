import Link from 'next/link';

/**
 * Confirmation page after unsubscribing.
 *
 * @returns Confirmation page
 */
export default function UnsubscribeConfirmedPage(): React.ReactElement {
  return (
    <main className="max-w-xl space-y-4">
      <h1 className="text-3xl font-bold">Unsubscribed</h1>
      <p className="text-neutral-600 dark:text-neutral-300">You won&apos;t get further emails.</p>
      <Link href="/" className="text-blue-600 underline dark:text-blue-400">
        Back to the directory
      </Link>
    </main>
  );
}
