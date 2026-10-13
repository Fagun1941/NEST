'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { apiRequest } from '@/lib/api';
import { saveAccessToken } from '@/lib/auth';
import type { LoginRequest, LoginResponse } from '@/types/auth';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoutNotice, setLogoutNotice] = useState(false);

  useEffect(() => {
    setLogoutNotice(new URLSearchParams(window.location.search).has('logout'));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const request: LoginRequest = { email: email.trim(), password };
      const response = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      saveAccessToken(response.accessToken);
      router.replace('/home');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to sign in. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-10">
      <div>
        <p className="text-sm font-semibold text-blue-700">SCHOOL MANAGEMENT</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Welcome to your school</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Sign in to manage classes, attendance, and school updates.</p>
      </div>

      {logoutNotice && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
          Your local session has been cleared, but the server could not confirm logout.
        </div>
      )}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      )}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-800">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-800">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            placeholder="At least 8 characters"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="font-semibold text-blue-700 hover:text-blue-900 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
          Create one
        </Link>
      </p>
    </section>
  );
}
