import type { Metadata } from "next";
import { bodyHtml, pageMetadata } from "./_lib/page-content";
import { applyLiveContent, getSiteContent } from "./_lib/site-content";

export const metadata: Metadata = pageMetadata("index");

export default async function Home() {
  const html = applyLiveContent(bodyHtml("index"), await getSiteContent());
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
