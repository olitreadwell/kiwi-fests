/** Feedback categories mapped to GitHub labels. */
export type FeedbackType = 'bug' | 'feature' | 'general';

export interface FeedbackInput {
  type: FeedbackType;
  title: string;
  description: string;
  steps?: string;
  expected?: string;
  actual?: string;
  page?: string;
}

export interface FeedbackMeta {
  repo: string;
  userAgent: string;
  appVersion: string;
  reportedAt: string;
}

const LABELS: Record<FeedbackType, string[]> = {
  bug: ['bug'],
  feature: ['enhancement'],
  general: ['question'],
};

/**
 * Build a GitHub issue payload from feedback input plus request context,
 * so reporters submit as much detail as possible with correct labels.
 *
 * @param input - Validated feedback fields
 * @param meta - Request context (repo, UA, version, time)
 * @returns GitHub issues API payload
 */
export function buildIssuePayload(
  input: FeedbackInput,
  meta: FeedbackMeta
): { title: string; body: string; labels: string[] } {
  const title = `${input.title} (${input.type})`;
  const sections = ['## Summary', input.description];
  if (input.type === 'bug') {
    sections.push(
      '## Steps to reproduce',
      input.steps || '_not provided_',
      '## Expected',
      input.expected || '_not provided_',
      '## Actual',
      input.actual || '_not provided_'
    );
  }
  sections.push(
    '## Environment',
    `- **App version:** ${meta.appVersion}`,
    `- **Page:** ${input.page || '_not provided_'}`,
    `- **User agent:** ${meta.userAgent}`,
    `- **Reported at:** ${meta.reportedAt}`,
    `- **Reported via:** feedback form (${meta.repo})`
  );
  return { title, body: sections.join('\n\n'), labels: LABELS[input.type] };
}

/**
 * Build a prefilled GitHub issue URL for the community loop: reports an
 * incorrect listing, requests a new listing, or reviews one already here.
 *
 * @param repo - GitHub repo "<owner>/<repo>"
 * @param kind - Which action the issue represents
 * @param item - Item context (name and id)
 * @returns Absolute issues/new URL with title, body and labels prefilled
 */
export function buildCommunityIssueUrl(
  repo: string,
  kind: 'add' | 'fix' | 'review',
  item: { name: string; id: string } | null
): string {
  const templates: Record<typeof kind, { title: string; body: string; labels: string }> = {
    add: {
      title: `Add: ${item?.name ?? 'new listing'}`,
      body: [
        '**Listing to add**',
        item ? `Related to existing listing: \`${item.id}\`` : '',
        '',
        '## Details',
        '- Name:',
        '- City:',
        '- Address / suburb:',
        '- Website:',
        '- Source URL:',
        '',
        '> The dataset is zod-validated; run `pnpm run check` after editing `src/data/items.ts`.',
      ]
        .filter((line) => line !== '')
        .join('\n'),
      labels: 'add',
    },
    fix: {
      title: `Fix: ${item?.name ?? 'listing'}`,
      body: [
        item ? `Listing: [\`${item.id}\`](/items/${item.id})` : '',
        '',
        '## What is wrong?',
        '-',
        '',
        '## What is the correct detail?',
        '-',
        '',
        '- Source URL:',
      ].join('\n'),
      labels: 'fix',
    },
    review: {
      title: `Review: ${item?.name ?? 'listing'}`,
      body: [
        item ? `Listing: [\`${item.id}\`](/items/${item.id})` : '',
        '',
        '## First-hand experience',
        '-',
        '',
        '> Reviews are public on the listing page after merge.',
      ].join('\n'),
      labels: 'review',
    },
  };
  const template = templates[kind];
  const params = new URLSearchParams({
    title: template.title,
    body: template.body,
    labels: template.labels,
  });
  return `https://github.com/${repo}/issues/new?${params.toString()}`;
}
