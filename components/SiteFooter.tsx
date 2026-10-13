export default function SiteFooter() {
  return (
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
  );
}
