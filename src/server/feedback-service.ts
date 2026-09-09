import { buildIssuePayload, type FeedbackInput } from '@/lib/issue-builder';

export interface FeedbackServiceConfig {
  token: string;
  repo: string;
  appVersion: string;
}

export interface FeedbackOutcome {
  disabled: boolean;
  url?: string;
}

/**
 * Read feedback config from the environment.
 *
 * @param env - Process environment object
 * @returns Config, or null when GitHub feedback is disabled
 */
export function readFeedbackConfig(
  env: Record<string, string | undefined>
): FeedbackServiceConfig | null {
  const token = env.GH_TOKEN ?? '';
  const repo = env.GH_REPO ?? '';
  if (!token || !repo) return null;
  return { token, repo, appVersion: env.APP_VERSION ?? '0.0.0' };
}

/**
 * Create a GitHub issue for feedback. Ensures the label exists first so
 * submissions land with the right template and labelling.
 *
 * @param input - Validated feedback fields
 * @param userAgent - Request user agent
 * @param config - Feedback service config
 * @returns Outcome with the issue URL when enabled
 */
export async function createGithubIssue(
  input: FeedbackInput,
  userAgent: string,
  config: FeedbackServiceConfig
): Promise<FeedbackOutcome> {
  const api = 'https://api.github.com';
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'template-feedback/1.0',
  };
  for (const label of ['bug', 'enhancement', 'question']) {
    await fetch(`${api}/repos/${config.repo}/labels`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: label, color: 'd73a4a' }),
    }).catch(() => undefined);
  }
  const payload = buildIssuePayload(input, {
    repo: config.repo,
    userAgent,
    appVersion: config.appVersion,
    reportedAt: new Date().toISOString(),
  });
  const response = await fetch(`${api}/repos/${config.repo}/issues`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`github: issue creation failed (${response.status})`);
  }
  const created = (await response.json()) as { html_url: string };
  return { disabled: false, url: created.html_url };
}
