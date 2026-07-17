import { NextResponse, type NextRequest } from "next/server";

// Lightweight Arcjet shield + rate limiting when ARCJET_KEY is configured.
// Falls back to passthrough when not set (local dev).
export async function middleware(req: NextRequest) {
  const key = process.env.ARCJET_KEY;
  if (!key) return NextResponse.next();

  try {
    const { default: Arcjet } = await import("@arcjet/next");
    const aj = Arcjet({
      key,
      rules: [
        // shield against common attacks
        { type: "shield" },
        // rate limit 20 req/min per IP on API routes
        ...(req.nextUrl.pathname.startsWith("/api")
          ? [{ type: "rate-limit", max: 20, window: "60s" }]
          : []),
      ],
    } as any);
    const decision = await aj.protect(req);
    if (decision.isDenied()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } catch {
    // never block the app due to security middleware failure
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/admin/:path*"],
};
