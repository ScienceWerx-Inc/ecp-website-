import type { Metadata } from "next";
import { pageMetadata } from "../_lib/page-content";
import { renderPage } from "../_lib/render-page";

export const metadata: Metadata = pageMetadata("projects");

export default function Projects() {
  return renderPage("projects");
}
