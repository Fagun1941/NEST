'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { apiRequest } from '@/lib/api';
import type { RegisterRequest, RegisterResponse } from '@/types/auth';

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [className, setClassName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [division, setDivision] = useState('');
  const [studentGroup, setStudentGroup] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const request: RegisterRequest = { name: name.trim(), email: email.trim(), password, className: className.trim(), rollNumber: rollNumber.trim(), division: division.trim(), studentGroup: studentGroup.trim() };
      const response = await apiRequest<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      setSuccess(`${response.message}. Redirecting you to sign in…`);
      window.setTimeout(() => router.replace('/auth/login'), 1200);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to create your account. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-10">
      <div>
        <p className="text-sm font-semibold text-blue-700">SCHOOL MANAGEMENT</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Create your school account</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Bring your school community together with one simple workspace.</p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          {success}
        </div>
      )}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-800">Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            placeholder="Your name"
          />
        </div>
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
          <label htmlFor="className" className="mb-2 block text-sm font-medium text-slate-800">Class</label>
          <input id="className" name="className" required maxLength={30} value={className} onChange={(event) => setClassName(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" placeholder="e.g. Class 9" />
        </div>
        <div>
          <label htmlFor="rollNumber" className="mb-2 block text-sm font-medium text-slate-800">Roll number</label>
          <input id="rollNumber" name="rollNumber" required maxLength={30} value={rollNumber} onChange={(event) => setRollNumber(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" placeholder="Your class roll" />
        </div>
        <div>
          <label htmlFor="division" className="mb-2 block text-sm font-medium text-slate-800">Division</label>
          <input id="division" name="division" required maxLength={50} value={division} onChange={(event) => setDivision(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" placeholder="e.g. A" />
        </div>
        <div>
          <label htmlFor="studentGroup" className="mb-2 block text-sm font-medium text-slate-800">Group</label>
          <select id="studentGroup" name="studentGroup" required value={studentGroup} onChange={(event) => setStudentGroup(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100">
            <option value="" disabled>Select your group</option><option value="SCIENCE">Science</option><option value="HUMANITIES">Humanities</option><option value="BUSINESS_STUDIES">Business Studies</option>
          </select>
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-800">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-800">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            placeholder="Re-enter your password"
          />
        </div>
        <button
          type="submit"
          disabled={loading || Boolean(success)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Already registered?{' '}
        <Link href="/auth/login" className="font-semibold text-blue-700 hover:text-blue-900 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
          Sign in
        </Link>
      </p>
    </section>
  );
}
