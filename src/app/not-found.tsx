import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(6rem, 18vw, 14rem)",
          color: "var(--mint)",
          lineHeight: 1,
          marginBottom: "1rem",
          letterSpacing: "0.02em",
        }}
      >
        404
      </div>
      <h1
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "clamp(1.4rem, 3vw, 2rem)",
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: "0.75rem",
        }}
      >
        Page Not Found
      </h1>
      <p
        style={{
          color: "var(--text-secondary)",
          maxWidth: "32rem",
          marginBottom: "2.5rem",
          lineHeight: 1.7,
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Head back to our homepage to explore our footwear moulds &amp; dies.
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.9rem 2rem",
            background: "var(--accent-gradient)",
            color: "var(--text-on-accent)",
            borderRadius: "var(--radius-pill)",
            fontFamily: "var(--font-ui)",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          Back to Home
        </Link>
        <Link
          href="/#contact"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.9rem 2rem",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-primary)",
            borderRadius: "var(--radius-pill)",
            fontFamily: "var(--font-ui)",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textDecoration: "none",
            fontSize: "0.9rem",
          }}
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
