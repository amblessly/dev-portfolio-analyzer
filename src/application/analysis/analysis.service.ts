import "server-only";
import { db } from "@/lib/db/prisma";
import { aiProvider } from "@/lib/ai/provider";
import {
  RepoAnalysisInput,
  RepoAnalysisResult,
} from "@/domain/analysis/ports";
import {
  RepoMetrics,
  computeRepositoryQualityScore,
  computeDocumentationScore,
  computeComplexityScore,
  computeDeploymentScore,
  computeCommitConsistencyScore,
  computeOverallScore,
  computeHiringReadiness,
  estimateLevel,
} from "@/domain/analysis/scoring-rules";

// Repository pattern: persistence is encapsulated behind repository functions.
export const analysisRepository = {
  async save(repositoryId: string, data: Record<string, unknown>) {
    return db.analysis.upsert({
      where: { repositoryId },
      create: { repositoryId, ...(data as any) },
      update: { ...(data as any) },
    });
  },
  async findByRepository(repositoryId: string) {
    return db.analysis.findUnique({ where: { repositoryId } });
  },
  async findByUser(userId: string) {
    return db.analysis.findMany({
      where: { repository: { connection: { userId } } },
      include: { repository: true },
    });
  },
};

export interface RunAnalysisResult {
  breakdown: {
    repoQuality: number;
    commitConsistency: number;
    readmeQuality: number;
    documentation: number;
    complexity: number;
    architecture: number;
    portfolioCompleteness: number;
    deploymentStatus: number;
  };
  overallScore: number;
  hiringReadiness: number;
  level: "JUNIOR" | "MID" | "SENIOR" | "LEAD";
  ai: RepoAnalysisResult;
}

// Application service: orchestrates deterministic scoring + AI, persists, returns.
export const analysisService = {
  async run(repositoryId: string, input: RepoAnalysisInput): Promise<RunAnalysisResult> {
    const metrics: RepoMetrics = {
      hasReadme: input.hasReadme,
      hasTests: input.hasTests,
      hasCI: input.hasCI,
      hasLicense: input.hasLicense,
      isDeployed: input.isDeployed,
      readmeLength: input.readmeLength ?? 0,
      languages: input.languages ?? {},
      commitCount: input.commitCount,
      commitGapStdDev: 0,
      loc: 0,
      moduleCount: Object.keys(input.languages ?? {}).length,
      dependencyCount: 0,
      docFiles: 0,
    };

    const deterministic = {
      repoQuality: computeRepositoryQualityScore(metrics),
      commitConsistency: computeCommitConsistencyScore(input.commitCount, 0),
      readmeQuality: computeDocumentationScore(metrics),
      documentation: computeDocumentationScore(metrics),
      complexity: computeComplexityScore(metrics),
      architecture: Math.round(
        (computeRepositoryQualityScore(metrics) + computeComplexityScore(metrics)) / 2,
      ),
      portfolioCompleteness: computeRepositoryQualityScore(metrics),
      deploymentStatus: computeDeploymentScore(input.isDeployed),
    };

    // AI augments the deterministic baseline (blended, bounds-enforced).
    const ai = await aiProvider.analyzeRepository(input);

    const merged = {
      repoQuality: Math.round((deterministic.repoQuality + ai.repoQuality) / 2),
      commitConsistency: Math.round(
        (deterministic.commitConsistency + ai.commitConsistency) / 2,
      ),
      readmeQuality: Math.round((deterministic.readmeQuality + ai.readmeQuality) / 2),
      documentation: Math.round((deterministic.documentation + ai.documentation) / 2),
      complexity: Math.round((deterministic.complexity + ai.complexity) / 2),
      architecture: Math.round((deterministic.architecture + ai.architecture) / 2),
      portfolioCompleteness: Math.round(
        (deterministic.portfolioCompleteness + ai.portfolioCompleteness) / 2,
      ),
      deploymentStatus: Math.round(
        (deterministic.deploymentStatus + ai.deploymentStatus) / 2,
      ),
    };

    const overallScore = computeOverallScore(merged);
    const hiringReadiness = computeHiringReadiness(merged);
    const level = estimateLevel(overallScore);

    await analysisRepository.save(repositoryId, {
      overallScore,
      hiringReadiness,
      level,
      ...merged,
      uiQuality: ai.uiQuality ?? null,
      strengths: ai.strengths,
      weaknesses: ai.weaknesses,
      missingProjects: ai.missingProjects,
      recommendedTech: ai.recommendedTech,
      raw: ai,
    });

    return { breakdown: merged, overallScore, hiringReadiness, level, ai };
  },
};
