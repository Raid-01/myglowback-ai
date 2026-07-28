import Link from 'next/link';
import { requireSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { daysUntilInLagos } from '@/lib/date';
import { RenewalBanner } from '@/components/RenewalBanner';
import { ReminderPopup } from '@/components/ReminderPopup';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  CreditCard,
  ClipboardList,
  Package,
  Users,
  ShieldCheck,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['CLINIC_ADMIN', 'STAFF'] },
  { href: '/dashboard/assessments/new', label: 'New Assessment', icon: ClipboardList, roles: ['CLINIC_ADMIN', 'STAFF'] },
  { href: '/dashboard/patients', label: 'Patients', icon: Users, roles: ['CLINIC_ADMIN', 'STAFF'] },
  { href: '/dashboard/inventory', label: 'Inventory', icon: Package, roles: ['CLINIC_ADMIN'] },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard, roles: ['CLINIC_ADMIN'] },
  { href: '/dashboard/super-admin', label: 'Super Admin', icon: ShieldCheck, roles: ['SUPER_ADMIN'] },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const { role, clinicId } = session.user;

  if (role === 'SUPER_ADMIN') {
    return <DashboardShell role={role}>{children}</DashboardShell>;
  }

  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic) return <DashboardShell role={role}>{children}</DashboardShell>;

  // ── Service cessation lockout ─────────────────────────────────────
  if (!clinic.isActive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory-100 px-6">
        <div className="max-w-sm rounded-card border border-clinical-border bg-white p-8 text-center shadow-soft">
          <h1 className="font-display text-xl font-medium text-clinical-text">
            {clinic.name} is currently unavailable
          </h1>
          <p className="mt-2 text-sm text-clinical-muted">
            {clinic.isTrialing
              ? "This clinic's free trial has ended, so staff access and the public booking portal are paused. Add payment to restore access immediately."
              : "This clinic's subscription has expired, so staff access and the public booking portal are paused. Renew to restore access immediately."}
          </p>
          <Link href="/dashboard/billing" className="mt-6 block">
            <Button size="lg" className="w-full">
              {clinic.isTrialing ? 'Add Payment →' : 'Renew Now →'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const daysUntilExpiry = daysUntilInLagos(clinic.subscriptionEnd);
  const pendingReminder = await prisma.notification.findFirst({
    where: { clinicId: clinic.id, type: 'DASHBOARD', isSeen: false },
    orderBy: { daysUntilExpiry: 'asc' },
  });

  return (
    <DashboardShell
      role={role}
      banner={<RenewalBanner daysUntilExpiry={daysUntilExpiry} isTrialing={clinic.isTrialing} />}
    >
      {pendingReminder && (
        <ReminderPopup
          notificationId={pendingReminder.id}
          daysUntilExpiry={pendingReminder.daysUntilExpiry}
        />
      )}
      {children}
    </DashboardShell>
  );
}

function DashboardShell({
  role,
  banner,
  children,
}: {
  role: string;
  banner?: React.ReactNode;
  children: React.ReactNode;
}) {
  const items = NAV.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen bg-ivory-100">
      {banner}
      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden w-60 flex-none border-r border-clinical-border px-4 py-8 sm:block">
          <Link href="/dashboard" className="mb-8 block px-2 font-display text-lg text-sage-800">
            MyGlowBack<span className="text-honey-500">.AI</span>
          </Link>
          <nav className="space-y-1">
            {items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-clinical-text hover:bg-sage-50"
              >
                <Icon size={18} className="text-sage-600" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 px-6 py-8 sm:px-10">{children}</main>
      </div>
    </div>
  );
}
