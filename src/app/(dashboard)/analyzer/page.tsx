import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-server";
import { AnalyzerClient } from "@/features/analysis/analyzer-client";

export default async function AnalyzerPage() {
  const user = await requireUser();
  return <AnalyzerClient userId={user.id} />;
}
