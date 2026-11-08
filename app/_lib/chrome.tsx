import React from "react";
import { bodyHtml } from "./page-content";

/**
 * The site's header and footer (taken verbatim from a generated page) around
 * a page built in React, such as the blog. `active` is the nav link to mark.
 */
function parts(active: string) {
  const html = bodyHtml("projects");
  const open = html.indexOf("<main");
  const close = html.indexOf("</main>");
  const mark = (s: string) =>
    s.replace(/ class="active"/g, "").replace(new RegExp(`<a href="${active}">`, "g"), `<a href="${active}" class="active">`);
  return { head: mark(html.slice(0, open)), foot: html.slice(close + "</main>".length) };
}

export function Chrome({ active, children }: { active: string; children: React.ReactNode }) {
  const { head, foot } = parts(active);
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: head }} />
      <main>{children}</main>
      <div dangerouslySetInnerHTML={{ __html: foot }} />
    </>
  );
}
