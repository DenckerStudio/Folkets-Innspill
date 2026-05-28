'use client';

import { Header } from '@/components/ui/header-3';

type NavigationProps = {
  children: React.ReactNode;
};

export function Navigation({ children }: NavigationProps) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
