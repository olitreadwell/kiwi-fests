'use client';

import { useState, type FormEvent } from 'react';
import { submitWithPow } from '@/lib/submit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/**
 * Contact page: name, email, subject, message + abuse protection.
 *
 * @returns Contact form with status output
 */
export default function ContactPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('solving challenge…');
    const form = new FormData(event.currentTarget);
    const fields = Object.fromEntries(form.entries()) as Record<string, string>;
    const result = await submitWithPow('/api/contact', fields);
    if (!result.ok) {
      setStatus(
        result.error === 'rate_limited'
          ? 'Too many messages — try again in an hour.'
          : 'Submission failed. Please try again.'
      );
      return;
    }
    if (result.data?.delivered === 'fallback' && typeof result.data.mailtoUrl === 'string') {
      window.location.href = result.data.mailtoUrl;
      setStatus('Opening your email client…');
      return;
    }
    setStatus('Thanks — your message is on its way.');
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Contact</h1>
      <p className="mt-2 text-neutral-600">
        Questions, corrections, or anything else — send a message.
      </p>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <Label>
          Name
          <Input name="name" required maxLength={100} />
        </Label>
        <Label>
          Email (optional, for replies)
          <Input name="email" type="email" maxLength={200} />
        </Label>
        <Label>
          Subject
          <Input name="subject" required maxLength={200} />
        </Label>
        <Label>
          Message
          <Textarea name="message" required maxLength={5000} rows={6} />
        </Label>
        {/* Honeypot: hidden from humans, irresistible to bots. */}
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />
        <Button type="submit">Send message</Button>
      </form>
      {status ? (
        <p className="mt-4 text-neutral-700" role="status">
          {status}
        </p>
      ) : null}
    </main>
  );
}
