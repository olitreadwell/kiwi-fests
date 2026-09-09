'use client';

import { useState, type FormEvent } from 'react';
import { submitWithPow } from '@/lib/submit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

/**
 * Feedback page: file a bug or feature request as a detailed GitHub issue.
 *
 * @returns Feedback form with status output
 */
export default function FeedbackPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [type, setType] = useState('bug');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('solving challenge…');
    const form = new FormData(event.currentTarget);
    const fields = Object.fromEntries(form.entries()) as Record<string, string>;
    const result = await submitWithPow('/api/feedback', fields);
    if (!result.ok) {
      setStatus(
        result.error === 'rate_limited'
          ? 'Too many submissions — try again in an hour.'
          : 'Submission failed. Please try again.'
      );
      return;
    }
    if (result.data?.disabled) {
      setStatus(
        'Issue creation is not enabled on this instance — please email instead (see /contact).'
      );
      return;
    }
    setStatus(`Issue created: ${String(result.data?.url ?? '')}`);
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Report feedback</h1>
      <p className="mt-2 text-neutral-600">
        Bug? Idea? File it with as much detail as possible — it becomes a labelled GitHub issue.
      </p>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <Label>
          Type
          <Select
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            aria-label="Feedback type"
          >
            <option value="bug">Bug report</option>
            <option value="feature">Feature request</option>
            <option value="general">General feedback</option>
          </Select>
        </Label>
        <Label>
          Title
          <Input name="title" required minLength={3} maxLength={200} />
        </Label>
        <Label>
          What happened / what do you want?
          <Textarea name="description" required minLength={3} maxLength={5000} rows={5} />
        </Label>
        <Label>
          Page or area (optional)
          <Input name="page" maxLength={500} />
        </Label>
        <Label>
          Steps to reproduce (bugs)
          <Textarea name="steps" maxLength={5000} rows={3} />
        </Label>
        <Label>
          Expected (bugs)
          <Textarea name="expected" maxLength={2000} rows={2} />
        </Label>
        <Label>
          Actual (bugs)
          <Textarea name="actual" maxLength={2000} rows={2} />
        </Label>
        {/* Honeypot: hidden from humans, irresistible to bots. */}
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />
        <Button type="submit">Submit feedback</Button>
      </form>
      {status ? (
        <p className="mt-4 text-neutral-700" role="status">
          {status}
        </p>
      ) : null}
    </main>
  );
}
