import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/github-icon";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Create account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form
            action={async (formData: FormData) => {
              "use server";
              const { auth } = await import("@/lib/auth");
              const { headers } = await import("next/headers");
              await auth.api.signUpEmail({
                headers: await headers(),
                body: {
                  name: String(formData.get("name")),
                  email: String(formData.get("email")),
                  password: String(formData.get("password")),
                },
              });
            }}
          >
            <input
              name="name"
              required
              placeholder="Full name"
              className="mb-3 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="mb-3 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
            />
            <input
              name="password"
              type="password"
              required
              minLength={8}
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
