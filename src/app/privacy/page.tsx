import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.url}/privacy` },
};

const updated = "30 April 2026";

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="legal-inner">
        <Link href="/" className="legal-back">
          ← Back to home
        </Link>
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: {updated}</p>

        <section>
          <h2>1. Who we are</h2>
          <p>
            {siteConfig.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a footwear
            mould and dies manufacturer based in New Delhi, India. You can
            reach us at <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>{" "}
            or <a href={`tel:${siteConfig.phone}`}>{siteConfig.phoneDisplay}</a>.
          </p>
        </section>

        <section>
          <h2>2. What we collect</h2>
          <p>
            When you submit our enquiry form, we collect the information you
            provide: name, company, email address, phone number, product of
            interest, and your message. We use this information solely to
            respond to your enquiry and follow up regarding our products and
            services.
          </p>
        </section>

        <section>
          <h2>3. How we use it</h2>
          <ul>
            <li>To respond to your enquiry and provide quotations.</li>
            <li>To follow up on quotations or ongoing orders.</li>
            <li>
              To occasionally share relevant product updates if you have
              consented.
            </li>
          </ul>
          <p>We do not sell, rent, or share your information with third parties for marketing.</p>
        </section>

        <section>
          <h2>4. How we store it</h2>
          <p>
            Enquiry submissions are stored in a private Google Spreadsheet
            accessible only to authorised members of our team. The spreadsheet
            is hosted on Google&apos;s infrastructure and protected by Google
            account authentication.
          </p>
        </section>

        <section>
          <h2>5. Cookies and analytics</h2>
          <p>
            Our website uses minimal cookies — primarily to remember your
            theme preference and that you&apos;ve dismissed our cookie notice.
            We may add anonymised analytics in the future to understand which
            pages are most useful to visitors. No personally identifying
            information is collected from these cookies.
          </p>
        </section>

        <section>
          <h2>6. Your rights</h2>
          <p>
            You may contact us at{" "}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> at
            any time to:
          </p>
          <ul>
            <li>Ask what information we hold about you.</li>
            <li>Request correction or deletion of your information.</li>
            <li>Withdraw consent for any future marketing communication.</li>
          </ul>
        </section>

        <section>
          <h2>7. Updates to this policy</h2>
          <p>
            We may update this policy occasionally. The &ldquo;Last
            updated&rdquo; date at the top reflects the most recent change.
          </p>
        </section>
      </div>
    </main>
  );
}
