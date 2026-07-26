import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function StatsCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-sage-100">
        <Icon size={20} className="text-sage-700" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-clinical-muted">{label}</p>
        <p className="font-display text-2xl font-medium text-clinical-text">{value}</p>
      </div>
    </Card>
  );
}
