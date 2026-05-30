export type PromptSourceHeadline = {
  title: string;
  url: string;
  outlet: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  publishedAt?: string | null;
};

export function parsePromptSources(raw: unknown): PromptSourceHeadline[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      const title = String(row.title ?? '').trim();
      const url = String(row.url ?? row.link ?? '').trim();
      const outlet = String(row.outlet ?? 'Nyhet').trim();
      if (!title || !url) return null;
      return {
        title,
        url,
        outlet,
        imageUrl: row.imageUrl ? String(row.imageUrl) : null,
        videoUrl: row.videoUrl ? String(row.videoUrl) : null,
        publishedAt: row.publishedAt ? String(row.publishedAt) : null,
      };
    })
    .filter((s): s is PromptSourceHeadline => s !== null);
}

export function getPromptPrimaryMedia(sources: PromptSourceHeadline[]) {
  const first = sources[0];
  if (!first) return null;
  if (first.videoUrl) {
    return { type: 'video' as const, url: first.videoUrl, posterUrl: first.imageUrl ?? null, articleUrl: first.url };
  }
  if (first.imageUrl) {
    return { type: 'image' as const, url: first.imageUrl, articleUrl: first.url };
  }
  return null;
}
