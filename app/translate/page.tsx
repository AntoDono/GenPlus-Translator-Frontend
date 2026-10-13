import type { Metadata } from "next";
import Lexicon from "@/components/Lexicon";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import Translator from "@/components/Translator";

export const metadata: Metadata = {
  title: "Translate · Gen+ Translator 🧠🚽",
};

export default function TranslatePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <h1 className="sr-only">Translate English to brainrot and back</h1>
        <Translator />
        <Lexicon />
      </main>
      <SiteFooter />
    </>
  );
}
