import type { Metadata } from "next";
import { bodyHtml, pageMetadata } from "../_lib/page-content";

export const metadata: Metadata = pageMetadata("contact");

export default function Contact() {
  return <div dangerouslySetInnerHTML={{ __html: bodyHtml("contact") }} />;
}
