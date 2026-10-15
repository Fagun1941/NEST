'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { saveAccessToken } from '@/lib/auth';
import type { LoginResponse } from '@/types/auth';

export default function MicrosoftSignInPage() {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void apiRequest<LoginResponse>('/auth/microsoft/session', { method: 'POST', credentials: 'same-origin' })
      .then((session) => { saveAccessToken(session.accessToken); router.replace('/home'); })
      .catch(() => setError(true));
  }, [router]);
  return (
    <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
      <h1 className="text-2xl font-semibold text-slate-950">Microsoft sign-in</h1>
      {error ? <>
        <p role="alert" className="mt-4 text-sm text-red-700">Your sign-in session expired or could not be completed. Please try again.</p>
        <Link href="/auth/login" className="mt-6 inline-block font-semibold text-blue-700">Back to sign in</Link>
      </> : <p role="status" className="mt-4 text-sm text-slate-600">Completing your Microsoft sign-in…</p>}
    </section>
  );
}
