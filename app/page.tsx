import type { Metadata } from "next";
import { bodyHtml, pageMetadata } from "./_lib/page-content";

export const metadata: Metadata = pageMetadata("index");

export default function Home() {
  return <div dangerouslySetInnerHTML={{ __html: bodyHtml("index") }} />;
}
