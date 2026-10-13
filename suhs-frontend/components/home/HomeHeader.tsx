'use client';

interface HomeHeaderProps {
  onLogout: () => void;
  loggingOut: boolean;
}

export default function HomeHeader({ onLogout, loggingOut }: HomeHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-700 text-white" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.8">
              <path d="m3 9 9-5.25L21 9M5.25 10.5v7.125c0 .621.504 1.125 1.125 1.125h11.25c.621 0 1.125-.504 1.125-1.125V10.5M9 18.75v-5.25h6v5.25M3 9h18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <p className="font-semibold tracking-wide text-slate-950">School Management</p>
            <p className="text-xs text-slate-500">School workspace</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-wait disabled:opacity-60"
        >
          {loggingOut ? 'Signing out…' : 'Log out'}
        </button>
      </div>
    </header>
  );
}
