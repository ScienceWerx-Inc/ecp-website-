import type { Metadata } from "next";
import { bodyHtml, pageMetadata } from "../_lib/page-content";
import { applyLiveContent, getSiteContent } from "../_lib/site-content";

export const metadata: Metadata = pageMetadata("about");

export default async function About() {
  const html = applyLiveContent(bodyHtml("about"), await getSiteContent());
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
