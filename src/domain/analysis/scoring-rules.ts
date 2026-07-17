import { clamp } from "@/lib/utils";

// Pure, deterministic scoring functions — no framework or IO dependencies.
// These guarantee score bounds and reduce AI hallucination by blending
// deterministic signals with AI output.

export interface RepoMetrics {
  hasReadme: boolean;
  hasTests: boolean;
  hasCI: boolean;
  hasLicense: boolean;
  isDeployed: boolean;
  readmeLength: number;
  languages: Record<string, number>;
  commitCount: number;
  commitGapStdDev: number; // days std-dev between commits
  loc: number;
  moduleCount: number;
  dependencyCount: number;
  docFiles: number;
}

export function computeRepositoryQualityScore(m: RepoMetrics): number {
  let score = 0;
  if (m.hasReadme) score += 20;
  if (m.hasTests) score += 25;
  if (m.hasCI) score += 20;
  if (m.hasLicense) score += 10;
  if (m.isDeployed) score += 15;
  score += m.moduleCount > 3 ? 10 : m.moduleCount * 3;
  return clamp(score);
}

export function computeCommitConsistencyScore(
  commitCount: number,
  gapStdDev: number,
): number {
  const volume = clamp((commitCount / 100) * 40, 0, 40);
  // Lower std-dev (more regular commits) => higher score.
  const regularity = clamp(60 - gapStdDev * 2, 0, 60);
  return clamp(volume + regularity);
}

export function computeDocumentationScore(m: RepoMetrics): number {
  let score = m.hasReadme ? 30 : 0;
  score += clamp((m.readmeLength / 2000) * 40, 0, 40);
  score += clamp((m.docFiles / 5) * 30, 0, 30);
  return clamp(score);
}

export function computeComplexityScore(m: RepoMetrics): number {
  const locScore = clamp((m.loc / 50000) * 40, 0, 40);
  const moduleScore = clamp((m.moduleCount / 20) * 35, 0, 35);
  const depScore = clamp((m.dependencyCount / 30) * 25, 0, 25);
  return clamp(locScore + moduleScore + depScore);
}

export function computeDeploymentScore(isDeployed: boolean): number {
  return isDeployed ? 100 : 25;
}

const WEIGHTS = {
  repoQuality: 0.18,
  commitConsistency: 0.12,
  readmeQuality: 0.1,
  documentation: 0.12,
  complexity: 0.13,
  architecture: 0.15,
  portfolioCompleteness: 0.1,
  deploymentStatus: 0.1,
} as const;

export interface ScoreBreakdown {
  repoQuality: number;
  commitConsistency: number;
  readmeQuality: number;
  documentation: number;
  complexity: number;
  architecture: number;
  portfolioCompleteness: number;
  deploymentStatus: number;
  uiQuality?: number;
}

export function computeOverallScore(b: ScoreBreakdown): number {
  const weighted =
    b.repoQuality * WEIGHTS.repoQuality +
    b.commitConsistency * WEIGHTS.commitConsistency +
    b.readmeQuality * WEIGHTS.readmeQuality +
    b.documentation * WEIGHTS.documentation +
    b.complexity * WEIGHTS.complexity +
    b.architecture * WEIGHTS.architecture +
    b.portfolioCompleteness * WEIGHTS.portfolioCompleteness +
    b.deploymentStatus * WEIGHTS.deploymentStatus;
  return Math.round(clamp(weighted));
}

export function computeHiringReadiness(
  b: ScoreBreakdown,
  resumeScore?: number,
): number {
  const base = computeOverallScore(b);
  const resumeFactor = resumeScore != null ? resumeScore * 0.25 : 0;
  return Math.round(clamp(base * 0.75 + resumeFactor));
}

export function estimateLevel(overall: number): "JUNIOR" | "MID" | "SENIOR" | "LEAD" {
  if (overall >= 85) return "LEAD";
  if (overall >= 70) return "SENIOR";
  if (overall >= 50) return "MID";
  return "JUNIOR";
}
