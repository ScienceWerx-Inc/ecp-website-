import type { Metadata, Viewport } from "next";
import "./globals.css";
import Behaviors from "./_components/Behaviors";
import Assistant from "./_components/Assistant";
import { MOREWERX_API, getSiteContent } from "./_lib/site-content";

const DEFAULT_GREETING =
  "Hi! I'm ECP's assistant. Ask me about our engineering, construction and specialty product services, or leave your email and our team will get back to you.";

/**
 * Where this site is served, canonical, og:url and shared blog links resolve
 * against it. NEXT_PUBLIC_SITE_URL wins; on Vercel, the project's production
 * domain (set automatically); else ecpltd.com.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://ecpltd.com");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  robots: { index: true, follow: true },
  title: {
    default: "ECP Engineering | Engineered Construction Products, Ltd.",
    template: "%s",
  },
  description:
    "Engineered Construction Products, Ltd., structural engineering, general contracting, construction management and specialty product supply across Maryland, Washington DC and West Virginia since 1975.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#141619",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { assistant } = await getSiteContent();
  const showAssistant = Boolean(MOREWERX_API) && assistant?.enabled !== false;
  return (
    <html lang="en">
      <head>
        {/* Fonts kept on the CDN link for byte-identical rendering in this
            first pass; can move to next/font as a later optimization. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
        />
      </head>
      <body>
        {children}
        <Behaviors />
        {showAssistant && <Assistant greeting={assistant?.greeting || DEFAULT_GREETING} />}
      </body>
    </html>
  );
}
