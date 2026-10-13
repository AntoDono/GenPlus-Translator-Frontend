import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-4 px-5 py-5 sm:px-8 md:px-10">
      <Link
        href="/"
        className="focus-ring type-expanded text-[1.75rem] font-black leading-none tracking-[-0.03em]"
      >
        GEN+{" "}
        <span aria-hidden className="inline-block text-[1.5rem] transition-transform hover:rotate-[20deg]">
          🧠🚽
        </span>
      </Link>
      <nav className="flex items-center gap-5 text-sm sm:gap-6">
        <Link href="/translate" className="focus-ring underline-offset-4 hover:underline">
          Translate
        </Link>
        <Link href="/translate#lexicon" className="focus-ring underline-offset-4 hover:underline">
          Lexicon
        </Link>
        <a
          href="https://github.com/AntoDono/GenPlus-Translator"
          target="_blank"
          rel="noreferrer"
          className="focus-ring hidden underline-offset-4 hover:underline sm:inline"
        >
          GitHub ↗
        </a>
      </nav>
    </header>
  );
}
