'use client';

import { useState } from 'react';
import { toSlug } from '@/lib/slug';

/**
 * Opt-out form: takes the listing id and POSTs to /api/opt-out.
 * The response explains what happens next (DB mode persists, snapshot
 * mode records the request for a PR).
 *
 * @returns Form element
 */
export function OptOutForm(): React.ReactElement {
  const [status, setStatus] = useState<string | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const id = String(data.get('id') ?? '').trim();
    const slug = toSlug(id);
    const response = await fetch('/api/opt-out', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: slug }),
    });
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    setStatus(
      response.ok ? (body.message ?? 'Done.') : (body.message ?? 'Could not process that request.')
    );
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <label htmlFor="opt-out-id" className="block text-sm font-medium">
        Listing name or id
      </label>
      <input
        id="opt-out-id"
        name="id"
        required
        placeholder="e.g. example-place-one"
        className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 dark:border-neutral-700 dark:bg-neutral-900"
      />
      <button
        type="submit"
        className="rounded-lg bg-neutral-900 px-4 py-2 font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
      >
        Request removal
      </button>
      {status ? (
        <p role="status" className="text-sm text-neutral-600 dark:text-neutral-300">
          {status}
        </p>
      ) : null}
    </form>
  );
}
