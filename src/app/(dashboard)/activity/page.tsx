import { requireUser } from "@/lib/auth-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ActivityPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Coding Activity</h1>
      <Card>
        <CardHeader>
          <CardTitle>Weekly commits & skill progress</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--color-muted-foreground)]">
          Activity snapshots + Recharts skill graph render from
          <code className="mx-1 rounded bg-[var(--color-secondary)] px-1">ActivitySnapshot</code> /
          <code className="mx-1 rounded bg-[var(--color-secondary)] px-1">SkillProgress</code> tables.
        </CardContent>
      </Card>
    </div>
  );
}
