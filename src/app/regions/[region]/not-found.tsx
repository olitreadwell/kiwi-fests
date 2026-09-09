import Link from 'next/link';

export default function RegionNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/regions"
        className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-muted-foreground dark:hover:text-muted-foreground"
      >
        <span aria-hidden="true">←</span> All regions
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">Region not found</h1>
      <p className="mt-3 text-sm text-muted-foreground dark:text-muted-foreground">
        We couldn&apos;t find a region matching that URL. Check the address or browse all regions
        below.
      </p>
      <Link
        href="/regions"
        className="mt-6 inline-block text-sm text-primary hover:underline dark:text-primary"
      >
        Browse all regions →
      </Link>
    </main>
  );
}
