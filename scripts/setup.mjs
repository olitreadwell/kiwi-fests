#!/usr/bin/env node
// Interactive scaffolder: turns this dataset-directory template into a
// fresh open-directory project. Rewrites package name, site identity,
// README, env placeholders and deploy configuration from a handful of
// answers — no other edits needed before `pnpm run check` + deploy.
//
// Usage:
//   node scripts/setup.mjs                        interactive setup
//   node scripts/setup.mjs --dry-run              show changes, write nothing
//   node scripts/setup.mjs --app-name foo --thing "op shop" --city Wellington
//   node scripts/setup.mjs --help
import { createInterface } from 'node:readline';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const HELP = `Usage: node scripts/setup.mjs [options]

Turns the dataset-directory template into a fresh project: package name,
site identity (thing, city, region), README, env vars and deploy target.

Options:
  --app-name <name>        Repo/project name (npm-valid, lowercase)
  --thing <label>          Singular listing label, e.g. "op shop"
  --thing-plural <label>   Plural label, e.g. "op shops"
  --city <city>            Start city, e.g. "Wellington"
  --region <region>        Region label, e.g. "Wellington region"
  --site-url <url>         Public base URL for feeds and metadata
  --gh-repo <owner/repo>   GitHub repo for community issue links
  --seed-sources <list>    Comma-separated sources to list in DATA_SOURCES.md
  --contact-email <email>  Contact inbox (CONTACT_TO)
  --deploy <target>        vercel (default) or github-pages
  --target <dir>           Project root to modify (default: current dir)
  --force                  Run even when the target does not look like a template
  --dry-run                Print planned changes without writing anything
  --help                   Show this help and exit
`;

/** Package names the scaffolder accepts as a pristine template checkout. */
const TEMPLATE_PACKAGE_NAMES = new Set(['template', 'dataset-directory-template']);

function out(line = '') {
  process.stdout.write(`${line}\n`);
}

/**
 * Parse CLI arguments into an options object.
 *
 * @param {string[]} argv - Raw arguments
 * @returns {object} Parsed options
 */
export function parseArgs(argv) {
  const opts = {
    appName: null,
    thing: null,
    thingPlural: null,
    city: null,
    region: null,
    siteUrl: '',
    ghRepo: '',
    seedSources: '',
    contactEmail: null,
    deploy: 'vercel',
    target: null,
    force: false,
    dryRun: false,
    help: false,
  };
  const strOpts = new Set([
    'app-name',
    'thing',
    'thing-plural',
    'city',
    'region',
    'site-url',
    'gh-repo',
    'seed-sources',
    'contact-email',
    'deploy',
    'target',
  ]);
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help') opts.help = true;
    else if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--force') opts.force = true;
    else if (strOpts.has(arg.slice(2))) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      opts[key] = argv[i + 1] ?? '';
      i += 1;
    } else {
      throw new Error(`unknown option: ${arg}`);
    }
  }
  if (opts.deploy && !['vercel', 'github-pages'].includes(opts.deploy)) {
    throw new Error(`unknown deploy target: ${opts.deploy}`);
  }
  return opts;
}

/**
 * Validate the target looks like a template checkout (unless forced).
 *
 * @param {string} root - Project root
 * @param {boolean} force - Bypass validation
 * @returns {string | null} Error message, or null when valid
 */
export function validateTarget(root, force) {
  const pkgPath = join(root, 'package.json');
  if (!existsSync(pkgPath)) return 'no package.json found in target';
  if (force) return null;
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    if (!TEMPLATE_PACKAGE_NAMES.has(pkg.name)) {
      return `package.json name is "${pkg.name}", not a template name — run with --force to overwrite anyway`;
    }
    return null;
  } catch {
    return 'package.json is not valid JSON';
  }
}

/**
 * Validate an npm package name (optionally scoped).
 *
 * @param {string} name - Proposed name
 * @returns {boolean} Whether the name is valid
 */
export function isValidAppName(name) {
  return /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(name);
}

/**
 * Title-case a kebab-case name for headings.
 *
 * @param {string} name - npm name or label
 * @returns {string} Human heading, e.g. "op-shops" -> "Op Shops"
 */
export function toTitleCase(name) {
  return name
    .split(/[\s-_.]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

/** Quote a value as a single-quoted TS string literal. */
function q(value) {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/**
 * Generate the src/lib/site-config.ts file body from scaffolder answers.
 * Mirrors the hand-written shape so no other code needs to change.
 *
 * @param {object} cfg - Effective site identity values
 * @returns {string} TypeScript source for the config file
 */
export function renderSiteConfig(cfg) {
  return `/**
 * Site-wide identity for this open directory.
 *
 * Generated by pnpm run setup — edit here (or rerun setup) to rebrand.
 * Keep every key here, not scattered across components: pages, feeds, API
 * metadata and scrapers all read from this one object.
 */
export const siteConfig = {
  /** Human name of the site, e.g. "Op Shop Directory". */
  name: ${q(`${toTitleCase(cfg.thingPlural)} in ${cfg.city}`)},
  /** Singular label for one listing, e.g. "op shop". */
  thing: ${q(cfg.thing)},
  /** Plural label for listings, e.g. "op shops". */
  thingPlural: ${q(cfg.thingPlural)},
  /** The city the directory starts in, e.g. "Wellington". */
  city: ${q(cfg.city)},
  /** Broader region label, e.g. "Wellington region". */
  region: ${q(cfg.region)},
  /** Public base URL. Defaults to empty in dev; override with NEXT_PUBLIC_SITE_URL. */
  baseUrl: ${q(cfg.siteUrl ?? '')},
  /** GitHub repo \`<owner>/<repo>\` used for community issue links. Empty = links hidden. */
  ghRepo: ${q(cfg.ghRepo ?? '')},
  /** Contact email shown in footers and docs. */
  contactEmail: ${q(cfg.contactEmail ?? '')},
  /** Days after \`lastVerified\` before a listing shows as stale. */
  staleAfterDays: 180,
  /** Vercel cron schedule for the daily refresh, in UTC. 2am NZT = 14:00 UTC. */
  refreshSchedule: '0 14 * * *',
};

/**
 * Resolve site identity, applying the \`NEXT_PUBLIC_SITE_URL\` env override
 * onto the committed defaults so a preview deployment keeps its own URL.
 *
 * @returns The effective site config.
 */
export function getSiteConfig() {
  return {
    ...siteConfig,
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.baseUrl,
  };
}
`;
}

/**
 * Compute the list of changes the scaffolder would make.
 *
 * @param {string} root - Project root
 * @param {object} opts - Parsed options
 * @returns {Array<{ action: string; file: string; detail: string }>} Planned changes
 */
export function planChanges(root, opts) {
  const changes = [];
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  if (pkg.name !== opts.appName) {
    changes.push({
      action: 'set',
      file: 'package.json',
      detail: `name: ${pkg.name} -> ${opts.appName}`,
    });
  }
  changes.push({
    action: 'set',
    file: 'src/lib/site-config.ts',
    detail: `regenerate site identity ${JSON.stringify({
      thing: opts.thing,
      thingPlural: opts.thingPlural,
      city: opts.city,
      region: opts.region,
      siteUrl: opts.siteUrl ?? '',
      ghRepo: opts.ghRepo ?? '',
      contactEmail: opts.contactEmail ?? '',
    })}`,
  });
  const envPath = join(root, '.env.example');
  if (existsSync(envPath)) {
    const env = readFileSync(envPath, 'utf8');
    if (opts.contactEmail && !env.includes(`CONTACT_TO=${opts.contactEmail}`)) {
      changes.push({
        action: 'set',
        file: '.env.example',
        detail: `CONTACT_TO -> ${opts.contactEmail}`,
      });
    }
    if (opts.siteUrl && !env.includes(`NEXT_PUBLIC_SITE_URL=${opts.siteUrl}`)) {
      changes.push({
        action: 'set',
        file: '.env.example',
        detail: `NEXT_PUBLIC_SITE_URL -> ${opts.siteUrl}`,
      });
    }
    if (opts.ghRepo && !env.includes(`NEXT_PUBLIC_GH_REPO=${opts.ghRepo}`)) {
      changes.push({
        action: 'set',
        file: '.env.example',
        detail: `NEXT_PUBLIC_GH_REPO -> ${opts.ghRepo}`,
      });
    }
    if (opts.deploy === 'github-pages' && !env.includes('NEXT_OUTPUT_MODE=export')) {
      changes.push({
        action: 'set',
        file: '.env.example',
        detail: 'NEXT_OUTPUT_MODE -> export (github-pages deploy)',
      });
    }
  }
  const readmePath = join(root, 'README.md');
  if (existsSync(readmePath)) {
    const readme = readFileSync(readmePath, 'utf8');
    const title = `${toTitleCase(opts.thingPlural)} in ${opts.city}`;
    if (!readme.startsWith(`# ${title}`)) {
      changes.push({ action: 'set', file: 'README.md', detail: `h1 -> # ${title}` });
    }
  }
  if (opts.seedSources) {
    changes.push({
      action: 'set',
      file: 'DATA_SOURCES.md',
      detail: `seed sources -> ${opts.seedSources}`,
    });
  }
  changes.push({ action: 'note', file: 'package.json', detail: `deploy: ${opts.deploy}` });
  return changes;
}

/**
 * Apply planned changes to disk.
 *
 * @param {string} root - Project root
 * @param {Array<{ action: string; file: string; detail: string }>} changes - Planned changes
 */
export function applyChanges(root, changes) {
  for (const change of changes) {
    if (change.action !== 'set') continue;
    const filePath = join(root, change.file);
    if (change.file === 'package.json') {
      const pkg = JSON.parse(readFileSync(filePath, 'utf8'));
      pkg.name = change.detail.match(/-> (.*)$/)[1];
      writeFileSync(filePath, `${JSON.stringify(pkg, null, 2)}\n`);
    } else if (change.file === 'src/lib/site-config.ts') {
      const cfg = JSON.parse(change.detail.replace(/^regenerate site identity /, ''));
      if (!cfg.region) cfg.region = `${cfg.city} region`;
      writeFileSync(filePath, renderSiteConfig(cfg));
    } else if (change.file === '.env.example') {
      const env = readFileSync(filePath, 'utf8');
      const set = (key, value) =>
        env.includes(`${key}=`)
          ? env.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}=${value}`)
          : `${env}\n${key}=${value}`;
      if (change.detail.startsWith('CONTACT_TO'))
        writeFileSync(filePath, set('CONTACT_TO', change.detail.split(' -> ')[1]));
      else if (change.detail.startsWith('NEXT_PUBLIC_SITE_URL'))
        writeFileSync(filePath, set('NEXT_PUBLIC_SITE_URL', change.detail.split(' -> ')[1]));
      else if (change.detail.startsWith('NEXT_PUBLIC_GH_REPO'))
        writeFileSync(filePath, set('NEXT_PUBLIC_GH_REPO', change.detail.split(' -> ')[1]));
      else if (change.detail.startsWith('NEXT_OUTPUT_MODE'))
        writeFileSync(filePath, set('NEXT_OUTPUT_MODE', 'export'));
    } else if (change.file === 'README.md') {
      const readme = readFileSync(filePath, 'utf8');
      const title = change.detail.replace('h1 -> # ', '');
      writeFileSync(filePath, readme.replace(/^#\s+.*$/m, `# ${title}`));
    } else if (change.file === 'DATA_SOURCES.md') {
      const doc = readFileSync(filePath, 'utf8');
      const sources = change.detail
        .replace('seed sources -> ', '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const rows = sources
        .map((source) => `| \`${source}\` | initial seed source | ✅ planned |`)
        .join('\n');
      writeFileSync(
        filePath,
        doc.replace(/<!-- SEED-SOURCES -->\n/, `${rows}\n<!-- SEED-SOURCES -->\n`)
      );
    }
  }
}

/**
 * Interactive prompt helpers with a readline fallback.
 *
 * @returns {{ text: (q: string, fb?: string) => Promise<string>, select: (q: string, c: Array<{value: string; label: string}>) => Promise<string>, close: () => void }}
 */
function fallbackPrompts() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) =>
    new Promise((resolveAnswer) => {
      rl.question(q, (answer) => resolveAnswer(answer.trim()));
    });
  return {
    async text(msg, fb = '') {
      const a = await ask(`${msg}${fb ? ` [${fb}]` : ''}: `);
      return a || fb;
    },
    async select(msg, choices) {
      out(msg);
      choices.forEach((c, i) => out(`  ${i + 1}) ${c.label}`));
      const a = await ask('Enter number: ');
      const idx = Number(a) - 1;
      return choices[Number.isNaN(idx) || idx < 0 || idx >= choices.length ? 0 : idx].value;
    },
    close() {
      rl.close();
    },
  };
}

/**
 * Run the scaffolder.
 *
 * @param {string[]} argv - Command arguments
 * @param {object} io - Logger + prompt injection for tests
 * @returns {Promise<number>} Exit code
 */
export async function main(argv, io = {}) {
  const log = io.log ?? out;
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (err) {
    log(err.message);
    log(HELP);
    return 1;
  }
  if (opts.help) {
    log(HELP);
    return 0;
  }
  const root = opts.target ? resolve(opts.target) : resolve('.');
  const targetError = validateTarget(root, opts.force);
  if (targetError) {
    log(`error: ${targetError}`);
    return 1;
  }
  if (!opts.appName) {
    const prompts = io.prompts ?? fallbackPrompts();
    opts.appName = await prompts.text(
      'Repo name (npm-valid, lowercase)',
      basename(root) || 'my-directory'
    );
    if (!isValidAppName(opts.appName)) {
      log(`error: invalid app name "${opts.appName}"`);
      prompts.close?.();
      return 1;
    }
    opts.thing = opts.thing ?? (await prompts.text('Thing (singular), e.g. "op shop"', 'item'));
    opts.thingPlural =
      opts.thingPlural ??
      (await prompts.text('Things (plural), e.g. "op shops"', `${opts.thing}s`));
    opts.city = opts.city ?? (await prompts.text('Start city, e.g. "Wellington"', 'Wellington'));
    opts.region =
      opts.region ??
      (await prompts.text('Region, e.g. "Wellington region"', `${opts.city} region`));
    opts.seedSources =
      opts.seedSources ?? (await prompts.text('Seed sources (comma-separated URLs or names)', ''));
    opts.contactEmail =
      opts.contactEmail ??
      (await prompts.text('Contact email', `${opts.appName}-contact@ot.mozmail.com`));
    opts.siteUrl = opts.siteUrl ?? (await prompts.text('Public site URL (empty for dev)', ''));
    opts.ghRepo =
      opts.ghRepo ??
      (await prompts.select('GitHub repo for community links', [
        { value: '', label: 'None yet (set later)' },
        { value: `olitreadwell/${opts.appName}`, label: `olitreadwell/${opts.appName}` },
      ]));
    opts.deploy = await prompts.select('Deploy target', [
      { value: 'vercel', label: 'Vercel (default)' },
      { value: 'github-pages', label: 'GitHub Pages (static export, API routes are Vercel-only)' },
    ]);
    prompts.close?.();
  }
  if (!opts.appName || !isValidAppName(opts.appName)) {
    log('error: a valid --app-name is required');
    return 1;
  }
  opts.thing = opts.thing || 'item';
  opts.thingPlural = opts.thingPlural || `${opts.thing}s`;
  opts.city = opts.city || 'Wellington';
  opts.region = opts.region || `${opts.city} region`;
  const changes = planChanges(root, opts);
  for (const change of changes) {
    log(
      `${opts.dryRun ? '[dry-run] would' : 'will'} ${change.action} ${change.file}: ${change.detail}`
    );
  }
  if (!opts.dryRun) {
    applyChanges(root, changes);
    const envPath = join(root, '.env');
    if (!existsSync(envPath)) {
      const example = readFileSync(join(root, '.env.example'), 'utf8');
      writeFileSync(envPath, example);
      log('wrote .env from .env.example');
    }
    log('');
    log('next steps:');
    log('  pnpm install');
    log('  pnpm run check');
    log('  git add -A && git commit -m "feat: init <app>"');
    log('  gh repo create <owner>/<app> --private --source . --push');
    if (opts.deploy === 'vercel') {
      log('  vercel --prod');
      log('  vercel cron will fire /api/cron/refresh daily (set CRON_SECRET in Vercel)');
    } else {
      log('  NEXT_OUTPUT_MODE=export pnpm build && push to gh-pages (see docs/deploy.md)');
    }
  }
  return 0;
}

// Direct invocation only: `node scripts/setup.mjs`.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
