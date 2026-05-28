'use client';

import { FileEdit, Home, MessageSquare, Search, UserRound } from 'lucide-react';
import { InteractiveMenu, type InteractiveMenuItem } from '@/components/ui/interactive-menu';
import { useAuth } from '@/hooks/use-auth';

const mobileNavItems: InteractiveMenuItem[] = [
  {
    label: 'Hjem',
    href: '/',
    icon: Home,
    isActive: (pathname) => pathname === '/',
  },
  {
    label: 'Utforsk',
    href: '/utforsk',
    icon: Search,
    isActive: (pathname) =>
      pathname === '/utforsk' ||
      pathname.startsWith('/utforsk/') ||
      pathname.startsWith('/sak/') ||
      pathname.startsWith('/politikere') ||
      pathname.startsWith('/representanter'),
  },
  {
    label: 'Høringer',
    href: '/horinger',
    icon: FileEdit,
    isActive: (pathname) => pathname === '/horinger' || pathname.startsWith('/horinger/'),
  },
  {
    label: 'Forum',
    href: '/forum',
    icon: MessageSquare,
    isActive: (pathname) => pathname === '/forum' || pathname.startsWith('/forum/'),
  },
  {
    label: 'Profil',
    href: '/min-side',
    icon: UserRound,
    isActive: (pathname) =>
      pathname.startsWith('/min-side') ||
      pathname.startsWith('/varsler') ||
      pathname.startsWith('/auth'),
  },
];

export function MobileNav() {
  const { user } = useAuth();

  const items = mobileNavItems.map((item) =>
    item.href === '/min-side' && !user
      ? { ...item, href: '/auth/login', label: 'Logg inn' }
      : item,
  );

  return (
    <div className="md:hidden">
      <InteractiveMenu items={items} accentColor="#00205b" />
    </div>
  );
}
