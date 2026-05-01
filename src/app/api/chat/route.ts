import { CHAT_SYSTEM_PROMPT } from "@/lib/chatSystemPrompt";

// Cloudflare Pages Workers runtime
export const runtime = "edge";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`;

const MAX_USER_MESSAGE_LEN = 4000;
const MAX_HISTORY_MESSAGES = 16;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Body = {
  messages: ChatMessage[];
  honeypot?: string;
};

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Chat is not configured. Missing GEMINI_API_KEY." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Honeypot — bots fill every field. Silently 200 without calling Gemini.
  if (body.honeypot && body.honeypot.trim()) {
    return new Response(
      JSON.stringify({ error: "Service unavailable." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: "No messages." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Trim history to last N messages, validate shapes
  const trimmed = messages.slice(-MAX_HISTORY_MESSAGES).filter(
    (m): m is ChatMessage =>
      !!m &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.length > 0 &&
      m.content.length <= MAX_USER_MESSAGE_LEN
  );

  if (trimmed.length === 0 || trimmed[trimmed.length - 1].role !== "user") {
    return new Response(JSON.stringify({ error: "Last message must be from user." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Build Gemini request payload
  const geminiBody = {
    systemInstruction: {
      parts: [{ text: CHAT_SYSTEM_PROMPT }],
    },
    contents: trimmed.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 800,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };

  let upstream: Response;
  try {
    upstream = await fetch(`${GEMINI_URL}&key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });
  } catch {
    return new Response(JSON.stringify({ error: "Upstream network error." }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => "");
    return new Response(
      JSON.stringify({ error: "Upstream chat error.", detail: errText.slice(0, 400) }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  // Transform Gemini SSE → simple plain-text streaming. We strip the
  // SSE envelope and forward only the text deltas, separated by no
  // delimiter. The client just appends what it receives.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await reader.read();
        if (done) {
          // Flush any final partial event
          if (buffer.length) {
            const text = extractTextFromSseChunk(buffer);
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        // SSE events separated by blank line
        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const event = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          const text = extractTextFromSseChunk(event);
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

function extractTextFromSseChunk(chunk: string): string {
  let out = "";
  for (const rawLine of chunk.split("\n")) {
    const line = rawLine.trim();
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      const json = JSON.parse(payload);
      const parts = json?.candidates?.[0]?.content?.parts;
      if (Array.isArray(parts)) {
        for (const p of parts) {
          if (typeof p?.text === "string") out += p.text;
        }
      }
    } catch {
      // ignore unparsable lines (heartbeats etc.)
    }
  }
  return out;
}
