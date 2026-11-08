import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import meta from "../_generated/meta.json";

export type PageName = keyof typeof meta;

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&rarr;/g, "→")
    .replace(/&times;/g, "×")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"');

/** Verbatim body markup for a page, injected server-side for byte-identical UI. */
export function bodyHtml(name: PageName): string {
  const p = path.join(process.cwd(), "app", "_generated", `${name}.html`);
  return fs.readFileSync(p, "utf8");
}

type PageMeta = {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
};

/** Per-page <title>, description and SEO tags lifted from the source pages. */
export function pageMetadata(name: PageName): Metadata {
  const m = meta[name] as PageMeta;
  const out: Metadata = { title: decode(m.title), description: decode(m.description) };
  if (m.keywords) out.keywords = decode(m.keywords);
  if (m.canonical) out.alternates = { canonical: m.canonical };
  if (m.ogTitle || m.ogDescription || m.ogImage) {
    out.openGraph = {
      type: "website",
      ...(m.ogTitle ? { title: decode(m.ogTitle) } : {}),
      ...(m.ogDescription ? { description: decode(m.ogDescription) } : {}),
      ...(m.ogImage ? { images: [m.ogImage] } : {}),
    };
  }
  return out;
}
