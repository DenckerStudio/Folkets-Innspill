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
    href: '/utforsk',
    description: 'Se og stem på aktuelle stortingssaker',
    icon: Search,
  },
  {
    title: 'Politikere',
    href: '/politikere',
    description: 'Finn representanter og deres standpunkt',
    icon: Users,
  },
  {
    title: 'Forside',
    href: '/',
    description: 'Oversikt over plattformen',
    icon: Home,
  },
];

/** Delta – høringer, forum og politiker-hub */
export const deltaLinks: SiteNavLinkItem[] = [
  {
    title: 'Høringer',
    href: '/horinger',
    description: 'Gi innspill til pågående høringer',
    icon: FileEdit,
  },
  {
    title: 'Forum',
    href: '/forum',
    description: 'Diskuter med andre innbyggere',
    icon: MessageSquare,
  },
  {
    title: 'Politiker-hub',
    href: '/politiker-hub',
    description: 'Innsikt og svar til innbyggere',
    icon: BarChart2,
  },
];

/** Om plattformen */
export const omLinks: SiteNavLinkItem[] = [
  {
    title: 'Om oss',
    href: '/om-oss',
    description: 'Historie, mål og hvordan vi jobber',
    icon: Info,
  },
  {
    title: 'Min side',
    href: '/min-side',
    description: 'Profil, stemmer og varsler',
    icon: UserRound,
  },
];

/** Hurtiglenker i dropdown */
export const hurtiglenker: SiteNavLinkItem[] = [
  { title: 'Forside', href: '/', icon: Home },
  { title: 'Utforsk', href: '/utforsk', icon: Search },
  { title: 'Høringer', href: '/horinger', icon: FileEdit },
  { title: 'Forum', href: '/forum', icon: MessageSquare },
  { title: 'Politiker-hub', href: '/politiker-hub', icon: BarChart2 },
];
