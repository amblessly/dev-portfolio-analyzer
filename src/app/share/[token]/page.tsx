import { notFound } from "next/navigation";
import { db } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreRing } from "@/components/score-ring";

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const report = await db.report.findFirst({
    where: { shareToken: token, isPublic: true },
    include: { user: { select: { name: true } } },
  });
  if (!report) notFound();

  const analyses = await db.analysis.findMany({
    where: { repository: { connection: { userId: report.userId } } },
    include: { repository: true },
    take: 10,
  });

  const avg =
    analyses.length > 0
      ? Math.round(analyses.reduce((a, x) => a + x.overallScore, 0) / analyses.length)
      : 0;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Portfolio Report</h1>
        <p className="mt-1 text-[var(--color-muted-foreground)]">
          Shared by {report.user.name}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Overall</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ScoreRing value={avg} label="Avg score" size={160} />
        </CardContent>
      </Card>
      <div className="mt-4 space-y-3">
        {analyses.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3"
          >
            <div>
              <p className="font-medium">{a.repository.fullName}</p>
              <p className="text-xs text-[var(--color-muted-foreground)]">{a.level}</p>
            </div>
            <span className="text-2xl font-bold tabular-nums">{a.overallScore}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
