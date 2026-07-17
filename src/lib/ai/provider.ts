import "server-only";
import OpenAI from "openai";
import {
  IAIProvider,
  RepoAnalysisInput,
  RepoAnalysisResult,
  RepoAnalysisResultSchema,
  CoachInput,
  CoachResult,
  CoachResultSchema,
  ResumeInput,
  ResumeResult,
  ResumeResultSchema,
  AIUsageRecord,
} from "@/domain/analysis/ports";
import { db } from "@/lib/db/prisma";
import { env } from "@/config/env";

type ProviderConfig = {
  client: OpenAI | null;
  model: string;
  provider: "openai" | "openrouter";
};

function buildConfig(): ProviderConfig {
  const provider = env.AI_PROVIDER;
  const model = env.MODEL ?? env.AI_MODEL;
  if (provider === "openrouter") {
    return {
      client: env.OPENROUTER_API_KEY
        ? new OpenAI({
            apiKey: env.OPENROUTER_API_KEY,
            baseURL: "https://openrouter.ai/api/v1",
          })
        : null,
      model,
      provider,
    };
  }
  return {
    client: env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null,
    model,
    provider,
  };
}

const SYSTEM_PROMPT =
  "You are a Principal Engineer and Technical Hiring Manager. " +
  "You evaluate developer portfolios with rigor and fairness. " +
  "Always respond with strict JSON matching the requested schema. " +
  "Be specific, actionable, and avoid flattery.";

export class LLMAIProvider implements IAIProvider {
  private cfg = buildConfig();

  private async complete<T>(
    schema: typeof RepoAnalysisResultSchema | typeof CoachResultSchema | typeof ResumeResultSchema,
    userPrompt: string,
    feature: string,
  ): Promise<T> {
    if (!this.cfg.client) {
      throw new Error(
        "AI provider not configured: set OPENAI_API_KEY or OPENROUTER_API_KEY",
      );
    }
    const res = await this.cfg.client.chat.completions.create({
      model: this.cfg.model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = res.choices[0]?.message?.content ?? "{}";
    const parsed = schema.parse(JSON.parse(raw));

    await this.trackUsage({
      feature,
      provider: this.cfg.provider,
      model: this.cfg.model,
      promptTokens: res.usage?.prompt_tokens ?? 0,
      completionTokens: res.usage?.completion_tokens ?? 0,
      costUsd: this.estimateCost(res.usage?.total_tokens ?? 0),
    });

    return parsed as T;
  }

  async analyzeRepository(input: RepoAnalysisInput): Promise<RepoAnalysisResult> {
    const prompt = `Analyze this repository and return scores (0-100), strengths, weaknesses, missing portfolio projects, and recommended technologies.\n\nRepository:\n${JSON.stringify(
      input,
      null,
      2,
    )}`;
    return this.complete<RepoAnalysisResult>(RepoAnalysisResultSchema, prompt, "analysis");
  }

  async coach(input: CoachInput): Promise<CoachResult> {
    const prompt = `Given the developer's repositories and current scores, produce a career roadmap, technologies to learn, and resume suggestions.\n\nData:\n${JSON.stringify(
      input,
      null,
      2,
    )}`;
    return this.complete<CoachResult>(CoachResultSchema, prompt, "coach");
  }

  async analyzeResume(input: ResumeInput): Promise<ResumeResult> {
    const prompt = `Analyze this resume text. Return a score (0-100), strengths, weaknesses, improvement suggestions, and missing industry keywords.\n\nResume:\n${input.content}`;
    return this.complete<ResumeResult>(ResumeResultSchema, prompt, "resume");
  }

  async trackUsage(record: AIUsageRecord): Promise<void> {
    try {
      await db.aIUsage.create({
        data: {
          feature: record.feature,
          provider: record.provider,
          model: record.model,
          promptTokens: record.promptTokens,
          completionTokens: record.completionTokens,
          costUsd: record.costUsd,
        },
      });
    } catch {
      // non-fatal: telemetry should never break the user flow
    }
  }

  private estimateCost(totalTokens: number): number {
    // rough estimate; tune per-model in production
    const per1k = this.cfg.provider === "openrouter" ? 0.0005 : 0.0015;
    return Number(((totalTokens / 1000) * per1k).toFixed(6));
  }
}

export const aiProvider: IAIProvider = new LLMAIProvider();
