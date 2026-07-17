import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-server";
import { db } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreRing } from "@/components/score-ring";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const user = await requireUser();

  const [analyses, roadmaps, reports] = await Promise.all([
    db.analysis.findMany({
      where: { repository: { connection: { userId: user.id } } },
      include: { repository: true },
      orderBy: { overallScore: "desc" },
      take: 5,
    }),
    db.careerRoadmap.count({ where: { userId: user.id } }),
    db.report.count({ where: { userId: user.id } }),
  ]);

  const avgScore =
    analyses.length > 0
      ? Math.round(
          analyses.reduce((a, x) => a + x.overallScore, 0) / analyses.length,
        )
      : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}</h1>
          <p className="mt-1 text-[var(--color-muted-foreground)]">
            Your portfolio intelligence at a glance.
          </p>
        </div>
        <Button asChild>
          <Link href="/analyzer">
            Analyze repository <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[var(--color-muted-foreground)]">
              Avg Portfolio Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreRing value={avgScore} size={110} />
          </CardContent>
        </Card>
        <StatCard title="Repositories analyzed" value={String(analyses.length)} />
        <StatCard title="Career roadmaps" value={String(roadmaps)} />
        <StatCard title="Reports generated" value={String(reports)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent analyses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analyses.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No repositories analyzed yet. Connect GitHub or paste a repo URL to begin.
            </p>
          ) : (
            analyses.map((a) => (
              <Link
                key={a.id}
                href={`/analyzer/${a.repositoryId}`}
                className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3 transition-colors hover:bg-[var(--color-accent)]"
              >
                <div>
                  <p className="font-medium">{a.repository.fullName}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    {a.level} · Hiring readiness {a.hiringReadiness}
                  </p>
                </div>
                <span className="text-2xl font-bold tabular-nums">{a.overallScore}</span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-[var(--color-muted-foreground)]">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
