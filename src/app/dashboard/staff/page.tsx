import { requireRole } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StaffTypeSelect } from '@/components/StaffTypeSelect';

export default async function StaffPage() {
  const session = await requireRole(['CLINIC_ADMIN']);
  const staff = await prisma.user.findMany({
    where: { clinicId: session.user.clinicId! },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, email: true, role: true, staffType: true },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-medium text-clinical-text">Staff</h1>
      <p className="mt-1 text-sm text-clinical-muted">
        Tag who's a licensed Pharmacist. Only a verified pharmacy clinic with a Pharmacist logged
        in can dispense prescription-tier items — everyone else sees them labeled, not actionable.
        Nobody is tagged Pharmacist by default; you're vouching for this yourself.
      </p>

      <Card className="mt-6">
        <ul className="divide-y divide-clinical-border">
          {staff.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-clinical-text">{u.name}</p>
                <p className="text-xs text-clinical-muted">
                  {u.email} · <Badge tone="neutral">{u.role.replace('_', ' ')}</Badge>
                </p>
              </div>
              <StaffTypeSelect userId={u.id} currentValue={u.staffType} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
