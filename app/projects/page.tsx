import type { Metadata } from "next";
import { bodyHtml, pageMetadata } from "../_lib/page-content";

export const metadata: Metadata = pageMetadata("projects");

export default function Projects() {
  return <div dangerouslySetInnerHTML={{ __html: bodyHtml("projects") }} />;
}
