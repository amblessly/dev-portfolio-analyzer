import { requireAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const [users, analyses, aiUsages, feedback] = await Promise.all([
    db.user.count(),
    db.analysis.count(),
    db.aIUsage.aggregate({ _sum: { costUsd: true, promptTokens: true } }),
    db.feedback.count(),
  ]);

  const stats = [
    { title: "Total users", value: String(users) },
    { title: "Analyses run", value: String(analyses) },
    { title: "AI cost (USD)", value: `$${(aiUsages._sum.costUsd ?? 0).toFixed(2)}` },
    { title: "Feedback items", value: String(feedback) },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[var(--color-muted-foreground)]">
                {s.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tabular-nums">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
