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

/**
 * Must mirror the current static markup AND the MoreWerx defaults exactly, so a
 * section is only re-rendered from data when the live content actually differs
 * (splice-on-difference) — the untouched default stays byte-identical.
 */
export const DEFAULT_CONTENT: SiteContent = {
  brand: { name: "ECP", kicker: "ENGINEERING", tagline: "Built on engineering. Proven by decades." },
  contact: { address: "Frederick, MD 21703, USA", phone: "+1 (301) 473-9520", email: "info@ecpltd.com" },
  hero: {
    eyebrow: "ENGINEERING · DESIGN · DELIVERY",
    title: "Built on engineering. Proven by decades.",
    subtitle:
      "Since 1975, ECP has delivered complex structural engineering, specialty procurement, and construction solutions across the Mid-Atlantic, combining technical excellence, safety, and long-term value.",
  },
  stats: [
    { value: "51+", label: "Years of Excellence", blurb: "A trusted engineering partner since 1975" },
    { value: "2,500+", label: "Projects Delivered", blurb: "A multidisciplinary team driving complex projects" },
    { value: "MD-DC-WV", label: "Integrated Capabilities", blurb: "Multi-disciplinary design, construction, and execution" },
    { value: "93 / 100", label: "Performance Score", blurb: "Recognized for quality, safety, and delivery." },
  ],
  projects: [
    { title: "Heavy Timber & Sash Restoration in Frederick", category: "Industrial & Timber", description: "Turnkey structural remediation, engineered heavy timber framing, and custom wood sash replication.", image: "spec_wood.jpg" },
    { title: "Office Building at Metro Corridor", category: "Commercial", description: "Full construction management and structural envelope upgrade for a multi-story commercial office building.", image: "mkt_commercial.jpg" },
    { title: "Multi-Use Industrial Renovation & Fit-Out", category: "Infrastructure", description: "Renovation, structural connection engineering, and fit-out of an existing facility to meet new operational requirements.", image: "mkt_civil.jpg" },
  ],
  faqs: [
    { q: "What geographic area does ECP serve?", a: "We are licensed and regularly execute projects in Maryland, Washington DC, and West Virginia. Our home base is Frederick, MD, and we serve clients throughout the greater Mid-Atlantic region. For specialty product supply or consulting outside these jurisdictions, contact us — we frequently support regional partners on a case-by-case basis." },
    { q: "Can ECP serve as both product supplier and contractor on the same project?", a: "Yes — and this is one of our strongest competitive advantages. When we both specify/supply the engineered components (such as custom wood sash windows, heavy timber, or structural hardware) and manage the field installation, there is zero disconnect between the submittals and what gets built. This dramatically reduces RFIs, substitution delays, and trade conflicts." },
    { q: "How quickly can ECP mobilize on a new project?", a: "Because we are a nimble, owner-operated organization, we can often engage within days for structural consulting, condition assessments, and pre-construction drawing reviews. For full General Contracting or Construction Management engagements, typical lead time from contract execution to field mobilization is two to four weeks." },
    { q: "What size projects does ECP typically handle?", a: "We work across a wide spectrum — from targeted specialty product supply and structural engineering consultations in the thousands of dollars, to multi-million-dollar commercial General Contracting and CM-at-Risk contracts. Every engagement receives direct senior oversight." },
    { q: "Do you work on historic preservation and custom wood window restoration?", a: "Yes. Historic wood sash replication, heavy timber framing, and non-invasive structural remediation are among our signature specialties across Frederick, Baltimore, Washington DC, and Harpers Ferry/WV. We match historic profiles while upgrading structural and thermal performance." },
    { q: "Is ECP insured and bonded?", a: "Yes. ECP carries comprehensive general liability, workers' compensation, commercial fleet (USDOT #897979), and professional liability insurance, along with strong bonding capacity. Certificates of insurance are issued promptly upon request." },
  ],
};

/** JSON-equality helper for splice-on-difference checks. */
export const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

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
