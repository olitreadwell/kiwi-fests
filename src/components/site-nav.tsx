import Link from 'next/link';
import { getSiteConfig } from '@/lib/site-config';

/** Top navigation shared by every page. */
export function SiteNav(): React.ReactElement {
  const config = getSiteConfig();
  const links = [
    { href: '/items', label: `All ${config.thingPlural}` },
    { href: '/map', label: 'Map' },
    { href: '/search', label: 'Search' },
    { href: '/docs', label: 'API' },
  ];
  return (
    <header className="border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3"
        aria-label="Site"
      >
        <Link href="/" className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          {config.name}
        </Link>
        <ul className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-300">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
