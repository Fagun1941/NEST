'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, apiRequest } from '@/lib/api';
import { clearAccessToken, getAccessToken } from '@/lib/auth';

type Teacher = { id: number; name: string; email: string; subject: string | null };
type Student = {
  id: number;
  name: string;
  email: string;
  className: string | null;
  rollNumber: string | null;
  division: string | null;
  studentGroup: string | null;
};

export default function DirectoryPage({ kind }: { kind: 'teachers' | 'students' }) {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const title = kind === 'teachers' ? 'Teacher List' : 'Student List';

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    apiRequest<Teacher[] | Student[]>(`/users/${kind}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((rows) => {
      if (kind === 'teachers') setTeachers(rows as Teacher[]);
      else setStudents(rows as Student[]);
    }).catch((requestError: unknown) => {
      if (requestError instanceof ApiError && requestError.status === 401) {
        clearAccessToken();
        router.replace('/auth/login');
        return;
      }
      setError(requestError instanceof Error ? requestError.message : 'Could not load this list.');
    }).finally(() => setLoading(false));
  }, [kind, router]);

  const rows = kind === 'teachers'
    ? teachers.map((teacher) => [teacher.name, teacher.email, teacher.subject || 'Not set'])
    : students.map((student) => [student.name, student.email, student.className || '—', student.rollNumber || '—', student.division || '—', student.studentGroup || '—']);
  const headings = kind === 'teachers'
    ? ['Teacher', 'Email', 'Subject']
    : ['Student', 'Email', 'Class', 'Roll', 'Division', 'Group'];
  const count = kind === 'teachers' ? teachers.length : students.length;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link href="/home" className="text-sm font-semibold text-blue-700 hover:text-blue-900">← Back to home</Link>
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{kind === 'teachers' ? 'Teachers and their subjects.' : 'Students and their class information.'}</p>
        {!loading && !error && <p className="mt-4 text-sm font-medium text-slate-700">{count} {kind === 'teachers' ? (count === 1 ? 'teacher' : 'teachers') : (count === 1 ? 'student' : 'students')}</p>}
        {loading ? <p className="py-12 text-center text-slate-600" role="status">Loading list…</p>
          : error ? <p className="py-12 text-center text-red-700" role="alert">{error}</p>
            : rows.length === 0 ? <p className="py-12 text-center text-slate-600">No {kind} have been added yet.</p>
              : <div className="mt-6 overflow-x-auto"><table className="w-full border-collapse text-left text-sm">
                <thead><tr className="border-b border-slate-200">{headings.map((heading) => <th key={heading} className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600">{heading}</th>)}</tr></thead>
                <tbody>{rows.map((row, index) => <tr key={`${row[1]}-${index}`} className="border-b border-slate-100 last:border-0">{row.map((value, cell) => <td key={cell} className="whitespace-nowrap px-4 py-4 text-slate-800">{value}</td>)}</tr>)}</tbody>
              </table></div>}
      </div>
    </main>
  );
}
