'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  _count: { assessments: number };
}

export function PatientTable({ patients }: { patients: Patient[] }) {
  const [query, setQuery] = useState('');

  const filtered = patients.filter((p) =>
    `${p.firstName} ${p.lastName} ${p.phone} ${p.email ?? ''}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-clinical-muted" />
        <Input
          placeholder="Search patients…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        {filtered.length === 0 ? (
          <p className="text-sm text-clinical-muted">No patients found.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-clinical-border text-xs uppercase tracking-wide text-clinical-muted">
                <th className="pb-2">Name</th>
                <th className="pb-2">Phone</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Assessments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-clinical-border">
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="py-3">
                    <Link
                      href={`/dashboard/patients/${p.id}`}
                      className="font-medium text-sage-700 hover:underline"
                    >
                      {p.firstName} {p.lastName}
                    </Link>
                  </td>
                  <td className="py-3 text-clinical-text">{p.phone}</td>
                  <td className="py-3 text-clinical-text">{p.email ?? '—'}</td>
                  <td className="py-3 text-clinical-text">{p._count.assessments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
