"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/score-ring";

interface Result {
  breakdown: Record<string, number>;
  overallScore: number;
  hiringReadiness: number;
  level: string;
  ai: {
    strengths: string[];
    weaknesses: string[];
    missingProjects: string[];
    recommendedTech: string[];
    summary: string;
  };
}

const emptyForm = {
  fullName: "",
  url: "",
  language: "",
  stars: "0",
  hasReadme: false,
  hasTests: false,
  hasCI: false,
  hasLicense: false,
  isDeployed: false,
  commitCount: "0",
};

export function AnalyzerClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [form, setForm] = React.useState(emptyForm);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<Result | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const name = form.fullName.split("/").pop() || form.fullName;
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          payload: {
            name,
            fullName: form.fullName,
            url: form.url,
            language: form.language || null,
            stars: Number(form.stars) || 0,
            hasReadme: form.hasReadme,
            hasTests: form.hasTests,
            hasCI: form.hasCI,
            hasLicense: form.hasLicense,
            isDeployed: form.isDeployed,
            commitCount: Number(form.commitCount) || 0,
          },
        }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = (await res.json()) as Result;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Repository Analyzer</h1>
        <p className="mt-1 text-[var(--color-muted-foreground)]">
          Paste a repository URL or connect GitHub to get an AI-driven score.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name (owner/repo)">
              <input
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="vercel/next.js"
                className={inputCls}
              />
            </Field>
            <Field label="Repository URL">
              <input
                required
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://github.com/owner/repo"
                className={inputCls}
              />
            </Field>
            <Field label="Primary language">
              <input
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                placeholder="TypeScript"
                className={inputCls}
              />
            </Field>
            <Field label="Stars">
              <input
                type="number"
                value={form.stars}
                onChange={(e) => setForm({ ...form, stars: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Commit count">
              <input
                type="number"
                value={form.commitCount}
                onChange={(e) => setForm({ ...form, commitCount: e.target.value })}
                className={inputCls}
              />
            </Field>
            <div className="flex flex-wrap content-end gap-4">
              {(["hasReadme", "hasTests", "hasCI", "hasLicense", "isDeployed"] as const).map(
                (k) => (
                  <label key={k} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form[k]}
                      onChange={(e) => setForm({ ...form, [k]: e.target.checked })}
                    />
                    {k.replace("has", "Has ").replace("isDeployed", "Deployed")}
                  </label>
                ),
              )}
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Analyzing…" : "Run analysis"}
              </Button>
            </div>
            {error && <p className="sm:col-span-2 text-sm text-[var(--color-destructive)]">{error}</p>}
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-8">
              <ScoreRing value={result.overallScore} label="Overall" />
              <ScoreRing value={result.hiringReadiness} label="Hiring ready" />
              <div className="text-sm">
                <p className="text-[var(--color-muted-foreground)]">Estimated level</p>
                <p className="text-2xl font-bold">{result.level}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Section title="Strengths" items={result.ai.strengths} tone="success" />
              <Section title="Weaknesses" items={result.ai.weaknesses} tone="destructive" />
              <Section title="Missing projects" items={result.ai.missingProjects} />
              <Section title="Recommended tech" items={result.ai.recommendedTech} tone="info" />
            </div>

            <p className="text-sm text-[var(--color-muted-foreground)]">{result.ai.summary}</p>
            <Button variant="outline" onClick={() => router.refresh()}>
              View in dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-[var(--color-muted-foreground)]">{label}</span>
      {children}
    </label>
  );
}

function Section({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone?: "success" | "destructive" | "info";
}) {
  const color =
    tone === "success"
      ? "var(--color-success)"
      : tone === "destructive"
        ? "var(--color-destructive)"
        : tone === "info"
          ? "var(--color-info)"
          : "var(--color-foreground)";
  return (
    <div className="rounded-lg border border-[var(--color-border)] p-4">
      <p className="mb-2 text-sm font-medium" style={{ color }}>
        {title}
      </p>
      <ul className="space-y-1 text-sm">
        {items.map((it, i) => (
          <li key={i} className="text-[var(--color-muted-foreground)]">
            • {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
