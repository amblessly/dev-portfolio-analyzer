import { NextResponse } from "next/server";
import { analyzeRepositoryAction } from "@/server/actions/analyze";
import { db } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { payload } = await req.json();
  try {
    const result = await analyzeRepositoryAction(session.user.id, payload);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

export async function GET() {
  // used to warm DB connection / health
  await db.user.count();
  return NextResponse.json({ ok: true });
}
