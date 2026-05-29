'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import type { LucideIcon } from 'lucide-react';
import { Bell, ChevronRight, LogIn, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  mobilePrimaryLinks,
  mobileSecondaryLinks,
  type SiteNavLinkItem,
} from '@/lib/site-nav-links';

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  displayName: string;
  unreadCount: number;
  onSignOut: () => void;
};

function isLinkActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AnimatedNavIcon({ icon: Icon, active }: { icon: LucideIcon; active: boolean }) {
  return (
    <motion.span
      className={cn(
        'relative flex size-11 shrink-0 items-center justify-center rounded-2xl',
        active
          ? 'bg-[#00205b] text-white shadow-md shadow-[#00205b]/20'
          : 'bg-white/80 text-[#00205b] ring-1 ring-black/[0.06]',
      )}
      whileHover={{ scale: 1.07, rotate: active ? 0 : -6 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 480, damping: 20 }}
    >
      <motion.span
        animate={active ? { y: [0, -2, 0] } : { y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <Icon className="size-[22px]" strokeWidth={active ? 2.25 : 2} />
      </motion.span>
      {active ? (
        <motion.span
          layoutId="mobile-nav-active-glow"
          className="absolute inset-0 rounded-2xl ring-2 ring-[#ba0c2f]/35"
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        />
      ) : null}
    </motion.span>
  );
}

function MobileNavRow({
  link,
  index,
  active,
  onNavigate,
  compact,
}: {
  link: SiteNavLinkItem;
  index: number;
  active: boolean;
  onNavigate: () => void;
  compact?: boolean;
}) {
  const Icon = link.icon;

  return (
    <motion.li
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{
        delay: 0.04 + index * 0.05,
        duration: 0.32,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="list-none"
    >
      <Link
        href={link.href}
        onClick={onNavigate}
        className={cn(
          'group relative flex items-center gap-3 overflow-hidden rounded-2xl transition-colors',
          compact ? 'px-2 py-2.5' : 'px-2.5 py-3',
          active ? 'bg-white/90 shadow-sm' : 'hover:bg-white/70',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00205b]/30',
        )}
      >
        {active ? (
          <motion.span
            layoutId="mobile-nav-active-bg"
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white to-indigo-50/80"
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          />
        ) : null}
        <AnimatedNavIcon icon={Icon} active={active} />
        <div className="relative min-w-0 flex-1">
          <span
            className={cn(
              'block font-semibold tracking-tight',
              compact ? 'text-sm' : 'text-[15px]',
              active ? 'text-[#00205b]' : 'text-foreground',
            )}
          >
            {link.title}
          </span>
          {link.description && !compact ? (
            <span className="text-muted-foreground mt-0.5 block truncate text-xs">
              {link.description}
            </span>
          ) : null}
        </div>
        <motion.span
          className="relative text-muted-foreground/70"
          initial={false}
          animate={{ x: active ? 2 : 0, opacity: active ? 1 : 0.55 }}
          whileHover={{ x: 6, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
          <ChevronRight className="size-4" strokeWidth={2.25} />
        </motion.span>
      </Link>
    </motion.li>
  );
}

export function MobileNavDrawer({
  open,
  onClose,
  isLoggedIn,
  displayName,
  unreadCount,
  onSignOut,
}: MobileNavDrawerProps) {
  const pathname = usePathname();

  if (typeof window === 'undefined') return null;

  const firstName = displayName.split(' ')[0];

  return createPortal(
    <AnimatePresence mode="wait">
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Lukk meny"
            className="fixed inset-0 top-16 z-40 bg-[#00205b]/20 backdrop-blur-[3px] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobilmeny"
            className={cn(
              'fixed top-16 right-0 bottom-0 z-50 flex w-full flex-col overflow-hidden lg:hidden',
              'border-t border-white/20 bg-gradient-to-b from-slate-50/98 via-white/96 to-indigo-50/40',
              'shadow-[-8px_0_32px_rgba(0,32,91,0.08)] backdrop-blur-xl',
            )}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34, mass: 0.9 }}
          >
            <div className="flex size-full flex-col overflow-hidden px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.28 }}
                className="mb-5 px-1"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ba0c2f]">
                  Folkets Stemme
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-[#00205b]">
                  {isLoggedIn && firstName ? `Hei, ${firstName}` : 'Hva vil du gjøre?'}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {isLoggedIn
                    ? 'Velg hvor du vil fortsette.'
                    : 'Utforsk saker, stem og delta i demokratiet.'}
                </p>
              </motion.div>

              <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <ul className="flex flex-col gap-1">
                  {mobilePrimaryLinks.map((link, index) => (
                    <MobileNavRow
                      key={link.href}
                      link={link}
                      index={index}
                      active={isLinkActive(pathname, link.href)}
                      onNavigate={onClose}
                    />
                  ))}
                </ul>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.28, duration: 0.25 }}
                  className="my-4 h-px bg-gradient-to-r from-transparent via-border to-transparent"
                />

                <p className="text-muted-foreground mb-2 px-2 text-[11px] font-medium uppercase tracking-wider">
                  Mer
                </p>
                <ul className="flex flex-col gap-0.5">
                  {mobileSecondaryLinks.map((link, index) => (
                    <MobileNavRow
                      key={link.href}
                      link={link}
                      index={index + mobilePrimaryLinks.length}
                      active={isLinkActive(pathname, link.href)}
                      onNavigate={onClose}
                      compact
                    />
                  ))}
                </ul>
              </nav>

              <motion.div
                className="mt-4 flex shrink-0 flex-col gap-2 border-t border-border/50 pt-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.3, ease: 'easeOut' }}
              >
                {isLoggedIn ? (
                  <>
                    <Button
                      variant="outline"
                      className="h-11 w-full justify-between rounded-xl border-border/70 bg-white/70"
                      render={<Link href="/varsler" onClick={onClose} />}
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <motion.span whileHover={{ rotate: [0, -12, 12, 0] }} transition={{ duration: 0.4 }}>
                          <Bell className="size-4" />
                        </motion.span>
                        Varsler
                      </span>
                      {unreadCount > 0 ? (
                        <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-[#ba0c2f] px-1.5 text-[11px] font-bold text-white">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      ) : null}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11 w-full rounded-xl border-border/70 bg-white/70"
                      render={<Link href="/min-side" onClick={onClose} />}
                    >
                      Min side
                    </Button>
                    <Button className="h-11 w-full rounded-xl bg-[#00205b] hover:bg-[#00205b]/90" onClick={onSignOut}>
                      <LogOut className="size-4" />
                      Logg ut
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="h-11 w-full rounded-xl border-border/70 bg-white/70"
                      render={<Link href="/auth/login" onClick={onClose} />}
                    >
                      <LogIn className="size-4" />
                      Logg inn
                    </Button>
                    <Button
                      className="h-11 w-full rounded-xl bg-[#00205b] hover:bg-[#00205b]/90"
                      render={<Link href="/auth/login" onClick={onClose} />}
                    >
                      Kom i gang
                    </Button>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
