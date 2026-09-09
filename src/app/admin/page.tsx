import type { Metadata } from 'next';
import Link from 'next/link';
import { seedItems } from '@/data/items';
import { artists } from '@/data/artists';
import { promoters } from '@/data/promoters';
import { lineups } from '@/data/lineups';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Admin — Aotearoa Festivals',
};

export const dynamic = 'force-dynamic';

/**
 * Admin dashboard: read-only counts over the committed dataset.
 *
 * The dataset-directory model is snapshot-first: changes land as PRs
 * through the community loop, not through admin CRUD, so this page
 * reports what the dataset holds rather than editing it.
 *
 * @returns Admin stats page
 */
export default function AdminPage() {
  const festivals = seedItems.length;
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
      <p className="mt-1 text-muted-foreground">Dataset stats. Changes land as PRs.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{festivals}</div>
            <div className="text-xs text-muted-foreground">Festivals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{artists.length}</div>
            <div className="text-xs text-muted-foreground">Artists</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{promoters.length}</div>
            <div className="text-xs text-muted-foreground">Promoters</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{lineups.length}</div>
            <div className="text-xs text-muted-foreground">Lineups</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold">Data</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/festivals" className="text-primary hover:underline">
                  Browse all festivals
                </Link>
              </li>
              <li>
                <Link href="/artists" className="text-primary hover:underline">
                  Browse all artists
                </Link>
              </li>
              <li>
                <Link href="/promoters" className="text-primary hover:underline">
                  Browse all promoters
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold">Contribute</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Spot a change or a missing festival? Every festival detail page links a prefilled
              add/fix/review issue. The dataset gate (zod + tests) reviews every change.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
