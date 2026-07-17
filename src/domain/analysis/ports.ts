// Domain ports for AI — framework-agnostic interfaces.
import { z } from "zod";

export const RepoAnalysisResultSchema = z.object({
  repoQuality: z.number().min(0).max(100),
  commitConsistency: z.number().min(0).max(100),
  readmeQuality: z.number().min(0).max(100),
  documentation: z.number().min(0).max(100),
  complexity: z.number().min(0).max(100),
  architecture: z.number().min(0).max(100),
  portfolioCompleteness: z.number().min(0).max(100),
  deploymentStatus: z.number().min(0).max(100),
  uiQuality: z.number().min(0).max(100).optional(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  missingProjects: z.array(z.string()),
  recommendedTech: z.array(z.string()),
  summary: z.string(),
});
export type RepoAnalysisResult = z.infer<typeof RepoAnalysisResultSchema>;

export const CoachResultSchema = z.object({
  level: z.enum(["JUNIOR", "MID", "SENIOR", "LEAD"]),
  roadmap: z.array(
    z.object({
      phase: z.string(),
      title: z.string(),
      description: z.string(),
      resources: z.array(z.string()),
    }),
  ),
  techToLearn: z.array(z.string()),
  resumeSuggestions: z.array(z.string()),
});
export type CoachResult = z.infer<typeof CoachResultSchema>;

export const ResumeResultSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  missingKeywords: z.array(z.string()),
});
export type ResumeResult = z.infer<typeof ResumeResultSchema>;

export interface RepoAnalysisInput {
  name: string;
  description?: string | null;
  language?: string | null;
  languages?: Record<string, number>;
  stars: number;
  forks: number;
  hasReadme: boolean;
  hasTests: boolean;
  hasCI: boolean;
  hasLicense: boolean;
  isDeployed: boolean;
  commitCount: number;
  recentCommitDates: string[];
  framework?: string | null;
  readmeLength?: number;
}

export interface CoachInput {
  username: string;
  repositories: { name: string; language?: string | null; stars: number }[];
  scores: Record<string, number>;
}

export interface ResumeInput {
  content: string;
}

export interface AIUsageRecord {
  feature: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
}

export interface IAIProvider {
  analyzeRepository(input: RepoAnalysisInput): Promise<RepoAnalysisResult>;
  coach(input: CoachInput): Promise<CoachResult>;
  analyzeResume(input: ResumeInput): Promise<ResumeResult>;
  trackUsage?(record: AIUsageRecord): Promise<void>;
}
