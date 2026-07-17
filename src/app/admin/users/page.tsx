import { requireAdmin } from "@/lib/auth-server";
import { db } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Users</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between border-b border-[var(--color-border)] py-2 text-sm last:border-0"
            >
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-[var(--color-muted-foreground)]">{u.email}</p>
              </div>
              <span className="rounded-full bg-[var(--color-secondary)] px-2 py-0.5 text-xs">
                {u.role}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
