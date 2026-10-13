"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ApiError,
  MAX_INPUT,
  translate,
  type Direction,
  type TermSpan,
  type TranslateResult,
} from "@/lib/api";

const LANG = { en: "English", slang: "Brainrot" } as const;

const EXAMPLES: Record<Direction, string[]> = {
  "en-to-slang": [
    "I'm so tired, that test was really hard.",
    "My uncle tells the same joke at every family dinner.",
    "That guy is very confident for someone who just tripped in front of everyone.",
  ],
  "slang-to-en": [
    "that test lowkey cooked me fr",
    "unc is so washed bro thinks minions memes are peak 💀",
    "she ate that presentation, main character energy no cap",
  ],
};

type Status = "idle" | "loading" | "error";

/** Translate this long after the last keystroke. */
const AUTO_DELAY = 1000;

interface Done extends TranslateResult {
  direction: Direction;
  source: string;
}

interface Note {
  n: number;
  word: string;
  definition: string | null;
}

/** Number each distinct term in order of first appearance on the brainrot side. */
function buildNotes(spans: TermSpan[]): { notes: Note[]; numberOf: Map<string, number> } {
  const numberOf = new Map<string, number>();
  const notes: Note[] = [];
  for (const s of [...spans].sort((a, b) => a.start - b.start)) {
    const key = s.word.toLowerCase();
    if (numberOf.has(key)) continue;
    numberOf.set(key, notes.length + 1);
    notes.push({ n: notes.length + 1, word: s.word, definition: s.definition });
  }
  return { notes, numberOf };
}

function WithChips({
  text,
  spans,
  numberOf,
  active,
  onActive,
}: {
  text: string;
  spans: TermSpan[];
  numberOf: Map<string, number>;
  active: number | null;
  onActive: (n: number | null) => void;
}) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  const ordered = [...spans]
    .filter((s) => s.start >= 0 && s.end <= text.length && s.start < s.end)
    .sort((a, b) => a.start - b.start);

  for (const s of ordered) {
    if (s.start < cursor) continue; // overlapping span, skip
    if (s.start > cursor) parts.push(text.slice(cursor, s.start));
    const n = numberOf.get(s.word.toLowerCase()) ?? 0;
    parts.push(
      <a
        key={`${s.start}-${s.end}`}
        href={`#note-${n}`}
        title={s.definition ?? undefined}
        onMouseEnter={() => onActive(n)}
        onMouseLeave={() => onActive(null)}
        onFocus={() => onActive(n)}
        onBlur={() => onActive(null)}
        className={`focus-ring rounded-[3px] px-[0.18em] py-[0.02em] no-underline transition-colors box-decoration-clone ${
          active === n
            ? "bg-ink text-paper outline outline-2 outline-offset-2 outline-ink"
            : "bg-ink text-paper"
        }`}
      >
        {text.slice(s.start, s.end)}
        <sup className="ml-[0.15em] font-mono text-[0.5em] font-medium">{n}</sup>
      </a>,
    );
    cursor = s.end;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

export default function Translator() {
  const [direction, setDirection] = useState<Direction>("en-to-slang");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Done | null>(null);
  const [editing, setEditing] = useState(true);
  const [active, setActive] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [shortcut, setShortcut] = useState("Ctrl ↵");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const requestId = useRef(0);
  const lastRun = useRef(""); // direction + text of the latest request, so the same input isn't sent twice

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setShortcut("⌘ ↵");
    // Landing page links pick the starting direction with ?dir=
    const dir = new URLSearchParams(window.location.search).get("dir");
    if (dir === "en-to-slang" || dir === "slang-to-en") setDirection(dir);
  }, []);

  const toSlang = direction === "en-to-slang";
  const sourceLang = toSlang ? LANG.en : LANG.slang;
  const targetLang = toSlang ? LANG.slang : LANG.en;

  const brainrotSpans = useMemo(
    () =>
      result
        ? result.terms.filter((t) =>
            result.direction === "en-to-slang" ? t.side === "output" : t.side === "input",
          )
        : [],
    [result],
  );
  const { notes, numberOf } = useMemo(() => buildNotes(brainrotSpans), [brainrotSpans]);

  // The previous translation stays on screen (dimmed) until the new one arrives;
  // a newer request makes older responses stale.
  async function run(input = text) {
    const trimmed = input.trim();
    if (!trimmed) return;
    lastRun.current = `${direction}\n${trimmed}`;
    const id = ++requestId.current;
    setStatus("loading");
    setError("");
    setActive(null);
    try {
      const res = await translate(direction, trimmed);
      if (id !== requestId.current) return;
      setResult({ ...res, direction, source: trimmed });
      setStatus("idle");
    } catch (e) {
      if (id !== requestId.current) return;
      setError(e instanceof ApiError ? e.message : "Something went wrong. Try again.");
      setStatus("error");
    }
  }

  // Auto-translate once typing pauses
  useEffect(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      requestId.current++;
      lastRun.current = "";
      setResult(null);
      setStatus("idle");
      setError("");
      return;
    }
    if (lastRun.current === `${direction}\n${trimmed}`) return;
    const t = setTimeout(() => void run(trimmed), AUTO_DELAY);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, direction]);

  function swap() {
    requestId.current++;
    const next: Direction = toSlang ? "slang-to-en" : "en-to-slang";
    if (result) setText(result.translation);
    setDirection(next);
    setResult(null);
    setStatus("idle");
    setError("");
    setEditing(true);
    setActive(null);
  }

  function pickExample(example: string) {
    setText(example);
    setEditing(false);
    void run(example);
  }

  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.translation);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard blocked; leave the button as is
    }
  }

  function startEditing() {
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  const showRenderedInput =
    !!result && result.direction === "slang-to-en" && result.source === text.trim() && !editing;

  const textSize = "text-[clamp(1.375rem,2.3vw,2rem)] leading-[1.3] tracking-[-0.01em]";

  return (
    <section aria-label="Translator">
      <div
        className="relative grid grid-rows-[1fr_1fr] border-y border-rule md:grid-cols-2 md:grid-rows-1"
        data-direction={direction}
      >
        {/* Source pane */}
        <div
          className="relative flex min-h-[300px] flex-col p-5 sm:p-8 md:min-h-[min(68vh,620px)] md:p-10"
        >
          <PaneLabel lang={sourceLang} htmlFor="source" />

          <div className="relative mt-5 flex-1">
            {showRenderedInput ? (
              <div
                className={`${textSize} cursor-text whitespace-pre-wrap break-words`}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("a")) return;
                  startEditing();
                }}
              >
                <WithChips
                  text={result.source}
                  spans={brainrotSpans}
                  numberOf={numberOf}
                  active={active}
                  onActive={setActive}
                />
              </div>
            ) : (
              <textarea
                id="source"
                ref={inputRef}
                value={text}
                maxLength={MAX_INPUT}
                onChange={(e) => setText(e.target.value)}
                onFocus={() => setEditing(true)}
                onBlur={() => setEditing(false)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    void run();
                  }
                }}
                placeholder={
                  toSlang
                    ? "Type something your grandma would say."
                    : "Paste the message that made you go \u201chuh??\u201d"
                }
                spellCheck={toSlang}
                className={`${textSize} h-full min-h-[8rem] w-full resize-none bg-transparent outline-none placeholder:text-faint`}
              />
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <span
              className="font-mono text-xs tabular-nums text-graphite"
            >
              {showRenderedInput ? (
                <button type="button" onClick={startEditing} className="focus-ring underline underline-offset-4">
                  Edit text
                </button>
              ) : (
                `${text.length} / ${MAX_INPUT}`
              )}
            </span>
            <span className="font-mono text-xs text-graphite">
              {status === "loading" ? "Flushing… 🚽" : `Translates as you type · ${shortcut} now`}
            </span>
          </div>
        </div>

        {/* Target pane */}
        <div
          className="relative flex min-h-[300px] flex-col border-t border-rule p-5 sm:p-8 md:min-h-[min(68vh,620px)] md:border-l md:border-t-0 md:p-10"
          aria-live="polite"
        >
          <PaneLabel lang={targetLang} />

          <div className="relative mt-5 flex-1">
            {status === "loading" && !result && <Flushing />}

            {status === "error" && (
              <div className="max-w-md">
                <p className={`${textSize} text-[clamp(1.125rem,1.6vw,1.375rem)]`}>{error}</p>
                <button
                  type="button"
                  onClick={() => void run()}
                  className="focus-ring mt-4 font-mono text-xs underline underline-offset-4"
                >
                  Try again
                </button>
              </div>
            )}

            {status !== "error" && result && (
              <p
                className={`${textSize} whitespace-pre-wrap break-words transition-opacity ${
                  status === "loading" || result.source !== text.trim() ? "opacity-40" : ""
                }`}
              >
                {result.direction === "en-to-slang" ? (
                  <WithChips
                    text={result.translation}
                    spans={brainrotSpans}
                    numberOf={numberOf}
                    active={active}
                    onActive={setActive}
                  />
                ) : (
                  result.translation
                )}
              </p>
            )}

            {status === "idle" && !result && (
              <div>
                <p className="font-mono text-xs text-graphite">
                  Try one
                </p>
                <ul className="mt-3 space-y-2">
                  {EXAMPLES[direction].map((ex) => (
                    <li key={ex}>
                      <button
                        type="button"
                        onClick={() => pickExample(ex)}
                        className={`focus-ring text-left text-lg decoration-1 underline-offset-[6px] hover:underline md:text-xl text-graphite hover:text-ink`}
                      >
                        {ex}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-6 flex h-[2.625rem] items-center justify-end">
            {status !== "error" && result && (
              <button
                type="button"
                onClick={copy}
                className="focus-ring font-mono text-xs text-graphite underline underline-offset-4 hover:text-ink"
              >
                {copied ? "Copied" : "Copy translation"}
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={swap}
          aria-label={`Swap languages. Now translating ${sourceLang} to ${targetLang}.`}
          className="focus-ring absolute left-1/2 top-1/2 z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-rule bg-paper text-ink transition-colors hover:border-ink"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 rotate-90 md:rotate-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M4 8h15m0 0-4-4m4 4-4 4M20 16H5m0 0 4-4m-4 4 4 4" />
          </svg>
        </button>
      </div>

      {/* Footnotes: the slang in this translation, numbered in reading order */}
      {status !== "error" && result && (
        <div className="px-5 py-8 sm:px-8 md:px-10 md:py-10">
          {notes.length > 0 ? (
            <ol className="grid gap-y-4 md:grid-cols-2 md:gap-x-20">
              {notes.map((note) => (
                <li
                  key={note.n}
                  id={`note-${note.n}`}
                  onMouseEnter={() => setActive(note.n)}
                  onMouseLeave={() => setActive(null)}
                  className={`flex scroll-mt-24 gap-4 border-t pt-4 transition-colors ${
                    active === note.n ? "border-ink" : "border-rule"
                  }`}
                >
                  <span className="w-5 shrink-0 pt-[0.2rem] font-mono text-xs tabular-nums text-graphite">
                    {note.n}
                  </span>
                  <p className="text-base leading-relaxed">
                    <span className="font-semibold">{note.word}</span>
                    <span className="text-graphite">
                      {" "}
                      — {note.definition ?? "No definition in the lexicon yet."}
                    </span>
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="font-mono text-xs text-graphite">No slang terms in this one.</p>
          )}
        </div>
      )}
    </section>
  );
}

function PaneLabel({ lang, htmlFor }: { lang: string; htmlFor?: string }) {
  const cls = "type-expanded text-[0.8rem] font-extrabold uppercase tracking-[0.14em]";
  return htmlFor ? (
    <label htmlFor={htmlFor} className={cls}>
      {lang}
    </label>
  ) : (
    <h2 className={cls}>{lang}</h2>
  );
}

const FLUSH_LINES = [
  "Flushing it through the brainrot pipeline…",
  "Consulting the skibidi council…",
  "Charging up the aura…",
  "Asking a 12-year-old…",
  "Letting it cook…",
];

/** Loading state: a spinning toilet and a rotating caption. */
function Flushing() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % FLUSH_LINES.length), 1600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-4 pt-2" role="status">
      <span aria-hidden className="flush inline-block text-[clamp(2rem,3.4vw,2.75rem)] leading-none">
        🚽
      </span>
      <span className="font-mono text-sm text-graphite">{FLUSH_LINES[i]}</span>
    </div>
  );
}
