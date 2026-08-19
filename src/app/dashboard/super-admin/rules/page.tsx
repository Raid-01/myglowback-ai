import Link from 'next/link';
import { requireRole } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RuleCondition {
  concerns?: string[];
  severity?: string[];
  skinType?: string[];
}

export default async function RulesListPage() {
  await requireRole(['SUPER_ADMIN']);
  const rules = await prisma.skincareRule.findMany({ orderBy: { name: 'asc' } });

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-clinical-text">Skincare Rules</h1>
          <p className="mt-1 text-sm text-clinical-muted">
            This is the actual clinical content the app recommends. Editing here changes what
            every clinic sees, immediately — no code, no waiting on a developer.
          </p>
        </div>
        <Link href="/dashboard/super-admin/rules/new">
          <Button type="button">New rule</Button>
        </Link>
      </div>

      <Card className="mt-6">
        {rules.length === 0 ? (
          <p className="text-sm text-clinical-muted">No rules yet.</p>
        ) : (
          <ul className="divide-y divide-clinical-border">
            {rules.map((r) => {
              const condition = r.condition as RuleCondition;
              return (
                <li key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link
                      href={`/dashboard/super-admin/rules/${r.id}`}
                      className="font-medium text-clinical-text hover:text-sage-700"
                    >
                      {r.name}
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {(condition.concerns ?? []).map((c) => (
                        <Badge key={c} tone="neutral">
                          {c.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                      {(condition.severity ?? []).map((s) => (
                        <Badge key={s} tone="honey">
                          {s}
                        </Badge>
                      ))}
                      {r.requiresLicensedPharmacy && <Badge tone="sage">Pharmacy-only</Badge>}
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/super-admin/rules/${r.id}`}
                    className="text-sm font-medium text-sage-700"
                  >
                    Edit
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
