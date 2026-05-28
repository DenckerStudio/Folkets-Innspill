export type StortingetFormat = 'json' | 'xml' | 'html';

export function stortingetUrl(pathname: string, query?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`https://data.stortinget.no${pathname}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export function parseStortingetDotNetDateToISO(dateStr: string): string {
  if (!dateStr) return '';
  const match = dateStr.match(/\/Date\((\d+)[+-]\d+\)\//);
  if (match && match[1]) {
    const date = new Date(parseInt(match[1], 10));
    return date.toISOString().split('T')[0];
  }
  return dateStr;
}

export type PersonbildeStorrelse = 'stort' | 'middels' | 'lite';

export function getPersonbildeUrl(personId: string, storrelse: PersonbildeStorrelse = 'middels', erstatningsbilde = true): string {
  return stortingetUrl('/eksport/personbilde', { personid: personId, storrelse, erstatningsbilde });
}

