'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/ui/header-3';
import { MobileNav } from '@/components/mobile-nav';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

type NavigationProps = {
  children: React.ReactNode;
};

/** Below `md`: bottom nav. From `md` up: top header on `/` or when logged in. */
export function Navigation({ children }: NavigationProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isHome = pathname === '/';
  const isLoggedIn = !!user;
  const showTopHeader = isHome || isLoggedIn;

  return (
    <>
      {showTopHeader ? (
        <div className="hidden md:block">
          <Header />
        </div>
      ) : null}
      <MobileNav />
      <div className={cn('pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] md:pb-0')}>
        {children}
      </div>
    </>
  );
}
