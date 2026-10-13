import type { AuthUser } from '@/types/auth';

interface UserProfileProps {
  user: AuthUser;
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-lg font-semibold text-blue-800" aria-hidden="true">
          {user.name.trim().charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Account information</h2>
          <p className="mt-1 text-sm text-slate-500">Your signed-in profile details.</p>
        </div>
      </div>
      <dl className="mt-7 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Name</dt>
          <dd className="mt-2 break-words text-sm font-medium text-slate-900">{user.name}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</dt>
          <dd className="mt-2 break-words text-sm font-medium text-slate-900">{user.email}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Account ID</dt>
          <dd className="mt-2 break-words text-sm font-medium text-slate-900">{user.id}</dd>
        </div>
      </dl>
    </section>
  );
}
