import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';

/** A markdown internal link that points at a missing file. */
export interface BrokenLink {
  file: string;
  link: string;
}

const MARKDOWN_EXTENSIONS = new Set(['.md', '.mdx']);
const IGNORED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  '.next',
  'coverage',
  'playwright-report',
  'test-results',
  'dist',
]);

function isMarkdownFile(filePath: string): boolean {
  return MARKDOWN_EXTENSIONS.has(extname(filePath));
}

/**
 * Recursively list markdown files under a root directory.
 *
 * @param rootDir - Directory to scan
 * @returns Absolute paths of markdown files
 */
export function listMarkdownFiles(rootDir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(rootDir)) {
    const entryPath = join(rootDir, entry);
    if (IGNORED_DIRECTORIES.has(entry)) continue;
    if (statSync(entryPath).isDirectory()) {
      found.push(...listMarkdownFiles(entryPath));
    } else if (isMarkdownFile(entryPath)) {
      found.push(entryPath);
    }
  }
  return found;
}

function isInternalLink(target: string): boolean {
  return !/^(https?:|mailto:|#|tel:|\/)/.test(target) && !target.includes('://');
}

function resolveTarget(rootDir: string, fileDir: string, target: string): string {
  const withoutAnchor = target.split('#')[0];
  if (!withoutAnchor) return '';
  const resolved = withoutAnchor.startsWith('/')
    ? join(rootDir, withoutAnchor)
    : resolve(fileDir, withoutAnchor);
  return resolved.replace(/\//g, sep);
}

/**
 * Find markdown links whose targets do not exist.
 * External links (http, mailto), anchors and images are skipped.
 *
 * @param rootDir - Repository root
 * @returns Broken links, one entry per offending link
 */
export function findBrokenInternalLinks(rootDir: string): BrokenLink[] {
  const broken: BrokenLink[] = [];
  for (const filePath of listMarkdownFiles(rootDir)) {
    const content = readFileSync(filePath, 'utf8');
    const linkPattern = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
    for (const match of content.matchAll(linkPattern)) {
      const rawTarget = match[1];
      if (!isInternalLink(rawTarget)) continue;
      const targetPath = resolveTarget(rootDir, dirname(filePath), rawTarget);
      if (!targetPath) continue;
      if (!statSync(targetPath, { throwIfNoEntry: false })?.isFile()) {
        broken.push({ file: relative(rootDir, filePath), link: rawTarget });
      }
    }
  }
  return broken;
}
