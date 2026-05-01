"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/siteConfig";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const STORAGE_KEY = "ss-chat-history-v1";
const MAX_HISTORY = 20;

const SUGGESTIONS = [
  "What products do you make?",
  "What's the lead time for an EVA Bond Mould?",
  "I need a custom mould for crocs-style footwear",
  "What file formats do you accept?",
];

const QUOTE_KEYWORDS = [
  "quote", "quotation", "price", "pricing", "cost", "rate",
  "how much", "kitna", "kitne ka", "rates",
];
const CONTACT_KEYWORDS = [
  "contact", "speak", "call", "reach", "talk", "human",
  "whatsapp", "message you", "email you",
];
const CATALOGUE_KEYWORDS = [
  "catalogue", "catalog", "brochure", "pdf", "spec sheet", "datasheet", "download",
];

function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function detectIntent(text: string): {
  showQuote: boolean;
  showContact: boolean;
  showCatalogue: boolean;
} {
  const t = text.toLowerCase();
  return {
    showQuote: QUOTE_KEYWORDS.some((k) => t.includes(k)),
    showContact: CONTACT_KEYWORDS.some((k) => t.includes(k)),
    showCatalogue: CATALOGUE_KEYWORDS.some((k) => t.includes(k)),
  };
}

function buildWhatsAppLink(messages: Message[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const ctx = lastUser ? lastUser.content.slice(0, 280) : "";
  const text = ctx
    ? `Hi SS Classic, I was chatting on your website and wanted to follow up:\n\n"${ctx}"\n\nCould you help?`
    : `Hi SS Classic, I came across your website and would like more information about your moulds.`;
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  // Hydrate from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setMessages(parsed.slice(-MAX_HISTORY));
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
    } catch {}
  }, [messages, hydrated]);

  // Auto-scroll on new content
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setInput("");

    const userMsg: Message = { id: makeId(), role: "user", content: trimmed };
    const assistantMsg: Message = { id: makeId(), role: "assistant", content: "" };
    const next = [...messages, userMsg, assistantMsg];
    setMessages(next);
    setSending(true);

    const honeypot = honeypotRef.current?.value || "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          honeypot,
          messages: next
            .filter((m) => m.id !== assistantMsg.id)
            .map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => "");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? {
                  ...m,
                  content:
                    "Sorry, I couldn't reach the assistant just now. You can WhatsApp us or use the contact form below to get a fast response.",
                }
              : m
          )
        );
        console.warn("[chat] non-ok response:", res.status, detail);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: acc } : m))
        );
      }
      if (!acc) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? {
                  ...m,
                  content:
                    "I didn't get a response just now. Please try again or reach us on WhatsApp.",
                }
              : m
          )
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? {
                ...m,
                content:
                  "Network hiccup — please try again. Or message us directly on WhatsApp.",
              }
            : m
        )
      );
    } finally {
      setSending(false);
    }
  }

  function clearChat() {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  // Detect intent on the latest *user* message to decide action chips
  const latestUser = [...messages].reverse().find((m) => m.role === "user");
  const intent = latestUser
    ? detectIntent(latestUser.content)
    : { showQuote: false, showContact: false, showCatalogue: false };
  const lastIsAssistant =
    messages.length > 0 && messages[messages.length - 1].role === "assistant";
  const showActions =
    lastIsAssistant && (intent.showQuote || intent.showContact || intent.showCatalogue);
  const whatsAppLink = buildWhatsAppLink(messages);

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        className={`chat-launcher ${open ? "is-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat assistant"}
      >
        {open ? (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
        )}
        {!open && <span className="chat-launcher-badge">AI</span>}
      </button>

      {/* Backdrop (mobile only) */}
      {open && <div className="chat-backdrop" onClick={() => setOpen(false)} />}

      {/* Slide-in panel */}
      <aside
        className={`chat-panel ${open ? "is-open" : ""}`}
        role="dialog"
        aria-label="SS Classic chat assistant"
        aria-hidden={!open}
      >
        {/* Header */}
        <header className="chat-header">
          <div className="chat-header-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L4 6v6c0 5.5 3.5 9.7 8 10 4.5-.3 8-4.5 8-10V6l-8-4z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div className="chat-header-text">
            <div className="chat-header-eyebrow">SS Classic Assistant</div>
            <div className="chat-header-status">
              <span className="chat-status-dot" aria-hidden="true" />
              Online · Powered by Gemini
            </div>
          </div>
          <button
            type="button"
            className="chat-clear"
            onClick={clearChat}
            disabled={messages.length === 0 || sending}
            aria-label="Clear conversation"
            title="Clear conversation"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
            </svg>
          </button>
          <button
            type="button"
            className="chat-close"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <div className="chat-welcome-greeting">
                Hi! 👋 I&apos;m the SS Classic assistant.
              </div>
              <p className="chat-welcome-body">
                I can answer questions about our footwear moulds, materials,
                lead times, and process. Try one of these to get started:
              </p>
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="chat-suggestion"
                    onClick={() => send(s)}
                    disabled={sending}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`chat-msg chat-msg-${m.role}`}>
              <div className="chat-msg-bubble">
                {m.content || (
                  <span className="chat-typing" aria-label="Assistant is typing">
                    <span /><span /><span />
                  </span>
                )}
              </div>
            </div>
          ))}

          {showActions && (
            <div className="chat-actions">
              {intent.showQuote && (
                <>
                  <a
                    href={whatsAppLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chat-action chat-action-primary"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.768.967-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.15-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Talk on WhatsApp
                  </a>
                  <button
                    type="button"
                    className="chat-action"
                    onClick={() => {
                      setOpen(false);
                      const el = document.getElementById("contact");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Quote form
                  </button>
                </>
              )}
              {intent.showContact && !intent.showQuote && (
                <>
                  <a
                    href={whatsAppLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chat-action chat-action-primary"
                  >
                    Open WhatsApp
                  </a>
                  <a href={`tel:${siteConfig.phone}`} className="chat-action">
                    Call us
                  </a>
                  <a href={`mailto:${siteConfig.email}`} className="chat-action">
                    Email
                  </a>
                </>
              )}
              {intent.showCatalogue && (
                <>
                  <a
                    href="/reference/EVA%20BOND%20CATALOGUE.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chat-action"
                    download
                  >
                    EVA Bond PDF
                  </a>
                  <a
                    href="/reference/FULLIVA.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chat-action"
                    download
                  >
                    Full EVA PDF
                  </a>
                  <a
                    href="/reference/SOLE%20EVA%20DIE.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chat-action"
                    download
                  >
                    Sole Die PDF
                  </a>
                </>
              )}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="chat-composer">
          {/* Honeypot — hidden from humans */}
          <input
            ref={honeypotRef}
            type="text"
            name="chat_url"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: "absolute", left: "-10000px", width: "1px", height: "1px" }}
          />
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about products, lead times, materials…"
            rows={1}
            disabled={sending}
            className="chat-input"
            maxLength={4000}
          />
          <button
            type="button"
            className="chat-send"
            onClick={() => send(input)}
            disabled={sending || !input.trim()}
            aria-label="Send message"
          >
            {sending ? (
              <span className="chat-spinner" aria-hidden="true" />
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            )}
          </button>
        </div>
        <div className="chat-footer">
          AI responses may be inaccurate. For final pricing or specs, please confirm with our team.
        </div>
      </aside>
    </>
  );
}
