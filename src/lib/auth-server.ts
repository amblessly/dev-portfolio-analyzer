import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getSession() {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch (err) {
    // Next.js throws DYNAMIC_SERVER_USAGE when a route uses `headers()`
    // during static generation — it must bubble up so the route opts out
    // of static rendering. Re-throw it; only swallow genuine auth errors.
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      (err as { digest?: string }).digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw err;
    }
    console.error("[auth] getSession failed:", err);
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}
