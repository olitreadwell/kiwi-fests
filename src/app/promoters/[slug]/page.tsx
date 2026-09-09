import { getPromoterBySlug, listPromoters } from '@/lib/festival-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import { FestivalStatusBadge } from '@/components/FestivalStatusBadge';

export const revalidate = 3600;

export async function generateStaticParams() {
  return listPromoters().map((promoter) => ({ slug: promoter.id }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const promoter = getPromoterBySlug(slug);
  if (!promoter) return { title: 'Promoter not found — Aotearoa Festivals' };
  return {
    title: `${promoter.name} — Aotearoa Festivals`,
    description: `Festivals and events run by ${promoter.name}${
      promoter.region ? ` in ${promoter.region}` : ''
    }.`,
  };
}

export default async function PromoterDetailPage({ params }: Props) {
  const { slug } = await params;

  const promoter = getPromoterBySlug(slug);

  if (!promoter) notFound();

  const socialLinks: { label: string; href: string }[] = [];
  if (promoter.website) socialLinks.push({ label: 'Website', href: promoter.website });
  if (promoter.instagram) socialLinks.push({ label: 'Instagram', href: promoter.instagram });
  if (promoter.facebook) socialLinks.push({ label: 'Facebook', href: promoter.facebook });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Promoters', href: '/promoters' },
          { label: promoter.name },
        ]}
      />

      <h1 className="text-3xl font-semibold tracking-tight">{promoter.name}</h1>

      {(promoter.region ?? promoter.genre) && (
        <dl className="mt-4 space-y-1.5 text-sm">
          {promoter.region && (
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 font-medium text-foreground dark:text-foreground">
                Region
              </dt>
              <dd className="text-muted-foreground dark:text-muted-foreground">
                {promoter.region}
              </dd>
            </div>
          )}
          {promoter.genre && (
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 font-medium text-foreground dark:text-foreground">
                Genre
              </dt>
              <dd className="text-muted-foreground dark:text-muted-foreground">{promoter.genre}</dd>
            </div>
          )}
        </dl>
      )}

      {socialLinks.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-border px-4 py-1 text-sm transition-colors hover:bg-muted dark:border-border dark:hover:bg-muted"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">
          Festivals{' '}
          <span className="text-base font-normal text-muted-foreground">
            ({promoter.festivals.length})
          </span>
        </h2>

        {promoter.festivals.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No festivals on record yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border dark:divide-border">
            {promoter.festivals.map((festival) => (
              <li key={festival.id}>
                <Link
                  href={`/festivals/${festival.slug}`}
                  className="-mx-2 flex items-center justify-between rounded px-2 py-4 transition-colors hover:bg-muted/50 dark:hover:bg-muted"
                >
                  <div>
                    <span className="font-medium">{festival.name}</span>
                    {festival.dateText && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        {festival.dateText}
                      </span>
                    )}
                  </div>
                  <FestivalStatusBadge status={festival.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
