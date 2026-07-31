'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  CreditCard,
  ClipboardList,
  Package,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Icons can't cross the server → client prop boundary as component
// references (Next.js requires props to be serializable), so items come in
// with a string icon name and get mapped to the real component in here.
// This map is intentionally NOT exported — a Server Component can't reach
// into an object of components from a 'use client' file (see
// dashboard/layout.tsx's SERVER_ICON_MAP for the server-side equivalent).
const ICON_MAP = {
  LayoutDashboard,
  CreditCard,
  ClipboardList,
  Package,
  Users,
  ShieldCheck,
} as const;

export type NavIconName = keyof typeof ICON_MAP;

export interface MobileNavItem {
  href: string;
  label: string;
  icon: NavIconName;
}

export function MobileNav({ items }: { items: MobileNavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="sm:hidden">
      <div className="flex items-center justify-between border-b border-clinical-border bg-white px-4 py-3">
        <Link
          href="/dashboard"
          className="font-display text-lg text-sage-800"
          onClick={() => setOpen(false)}
        >
          MyGlowBack<span className="text-honey-500">.AI</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-full p-2 text-sage-700 hover:bg-sage-50"
        >
          <Menu size={22} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute right-0 top-0 flex h-full w-72 max-w-[80%] flex-col bg-white p-5 shadow-soft">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-lg text-sage-800">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-full p-2 text-sage-700 hover:bg-sage-50"
              >
                <X size={22} />
              </button>
            </div>
            <div className="space-y-1">
              {items.map(({ href, label, icon }) => {
                const Icon = ICON_MAP[icon];
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-clinical-text hover:bg-sage-50',
                      active && 'bg-sage-50 text-sage-800'
                    )}
                  >
                    <Icon size={18} className="text-sage-600" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
