import type { Metadata } from "next";
import { bodyHtml, pageMetadata } from "../_lib/page-content";
import { applyLiveContent, getSiteContent } from "../_lib/site-content";

export const metadata: Metadata = pageMetadata("projects");

export default async function Projects() {
  const html = applyLiveContent(bodyHtml("projects"), await getSiteContent());
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
