"use client";

import { useEffect, useState } from "react";

/** Real outputs from the fine-tuned model; terms and definitions come from the lexicon. */
const DEMOS = [
  {
    english: "My uncle tried to dance at the wedding and it was embarrassing.",
    slang: "Unc dabbed at the wedding but it was a big yikes.",
    terms: [
      ["Unc", "Someone seen as old or out of touch."],
      ["dabbed", "Did a dance move used as a gesture of triumph."],
      ["big yikes", "Something embarrassing or cringey."],
    ],
  },
  {
    english: "The server actually outshone the cook in appearance right now.",
    slang: "the server literally mogged the chef rn, pookie",
    terms: [
      ["mogged", "Outshone someone, especially in looks."],
      ["pookie", "Endearing nickname for a close friend or lover."],
    ],
  },
  {
    english: "The hotel stopped responding to my messages after I complained about the bed.",
    slang: "the hotel ghosted me after i complained about the bed",
    terms: [["ghosted", "Ended communication without warning."]],
  },
  {
    english: "My mother is clearly the most stylish person in our household and she knows it.",
    slang: "my mom is literally the GOAT of my family and she knows it.",
    terms: [["GOAT", "Greatest of all time."]],
  },
] as const;

type Phase = "english" | "flush" | "slang";
const DURATION: Record<Phase, number> = { english: 2600, flush: 1100, slang: 4200 };

function highlight(text: string, terms: readonly (readonly [string, string])[]) {
  const parts: React.ReactNode[] = [];
  let rest = text;
  terms.forEach(([word], n) => {
    const i = rest.indexOf(word);
    if (i < 0) return;
    parts.push(rest.slice(0, i));
    parts.push(
      <span key={n} className="rounded-[3px] bg-ink px-[0.18em] text-paper box-decoration-clone">
        {word}
        <sup className="ml-[0.15em] font-mono text-[0.5em] font-medium">{n + 1}</sup>
      </span>,
    );
    rest = rest.slice(i + word.length);
  });
  parts.push(rest);
  return parts;
}

/** English goes in, gets flushed, comes back out as brainrot. Loops through DEMOS. */
export default function FlushDemo() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("english");

  useEffect(() => {
    const t = setTimeout(() => {
      if (phase === "english") setPhase("flush");
      else if (phase === "flush") setPhase("slang");
      else {
        setIndex((i) => (i + 1) % DEMOS.length);
        setPhase("english");
      }
    }, DURATION[phase]);
    return () => clearTimeout(t);
  }, [phase]);

  const text = "text-[clamp(1.375rem,2.3vw,1.875rem)] leading-[1.3] tracking-[-0.01em]";
  const label = "type-expanded text-[0.75rem] font-extrabold uppercase tracking-[0.14em]";

  return (
    <figure className="flex flex-col overflow-hidden rounded-2xl border-2 border-ink p-5 shadow-[6px_6px_0_var(--ink)] sm:p-8" aria-label="Example translations">
      <p className={label}>English</p>
      <div className="mt-3 grid">
        {DEMOS.map((d, i) => (
          <p
            key={i}
            aria-hidden={i !== index}
            className={`${text} [grid-area:1/1] ${i !== index ? "invisible" : ""} ${
              i === index && phase === "flush" ? "swirl" : ""
            } ${phase === "slang" ? "text-faint" : ""}`}
          >
            {d.english}
          </p>
        ))}
      </div>

      <div className="my-5 flex items-center gap-4" aria-hidden>
        <span className={`inline-block text-[2.5rem] leading-none ${phase === "flush" ? "flush" : ""}`}>🚽</span>
        <span className="h-px flex-1 bg-rule" />
        <span className="font-mono text-xs text-graphite">{phase === "flush" ? "flushing…" : ""}</span>
      </div>

      <p className={label}>Brainrot</p>
      <div aria-live="polite" className="mt-3 grid flex-1">
        {DEMOS.map((d, di) => (
          <div
            key={di}
            aria-hidden={!(di === index && phase === "slang")}
            className={`[grid-area:1/1] ${di === index && phase === "slang" ? "rise" : "invisible"}`}
          >
            <p className={text}>{highlight(d.slang, d.terms)}</p>
            <ol className="mt-5 space-y-1.5 text-sm">
              {d.terms.map(([word, definition], i) => (
                <li key={word} className="flex gap-3">
                  <span className="w-3 shrink-0 font-mono text-xs tabular-nums text-graphite">{i + 1}</span>
                  <span>
                    <span className="font-semibold">{word}</span>
                    <span className="text-graphite"> — {definition}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-1.5" aria-hidden>
        {DEMOS.map((_, i) => (
          <span key={i} className={`h-1 w-6 rounded-full ${i === index ? "bg-ink" : "bg-rule"}`} />
        ))}
      </div>
    </figure>
  );
}
