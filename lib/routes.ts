/** App routes — dashboard lives under `/dashboard`. */

export const DASHBOARD_PREFIX = '/dashboard';

export const routes = {
  home: '/',
  dashboard: DASHBOARD_PREFIX,
  utforsk: `${DASHBOARD_PREFIX}/utforsk`,
  minSide: `${DASHBOARD_PREFIX}/min-side`,
  varsler: `${DASHBOARD_PREFIX}/varsler`,
  horinger: `${DASHBOARD_PREFIX}/horinger`,
  forum: `${DASHBOARD_PREFIX}/forum`,
  politikere: `${DASHBOARD_PREFIX}/politikere`,
  representanter: `${DASHBOARD_PREFIX}/representanter`,
  politikerHub: `${DASHBOARD_PREFIX}/politiker-hub`,
  saksganger: `${DASHBOARD_PREFIX}/saksganger`,
  sporsmal: `${DASHBOARD_PREFIX}/sporsmal`,
  omOss: '/om-oss',
  login: '/auth/login',
  sak: (id: string) => `${DASHBOARD_PREFIX}/sak/${id}`,
  horing: (id: string) => `${DASHBOARD_PREFIX}/horinger/${id}`,
  forumTopic: (id: string) => `${DASHBOARD_PREFIX}/forum/${id}`,
} as const;

export function isDashboardPath(pathname: string): boolean {
  return pathname === DASHBOARD_PREFIX || pathname.startsWith(`${DASHBOARD_PREFIX}/`);
}

/** Public issue pages linked from the landing page. */
export function isPublicDashboardSakPath(pathname: string): boolean {
  return /^\/dashboard\/sak\/[^/]+$/.test(pathname);
}
