import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  ScanSearch,
  Sparkles,
  FileText,
  CheckSquare,
  Activity,
  FileBarChart,
  BarChart3,
  Users,
  MessageSquare,
  LogOut,
  Github,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth-server";
import { dashboardNav, adminNav, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  ScanSearch,
  Sparkles,
  FileText,
  CheckSquare,
  Activity,
  FileBarChart,
  BarChart3,
  Users,
  MessageSquare,
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-card)]/60 px-3 py-4 lg:flex">
        <div className="px-3 py-2 text-base font-semibold">{siteConfig.name}</div>
        <nav className="mt-4 flex flex-1 flex-col gap-1">
          {dashboardNav.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-foreground)]"
              >
                {Icon && <Icon className="size-4" />}
                {item.title}
              </Link>
            );
          })}
          {isAdmin && (
            <>
              <div className="mt-4 px-3 text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                Admin
              </div>
              {adminNav.map((item) => {
                const Icon = iconMap[item.icon];
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-foreground)]"
                  >
                    {Icon && <Icon className="size-4" />}
                    {item.title}
                  </Link>
                );
              })}
            </>
          )}
        </nav>
        <form
          action={async () => {
            "use server";
            const { auth } = await import("@/lib/auth");
            const { headers } = await import("next/headers");
            await auth.api.signOut({ headers: await headers() });
            redirect("/sign-in");
          }}
        >
          <Button type="submit" variant="ghost" className="w-full justify-start">
            <LogOut className="size-4" />
            Sign out
          </Button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <div className="flex items-center gap-2">
            <Github className="size-5 text-[var(--color-muted-foreground)]" />
            <span className="text-sm text-[var(--color-muted-foreground)]">
              {user.name}
            </span>
          </div>
          <span className="text-xs text-[var(--color-muted-foreground)]">
            {user.role}
          </span>
        </header>
        <main className={cn("flex-1 px-6 py-8")}>{children}</main>
      </div>
    </div>
  );
}
