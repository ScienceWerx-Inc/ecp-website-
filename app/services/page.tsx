import type { Metadata } from "next";
import { pageMetadata } from "../_lib/page-content";
import { renderPage } from "../_lib/render-page";

export const metadata: Metadata = pageMetadata("services");

export default function Services() {
  return renderPage("services");
}
