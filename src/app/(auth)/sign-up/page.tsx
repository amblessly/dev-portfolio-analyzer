import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/github-icon";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function signUpAction(formData: FormData) {
    "use server";
    const { auth } = await import("@/lib/auth");
    const { headers } = await import("next/headers");
    const name = String(formData.get("name"));
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    try {
      await auth.api.signUpEmail({
        headers: await headers(),
        body: { name, email, password },
      });
    } catch (err) {
      console.error("[sign-up] failed:", err);
      redirect(`/sign-up?error=exists`);
    }
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Create account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <p className="rounded-lg bg-[color-mix(in_srgb,var(--color-destructive)_15%,transparent)] px-3 py-2 text-sm text-[var(--color-destructive)]">
              Account already exists or registration failed. Try signing in.
            </p>
          )}
          <form action={signUpAction} className="space-y-3">
            <input
              name="name"
              required
              defaultValue="blesdev5"
              placeholder="Full name"
              className="mb-3 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            />
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
              minLength={8}
              defaultValue="12345678"
              placeholder="Password (min 8)"
              className="mb-4 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            />
            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>
          <Button variant="outline" className="w-full" asChild>
            <a href="/api/auth/sign-in/github">
              <GitHubIcon /> Continue with GitHub
            </a>
          </Button>
          <p className="text-center text-sm text-[var(--color-muted-foreground)]">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-[var(--color-primary)] underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
