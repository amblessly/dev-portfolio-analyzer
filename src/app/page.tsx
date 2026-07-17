import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_srgb,var(--color-primary)_18%,transparent),transparent)]" />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-lg font-semibold">{siteConfig.name}</span>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Get started</Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-24 pt-20 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-secondary)] px-4 py-1.5 text-sm text-[var(--color-muted-foreground)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
          AI-powered portfolio intelligence
        </div>
        <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl">
          Turn your GitHub into a{" "}
          <span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-info)] bg-clip-text text-transparent">
            hiring-ready portfolio
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-[var(--color-muted-foreground)]">
          {siteConfig.description}
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/sign-up">Start free analysis</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/analyzer">Try the analyzer</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 sm:grid-cols-3">
        {[
          { t: "Portfolio Score", d: "Overall 0–100 quality across 9 dimensions." },
          { t: "Career Coach", d: "Personalized roadmap & tech to learn." },
          { t: "Shareable Report", d: "Export PDF or share a public link." },
        ].map((c) => (
          <div key={c.t} className="glass rounded-[var(--radius)] p-6 shadow-soft">
            <h3 className="font-semibold">{c.t}</h3>
            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{c.d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
