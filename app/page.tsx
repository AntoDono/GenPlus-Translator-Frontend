import Translator from "@/components/Translator";
import Lexicon from "@/components/Lexicon";

export default function Home() {
  return (
    <>
      <header className="flex items-center justify-between gap-4 px-5 py-5 sm:px-8 md:px-10">
        <a
          href="/"
          className="focus-ring type-expanded text-[1.75rem] font-black leading-none tracking-[-0.03em]"
        >
          GEN+{" "}
          <span aria-hidden className="inline-block text-[1.5rem] transition-transform hover:rotate-[20deg]">
            🧠🚽
          </span>
        </a>
        <nav className="flex items-center gap-6 text-sm">
          <a href="#lexicon" className="focus-ring underline-offset-4 hover:underline">
            Lexicon
          </a>
          <a
            href="https://github.com/AntoDono/GenPlus-Translator"
            target="_blank"
            rel="noreferrer"
            className="focus-ring underline-offset-4 hover:underline"
          >
            GitHub ↗
          </a>
        </nav>
      </header>

      <main>
        <h1 className="sr-only">Gen+ Translator: English to brainrot and back</h1>
        <Translator />
        <Lexicon />
      </main>

      <footer className="border-t border-rule">
        <div className="flex flex-col gap-2 px-5 py-6 font-mono text-xs text-graphite sm:flex-row sm:justify-between sm:px-8 md:px-10">
          <p>Translations come from a small fine-tuned model and can be wrong. Not responsible for any aura lost.</p>
          <p>
            Built by{" "}
            <a
              href="https://youweizhen.com"
              target="_blank"
              rel="noreferrer"
              className="focus-ring underline underline-offset-4 hover:text-ink"
            >
              Youwei Zhen
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
