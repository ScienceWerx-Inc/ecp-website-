"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Port of the shared main.js behaviors, re-run on every route so freshly
 * injected markup is wired up:
 *   1. Mobile nav open/close + Escape.
 *   2. Accessible service tabs (click + ArrowLeft/Right) with URL-hash support.
 *   3. Project portfolio category filtering.
 */
export default function Behaviors() {
  const pathname = usePathname();

  useEffect(() => {
    const cleanups: Array<() => void> = [];
    const on = <K extends keyof HTMLElementEventMap>(
      el: Element | Document | null,
      type: K,
      fn: (e: HTMLElementEventMap[K]) => void
    ) => {
      if (!el) return;
      el.addEventListener(type, fn as EventListener);
      cleanups.push(() => el.removeEventListener(type, fn as EventListener));
    };

    // 1. Mobile navigation
    const mobileNav = document.getElementById("mobilenav");
    const openBtn = document.querySelector(".menu-toggle");
    const closeBtn = document.querySelector(".menu-close");
    on(openBtn, "click", () => mobileNav?.classList.add("open"));
    on(closeBtn, "click", () => mobileNav?.classList.remove("open"));
    on(document, "keydown", (e) => {
      if (e.key === "Escape" && mobileNav?.classList.contains("open")) {
        mobileNav.classList.remove("open");
      }
    });

    // 2. Service tabs
    const tabs = Array.prototype.slice.call(
      document.querySelectorAll('.tabs [role="tab"]')
    ) as HTMLElement[];
    if (tabs.length) {
      const selectTab = (tab: HTMLElement) => {
        tabs.forEach((t) => {
          const panel = document.getElementById(
            t.getAttribute("aria-controls") || ""
          );
          const isSelected = t === tab;
          t.setAttribute("aria-selected", isSelected ? "true" : "false");
          if (panel) (panel as HTMLElement).hidden = !isSelected;
        });
      };
      tabs.forEach((t, i) => {
        on(t, "click", () => selectTab(t));
        on(t, "keydown", (e) => {
          const d =
            e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          const next = tabs[(i + d + tabs.length) % tabs.length];
          next.focus();
          selectTab(next);
        });
      });
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        const matchingTab = document.getElementById("t-" + hash);
        if (matchingTab) selectTab(matchingTab);
      }
    }

    // 3. Contact form -> MoreWerx company-scoped lead intake (best-effort).
    const contactForm = document.getElementById("ds")?.closest("form");
    if (contactForm) {
      const api = (process.env.NEXT_PUBLIC_MOREWERX_API || "").replace(/\/+$/, "");
      const slug = process.env.NEXT_PUBLIC_ECP_SLUG || "ecp";
      on(contactForm, "submit", () => {
        if (!api) return; // nothing wired yet; inline handler still shows the ack
        const val = (id: string) =>
          (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null)?.value?.trim() || "";
        const name = `${val("fn")} ${val("ln")}`.trim();
        const email = val("em");
        if (!name || !email) return;
        const location = val("lo");
        const message = [location ? `Location: ${location}` : "", val("ds")].filter(Boolean).join("\n");
        // fire-and-forget; the form's own handler shows the acknowledgement
        void fetch(`${api}/api/public/site/${slug}/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone: val("ph"),
            companyName: val("co"),
            message,
            pageUrl: window.location.href,
          }),
        }).catch(() => {});
      });
    }

    // 4. Project filtering
    const filterBtns = Array.prototype.slice.call(
      document.querySelectorAll(".filter-btn[data-filter]")
    ) as HTMLElement[];
    const projCards = Array.prototype.slice.call(
      document.querySelectorAll(".proj-card[data-category]")
    ) as HTMLElement[];
    if (filterBtns.length && projCards.length) {
      filterBtns.forEach((btn) => {
        on(btn, "click", () => {
          const cat = btn.getAttribute("data-filter");
          filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
          projCards.forEach((card) => {
            const cardCats = card.getAttribute("data-category") || "";
            const show = cat === "all" || cardCats.indexOf(cat || "") !== -1;
            (card as HTMLElement).hidden = !show;
          });
        });
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
