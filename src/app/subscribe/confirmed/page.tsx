import Link from 'next/link';

/**
 * Confirmation page after subscribing.
 *
 * @returns Confirmation page
 */
export default function SubscribeConfirmedPage(): React.ReactElement {
  return (
    <main className="max-w-xl space-y-4">
      <h1 className="text-3xl font-bold">You&apos;re subscribed</h1>
      <p className="text-neutral-600 dark:text-neutral-300">
        Thanks — new listings will land in your inbox.
      </p>
      <Link href="/" className="text-blue-600 underline dark:text-blue-400">
        Back to the directory
      </Link>
    </main>
  );
}
