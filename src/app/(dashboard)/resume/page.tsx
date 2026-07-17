import { requireUser } from "@/lib/auth-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ResumePage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Resume Analyzer</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upload or paste your resume</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--color-muted-foreground)]">
          Resume parsing, scoring, and improvement suggestions are wired through
          <code className="mx-1 rounded bg-[var(--color-secondary)] px-1">resumeService</code> +
          <code className="mx-1 rounded bg-[var(--color-secondary)] px-1">aiProvider.analyzeResume</code>.
        </CardContent>
      </Card>
    </div>
  );
}
