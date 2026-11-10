"use client";

import { useEffect, useRef, useState } from "react";
import { ECP_SLUG, MOREWERX_API } from "../_lib/site-content";

/**
 * The floating "Ask ECP" chat bubble. Talks to the company's assistant in
 * MoreWerx (POST /api/public/site/{slug}/assistant), which answers from ECP's
 * site content and blog.
 *
 * Onboarding: on first open the assistant asks a short intake, one question
 * at a time (name, email, company, role, industry, need, location, timeline,
 * phone — everything after email can be skipped). The answers, exactly as the
 * visitor gave them, go to POST /api/public/site/{slug}/onboarding, which
 * makes them a lead in ECP's MoreWerx CRM with the page they came from. The
 * profile is then remembered on this device and sent with each question so
 * the assistant knows who it's talking to. A visitor can skip the intake and
 * just chat (typing an email in chat still saves them as a lead).
 *
 * Turns are kept only in this tab's sessionStorage; intake turns are shown
 * but never sent to the model as history.
 */

interface Turn {
  role: "user" | "model";
  text: string;
  /** Part of the onboarding intake — not sent as chat history. */
  intake?: boolean;
}

type Field = "name" | "email" | "company" | "title" | "industry" | "need" | "location" | "timeline" | "phone";

interface Profile {
  name: string;
  email: string;
  answers: Partial<Record<Exclude<Field, "name" | "email">, string>>;
}

interface Step {
  key: Field;
  ask: (p: Partial<Record<Field, string>>) => string;
  placeholder: string;
  required?: boolean;
  chips?: string[];
}

const first = (name?: string) => (name ?? "").trim().split(/\s+/)[0] || "there";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STEPS: Step[] = [
  { key: "name", required: true, placeholder: "Your name", ask: () => "Before we start, what's your name?" },
  { key: "email", required: true, placeholder: "you@company.com", ask: (p) => `Nice to meet you, ${first(p.name)}! What's the best email to reach you?` },
  { key: "company", placeholder: "Company name", ask: () => "Which company are you with?", chips: ["Just me / property owner"] },
  { key: "title", placeholder: "e.g. Facilities Manager", ask: () => "What's your role there?" },
  {
    key: "industry", placeholder: "Your industry", ask: () => "Which industry are you in?",
    chips: ["Commercial real estate", "Industrial / manufacturing", "Government / public sector", "Healthcare", "Education", "Architecture / engineering", "Residential"],
  },
  {
    key: "need", placeholder: "Tell us briefly", ask: () => "What can ECP help you with?",
    chips: ["Structural engineering", "General contracting", "Construction management", "Specialty products (windows, timber)", "Historic restoration", "Just exploring"],
  },
  { key: "location", placeholder: "City, State", ask: () => "Where is the project located?" },
  {
    key: "timeline", placeholder: "When?", ask: () => "When are you hoping to start?",
    chips: ["As soon as possible", "Within 3 months", "3–6 months", "6+ months", "Not sure yet"],
  },
  { key: "phone", placeholder: "Phone (optional)", ask: () => "Last one: a phone number, if you'd like a call?" },
];

/** What the assistant is told about the visitor (labels match the CRM's). */
const VISITOR_LABELS: Partial<Record<Field, string>> = {
  company: "Company", title: "Role", industry: "Industry", need: "Looking for", location: "Project location", timeline: "Timeline",
};

const STORE_KEY = "ecp_chat_v2";
const PROFILE_KEY = "ecp_chat_profile_v1";
const SKIP_KEY = "ecp_chat_skip_intake";
const SKIP = "Skip";
const SUGGESTIONS = [
  "What services does ECP offer?",
  "Which areas do you serve?",
  "Can you supply and install custom wood windows?",
  "I'd like a quote for a project",
];

const read = <T,>(store: () => Storage, key: string, fallback: T): T => {
  try {
    const v = store().getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (store: () => Storage, key: string, value: unknown) => {
  try {
    if (value === null) store().removeItem(key);
    else store().setItem(key, JSON.stringify(value));
  } catch {}
};
const local = () => localStorage;
const session = () => sessionStorage;

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
  const [profile, setProfile] = useState<Profile | null>(null);
  /** The intake question being asked, or null when chatting. */
  const [step, setStep] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<Record<Field, string>>>({});
  const [loaded, setLoaded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = read<{ turns?: Turn[]; step?: number | null; draft?: Partial<Record<Field, string>> }>(session, STORE_KEY, {});
    const known = read<Profile | null>(local, PROFILE_KEY, null);
    setTurns(Array.isArray(saved.turns) ? saved.turns.slice(-30) : []);
    setProfile(known?.email ? known : null);
    setDraft(saved.draft ?? {});
    // Resume an intake in progress; start one for a new visitor who hasn't skipped it.
    const skipped = read<boolean>(session, SKIP_KEY, false);
    setStep(known?.email || skipped ? null : typeof saved.step === "number" ? saved.step : 0);
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) write(session, STORE_KEY, { turns: turns.slice(-30), step, draft });
  }, [turns, step, draft, loaded]);
  // The first intake question, once, when a new visitor opens the chat.
  useEffect(() => {
    if (open && loaded && step === 0 && !turns.some((t) => t.intake)) {
      setTurns((t) => [...t, { role: "model", text: STEPS[0].ask({}), intake: true }]);
    }
  }, [open, loaded, step, turns]);
  useEffect(() => {
    // A new answer scrolls to its first line, so a long reply reads from the top.
    const list = listRef.current;
    const last = list?.lastElementChild as HTMLElement | null;
    if (list && last && !sending && turns.at(-1)?.role === "model" && !turns.at(-1)?.intake) {
      list.scrollTo({ top: last.offsetTop - 12, behavior: "smooth" });
    } else {
      list?.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
    }
  }, [turns, sending]);
  useEffect(() => {
    const phone = window.matchMedia("(max-width: 640px)").matches;
    // Desktop: focus the input. Phone: don't pop the keyboard over the
    // suggestions, and stop the page scrolling behind the full-screen chat.
    if (open && !phone) inputRef.current?.focus();
    if (open && phone) document.documentElement.classList.add("ecp-chat-lock");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("ecp-chat-lock");
    };
  }, [open]);

  const current = step !== null ? STEPS[step] : null;

  /** One intake answer: validate, record, ask the next question or finish. */
  async function answer(raw: string) {
    if (!current || sending) return;
    const value = raw === SKIP ? "" : raw.trim();
    if (!value && current.required) return;
    setInput("");
    const said: Turn = { role: "user", text: raw === SKIP ? "Skip" : value, intake: true };
    if (current.key === "email" && !EMAIL_RE.test(value)) {
      setTurns((t) => [...t, said, { role: "model", text: "That doesn't look like an email address. Could you check it?", intake: true }]);
      return;
    }
    const next = { ...draft, ...(value ? { [current.key]: value } : {}) };
    setDraft(next);
    const i = step! + 1;
    if (i < STEPS.length) {
      setStep(i);
      setTurns((t) => [...t, said, { role: "model", text: STEPS[i].ask(next), intake: true }]);
      return;
    }
    setTurns((t) => [...t, said]);
    await finishIntake(next);
  }

  async function finishIntake(d: Partial<Record<Field, string>>) {
    const { name = "", email = "", ...rest } = d;
    const p: Profile = { name, email, answers: rest };
    setSending(true);
    let saved = false;
    try {
      const res = await fetch(`${MOREWERX_API}/api/public/site/${ECP_SLUG}/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...p, pageUrl: location.href, referrer: document.referrer || undefined }),
      });
      saved = res.ok;
    } catch {}
    setSending(false);
    setStep(null);
    setDraft({});
    setProfile(p);
    write(local, PROFILE_KEY, p);
    setTurns((t) => [
      ...t,
      {
        role: "model",
        intake: true,
        text: saved
          ? `Thanks, ${first(name)}! I've passed your details to the ECP team, and they'll follow up at **${email}**. In the meantime, what would you like to know?`
          : `Thanks, ${first(name)}! I couldn't send your details just now. You can reach the team on the [contact page](/contact). Meanwhile, what would you like to know?`,
      },
    ]);
  }

  function skipIntake() {
    write(session, SKIP_KEY, true);
    setStep(null);
    setDraft({});
    setTurns((t) => [...t, { role: "model", text: "No problem. What would you like to know?", intake: true }]);
  }

  /** Forget this device's profile (e.g. a shared computer) and start the intake again. */
  function startOver() {
    write(local, PROFILE_KEY, null);
    write(session, SKIP_KEY, null);
    setProfile(null);
    setDraft({});
    setTurns([]);
    setStep(0);
  }

  async function ask(q: string) {
    const question = q.trim();
    if (!question || sending) return;
    setInput("");
    const history = turns.filter((t) => !t.intake).slice(-12).map(({ role, text }) => ({ role, text }));
    const visitor = profile
      ? Object.fromEntries([
          ["Name", profile.name],
          ...Object.entries(profile.answers).flatMap(([k, v]) => (v && VISITOR_LABELS[k as Field] ? [[VISITOR_LABELS[k as Field]!, v]] : [])),
        ])
      : undefined;
    setTurns((t) => [...t, { role: "user", text: question }]);
    setSending(true);
    let reply: string;
    try {
      const res = await fetch(`${MOREWERX_API}/api/public/site/${ECP_SLUG}/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history, visitor, pageUrl: location.href, referrer: document.referrer || undefined }),
      });
      const data = await res.json().catch(() => null);
      reply = res.ok && data?.answer?.text
        ? data.answer.text
        : data?.error?.message || "I couldn't reach the assistant. Please try again, or use the [contact page](/contact).";
    } catch {
      reply = "I couldn't reach the assistant. Please try again, or use the [contact page](/contact).";
    }
    setTurns((t) => [...t, { role: "model", text: reply }]);
    setSending(false);
  }

  const submit = (text: string) => (current ? answer(text) : ask(text));
  const chatting = !current;
  const showSuggestions = chatting && !turns.some((t) => !t.intake) && !sending;
  const chips = current ? [...(current.chips ?? []), ...(current.required ? [] : [SKIP])] : [];

  return (
    <>
      {open && (
        <section className="ecp-chat" role="dialog" aria-label="Ask ECP">
          <header className="ecp-chat__head">
            <div>
              <strong>Ask ECP</strong>
              <span>
                {profile ? (
                  <>
                    Chatting as {first(profile.name)} ·{" "}
                    <button type="button" className="ecp-chat__link" onClick={startOver}>Not you?</button>
                  </>
                ) : (
                  "AI assistant · answers from our website"
                )}
              </span>
            </div>
            <button type="button" className="ecp-chat__x" aria-label="Close chat" onClick={() => setOpen(false)}>
              ×
            </button>
          </header>

          <div className="ecp-chat__list" ref={listRef} aria-live="polite">
            <div className="ecp-chat__msg ecp-chat__msg--model"><Rich text={greeting} /></div>
            {turns.map((t, i) => (
              <div key={i} className={`ecp-chat__msg ecp-chat__msg--${t.role}`}>
                {t.role === "model" ? <Rich text={t.text} /> : <p>{t.text}</p>}
              </div>
            ))}
            {sending && <div className="ecp-chat__msg ecp-chat__msg--model ecp-chat__typing" aria-label="Typing"><i /><i /><i /></div>}
            {showSuggestions && (
              <div className="ecp-chat__suggest">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => ask(s)}>{s}</button>
                ))}
              </div>
            )}
            {chips.length > 0 && !sending && (
              <div className="ecp-chat__chips">
                {chips.map((c) => (
                  <button key={c} type="button" className={c === SKIP ? "ecp-chat__chip--skip" : undefined} onClick={() => answer(c)}>{c}</button>
                ))}
              </div>
            )}
          </div>

          <form
            className="ecp-chat__form"
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              rows={1}
              maxLength={800}
              inputMode={current?.key === "email" ? "email" : current?.key === "phone" ? "tel" : undefined}
              autoComplete={current?.key === "name" ? "name" : current?.key === "email" ? "email" : current?.key === "phone" ? "tel" : current?.key === "company" ? "organization" : "off"}
              placeholder={current ? current.placeholder : profile ? "Ask a question…" : "Ask a question, or leave your email…"}
              aria-label={current ? current.ask(draft) : "Your message"}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
            />
            <button type="submit" disabled={sending || !input.trim()} aria-label="Send">➤</button>
          </form>
          <p className="ecp-chat__note">
            {current ? (
              <>
                Your details go only to the ECP team.{" "}
                <button type="button" className="ecp-chat__link" onClick={skipIntake}>Skip, just ask a question</button>
              </>
            ) : (
              "AI answers can be wrong. Details you share go only to the ECP team."
            )}
          </p>
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
