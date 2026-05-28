'use client';

import React from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { LogIn, LogOut } from 'lucide-react';
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
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const { user } = useAuth();
  const router = useRouter();
  const isLoggedIn = !!user;
  const displayName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleSignOut = async () => {
    const { getBrowserSupabase } = await import('@/lib/supabase');
    await getBrowserSupabase().auth.signOut();
    setOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 supports-[backdrop-filter]:bg-background/80',
        scrolled ? 'border-border shadow-sm backdrop-blur-lg' : 'border-border/60',
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 md:gap-5">
          <Link href="/" className="hover:opacity-90 rounded-md p-1 transition-opacity">
            <FolketsStemmeLogo />
          </Link>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">Utforsk</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background p-1 pr-1.5">
                  <ul className="bg-popover grid w-lg grid-cols-2 gap-2 rounded-md border p-2 shadow">
                    {utforskLinks.map((item) => (
                      <li key={item.href}>
                        <DesktopListItem {...item} onNavigate={() => setOpen(false)} />
                      </li>
                    ))}
                  </ul>
                  <div className="p-2">
                    <p className="text-muted-foreground text-sm">
                      Vil du delta?{' '}
                      <Link
                        href="/horinger"
                        className="text-foreground font-medium hover:underline"
                      >
                        Se åpne høringer
                      </Link>
                    </p>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">Delta</NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background p-1 pr-1.5 pb-1.5">
                  <div className="grid w-lg grid-cols-2 gap-2">
                    <ul className="bg-popover space-y-2 rounded-md border p-2 shadow">
                      {deltaLinks.map((item) => (
                        <li key={item.href}>
                          <DesktopListItem {...item} onNavigate={() => setOpen(false)} />
                        </li>
                      ))}
                    </ul>
                    <ul className="space-y-2 p-3">
                      {hurtiglenker.map((item) => (
                        <li key={item.href}>
                          <NavigationMenuLink
                            render={<Link href={item.href} />}
                            closeOnClick
                            className="flex p-2 hover:bg-accent flex-row rounded-md items-center gap-x-2"
                          >
                            <item.icon className="text-foreground size-4" />
                            <span className="font-medium">{item.title}</span>
                          </NavigationMenuLink>
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
                        <DesktopListItem {...item} onNavigate={() => setOpen(false)} />
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <>
              <Button variant="outline" render={<Link href="/min-side" />}>
                {displayName ? `Hei, ${displayName.split(' ')[0]}` : 'Min side'}
              </Button>
              <Button onClick={handleSignOut}>
                <LogOut className="size-4" />
                Logg ut
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" render={<Link href="/auth/login" />}>
                <LogIn className="size-4" />
                Logg inn
              </Button>
              <Button render={<Link href="/auth/login" />}>Kom i gang</Button>
            </>
          )}
        </div>
        <Button
          size="icon"
          variant="outline"
          onClick={() => setOpen(!open)}
          className="md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Åpne meny"
        >
          <MenuToggleIcon open={open} className="size-5" duration={300} />
        </Button>
      </nav>
      <MobileMenu open={open} className="flex flex-col justify-between gap-4 overflow-y-auto">
        <div className="flex w-full flex-col gap-y-4">
          <MobileNavSection title="Utforsk" links={utforskLinks} onNavigate={() => setOpen(false)} />
          <MobileNavSection title="Delta" links={deltaLinks} onNavigate={() => setOpen(false)} />
          <MobileNavSection title="Om" links={omLinks} onNavigate={() => setOpen(false)} />
          <MobileNavSection title="Hurtiglenker" links={hurtiglenker} onNavigate={() => setOpen(false)} />
        </div>
        <div className="flex flex-col gap-2 pb-4">
          {isLoggedIn ? (
            <>
              <Button variant="outline" className="w-full bg-transparent" render={<Link href="/min-side" onClick={() => setOpen(false)} />}>
                Min side
              </Button>
              <Button className="w-full" onClick={handleSignOut}>
                Logg ut
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="w-full bg-transparent" render={<Link href="/auth/login" onClick={() => setOpen(false)} />}>
                Logg inn
              </Button>
              <Button className="w-full" render={<Link href="/auth/login" onClick={() => setOpen(false)} />}>
                Kom i gang
              </Button>
            </>
          )}
        </div>
      </MobileMenu>
    </header>
  );
}

type MobileMenuProps = React.ComponentProps<'div'> & {
  open: boolean;
};

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
  if (!open || typeof window === 'undefined') return null;

  return createPortal(
    <div
      id="mobile-menu"
      className={cn(
        'bg-background/95 supports-[backdrop-filter]:bg-background/50 backdrop-blur-lg',
        'fixed top-16 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-y md:hidden',
      )}
    >
      <div
        data-slot={open ? 'open' : 'closed'}
        className={cn(
          'data-[slot=open]:animate-in data-[slot=open]:zoom-in-97 ease-out',
          'size-full p-4',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

function MobileNavSection({
  title,
  links,
  onNavigate,
}: {
  title: string;
  links: LinkItem[];
  onNavigate: () => void;
}) {
  return (
    <div>
      <span className="text-muted-foreground mb-2 block text-sm font-medium">{title}</span>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <MobileListItem {...link} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function DesktopListItem({
  title,
  description,
  icon: Icon,
  className,
  href,
  onNavigate,
}: LinkItem & {
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <NavigationMenuLink
      className={cn(
        'w-full flex flex-row gap-x-2 data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-sm p-2',
        className,
      )}
      closeOnClick
      render={<Link href={href} onClick={onNavigate} />}
    >
      <div className="bg-background/40 flex aspect-square size-12 items-center justify-center rounded-md border shadow-sm">
        <Icon className="text-foreground size-5" />
      </div>
      <div className="flex flex-col items-start justify-center">
        <span className="font-medium">{title}</span>
        {description ? (
          <span className="text-muted-foreground text-xs">{description}</span>
        ) : null}
      </div>
    </NavigationMenuLink>
  );
}

function MobileListItem({
  title,
  description,
  icon: Icon,
  href,
  onNavigate,
}: LinkItem & { onNavigate?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'w-full flex flex-row gap-x-2 rounded-sm p-2',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:bg-accent focus:text-accent-foreground focus:outline-none',
      )}
    >
      <div className="bg-background/40 flex aspect-square size-12 items-center justify-center rounded-md border shadow-sm">
        <Icon className="text-foreground size-5" />
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
