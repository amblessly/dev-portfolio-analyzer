import "server-only";
import { db } from "@/lib/db/prisma";
import { z } from "zod";
import { analysisService } from "@/application/analysis/analysis.service";

const InputSchema = z.object({
  name: z.string(),
  fullName: z.string(),
  url: z.string(),
  description: z.string().nullish(),
  language: z.string().nullish(),
  languages: z.record(z.number()).optional(),
  stars: z.number().int().nonnegative().default(0),
  forks: z.number().int().nonnegative().default(0),
  hasReadme: z.boolean().default(false),
  hasTests: z.boolean().default(false),
  hasCI: z.boolean().default(false),
  hasLicense: z.boolean().default(false),
  isDeployed: z.boolean().default(false),
  commitCount: z.number().int().nonnegative().default(0),
  recentCommitDates: z.array(z.string()).default([]),
  framework: z.string().nullish(),
  readmeLength: z.number().int().nonnegative().default(0),
});

export type AnalyzeRepoInput = z.infer<typeof InputSchema>;

// Application use-case: persist repo (under user's connection) then run analysis.
export async function analyzeRepositoryAction(
  userId: string,
  raw: unknown,
) {
  const input = InputSchema.parse(raw);

  let connection = await db.gitHubConnection.findFirst({
    where: { userId, username: "manual" },
  });
  if (!connection) {
    connection = await db.gitHubConnection.create({
      data: { userId, username: "manual", isActive: false },
    });
  }

  const repo = await db.repository.upsert({
    where: {
      connectionId_githubRepoId: { connectionId: connection.id, githubRepoId: 0 },
    },
    create: {
      connectionId: connection.id,
      githubRepoId: 0,
      name: input.name,
      fullName: input.fullName,
      description: input.description ?? null,
      url: input.url,
      language: input.language ?? null,
      languages: input.languages ?? undefined,
      starCount: input.stars,
      forkCount: input.forks,
      hasReadme: input.hasReadme,
      hasTests: input.hasTests,
      hasCI: input.hasCI,
      hasLicense: input.hasLicense,
      isDeployed: input.isDeployed,
      primaryFramework: input.framework ?? null,
      lastCommitAt: input.recentCommitDates[0]
        ? new Date(input.recentCommitDates[0])
        : null,
      ingestedAt: new Date(),
    },
    update: {
      name: input.name,
      fullName: input.fullName,
      description: input.description ?? null,
      url: input.url,
      language: input.language ?? null,
      languages: input.languages ?? undefined,
      starCount: input.stars,
      forkCount: input.forks,
      hasReadme: input.hasReadme,
      hasTests: input.hasTests,
      hasCI: input.hasCI,
      hasLicense: input.hasLicense,
      isDeployed: input.isDeployed,
      primaryFramework: input.framework ?? null,
      lastCommitAt: input.recentCommitDates[0]
        ? new Date(input.recentCommitDates[0])
        : null,
    },
  });

  return analysisService.run(repo.id, input);
}
