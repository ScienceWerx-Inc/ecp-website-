import type { Metadata } from "next";
import { bodyHtml, pageMetadata } from "../_lib/page-content";
import { applyLiveContent, getSiteContent } from "../_lib/site-content";

export const metadata: Metadata = pageMetadata("services");

export default async function Services() {
  const html = applyLiveContent(bodyHtml("services"), await getSiteContent());
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
