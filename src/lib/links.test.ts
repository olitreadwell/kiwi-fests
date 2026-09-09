import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { findBrokenInternalLinks } from '@/lib/links';

let fixtureDir: string;

beforeAll(() => {
  fixtureDir = mkdtempSync(join(tmpdir(), 'links-fixture-'));
  mkdirSync(join(fixtureDir, 'docs'));
  writeFileSync(
    join(fixtureDir, 'README.md'),
    '# Home\n\n[Good link](docs/guide.md)\n[Broken link](docs/missing.md)\n[External](https://example.com)\n[Anchor](#section)\n'
  );
  writeFileSync(join(fixtureDir, 'docs', 'guide.md'), '# Guide\n\n[Back](../README.md)\n');
});

afterAll(() => {
  rmSync(fixtureDir, { recursive: true, force: true });
});

describe('findBrokenInternalLinks', () => {
  it('flags only links to missing files', () => {
    const broken = findBrokenInternalLinks(fixtureDir);
    expect(broken).toHaveLength(1);
    expect(broken[0]).toMatchObject({ file: 'README.md', link: 'docs/missing.md' });
  });

  it('skips external links and anchors', () => {
    const broken = findBrokenInternalLinks(fixtureDir);
    expect(broken.some((entry) => entry.link.startsWith('http'))).toBe(false);
  });

  it('skips root-relative app routes', () => {
    writeFileSync(join(fixtureDir, 'route-link.md'), '[Contact](/contact)\n');
    const broken = findBrokenInternalLinks(fixtureDir);
    expect(broken.some((entry) => entry.link === '/contact')).toBe(false);
  });
});
