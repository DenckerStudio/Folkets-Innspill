'use client';

import { FileEdit, LayoutDashboard, MessageSquare, Search, UserRound } from 'lucide-react';
import { InteractiveMenu, type InteractiveMenuItem } from '@/components/ui/interactive-menu';
import { useAuth } from '@/hooks/use-auth';
import { DASHBOARD_PREFIX, routes } from '@/lib/routes';

const mobileNavItems: InteractiveMenuItem[] = [
  {
    label: 'Dashboard',
    href: routes.dashboard,
    icon: LayoutDashboard,
    isActive: (pathname) => pathname === DASHBOARD_PREFIX,
  },
  {
    label: 'Utforsk',
    href: routes.utforsk,
    icon: Search,
    isActive: (pathname) =>
      pathname === routes.utforsk ||
      pathname.startsWith(`${routes.utforsk}/`) ||
      pathname.startsWith(`${DASHBOARD_PREFIX}/sak/`) ||
      pathname.startsWith(routes.politikere) ||
      pathname.startsWith(routes.representanter),
  },
  {
    label: 'Høringer',
    href: routes.horinger,
    icon: FileEdit,
    isActive: (pathname) =>
      pathname === routes.horinger || pathname.startsWith(`${routes.horinger}/`),
  },
  {
    label: 'Forum',
    href: routes.forum,
    icon: MessageSquare,
    isActive: (pathname) =>
      pathname === routes.forum || pathname.startsWith(`${routes.forum}/`),
  },
  {
    label: 'Profil',
    href: routes.minSide,
    icon: UserRound,
    isActive: (pathname) =>
      pathname.startsWith(routes.minSide) ||
      pathname.startsWith(routes.varsler) ||
      pathname.startsWith('/auth'),
  },
];

export function MobileNav() {
  const { user } = useAuth();

  const items = mobileNavItems.map((item) =>
    item.href === routes.minSide && !user
      ? { ...item, href: routes.login, label: 'Logg inn' }
      : item,
  );

  return (
    <div className="md:hidden">
      <InteractiveMenu items={items} accentColor="#00205b" />
    </div>
  );
}
