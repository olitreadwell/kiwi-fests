import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';

const SETUP_SCRIPT = fileURLToPath(new URL('./setup.mjs', import.meta.url));

function makeFixture() {
  const dir = mkdtempSync(join(tmpdir(), 'setup-fixture-'));
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify(
      { name: 'dataset-directory-template', version: '0.1.0', scripts: { check: 'echo ok' } },
      null,
      2
    )
  );
  writeFileSync(join(dir, 'README.md'), '# Open Items Directory\n\nBody text.\n');
  writeFileSync(
    join(dir, '.env.example'),
    'PORT=3000\nCONTACT_TO=placeholder@example.com\nNEXT_PUBLIC_SITE_URL=\nNEXT_PUBLIC_GH_REPO=\nNEXT_OUTPUT_MODE=\n'
  );
  const configDir = join(dir, 'src', 'lib');
  mkdirSync(configDir, { recursive: true });
  writeFileSync(
    join(configDir, 'site-config.ts'),
    'export const siteConfig = { name: "Open Items Directory", thingPlural: "items", city: "Wellington" };\n'
  );
  writeFileSync(join(dir, 'DATA_SOURCES.md'), '# Data sources\n\n<!-- SEED-SOURCES -->\n');
  return dir;
}

function run(dir, args) {
  try {
    const stdout = execFileSync(process.execPath, [SETUP_SCRIPT, '--target', dir, ...args], {
      encoding: 'utf8',
    });
    return { code: 0, stdout };
  } catch (err) {
    return { code: err.status, stdout: err.stdout ?? '' };
  }
}

describe('setup.mjs', () => {
  let fixture;
  before(() => {
    fixture = mkdtempSync(join(tmpdir(), 'setup-suite-'));
  });
  after(() => {
    rmSync(fixture, { recursive: true, force: true });
  });

  it('--help exits 0 and prints usage', () => {
    const { code, stdout } = run(fixture, ['--help']);
    assert.equal(code, 0);
    assert.match(stdout, /Usage: node scripts\/setup\.mjs/);
    assert.match(stdout, /--thing/);
  });

  it('rejects unknown options', () => {
    const { code } = run(fixture, ['--bogus']);
    assert.equal(code, 1);
  });

  it('rejects non-template package names without --force', () => {
    const dir = makeFixture();
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'my-project' }, null, 2));
    const { code, stdout } = run(dir, ['--app-name', 'demo-app']);
    assert.equal(code, 1);
    assert.match(stdout, /not a template name/);
    rmSync(dir, { recursive: true, force: true });
  });

  it('--dry-run writes nothing', () => {
    const dir = makeFixture();
    const args = [
      '--app-name',
      'demo-app',
      '--thing',
      'op shop',
      '--thing-plural',
      'op shops',
      '--city',
      'Wellington',
      '--contact-email',
      'demo@example.com',
      '--dry-run',
    ];
    const before = readFileSync(join(dir, 'package.json'), 'utf8');
    const { code, stdout } = run(dir, args);
    assert.equal(code, 0);
    assert.match(stdout, /\[dry-run\] would/);
    assert.equal(readFileSync(join(dir, 'package.json'), 'utf8'), before);
    rmSync(dir, { recursive: true, force: true });
  });

  it('rewrites identity, README, env and seed sources', () => {
    const dir = makeFixture();
    const { code } = run(dir, [
      '--app-name',
      'op-shop-directory',
      '--thing',
      'op shop',
      '--thing-plural',
      'op shops',
      '--city',
      'Wellington',
      '--region',
      'Wellington region',
      '--site-url',
      'https://op-shops.example',
      '--gh-repo',
      'oli/op-shop-directory',
      '--contact-email',
      'help@op-shops.example',
      '--seed-sources',
      'salvation-army.org.nz,redcross.org.nz',
    ]);
    assert.equal(code, 0);

    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    assert.equal(pkg.name, 'op-shop-directory');

    const config = readFileSync(join(dir, 'src', 'lib', 'site-config.ts'), 'utf8');
    assert.match(config, /thingPlural: 'op shops'/);
    assert.match(config, /thing: 'op shop'/);
    assert.match(config, /city: 'Wellington'/);
    assert.match(config, /region: 'Wellington region'/);
    assert.match(config, /baseUrl: 'https:\/\/op-shops\.example'/);
    assert.match(config, /ghRepo: 'oli\/op-shop-directory'/);

    const readme = readFileSync(join(dir, 'README.md'), 'utf8');
    assert.ok(readme.startsWith('# Op Shops in Wellington'));

    const env = readFileSync(join(dir, '.env.example'), 'utf8');
    assert.match(env, /CONTACT_TO=help@op-shops\.example/);
    assert.match(env, /NEXT_PUBLIC_SITE_URL=https:\/\/op-shops\.example/);
    assert.match(env, /NEXT_PUBLIC_GH_REPO=oli\/op-shop-directory/);

    const sources = readFileSync(join(dir, 'DATA_SOURCES.md'), 'utf8');
    assert.match(sources, /salvation-army\.org\.nz/);
    assert.match(sources, /redcross\.org\.nz/);

    assert.ok(readFileSync(join(dir, '.env'), 'utf8').length > 0);
    rmSync(dir, { recursive: true, force: true });
  });

  it('sets export mode for the github-pages deploy target', () => {
    const dir = makeFixture();
    const { code } = run(dir, [
      '--app-name',
      'static-dir',
      '--thing-plural',
      'op shops',
      '--city',
      'Wellington',
      '--deploy',
      'github-pages',
    ]);
    assert.equal(code, 0);
    const env = readFileSync(join(dir, '.env.example'), 'utf8');
    assert.match(env, /NEXT_OUTPUT_MODE=export/);
    rmSync(dir, { recursive: true, force: true });
  });
});
