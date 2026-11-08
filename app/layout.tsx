import type { Metadata, Viewport } from "next";
import "./globals.css";
import Behaviors from "./_components/Behaviors";

export const metadata: Metadata = {
  metadataBase: new URL("https://ecpltd.com"),
  robots: { index: true, follow: true },
  title: {
    default: "ECP Engineering | Engineered Construction Products, Ltd.",
    template: "%s",
  },
  description:
    "Engineered Construction Products, Ltd. — structural engineering, general contracting, construction management and specialty product supply across Maryland, Washington DC and West Virginia since 1975.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#141619",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      </body>
    </html>
  );
}
