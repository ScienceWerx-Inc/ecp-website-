import { cache } from "react";

/**
 * Live site content fed by the company's MoreWerx account (the "backbone").
 * The ECP site fetches a published projection from MoreWerx's public read API
 * and falls back to the built-in defaults (identical to the static design) when
 * the API is unset or unreachable — so the site always renders.
 *
 * Config (env):
 *   NEXT_PUBLIC_MOREWERX_API  base URL of MoreWerx, e.g. https://morewerx.com
 *   NEXT_PUBLIC_ECP_SLUG      this company's slug in MoreWerx, e.g. ecp
 */

export interface SiteContact {
  address: string;
  phone: string;
  email: string;
}
export interface SiteContent {
  brand: { name: string; kicker: string; tagline: string };
  contact: SiteContact;
  hero: { eyebrow: string; title: string; subtitle: string };
  stats: { value: string; label: string; blurb: string }[];
  projects: { title: string; category: string; description: string; image?: string }[];
  faqs: { q: string; a: string }[];
}

/** Must mirror the current static markup so defaults render byte-identically. */
export const DEFAULT_CONTENT: SiteContent = {
  brand: { name: "ECP", kicker: "ENGINEERING", tagline: "Built on engineering. Proven by decades." },
  contact: { address: "Frederick, MD 21703, USA", phone: "+1 (301) 473-9520", email: "info@ecpltd.com" },
  hero: {
    eyebrow: "ENGINEERING · DESIGN · DELIVERY",
    title: "Built on engineering. Proven by decades.",
    subtitle:
      "Since 1975, ECP has delivered complex structural engineering, specialty procurement, and construction solutions across the Mid-Atlantic, combining technical excellence, safety, and long-term value.",
  },
  stats: [],
  projects: [],
  faqs: [],
};

/** The exact tel: href in the source markup, rebuilt from a live phone. */
const DEFAULT_TEL = "tel:+13014739520";
const telFrom = (phone: string) => "tel:+" + phone.replace(/[^\d]/g, "");

export const MOREWERX_API = process.env.NEXT_PUBLIC_MOREWERX_API?.replace(/\/+$/, "") || "";
export const ECP_SLUG = process.env.NEXT_PUBLIC_ECP_SLUG || "ecp";

/**
 * Fetch the live content for this company, deduped per request and revalidated
 * every 60s. Any failure falls back to DEFAULT_CONTENT so the site never breaks.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  if (!MOREWERX_API) return DEFAULT_CONTENT;
  try {
    const res = await fetch(`${MOREWERX_API}/api/public/site/${ECP_SLUG}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return DEFAULT_CONTENT;
    const data = (await res.json()) as { content?: Partial<SiteContent> };
    const c = data.content ?? {};
    return {
      ...DEFAULT_CONTENT,
      ...c,
      brand: { ...DEFAULT_CONTENT.brand, ...(c.brand ?? {}) },
      contact: { ...DEFAULT_CONTENT.contact, ...(c.contact ?? {}) },
      hero: { ...DEFAULT_CONTENT.hero, ...(c.hero ?? {}) },
      stats: c.stats ?? [],
      projects: c.projects ?? [],
      faqs: c.faqs ?? [],
    };
  } catch {
    return DEFAULT_CONTENT;
  }
});

const replaceAll = (s: string, find: string, repl: string) =>
  find && repl && find !== repl ? s.split(find).join(repl) : s;

/**
 * Bind live contact details into the verbatim page markup. Only the unique,
 * unambiguous contact strings are substituted, so output is byte-identical when
 * content equals the defaults and pixel-safe otherwise. Richer section binding
 * (hero/stats/projects/faqs — already stored in MoreWerx) is a follow-up that
 * needs those sections componentized.
 */
export function applyLiveContent(html: string, content: SiteContent): string {
  const d = DEFAULT_CONTENT.contact;
  const c = content.contact;
  let out = html;
  out = replaceAll(out, d.address, c.address);
  out = replaceAll(out, d.phone, c.phone);
  out = replaceAll(out, DEFAULT_TEL, telFrom(c.phone));
  out = replaceAll(out, d.email, c.email);
  return out;
}
