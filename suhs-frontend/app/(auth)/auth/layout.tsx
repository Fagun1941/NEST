import Link from 'next/link';
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <aside className="relative isolate flex min-h-[340px] flex-col overflow-hidden bg-gradient-to-br from-[#102a56] via-[#174b83] to-[#126e88] px-6 py-7 text-white sm:px-10 sm:py-9 lg:sticky lg:top-0 lg:h-screen lg:px-14 lg:py-12">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-36 size-96 rounded-full border border-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-32 size-[28rem] rounded-full border border-white/10" />

        <Link href="/auth/login" className="relative inline-flex w-fit items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          <span className="text-base font-bold tracking-wide">School Management</span>
        </Link>

        <div className="relative mt-9 max-w-xl sm:mt-12 lg:mt-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">A brighter way to run your school</p>
          <h2 className="mt-4 max-w-lg text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Make every school day run smoothly.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-blue-100 sm:text-base">
            Keep your school connected with the people, classes, and daily details that matter most.
          </p>
        </div>

        <div className="relative mt-8 hidden w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-4 shadow-2xl shadow-slate-950/20 backdrop-blur-sm sm:mt-10 sm:block sm:p-5 lg:mt-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-100">YOUR SCHOOL, AT A GLANCE</p>
              <p className="mt-1 text-sm font-semibold">Today&apos;s overview</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-cyan-300/15 text-cyan-100" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.8">
                <path d="M3.75 10.5 12 3.75l8.25 6.75v9a.75.75 0 0 1-.75.75h-15a.75.75 0 0 1-.75-.75v-9Z" />
                <path d="M9 20.25v-6h6v6M3.75 10.5h16.5" />
              </svg>
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-xs text-blue-100">Attendance</p>
              <p className="mt-1 text-xl font-semibold">On track</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-4/5 rounded-full bg-cyan-300" />
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-xs text-blue-100">School day</p>
              <p className="mt-1 text-xl font-semibold">In session</p>
              <div className="mt-3 flex items-center gap-1.5" aria-hidden="true">
                <span className="size-1.5 rounded-full bg-cyan-300" />
                <span className="text-xs text-blue-100">Classes are underway</span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white p-3 text-slate-800">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.8">
                <path d="M4.5 19.5h15M6 19.5V8.25L12 4.5l6 3.75V19.5M9 19.5v-6h6v6M9 9.75h.01M12 9.75h.01M15 9.75h.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold">One connected community</p>
              <p className="text-xs text-slate-500">Everything starts with a well-organized day.</p>
            </div>
          </div>
        </div>

        <p className="relative mt-6 hidden text-xs text-blue-200 lg:block">A simple home for your school community.</p>
      </aside>

      <div className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        {children}
      </div>
    </main>
  );
}
