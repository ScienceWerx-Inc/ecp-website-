import type { Metadata } from "next";
import { bodyHtml, pageMetadata } from "../_lib/page-content";

export const metadata: Metadata = pageMetadata("about");

export default function About() {
  return <div dangerouslySetInnerHTML={{ __html: bodyHtml("about") }} />;
}
