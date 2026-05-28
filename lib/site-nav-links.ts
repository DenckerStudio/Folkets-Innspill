import type { LucideIcon } from 'lucide-react';
import {
  BarChart2,
  FileEdit,
  Home,
  Info,
  MessageSquare,
  Search,
  UserRound,
  Users,
} from 'lucide-react';
import { routes } from '@/lib/routes';

export type SiteNavLinkItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

/** Utforsk – saker og representanter */
export const utforskLinks: SiteNavLinkItem[] = [
  {
    title: 'Utforsk saker',
    href: routes.utforsk,
    description: 'Se og stem på aktuelle stortingssaker',
    icon: Search,
  },
  {
    title: 'Politikere',
    href: routes.politikere,
    description: 'Finn representanter og deres standpunkt',
    icon: Users,
  },
  {
    title: 'Dashboard',
    href: routes.dashboard,
    description: 'Oversikt over plattformen',
    icon: Home,
  },
];

/** Delta – høringer, forum og politiker-hub */
export const deltaLinks: SiteNavLinkItem[] = [
  {
    title: 'Høringer',
    href: routes.horinger,
    description: 'Gi innspill til pågående høringer',
    icon: FileEdit,
  },
  {
    title: 'Forum',
    href: routes.forum,
    description: 'Diskuter med andre innbyggere',
    icon: MessageSquare,
  },
  {
    title: 'Politiker-hub',
    href: routes.politikerHub,
    description: 'Innsikt og svar til innbyggere',
    icon: BarChart2,
  },
];

/** Om plattformen */
export const omLinks: SiteNavLinkItem[] = [
  {
    title: 'Om oss',
    href: routes.omOss,
    description: 'Historie, mål og hvordan vi jobber',
    icon: Info,
  },
  {
    title: 'Min side',
    href: routes.minSide,
    description: 'Profil, stemmer og varsler',
    icon: UserRound,
  },
];

/** Hurtiglenker i dropdown */
export const hurtiglenker: SiteNavLinkItem[] = [
  { title: 'Dashboard', href: routes.dashboard, icon: Home },
  { title: 'Utforsk', href: routes.utforsk, icon: Search },
  { title: 'Høringer', href: routes.horinger, icon: FileEdit },
  { title: 'Forum', href: routes.forum, icon: MessageSquare },
  { title: 'Politiker-hub', href: routes.politikerHub, icon: BarChart2 },
];
