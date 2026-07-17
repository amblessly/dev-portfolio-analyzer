import { requireUser } from "@/lib/auth-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ChecklistPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Portfolio Checklist</h1>
      <Card>
        <CardHeader>
          <CardTitle>Completeness tracker</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--color-muted-foreground)]">
          Portfolio completeness is computed in
          <code className="mx-1 rounded bg-[var(--color-secondary)] px-1]">scoring-rules.ts</code> and
          surfaced here as a checklist of missing projects & technologies.
        </CardContent>
      </Card>
    </div>
  );
}
