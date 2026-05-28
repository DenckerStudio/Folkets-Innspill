'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuHamburger,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuMobile,
  NavigationMenuMobilePanel,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Bell, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import {
  deltaLinks,
  hurtiglenker,
  omLinks,
  type SiteNavLinkItem,
  utforskLinks,
} from '@/lib/site-nav-links';

type LinkItem = SiteNavLinkItem;

export function Header() {
  const scrolled = useScroll(10);
  const { user } = useAuth();
  const router = useRouter();
  const isLoggedIn = !!user;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const displayName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  const handleSignOut = async () => {
    const { getBrowserSupabase } = await import('@/lib/supabase');
    await getBrowserSupabase().auth.signOut();
    router.push('/');
    router.refresh();
  };

  React.useEffect(() => {
    let timer: number | undefined;
    const load = async () => {
      if (!isLoggedIn) {
        setUnreadCount(0);
        return;
      }
      try {
        const res = await fetch('/api/notifications/unread-count', { cache: 'no-store' });
        const json = await res.json();
        setUnreadCount(Number(json.count || 0));
      } catch {
        // ignore
      }
    };

    void load();
    timer = window.setInterval(load, 30000);
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [isLoggedIn]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 supports-[backdrop-filter]:bg-background/80',
        scrolled ? 'border-border shadow-sm backdrop-blur-lg' : 'border-border/60',
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 md:gap-5">
          <div className="md:hidden">
            <NavigationMenuMobile open={mobileOpen} onOpenChange={setMobileOpen}>
              <NavigationMenuHamburger />
              <NavigationMenuMobilePanel>
                <HeaderMobileNavList />
              </NavigationMenuMobilePanel>
            </NavigationMenuMobile>
          </div>
          <Link href="/" className="hover:opacity-90 rounded-md p-1 transition-opacity">
            <FolketsStemmeLogo />
          </Link>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <HeaderNavSections />
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 md:hidden">
            <HeaderAuthActions
              variant="mobile"
              isLoggedIn={isLoggedIn}
              unreadCount={unreadCount}
              displayName={displayName}
              onSignOut={handleSignOut}
            />
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <HeaderAuthActions
              variant="desktop"
              isLoggedIn={isLoggedIn}
              unreadCount={unreadCount}
              displayName={displayName}
              onSignOut={handleSignOut}
            />
          </div>
        </div>
      </nav>
    </header>
  );
}

function HeaderNavSections() {
  return (
    <>
      <NavigationMenuItem>
        <NavigationMenuTrigger className="bg-transparent">Utforsk</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-background p-1 pr-1.5">
          <ul className="bg-popover grid w-96 grid-cols-2 gap-2 rounded-md border p-2 shadow">
            {utforskLinks.map((item) => (
              <li key={item.href}>
                <NavListItem {...item} />
              </li>
            ))}
          </ul>
          <div className="p-2">
            <p className="text-muted-foreground text-sm">
              Vil du delta?{' '}
              <Link href="/horinger" className="text-foreground font-medium hover:underline">
                Se åpne høringer
              </Link>
            </p>
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuTrigger className="bg-transparent">Delta</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-background p-1 pr-1.5 pb-1.5">
          <div className="grid w-96 grid-cols-2 gap-2">
            <ul className="bg-popover space-y-2 rounded-md border p-2 shadow">
              {deltaLinks.map((item) => (
                <li key={item.href}>
                  <NavListItem {...item} />
                </li>
              ))}
            </ul>
            <ul className="space-y-2 p-3">
              {hurtiglenker.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex p-2 hover:bg-accent flex-row rounded-md items-center gap-x-2"
                  >
                    <item.icon className="text-foreground size-4" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuTrigger className="bg-transparent">Om</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-background p-1 pr-1.5">
          <ul className="bg-popover w-72 space-y-2 rounded-md border p-2 shadow">
            {omLinks.map((item) => (
              <li key={item.href}>
                <NavListItem {...item} />
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </>
  );
}

function HeaderMobileNavList() {
  return (
    <div className="space-y-6">
      <MobileNavSection title="Utforsk">
        <ul className="space-y-1">
          {utforskLinks.map((item) => (
            <li key={item.href}>
              <NavListItem {...item} compact />
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mt-3 text-sm">
          Vil du delta?{' '}
          <Link href="/horinger" className="text-foreground font-medium hover:underline">
            Se åpne høringer
          </Link>
        </p>
      </MobileNavSection>
      <MobileNavSection title="Delta">
        <ul className="space-y-1">
          {deltaLinks.map((item) => (
            <li key={item.href}>
              <NavListItem {...item} compact />
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground mt-3 mb-1 text-xs font-medium uppercase tracking-wide">
          Hurtiglenker
        </p>
        <ul className="space-y-1">
          {hurtiglenker.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-2 rounded-md p-2 text-sm font-medium hover:bg-accent"
              >
                <item.icon className="text-foreground size-4" />
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </MobileNavSection>
      <MobileNavSection title="Om">
        <ul className="space-y-1">
          {omLinks.map((item) => (
            <li key={item.href}>
              <NavListItem {...item} compact />
            </li>
          ))}
        </ul>
      </MobileNavSection>
    </div>
  );
}

function MobileNavSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-foreground mb-2 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

type HeaderAuthActionsProps = {
  variant: 'mobile' | 'desktop';
  isLoggedIn: boolean;
  unreadCount: number;
  displayName: string;
  onSignOut: () => void;
};

function HeaderAuthActions({
  variant,
  isLoggedIn,
  unreadCount,
  displayName,
  onSignOut,
}: HeaderAuthActionsProps) {
  if (isLoggedIn) {
    return (
      <>
        <Link
          href="/varsler"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors md:h-10 md:w-10"
          aria-label="Varsler"
        >
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[11px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </Link>
        {variant === 'desktop' ? (
          <>
            <Button variant="outline" render={<Link href="/min-side" />}>
              {displayName ? `Hei, ${displayName.split(' ')[0]}` : 'Min side'}
            </Button>
            <Button onClick={onSignOut}>
              <LogOut className="size-4" />
              Logg ut
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" render={<Link href="/min-side" />}>
            {displayName ? displayName.split(' ')[0] : 'Min side'}
          </Button>
        )}
      </>
    );
  }

  if (variant === 'desktop') {
    return (
      <>
        <Button variant="outline" render={<Link href="/auth/login" />}>
          <LogIn className="size-4" />
          Logg inn
        </Button>
        <Button render={<Link href="/auth/login" />}>Kom i gang</Button>
      </>
    );
  }

  return (
    <Button variant="outline" size="sm" render={<Link href="/auth/login" />}>
      <LogIn className="size-4" />
      Logg inn
    </Button>
  );
}

function NavListItem({
  title,
  description,
  icon: Icon,
  href,
  compact = false,
}: LinkItem & { compact?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'w-full flex flex-row gap-x-2 rounded-sm p-2',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:bg-accent focus:text-accent-foreground focus:outline-none',
      )}
    >
      <div
        className={cn(
          'bg-background/40 flex aspect-square items-center justify-center rounded-md border shadow-sm',
          compact ? 'size-9' : 'size-12',
        )}
      >
        <Icon className={cn('text-foreground', compact ? 'size-4' : 'size-5')} />
      </div>
      <div className="flex flex-col items-start justify-center">
        <span className="font-medium">{title}</span>
        {description ? (
          <span className="text-muted-foreground text-xs">{description}</span>
        ) : null}
      </div>
    </Link>
  );
}

function useScroll(threshold: number) {
  const [scrolled, setScrolled] = React.useState(false);

  const onScroll = React.useCallback(() => {
    setScrolled(window.scrollY > threshold);
  }, [threshold]);

  React.useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  React.useEffect(() => {
    onScroll();
  }, [onScroll]);

  return scrolled;
}

function FolketsStemmeLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 200 250" className="h-10 w-8 shrink-0" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <clipPath id="fs-nav-bubble">
          <path d="M 40 0 H 160 A 40 40 0 0 1 200 40 V 160 A 40 40 0 0 1 160 200 H 140 L 145 240 L 100 200 H 40 A 40 40 0 0 1 0 160 V 40 A 40 40 0 0 1 40 0 Z" />
        </clipPath>
        <g clipPath="url(#fs-nav-bubble)">
          <rect width="200" height="250" fill="#ba0c2f" />
          <rect x="60" y="0" width="30" height="250" fill="white" />
          <rect x="0" y="80" width="200" height="30" fill="white" />
          <rect x="70" y="0" width="10" height="250" fill="#00205b" />
          <rect x="0" y="90" width="200" height="10" fill="#00205b" />
          <path d="M 0 150 L 90 60 L 120 90 L 220 -10 L 220 250 L 0 250 Z" fill="#ba0c2f" />
          <path
            d="M -10 160 L 90 60 L 120 90 L 230 -20"
            fill="none"
            stroke="white"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="120" cy="90" r="14" fill="#00205b" stroke="white" strokeWidth="6" />
        </g>
      </svg>
      <div className="hidden flex-col justify-center font-extrabold tracking-tight sm:flex">
        <span className="text-[#00205b] text-sm leading-none">FOLKETS</span>
        <span className="text-[#ba0c2f] text-sm leading-none">STEMME</span>
      </div>
    </div>
  );
}
