'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/ui/header-3';
import { MobileNav } from '@/components/mobile-nav';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

type NavigationProps = {
  children: React.ReactNode;
};

/** Top header on `/` always; on other routes only when logged in. Bottom nav otherwise (mobile). */
export function Navigation({ children }: NavigationProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isHome = pathname === '/';
  const isLoggedIn = !!user;
  const showTopHeader = isHome || isLoggedIn;
  const showBottomNav = !showTopHeader;

  return (
    <>
      {showTopHeader ? <Header enableMobileMenu /> : null}
      {showBottomNav ? <MobileNav /> : null}
      <div
        className={cn(
          showBottomNav && 'pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] lg:pb-0',
        )}
      >
        {children}
      </div>
    </>
  );
}
