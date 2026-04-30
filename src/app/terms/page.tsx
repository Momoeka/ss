import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms of use for ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.url}/terms` },
};

const updated = "30 April 2026";

export default function TermsPage() {
  return (
    <main className="legal-page">
      <div className="legal-inner">
        <Link href="/" className="legal-back">
          ← Back to home
        </Link>
        <h1>Terms of Use</h1>
        <p className="legal-updated">Last updated: {updated}</p>

        <section>
          <h2>1. Acceptance</h2>
          <p>
            By accessing or using <strong>{siteConfig.url}</strong> (the
            &ldquo;site&rdquo;), you agree to these terms. If you do not agree,
            please do not use the site.
          </p>
        </section>

        <section>
          <h2>2. Use of the site</h2>
          <p>
            The site is provided for informational purposes — to showcase the
            products and services of {siteConfig.name}, and to allow
            prospective customers to make enquiries. You agree to use the
            site lawfully and not to attempt to disrupt, scrape at scale,
            misuse the enquiry form, or compromise security.
          </p>
        </section>

        <section>
          <h2>3. Quotations and orders</h2>
          <p>
            Any pricing, lead times, or specifications mentioned on this site
            are indicative. Final terms are confirmed in writing through a
            formal quotation issued after we discuss your requirements.
            Orders are subject to a separate purchase agreement.
          </p>
        </section>

        <section>
          <h2>4. Intellectual property</h2>
          <p>
            All content on this site — including text, images of moulds and
            products, the brand name, and design — is the property of{" "}
            {siteConfig.name} unless otherwise noted. You may view and share
            links to the site, but please do not republish content without
            permission.
          </p>
        </section>

        <section>
          <h2>5. Third-party links</h2>
          <p>
            The site may link to external services (e.g. WhatsApp, Google
            Maps, Google Forms). We are not responsible for the content or
            privacy practices of those services.
          </p>
        </section>

        <section>
          <h2>6. Limitation of liability</h2>
          <p>
            The site is provided &ldquo;as is&rdquo;. To the extent permitted
            by law, {siteConfig.name} is not liable for any indirect or
            consequential losses arising from use of, or inability to use,
            the site.
          </p>
        </section>

        <section>
          <h2>7. Governing law</h2>
          <p>
            These terms are governed by the laws of India. Any disputes will
            be subject to the courts of New Delhi.
          </p>
        </section>

        <section>
          <h2>8. Contact</h2>
          <p>
            Questions about these terms? Reach us at{" "}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> or{" "}
            <a href={`tel:${siteConfig.phone}`}>{siteConfig.phoneDisplay}</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
