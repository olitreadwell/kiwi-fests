'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';

/**
 * Passwordless sign-in: enter an email, receive a one-time code, verify.
 *
 * @returns Sign-in form with code step
 */
export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function onSendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending code…');
    const form = new FormData(event.currentTarget);
    const address = String(form.get('email') ?? '');
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: address,
      type: 'sign-in',
    });
    if (error) {
      setStatus(error.message ?? 'Could not send the code. Try again.');
      return;
    }
    setEmail(address);
    setStep('code');
    setStatus('Code sent — check your inbox (or server logs in dev).');
  }

  async function onVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('verifying…');
    const { error } = await authClient.emailOtp.verifyEmail({ email, otp });
    if (error) {
      setStatus(error.message ?? 'Wrong or expired code.');
      return;
    }
    router.push('/');
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-neutral-600">No password needed — we email you a one-time code.</p>
      {step === 'email' ? (
        <form onSubmit={onSendCode} className="mt-6 flex flex-col gap-4">
          <Label>
            Email
            <Input name="email" type="email" required maxLength={200} autoComplete="email" />
          </Label>
          <Button type="submit">Send code</Button>
        </form>
      ) : (
        <form onSubmit={onVerifyCode} className="mt-6 flex flex-col gap-4">
          <Label>
            Code sent to {email}
            <Input
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={otp}
              onChange={(event) => setOtp(event.currentTarget.value)}
            />
          </Label>
          <Button type="submit">Verify</Button>
        </form>
      )}
      {status ? (
        <p className="mt-4 text-neutral-700" role="status">
          {status}
        </p>
      ) : null}
    </main>
  );
}
