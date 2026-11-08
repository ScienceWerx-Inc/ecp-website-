/**
 * ECP's blog posts, written and published in MoreWerx (Blog & News, inside the
 * ECP company) and read here from its public feed:
 *   GET {NEXT_PUBLIC_MOREWERX_API}/api/public/site/{slug}/posts
 *   GET {NEXT_PUBLIC_MOREWERX_API}/api/public/site/{slug}/posts/{postSlug}
 * Only published posts are served. Refreshed at most every 60 seconds; with
 * no API configured, or MoreWerx unreachable, the blog is simply empty.
 */
import { cache } from "react";
import { ECP_SLUG, MOREWERX_API } from "./site-content";

export interface PostSummary {
  slug: string;
  title: string;
  type: string;
  excerpt: string;
  imageUrl: string;
  date: string;
  readTime: string;
  tags: string[];
  author: string;
}

export type PostBlock = { kind: "text"; text: string } | { kind: "image"; url: string; alt: string };

export interface Post extends PostSummary {
  blocks: PostBlock[];
}

const base = () => `${MOREWERX_API}/api/public/site/${encodeURIComponent(ECP_SLUG)}/posts`;

export const getPosts = cache(async (): Promise<PostSummary[]> => {
  if (!MOREWERX_API) return [];
  try {
    const res = await fetch(`${base()}?kind=blog`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { posts?: PostSummary[] };
    return Array.isArray(data.posts) ? data.posts : [];
  } catch {
    return [];
  }
});

export const getPost = cache(async (slug: string): Promise<Post | null> => {
  if (!MOREWERX_API) return null;
  try {
    const res = await fetch(`${base()}/${encodeURIComponent(slug)}?kind=blog`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { post?: Post };
    return data.post ?? null;
  } catch {
    return null;
  }
});

/** "2026-11-08" → "November 8, 2026"; anything else as given. */
export function prettyDate(date: string): string {
  const d = /^\d{4}-\d{2}-\d{2}/.test(date) ? new Date(`${date.slice(0, 10)}T12:00:00Z`) : null;
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
    : date;
}
