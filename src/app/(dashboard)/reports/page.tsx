import { requireUser } from "@/lib/auth-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ReportsPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Export & share</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--color-muted-foreground)]">
          PDF export + public shareable links are generated via
          <code className="mx-1 rounded bg-[var(--color-secondary)] px-1">Report</code> table with
          unguessable <code className="mx-1 rounded bg-[var(--color-secondary)] px-1">shareToken</code>.
        </CardContent>
      </Card>
    </div>
  );
}
