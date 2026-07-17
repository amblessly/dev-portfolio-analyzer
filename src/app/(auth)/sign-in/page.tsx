import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/github-icon";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function signInAction(formData: FormData) {
    "use server";
    const { auth } = await import("@/lib/auth");
    const { headers } = await import("next/headers");
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    try {
      await auth.api.signInEmail({
        headers: await headers(),
        body: { email, password },
      });
    } catch (err) {
      console.error("[sign-in] failed:", err);
      redirect(`/sign-in?error=invalid`);
    }
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <p className="rounded-lg bg-[color-mix(in_srgb,var(--color-destructive)_15%,transparent)] px-3 py-2 text-sm text-[var(--color-destructive)]">
              Invalid email or password.
            </p>
          )}
          <form action={signInAction} className="space-y-3">
            <input
              name="email"
              type="email"
              required
              defaultValue="blesdev5@gmail.com"
              placeholder="you@example.com"
              className="mb-3 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            />
            <input
              name="password"
              type="password"
              required
              defaultValue="12345678"
              placeholder="Password"
              className="mb-4 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            />
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
          <Button variant="outline" className="w-full" asChild>
            <a href="/api/auth/sign-in/github">
              <GitHubIcon /> Continue with GitHub
            </a>
          </Button>
          <p className="text-center text-sm text-[var(--color-muted-foreground)]">
            No account?{" "}
            <Link href="/sign-up" className="text-[var(--color-primary)] underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
