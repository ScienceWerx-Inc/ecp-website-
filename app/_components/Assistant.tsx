"use client";

import { useEffect, useRef, useState } from "react";
import { ECP_SLUG, MOREWERX_API } from "../_lib/site-content";

/**
 * The floating "Ask ECP" chat bubble. Talks to the company's assistant in
 * MoreWerx (POST /api/public/site/{slug}/assistant), which answers from ECP's
 * site content and blog, and saves a visitor who types their email as a lead
 * in ECP's CRM. Stateless: the last few turns are resent with each question
 * and kept only in this tab's sessionStorage.
 */

interface Turn {
  role: "user" | "model";
  text: string;
}

const STORE_KEY = "ecp_chat_v1";
const SUGGESTIONS = [
  "What services does ECP offer?",
  "Which areas do you serve?",
  "Can you supply and install custom wood windows?",
  "I'd like a quote for a project",
];

/** Minimal markdown: paragraphs, `-` bullets, **bold**, [text](/link). */
function Rich({ text }: { text: string }) {
  const inline = (line: string) =>
    line.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g).filter(Boolean).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
      if (link) {
        const [, label, href] = link;
        const safe = /^(\/|https?:\/\/|mailto:|tel:)/i.test(href) ? href : "#";
        const external = /^https?:\/\//i.test(safe);
        return (
          <a key={i} href={safe} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {label}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });

  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) blocks.push(<ul key={`u${blocks.length}`}>{list.map((l, i) => <li key={i}>{inline(l)}</li>)}</ul>);
    list = [];
  };
  text.split("\n").forEach((raw, i) => {
    const b = /^\s*[-*]\s+(.*)$/.exec(raw);
    if (b) return void list.push(b[1]);
    flush();
    if (raw.trim()) blocks.push(<p key={`p${i}`}>{inline(raw)}</p>);
  });
  flush();
  return <>{blocks}</>;
}

export default function Assistant({ greeting }: { greeting: string }) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) ?? "[]");
      if (Array.isArray(saved)) setTurns(saved.slice(-20));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(turns.slice(-20)));
    } catch {}
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, sending]);
  useEffect(() => {
    if (open) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function ask(q: string) {
    const question = q.trim();
    if (!question || sending) return;
    setInput("");
    const history = turns.slice(-12);
    setTurns((t) => [...t, { role: "user", text: question }]);
    setSending(true);
    let reply: string;
    try {
      const res = await fetch(`${MOREWERX_API}/api/public/site/${ECP_SLUG}/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history, pageUrl: location.href, referrer: document.referrer || undefined }),
      });
      const data = await res.json().catch(() => null);
      reply = res.ok && data?.answer?.text
        ? data.answer.text
        : data?.error?.message || "I couldn't reach the assistant — please try again, or use the [contact page](/contact).";
    } catch {
      reply = "I couldn't reach the assistant — please try again, or use the [contact page](/contact).";
    }
    setTurns((t) => [...t, { role: "model", text: reply }]);
    setSending(false);
  }

  return (
    <>
      {open && (
        <section className="ecp-chat" role="dialog" aria-label="Ask ECP">
          <header className="ecp-chat__head">
            <div>
              <strong>Ask ECP</strong>
              <span>AI assistant · answers from our website</span>
            </div>
            <button type="button" className="ecp-chat__x" aria-label="Close chat" onClick={() => setOpen(false)}>
              ×
            </button>
          </header>

          <div className="ecp-chat__list" ref={listRef} aria-live="polite">
            <div className="ecp-chat__msg ecp-chat__msg--model"><Rich text={greeting} /></div>
            {turns.length === 0 && (
              <div className="ecp-chat__suggest">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => ask(s)}>{s}</button>
                ))}
              </div>
            )}
            {turns.map((t, i) => (
              <div key={i} className={`ecp-chat__msg ecp-chat__msg--${t.role}`}>
                {t.role === "model" ? <Rich text={t.text} /> : <p>{t.text}</p>}
              </div>
            ))}
            {sending && <div className="ecp-chat__msg ecp-chat__msg--model ecp-chat__typing" aria-label="Typing"><i /><i /><i /></div>}
          </div>

          <form
            className="ecp-chat__form"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              rows={1}
              maxLength={800}
              placeholder="Ask a question, or leave your email…"
              aria-label="Your message"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }}
            />
            <button type="submit" disabled={sending || !input.trim()} aria-label="Send">➤</button>
          </form>
          <p className="ecp-chat__note">AI answers can be wrong. Emails you share go only to the ECP team.</p>
        </section>
      )}

      <button
        type="button"
        className={`ecp-chat__fab${open ? " ecp-chat__fab--open" : ""}`}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Ask ECP a question"}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? (
          "×"
        ) : (
          <><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg><span className="ecp-chat__fab-label">Ask ECP</span></>
        )}
      </button>
    </>
  );
}
