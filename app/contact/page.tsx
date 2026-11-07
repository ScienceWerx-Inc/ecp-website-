import type { Metadata } from "next";
import { bodyHtml, pageMetadata } from "../_lib/page-content";
import { applyLiveContent, getSiteContent } from "../_lib/site-content";

export const metadata: Metadata = pageMetadata("contact");

export default async function Contact() {
  const html = applyLiveContent(bodyHtml("contact"), await getSiteContent());
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
