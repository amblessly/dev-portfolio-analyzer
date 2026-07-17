import { requireAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminFeedbackPage() {
  await requireAdmin();
  const feedback = await db.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { name: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
      <Card>
        <CardHeader>
          <CardTitle>Latest feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {feedback.map((f) => (
            <div key={f.id} className="rounded-lg border border-[var(--color-border)] p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{f.user?.name ?? "Anonymous"}</span>
                <span className="text-[var(--color-muted-foreground)]">
                  {"★".repeat(f.rating)}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{f.message}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
