import React from "react";
import { bodyHtml, type PageName } from "./page-content";
import { applyLiveContent, DEFAULT_CONTENT, getSiteContent, same, type SiteContent } from "./site-content";
import { Faqs, FeaturedProjects, Hero, Stats } from "../_components/sections";

/** End index (exclusive) of the element opening at `openIdx`, via tag-depth counting. */
function elementEnd(html: string, openIdx: number, tag: string): number {
  const re = new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi");
  re.lastIndex = openIdx;
  let depth = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    depth += m[0][1] === "/" ? -1 : 1;
    if (depth === 0) return m.index + m[0].length;
  }
  return -1;
}

type Region = { start: number; end: number; node: React.ReactNode };

/** Locate an element region by a literal opening-tag anchor. */
function byAnchor(html: string, anchor: string, tag: string, node: React.ReactNode): Region | null {
  const start = html.indexOf(anchor);
  if (start < 0) return null;
  const end = elementEnd(html, start, tag);
  return end < 0 ? null : { start, end, node };
}

/** The FAQ list: the inner <div> that wraps the <details>, inside .faq-grid. */
function faqRegion(html: string, node: React.ReactNode): Region | null {
  const grid = html.indexOf('<div class="faq-grid">');
  if (grid < 0) return null;
  const start = html.indexOf("<div", grid + 1);
  if (start < 0) return null;
  const end = elementEnd(html, start, "div");
  return end < 0 ? null : { start, end, node };
}

function raw(html: string, key: number) {
  return <div key={key} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** The page body with live-differing sections replaced by components. */
export async function renderPage(name: PageName): Promise<React.ReactNode> {
  const content: SiteContent = await getSiteContent();
  const html = applyLiveContent(bodyHtml(name), content);

  const regions: Region[] = [];
  if (name === "index") {
    if (!same(content.hero, DEFAULT_CONTENT.hero)) {
      const r = byAnchor(html, '<section class="hero-bovis">', "section", <Hero hero={content.hero} />);
      if (r) regions.push(r);
    }
    if (!same(content.stats, DEFAULT_CONTENT.stats) && content.stats.length) {
      const r = byAnchor(html, '<div class="wrap stats-overlap-wrap">', "div", <Stats stats={content.stats} />);
      if (r) regions.push(r);
    }
    if (!same(content.projects, DEFAULT_CONTENT.projects) && content.projects.length) {
      const r = byAnchor(html, '<div class="proj-grid">', "div", <FeaturedProjects projects={content.projects} />);
      if (r) regions.push(r);
    }
  } else if (name === "contact") {
    if (!same(content.faqs, DEFAULT_CONTENT.faqs) && content.faqs.length) {
      const r = faqRegion(html, <Faqs faqs={content.faqs} />);
      if (r) regions.push(r);
    }
  }

  if (!regions.length) return raw(html, 0);

  regions.sort((a, b) => a.start - b.start);
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  for (const r of regions) {
    if (r.start < cursor) continue; // skip overlaps defensively
    if (r.start > cursor) parts.push(raw(html.slice(cursor, r.start), key++));
    parts.push(<React.Fragment key={key++}>{r.node}</React.Fragment>);
    cursor = r.end;
  }
  if (cursor < html.length) parts.push(raw(html.slice(cursor), key++));
  return <>{parts}</>;
}
