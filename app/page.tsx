import Link from "next/link";
import FlushDemo from "@/components/FlushDemo";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const TICKER = [
  ["rizz", "😏"], ["aura", "✨"], ["unc", "👴"], ["6-7", "🤲"], ["cooked", "🍳"], ["mid", "😐"],
  ["gyatt", "🍑"], ["delulu", "🦄"], ["skibidi", "🚽"], ["clanker", "🤖"], ["locked in", "🔒"],
  ["glazing", "🍩"], ["fanum tax", "🍟"], ["chopped", "🔪"], ["mog", "🗿"], ["sigma", "🐺"],
  ["it's giving", "💅"], ["ohio", "🌽"], ["no cap", "🧢"], ["L", "💀"],
] as const;

const STEPS = [
  {
    emoji: "✍️",
    title: "Type something boring",
    body: "Anything your grandma would say. “I am very tired after that exam” is perfect.",
  },
  {
    emoji: "🚽",
    title: "We flush it",
    body: "A tiny AI model that studied 14,000 examples of brainrot (so you didn’t have to) rewrites it.",
  },
  {
    emoji: "🧠",
    title: "Brainrot comes out",
    body: "Every slang word gets highlighted with what it means, so you learn something. Unfortunately.",
  },
];

const MODES = [
  {
    emoji: "🗣️",
    title: "English → Brainrot",
    input: "I'm going to study all night for the exam.",
    output: "i am finna study all night for the test",
    href: "/translate?dir=en-to-slang",
    cta: "Brainrot-ify something",
  },
  {
    emoji: "👴",
    title: "Brainrot → English",
    input: "the whole game was literally mid and i dont even care anymore",
    output: "The entire game was average and I do not care anymore.",
    href: "/translate?dir=slang-to-en",
    cta: "Decode a text from your cousin",
  },
  {
    emoji: "📖",
    title: "What does that mean??",
    input: "What does “aura” mean?",
    output: "A quantifiable unit of coolness or uncoolness.",
    href: "/translate#lexicon",
    cta: "Look up a word",
  },
];

const FAQ = [
  ["Is it accurate?", "Mostly. It’s a small model, so sometimes it fumbles. Double-check before texting your crush."],
  ["Will this make me cool?", "No. Using it in front of actual teenagers may cost you aura. We are not liable."],
  ["Who is this for?", "Parents, teachers, uncs, and anyone who got a “💀” reply and needs to know if that’s bad."],
];

function Sticker({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`wobble inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-ink bg-paper px-3.5 py-1.5 text-sm font-bold shadow-[3px_3px_0_var(--ink)] ${className}`}
    >
      {children}
    </span>
  );
}

export default function Landing() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* Hero: the pitch on the left, the flush demo on the right */}
        <section className="grid gap-12 px-5 pb-16 pt-8 sm:px-8 md:px-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-12">
          <div>
            <div className="mb-7 flex flex-wrap gap-3">
              <Sticker className="-rotate-3">certified skibidi ✅</Sticker>
              <Sticker className="rotate-2">200+ words of brainrot 🧠</Sticker>
            </div>
            <h1 className="type-expanded text-[clamp(2.75rem,7.5vw,6.5rem)] font-black leading-[0.92] tracking-[-0.04em]">
              English in.
              <br />
              Brainrot out.{" "}
              <span aria-hidden className="inline-block rotate-12 text-[0.8em]">🚽</span>
            </h1>
            <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-graphite md:text-xl">
              Turn normal sentences into Gen Z and Gen Alpha slang, decode whatever your little cousin just texted you,
              and finally find out what <span className="font-semibold text-ink">6-7</span> means.{" "}
              <span aria-hidden>🤲</span>
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link
                href="/translate"
                className="focus-ring inline-flex items-center gap-3 rounded-full border-2 border-ink bg-ink px-6 py-3 text-base font-semibold text-paper shadow-[4px_4px_0_var(--graphite)] transition-transform hover:-translate-y-0.5 hover:rotate-[-1deg]"
              >
                Start translating <span aria-hidden>🚽</span>
              </Link>
              <Link href="/translate#lexicon" className="focus-ring text-base underline underline-offset-[6px] hover:text-graphite">
                Browse the lexicon 📖
              </Link>
            </div>
          </div>

          <div className="relative">
            <Sticker className="absolute -top-4 right-6 z-10 rotate-6">watch this 👀</Sticker>
            <FlushDemo />
          </div>
        </section>

        {/* Ticker of lexicon terms */}
        <div className="ticker-wrap border-y-2 border-ink py-4" aria-label="Some of the slang it knows">
          <div className="ticker type-expanded flex w-max gap-10 whitespace-nowrap text-[clamp(1.25rem,2.4vw,1.75rem)] font-extrabold uppercase tracking-[-0.01em]">
            {[...TICKER, ...TICKER].map(([word, emoji], i) => (
              <span key={i} className="flex items-center gap-3" aria-hidden={i >= TICKER.length}>
                {word}
                <span aria-hidden>{emoji}</span>
              </span>
            ))}
          </div>
        </div>

        {/* How it works: a real sequence, so numbered */}
        <section className="px-5 py-16 sm:px-8 md:px-10 lg:py-24">
          <h2 className="type-expanded text-[clamp(1.75rem,3.4vw,2.75rem)] font-black leading-none tracking-[-0.03em]">
            How it works <span aria-hidden>🤓☝️</span>
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className={`rounded-2xl border-2 border-ink p-6 shadow-[5px_5px_0_var(--ink)] transition-transform hover:-translate-y-1 ${
                  ["md:-rotate-1", "md:rotate-1", "md:-rotate-[0.5deg]"][i]
                }`}
              >
                <div className="flex items-start justify-between">
                  <span aria-hidden className="text-5xl leading-none">{s.emoji}</span>
                  <span className="font-mono text-sm text-graphite">step {i + 1}</span>
                </div>
                <h3 className="type-expanded mt-6 text-xl font-black tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-graphite">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* What you can do with it */}
        <section className="border-t-2 border-ink px-5 py-16 sm:px-8 md:px-10 lg:py-24">
          <h2 className="type-expanded text-[clamp(1.75rem,3.4vw,2.75rem)] font-black leading-none tracking-[-0.03em]">
            Pick your poison <span aria-hidden>🧪</span>
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {MODES.map((m) => (
              <Link key={m.title} href={m.href} className="focus-ring group flex flex-col border-t border-ink pt-5">
                <span aria-hidden className="text-4xl leading-none transition-transform group-hover:-rotate-12 group-hover:scale-110">
                  {m.emoji}
                </span>
                <h3 className="type-expanded mt-4 text-[0.8rem] font-extrabold uppercase tracking-[0.14em]">{m.title}</h3>
                <p className="mt-4 text-lg leading-snug text-graphite">{m.input}</p>
                <p className="mt-3 text-lg leading-snug">
                  <span aria-hidden className="mr-2 font-mono text-graphite">↳</span>
                  {m.output}
                </p>
                <span className="mt-6 text-sm font-semibold underline-offset-[6px] group-hover:underline">
                  {m.cta} <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t-2 border-ink px-5 py-16 sm:px-8 md:px-10 lg:py-24">
          <h2 className="type-expanded text-[clamp(1.75rem,3.4vw,2.75rem)] font-black leading-none tracking-[-0.03em]">
            Questions nobody asked <span aria-hidden>🙋</span>
          </h2>
          <dl className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-3">
            {FAQ.map(([q, a]) => (
              <div key={q}>
                <dt className="text-lg font-bold">{q}</dt>
                <dd className="mt-2 leading-relaxed text-graphite">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Closing CTA */}
        <section className="border-t-2 border-ink bg-ink px-5 py-16 text-paper sm:px-8 md:px-10 lg:py-20">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <p className="type-expanded text-[clamp(2rem,5vw,4rem)] font-black leading-[0.95] tracking-[-0.04em]">
              Ready to lose
              <br />
              some aura? <span aria-hidden>💀</span>
            </p>
            <Link
              href="/translate"
              className="focus-ring wobble inline-flex items-center gap-3 rounded-full border-2 border-paper bg-paper px-7 py-4 text-lg font-bold text-ink"
            >
              Let&apos;s go <span aria-hidden>🚽</span>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
