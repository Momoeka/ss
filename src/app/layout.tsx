import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { siteConfig } from "@/lib/siteConfig";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Footwear Mould & Die Manufacturers in Delhi, India`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "India's leading footwear mould manufacturer in Delhi NCR — EVA bond moulds, full EVA injection moulds, sole die cuts & crocs-style custom dies. Precision engineering since 2000. Quotation in 24 hours.",
  applicationName: siteConfig.name,
  keywords: [
    // Primary product keywords
    "footwear mould manufacturer",
    "footwear mould manufacturer India",
    "footwear mould manufacturer Delhi",
    "shoe mould manufacturer",
    "shoe mould maker India",
    "EVA mould",
    "EVA mould manufacturer",
    "EVA mould Delhi",
    "EVA mould India",
    "EVA bond mould",
    "EVA bond mould manufacturer",
    "full EVA mould",
    "full EVA injection mould",
    "EVA injection mould India",
    "EVA midsole mould",
    // Crocs / clogs
    "crocs mould",
    "crocs mould manufacturer",
    "crocs mould India",
    "crocs style mould",
    "clog mould manufacturer",
    "EVA clog mould",
    // Sole / die
    "sole die cut",
    "sole die manufacturer",
    "sole die manufacturer India",
    "sole cutting die",
    "outsole die",
    "midsole die",
    "footwear die manufacturer",
    "shoe die maker",
    "footwear dies",
    "custom footwear dies",
    "custom shoe mould",
    // Material / process
    "aluminium footwear mould",
    "aluminium alloy mould",
    "hardened steel sole die",
    "precision shoe mould",
    "multi-cavity EVA mould",
    "press mould footwear",
    // Industry / supply
    "OEM footwear mould India",
    "footwear tooling India",
    "footwear manufacturer supplier",
    "shoe industry supplier Delhi",
    "footwear factory equipment",
    // Local SEO
    "mould manufacturer Mangolpuri",
    "mould manufacturer Peeragarhi",
    "footwear mould Delhi NCR",
    "shoe mould New Delhi",
    "footwear tooling North India",
    // Brand
    "S.S. Classic Mould",
    "S.S. Classic Mould & Dies",
    "SS Classic moulds",
    "Sheikh Sikander mould",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "Manufacturing",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: { canonical: siteConfig.url },
  openGraph: {
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Footwear Mould & Die Manufacturers, Delhi`,
    description:
      "India's leading footwear mould manufacturer — EVA, crocs-style & sole dies. 25+ years precision engineering. Get a quote in 24 hours.",
    url: siteConfig.url,
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "S.S. Classic Mould & Dies — Premium footwear mould display",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description:
      "India's precision footwear mould engineers — EVA, crocs-style & sole dies since 2000.",
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  other: {
    "geo.region": "IN-DL",
    "geo.placename": "New Delhi",
    "geo.position": "28.6867;77.0994",
    ICBM: "28.6867, 77.0994",
    "DC.title": siteConfig.name,
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
  "@type": ["LocalBusiness", "ManufacturingBusiness"],
  "@id": `${siteConfig.url}/#business`,
  name: siteConfig.name,
  legalName: "S.S. Classic Mould & Dies",
  alternateName: ["SS Classic Mould", "S.S. Classic Moulds"],
  description:
    "India's leading footwear mould manufacturer — EVA bond moulds, full EVA injection moulds, sole die cuts and custom crocs-style dies. Precision engineering since 2000.",
  slogan: "Manufacturers of All Kinds of Footwear Mould",
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  image: siteConfig.ogImage,
  telephone: siteConfig.phone,
  email: siteConfig.email,
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.streetAddress,
    addressLocality: siteConfig.address.locality,
    addressRegion: "Delhi",
    postalCode: siteConfig.address.postalCode,
    addressCountry: siteConfig.address.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 28.6867,
    longitude: 77.0994,
  },
  founder: { "@type": "Person", name: siteConfig.founder },
  foundingDate: siteConfig.foundingYear,
  areaServed: [
    { "@type": "Country", name: "India" },
    { "@type": "AdministrativeArea", name: "Delhi NCR" },
    { "@type": "AdministrativeArea", name: "North India" },
  ],
  knowsAbout: [
    "Footwear Mould Manufacturing",
    "EVA Bond Mould",
    "Full EVA Injection Mould",
    "Sole Die Cutting",
    "Crocs-style Mould Engineering",
    "Custom Footwear Tooling",
    "CNC Mould Machining",
    "Aluminium Alloy Moulds",
    "Hardened Steel Dies",
  ],
  makesOffer: [
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: "EVA Bond Mould",
        description:
          "High-density EVA bond moulds engineered for superior bonding, consistent cell structure, and excellent compression set resistance.",
        category: "Footwear Tooling",
        brand: { "@type": "Brand", name: siteConfig.name },
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: "Full EVA Mould",
        description:
          "Complete EVA injection moulds for full-shoe production — crocs-style, clogs, and lightweight casual footwear.",
        category: "Footwear Tooling",
        brand: { "@type": "Brand", name: siteConfig.name },
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: "Sole Die Cut",
        description:
          "Precision die-cutting tools for outsole and midsole profiling. Hardened steel construction for high-volume production durability.",
        category: "Footwear Tooling",
        brand: { "@type": "Brand", name: siteConfig.name },
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Product",
        name: "Custom Footwear Dies",
        description:
          "Bespoke moulds engineered from your sample, drawing, or 3D file (STEP, IGES, STL).",
        category: "Footwear Tooling",
        brand: { "@type": "Brand", name: siteConfig.name },
      },
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Footwear Moulds & Dies",
    itemListElement: [
      "EVA Bond Moulds",
      "Full EVA Moulds",
      "Sole Die Cuts",
      "Custom Footwear Dies",
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Product", name },
    })),
  },
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
