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
    "Your outfit looks amazing today.",
    "Be honest, is this restaurant actually good?",
  ],
  "slang-to-en": [
    "that test lowkey cooked me fr",
    "bro's fit is bussin, no cap",
    "she ate that presentation, main character energy",
  ],
};

type Status = "idle" | "loading" | "error";

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
            ? "bg-paper text-ink outline outline-2 outline-offset-2 outline-paper"
            : "bg-paper text-ink"
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

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setShortcut("⌘ ↵");
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

  async function run(input = text) {
    const trimmed = input.trim();
    if (!trimmed || status === "loading") return;
    const id = ++requestId.current;
    setStatus("loading");
    setError("");
    setResult(null);
    setActive(null);
    try {
      const res = await translate(direction, trimmed);
      if (id !== requestId.current) return;
      setResult({ ...res, direction, source: trimmed });
      setText(trimmed);
      setEditing(false);
      setStatus("idle");
    } catch (e) {
      if (id !== requestId.current) return;
      setError(e instanceof ApiError ? e.message : "Something went wrong. Try again.");
      setStatus("error");
    }
  }

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
    setEditing(true);
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

  // Which pane is ink: brainrot is always black.
  const sourceInk = !toSlang;
  const targetInk = toSlang;
  const showRenderedInput = !!result && result.direction === "slang-to-en" && !editing;

  const textSize = "text-[clamp(1.375rem,2.3vw,2rem)] leading-[1.3] tracking-[-0.01em]";

  return (
    <section aria-label="Translator">
      <div
        className="relative grid grid-rows-[1fr_1fr] border-y border-rule md:grid-cols-2 md:grid-rows-1"
        data-direction={direction}
      >
        <div aria-hidden className="ink-layer" data-at={toSlang ? "second" : "first"} />

        {/* Source pane */}
        <div
          className={`pane relative flex min-h-[300px] flex-col p-5 sm:p-8 md:min-h-[min(68vh,620px)] md:p-10 ${
            sourceInk ? "text-paper" : "pane-paper text-ink"
          }`}
        >
          <PaneLabel lang={sourceLang} ink={sourceInk} htmlFor="source" />

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
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    void run();
                  }
                }}
                placeholder={
                  toSlang
                    ? "Type something in plain English."
                    : "Paste a message full of slang."
                }
                spellCheck={toSlang}
                className={`${textSize} h-full min-h-[8rem] w-full resize-none bg-transparent outline-none ${
                  sourceInk ? "placeholder:text-[#5e5e5e]" : "placeholder:text-[#b4b4b4]"
                }`}
              />
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <span
              className={`font-mono text-xs tabular-nums ${sourceInk ? "text-ash" : "text-graphite"}`}
            >
              {showRenderedInput ? (
                <button type="button" onClick={startEditing} className="focus-ring underline underline-offset-4">
                  Edit text
                </button>
              ) : (
                `${text.length} / ${MAX_INPUT}`
              )}
            </span>
            <button
              type="button"
              onClick={() => void run()}
              disabled={!text.trim() || status === "loading"}
              className={`focus-ring group inline-flex items-center gap-3 rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-35 ${
                sourceInk ? "bg-paper text-ink" : "bg-ink text-paper"
              }`}
            >
              {status === "loading" ? "Translating" : "Translate"}
              <span className="font-mono text-[0.7rem] font-normal opacity-60">{shortcut}</span>
            </button>
          </div>
        </div>

        {/* Target pane */}
        <div
          className={`pane relative flex min-h-[300px] flex-col p-5 sm:p-8 md:min-h-[min(68vh,620px)] md:p-10 ${
            targetInk ? "text-paper" : "pane-paper text-ink"
          }`}
          aria-live="polite"
        >
          <PaneLabel lang={targetLang} ink={targetInk} />

          <div className="relative mt-5 flex-1">
            {status === "loading" && (
              <div className="space-y-3 pt-2" role="status">
                <span className="sr-only">Translating</span>
                {["92%", "78%", "44%"].map((w) => (
                  <div key={w} className="shimmer h-[1.1em] rounded-sm text-[clamp(1.375rem,2.3vw,2rem)]" style={{ width: w }} />
                ))}
              </div>
            )}

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

            {status === "idle" && result && (
              <p className={`${textSize} whitespace-pre-wrap break-words`}>
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
                <p className={`font-mono text-xs ${targetInk ? "text-ash" : "text-graphite"}`}>
                  Try one
                </p>
                <ul className="mt-3 space-y-2">
                  {EXAMPLES[direction].map((ex) => (
                    <li key={ex}>
                      <button
                        type="button"
                        onClick={() => pickExample(ex)}
                        className={`focus-ring text-left text-lg decoration-1 underline-offset-[6px] hover:underline md:text-xl ${
                          targetInk ? "text-ash hover:text-paper" : "text-graphite hover:text-ink"
                        }`}
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
            {status === "idle" && result && (
              <button
                type="button"
                onClick={copy}
                className={`focus-ring font-mono text-xs underline underline-offset-4 ${
                  targetInk ? "text-ash hover:text-paper" : "text-graphite hover:text-ink"
                }`}
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
          className="swap focus-ring absolute left-1/2 top-1/2 z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-ink outline-paper"
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
      {status === "idle" && result && (
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

function PaneLabel({ lang, ink, htmlFor }: { lang: string; ink: boolean; htmlFor?: string }) {
  const cls = `type-expanded text-[0.8rem] font-extrabold uppercase tracking-[0.14em] ${
    ink ? "text-paper" : "text-ink"
  }`;
  return htmlFor ? (
    <label htmlFor={htmlFor} className={cls}>
      {lang}
    </label>
  ) : (
    <h2 className={cls}>{lang}</h2>
  );
}
