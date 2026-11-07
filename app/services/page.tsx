import type { Metadata } from "next";
import { bodyHtml, pageMetadata } from "../_lib/page-content";

export const metadata: Metadata = pageMetadata("services");

export default function Services() {
  return <div dangerouslySetInnerHTML={{ __html: bodyHtml("services") }} />;
}
