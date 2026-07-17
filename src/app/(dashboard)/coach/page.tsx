import { requireUser } from "@/lib/auth-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CareerCoachPage() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">AI Career Coach</h1>
      <Card>
        <CardHeader>
          <CardTitle>Personalized roadmap</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--color-muted-foreground)]">
          Career coaching for <strong>{user.name}</strong> is wired through
          <code className="mx-1 rounded bg-[var(--color-secondary)] px-1">career-coachService</code>.
          Run an analysis first to generate your roadmap. (Feature in active development.)
        </CardContent>
      </Card>
    </div>
  );
}
