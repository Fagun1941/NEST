'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import HomeHeader from '@/components/home/HomeHeader';
import UserProfile from '@/components/home/UserProfile';
import { ApiError, apiRequest } from '@/lib/api';
import { clearAccessToken, getAccessToken } from '@/lib/auth';
import type { HomeResponse, LogoutResponse } from '@/types/auth';

export default function HomePage() {
  const router = useRouter();
  const [home, setHome] = useState<HomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const loadHome = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      router.replace('/auth/login');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<HomeResponse>('/home', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHome(response);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        clearAccessToken();
        router.replace('/auth/login');
        return;
      }
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load your home page. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadHome();
  }, [loadHome]);

  const handleLogout = async () => {
    const token = getAccessToken();
    setLoggingOut(true);
    setLogoutError(null);

    if (token) {
      try {
        await apiRequest<LogoutResponse>('/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (requestError) {
        setLogoutError(
          requestError instanceof Error
            ? `The server could not confirm logout (${requestError.message}). Your local session was cleared.`
            : 'The server could not confirm logout. Your local session was cleared.',
        );
        clearAccessToken();
        window.setTimeout(() => router.replace('/auth/login?logout=failed'), 1800);
        return;
      }
    }

    clearAccessToken();
    router.replace('/auth/login');
  };

  return (
    <div className="min-h-screen">
      <HomeHeader
        onLogout={handleLogout}
        loggingOut={loggingOut}
      />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {logoutError && (
          <div
            className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="alert"
          >
            {logoutError} Redirecting you to sign in…
          </div>
        )}

        {loading ? (
          <div className="flex min-h-72 items-center justify-center" role="status">
            <span className="flex items-center gap-3 text-sm font-medium text-slate-600">
              <span className="size-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-700" />
              Loading your workspace…
            </span>
          </div>
        ) : error ? (
          <section className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-slate-900">We couldn&apos;t load your workspace</h1>
            <p className="mt-3 text-sm leading-6 text-red-700" role="alert">{error}</p>
            <button
              type="button"
              onClick={() => void loadHome()}
              className="mt-6 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Try again
            </button>
          </section>
        ) : home ? (
          <div className="space-y-7">
            <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#102a56] via-[#174b83] to-[#126e88] px-6 py-8 text-white shadow-xl shadow-blue-950/10 sm:px-10 sm:py-10">
              <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-36 -z-10 size-96 rounded-full border border-white/10" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-44 right-24 -z-10 size-80 rounded-full border border-white/10" />
              <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-blue-100">
                    <span className="size-2 rounded-full bg-emerald-300" />
                    SCHOOL MANAGEMENT PORTAL
                  </div>
                  <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                    Welcome, {home.user.name}
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                    Your school workspace is ready. Keep your account details close and your school community connected.
                  </p>
                  <a
                    href="#account"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-blue-900 transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    View account details
                    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
                      <path d="M4.167 10h11.666M10 4.167 15.833 10 10 15.833" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>

                <div className="hidden size-40 place-items-center rounded-[2rem] border border-white/15 bg-white/10 shadow-inner shadow-white/10 sm:grid lg:size-48" aria-hidden="true">
                  <svg viewBox="0 0 120 120" fill="none" className="size-28 text-white lg:size-32" stroke="currentColor" strokeWidth="2">
                    <path d="M15 48 60 20l45 28M23 48h74v51H23zM48 99V68h24v31M36 61h.01M60 61h.01M84 61h.01M36 79h.01M84 79h.01" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 100h100" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </section>

            <section aria-label="School directories" className="grid gap-4 sm:grid-cols-2">
              <Link href="/home/teachers" className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                <p className="text-sm font-medium text-slate-500">School directory</p>
                <div className="mt-2 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-950">Teacher List</h2>
                  <span className="text-2xl text-blue-700 transition group-hover:translate-x-1" aria-hidden="true">→</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">Browse teachers and the subjects they teach.</p>
              </Link>
              <Link href="/home/students" className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                <p className="text-sm font-medium text-slate-500">School directory</p>
                <div className="mt-2 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-950">Student List</h2>
                  <span className="text-2xl text-blue-700 transition group-hover:translate-x-1" aria-hidden="true">→</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">Browse students by class, roll, division, and group.</p>
              </Link>
            </section>

            <section aria-label="Workspace status" className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.8">
                    <path d="m5 12.5 4.25 4.25L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-500">Account status</p>
                  <p className="mt-1 font-semibold text-slate-950">Connected</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4.5 19.5h15M6 19.5V8.25L12 4.5l6 3.75V19.5M9 19.5v-6h6v6M9 9.75h.01M12 9.75h.01M15 9.75h.01" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-500">Workspace</p>
                  <p className="mt-1 font-semibold text-slate-950">School Management</p>
                </div>
              </div>
              <div className="flex min-w-0 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="8" r="3.25" />
                    <path d="M5.75 19.25a6.25 6.25 0 0 1 12.5 0M19 8.5h2M20 7.5v2" strokeLinecap="round" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Signed in as</p>
                  <p className="mt-1 break-all font-semibold text-slate-950">{home.user.email}</p>
                </div>
              </div>
            </section>

            <div id="account" className="scroll-mt-6">
              <UserProfile user={home.user} />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
