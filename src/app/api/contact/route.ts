import { NextResponse } from "next/server";

// Google Form bridge — submissions land in the linked Google Sheet.
const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSewZGfIWzHAksm4u3e0l0Rav6PxiRmu-ezuieH1pWlO8GYvUw/formResponse";
const ENTRY_NAME = "entry.931668479";
const ENTRY_COMPANY = "entry.904311554";
const ENTRY_EMAIL = "entry.1665906071";
const ENTRY_PHONE = "entry.1780540663";
const ENTRY_PRODUCT = "entry.85812830";
const ENTRY_MESSAGE = "entry.2009198415";

type Body = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  product?: string;
  message?: string;
  website?: string; // honeypot — humans must leave blank
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const name = (body.name ?? "").trim();
    const company = (body.company ?? "").trim();
    const email = (body.email ?? "").trim();
    const phone = (body.phone ?? "").trim();
    const product = (body.product ?? "").trim();
    const message = (body.message ?? "").trim();
    const honeypot = (body.website ?? "").trim();

    // Honeypot: bots fill every field. Pretend success without forwarding so
    // they don't learn they were blocked and adjust.
    if (honeypot) {
      return NextResponse.json({ success: true, persisted: false });
    }

    if (!name || !email || !phone || !product) {
      return NextResponse.json(
        { success: false, error: "Required fields missing." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email." },
        { status: 400 }
      );
    }
    if (
      name.length > 200 ||
      company.length > 200 ||
      email.length > 320 ||
      phone.length > 30 ||
      product.length > 100 ||
      message.length > 5000
    ) {
      return NextResponse.json(
        { success: false, error: "Field too long." },
        { status: 400 }
      );
    }

    if (!GOOGLE_FORM_URL || !ENTRY_NAME) {
      // Form not configured yet — log and acknowledge so the UI shows success
      // during local dev. Replace with real form URL/IDs to actually persist.
      console.warn("[/api/contact] Google Form not configured. Payload:", {
        name,
        company,
        email,
        phone,
        product,
        message,
      });
      return NextResponse.json({ success: true, persisted: false });
    }

    const fd = new URLSearchParams();
    fd.append(ENTRY_NAME, name);
    if (ENTRY_COMPANY) fd.append(ENTRY_COMPANY, company);
    fd.append(ENTRY_EMAIL, email);
    if (ENTRY_PHONE) fd.append(ENTRY_PHONE, phone);
    if (ENTRY_PRODUCT) fd.append(ENTRY_PRODUCT, product);
    if (ENTRY_MESSAGE) fd.append(ENTRY_MESSAGE, message);

    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 10_000);
    const res = await fetch(GOOGLE_FORM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: fd.toString(),
      signal: ctrl.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "Upstream form rejected the submission." },
        { status: 502 }
      );
    }
    return NextResponse.json({ success: true, persisted: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unexpected error." },
      { status: 500 }
    );
  }
}
