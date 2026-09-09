import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { SiteNav } from '@/components/SiteNav';

export const metadata: Metadata = {
  title: 'Aotearoa Festivals',
  description: 'New Zealand music festivals, promoters, and the artists who play them.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = window.localStorage.getItem("theme");
    var theme =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    document.documentElement.classList.add(theme);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="pb-[env(safe-area-inset-bottom,0px)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:text-base focus:font-medium focus:shadow-[0_12px_32px_-16px_rgba(28,25,23,0.3)] focus:outline-2 focus:outline-primary dark:focus:bg-foreground dark:focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <SiteNav />
        <div id="main-content" className="site-content">
          {children}
        </div>
        <footer className="border-t border-border bg-muted/30">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-muted-foreground">
              Aotearoa Festivals — the NZ music festival directory. Made in Aotearoa.
            </p>
            <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-6">
              <a
                href="/about"
                className="text-xs font-medium text-muted-foreground transition-colors duration-300 ease-out-expo hover:text-foreground"
              >
                About
              </a>
              <a
                href="/contact"
                className="text-xs font-medium text-muted-foreground transition-colors duration-300 ease-out-expo hover:text-foreground"
              >
                Contact
              </a>
              <a
                href="https://github.com/olitreadwell/aotearoa-festivals"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-muted-foreground transition-colors duration-300 ease-out-expo hover:text-foreground"
              >
                GitHub
              </a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
