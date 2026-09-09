import Link from 'next/link';

export default function FestivalNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/festivals"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-muted-foreground dark:hover:text-muted-foreground"
      >
        <span aria-hidden="true">←</span> All festivals
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">Festival not found</h1>
      <p className="mt-3 text-sm text-muted-foreground dark:text-muted-foreground">
        We couldn&apos;t find the festival you&apos;re looking for. It may have been removed or the
        URL may be incorrect.
      </p>
    </main>
  );
}
