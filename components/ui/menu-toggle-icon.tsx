'use client';

import { cn } from '@/lib/utils';

type MenuToggleIconProps = {
  open: boolean;
  className?: string;
  duration?: number;
};

export function MenuToggleIcon({ open, className, duration = 300 }: MenuToggleIconProps) {
  return (
    <svg
      className={cn('pointer-events-none', className)}
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M2.5 4.5h11"
        style={{
          transformOrigin: 'center',
          transition: `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          transform: open ? 'translateY(3.5px) rotate(45deg)' : undefined,
        }}
      />
      <path
        fill="currentColor"
        d="M2.5 8h11"
        style={{
          transformOrigin: 'center',
          transition: `opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          opacity: open ? 0 : 1,
        }}
      />
      <path
        fill="currentColor"
        d="M2.5 11.5h11"
        style={{
          transformOrigin: 'center',
          transition: `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          transform: open ? 'translateY(-3.5px) rotate(-45deg)' : undefined,
        }}
      />
    </svg>
  );
}
