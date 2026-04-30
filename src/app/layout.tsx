import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { siteConfig } from "@/lib/siteConfig";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Premium Footwear Mould Manufacturers`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "S.S. Classic Mould & Dies — Leading manufacturers of EVA Bond Moulds, Full EVA Moulds, Sole Die Cuts & Custom Footwear Dies in New Delhi, India. 25+ years of precision engineering.",
  keywords: [
    "footwear mould manufacturer",
    "EVA mould Delhi",
    "crocs mould India",
    "sole die cut",
    "footwear dies",
    "shoe mould maker",
    "EVA bond mould",
    "S.S. Classic Mould",
  ],
  authors: [{ name: siteConfig.name }],
  robots: { index: true, follow: true },
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: `${siteConfig.name} — Premium Footwear Mould Manufacturers`,
    description:
      "25+ years engineering precision EVA moulds, crocs-style dies & complete footwear solutions from Delhi, India.",
    url: siteConfig.url,
    type: "website",
    locale: "en_IN",
    images: [{ url: siteConfig.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description:
      "India's precision mould engineers — EVA, crocs-style & sole dies since 2000.",
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0E14" },
    { media: "(prefers-color-scheme: light)", color: "#F0F2F5" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ManufacturingBusiness",
  name: siteConfig.name,
  description: "Manufacturers of All Kinds of Footwear Mould",
  url: siteConfig.url,
  telephone: [siteConfig.phone],
  email: siteConfig.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.streetAddress,
    addressLocality: siteConfig.address.locality,
    postalCode: siteConfig.address.postalCode,
    addressCountry: siteConfig.address.country,
  },
  founder: { "@type": "Person", name: siteConfig.founder },
  foundingDate: siteConfig.foundingYear,
  areaServed: "IN",
  makesOffer: [
    { "@type": "Offer", itemOffered: { "@type": "Product", name: "EVA Bond Moulds" } },
    { "@type": "Offer", itemOffered: { "@type": "Product", name: "Full EVA Moulds" } },
    { "@type": "Offer", itemOffered: { "@type": "Product", name: "Sole Die Cuts" } },
    { "@type": "Offer", itemOffered: { "@type": "Product", name: "Custom Footwear Dies" } },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.0.0/css/flag-icons.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <Script src="/legacy.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
