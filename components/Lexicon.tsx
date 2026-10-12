"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError, define, fetchVocabulary, type VocabTerm } from "@/lib/api";

const PREVIEW = 24;

type Explain =
  | { state: "loading" }
  | { state: "done"; text: string }
  | { state: "error"; text: string };

export default function Lexicon() {
  const [terms, setTerms] = useState<VocabTerm[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [explained, setExplained] = useState<Record<string, Explain>>({});
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchVocabulary()
      .then((res) =>
        setTerms([...res.terms].sort((a, b) => a.word.localeCompare(b.word))),
      )
      .catch((e) =>
        setLoadError(
          e instanceof ApiError
            ? `Couldn't load the lexicon. ${e.message}`
            : "Couldn't load the lexicon.",
        ),
      );
  }, []);

  const shown = useMemo(() => {
    if (!terms) return [];
    const q = query.trim().toLowerCase();
    if (!q) return showAll ? terms : terms.slice(0, PREVIEW);
    return terms.filter(
      (t) =>
        t.word.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q),
    );
  }, [terms, query, showAll]);

  async function explain(word: string) {
    setExplained((prev) => ({ ...prev, [word]: { state: "loading" } }));
    try {
      const res = await define(word);
      setExplained((prev) => ({
        ...prev,
        [word]: { state: "done", text: res.explanation },
      }));
    } catch (e) {
      setExplained((prev) => ({
        ...prev,
        [word]: {
          state: "error",
          text: e instanceof ApiError ? e.message : "The model couldn't explain this one.",
        },
      }));
    }
  }

  return (
    <section
      id="lexicon"
      aria-labelledby="lexicon-title"
      className="scroll-mt-4 px-5 pb-24 pt-16 sm:px-8 md:px-10 md:pt-24"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2
            id="lexicon-title"
            className="type-expanded text-[clamp(2.5rem,6vw,4.5rem)] font-black uppercase leading-[0.9] tracking-[-0.02em]"
          >
            Lexicon
          </h2>
          <p className="mt-3 max-w-md text-graphite">
            Every term the model knows, with what it means.
            {terms && (
              <span className="ml-2 font-mono text-xs tabular-nums">
                {terms.length} terms
              </span>
            )}
          </p>
        </div>
        <div className="w-full md:w-80">
          <label htmlFor="lexicon-search" className="sr-only">
            Search the lexicon
          </label>
          <input
            id="lexicon-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms or meanings"
            className="w-full border-b border-ink bg-transparent py-2 font-mono text-sm outline-none placeholder:text-graphite focus-visible:border-b-2"
          />
        </div>
      </div>

      <div className="mt-10 border-t border-ink">
        {!terms && !loadError && (
          <p className="py-6 font-mono text-xs text-graphite">Loading the lexicon…</p>
        )}
        {loadError && <p className="py-6 text-graphite">{loadError}</p>}
        {terms && shown.length === 0 && (
          <p className="py-6 text-graphite">
            No terms match “{query.trim()}”. Try a shorter search.
          </p>
        )}

        <dl className="grid md:grid-cols-2 md:gap-x-12 xl:grid-cols-3">
          {shown.map((t) => {
            const ex = explained[t.word];
            return (
              <div key={t.word} className="border-b border-rule py-5">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-lg font-semibold">{t.word}</dt>
                  {!ex && (
                    <button
                      type="button"
                      onClick={() => explain(t.word)}
                      className="focus-ring shrink-0 font-mono text-[0.7rem] text-graphite underline-offset-4 hover:text-ink hover:underline"
                    >
                      Ask the model
                    </button>
                  )}
                </div>
                <dd className="mt-1 leading-relaxed text-graphite">{t.definition}</dd>
                {ex && (
                  <dd
                    className="mt-3 border-l border-ink pl-3 text-sm leading-relaxed"
                    aria-live="polite"
                  >
                    {ex.state === "loading" && (
                      <span className="font-mono text-xs text-graphite">Asking…</span>
                    )}
                    {ex.state === "done" && ex.text}
                    {ex.state === "error" && (
                      <span className="text-graphite">
                        {ex.text}{" "}
                        <button
                          type="button"
                          onClick={() => explain(t.word)}
                          className="focus-ring font-mono text-xs underline underline-offset-4"
                        >
                          Try again
                        </button>
                      </span>
                    )}
                  </dd>
                )}
              </div>
            );
          })}
        </dl>

        {terms && !query.trim() && !showAll && terms.length > PREVIEW && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="focus-ring mt-8 rounded-full border border-ink px-5 py-2.5 text-sm font-semibold hover:bg-ink hover:text-paper"
          >
            Show all {terms.length} terms
          </button>
        )}
      </div>
    </section>
  );
}
