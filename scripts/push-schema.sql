-- Dev Portfolio Analyzer — raw DDL for Neon PostgreSQL
-- Paste into: https://console.neon.tech/app/projects/divine-snow-13292795?branchId=br-noisy-cake-au4di43f
-- (SQL Editor -> Run). Mirrors prisma/schema.prisma. Safe to re-run (IF NOT EXISTS).

CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "DevLevel" AS ENUM ('JUNIOR', 'MID', 'SENIOR', 'LEAD');
CREATE TYPE "ReportType" AS ENUM ('PORTFOLIO', 'RESUME', 'CAREER');
CREATE TYPE "SkillCategory" AS ENUM ('LANGUAGE', 'FRAMEWORK', 'TOOLING', 'SOFT', 'DOMAIN');
CREATE TYPE "FeedbackStatus" AS ENUM ('OPEN', 'REVIEWED', 'RESOLVED');

-- Auth
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "image" TEXT,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Account" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMPTZ,
  "refreshTokenExpiresAt" TIMESTAMPTZ,
  "scope" TEXT,
  "idToken" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Account_provider_account_unique" UNIQUE ("providerId", "accountId")
);
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");

CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT PRIMARY KEY,
  "token" TEXT NOT NULL UNIQUE,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");

CREATE TABLE IF NOT EXISTS "Verification" (
  "id" TEXT PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "Verification_identifier_idx" ON "Verification"("identifier");

-- GitHub
CREATE TABLE IF NOT EXISTS "GitHubConnection" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "avatarUrl" TEXT,
  "accessToken" TEXT,
  "scope" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastSyncAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "GitHubConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "GitHubConnection_user_username_unique" UNIQUE ("userId", "username")
);
CREATE INDEX IF NOT EXISTS "GitHubConnection_userId_idx" ON "GitHubConnection"("userId");

CREATE TABLE IF NOT EXISTS "Repository" (
  "id" TEXT PRIMARY KEY,
  "connectionId" TEXT NOT NULL,
  "githubRepoId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "description" TEXT,
  "url" TEXT NOT NULL,
  "language" TEXT,
  "languages" JSONB,
  "starCount" INTEGER NOT NULL DEFAULT 0,
  "forkCount" INTEGER NOT NULL DEFAULT 0,
  "primaryFramework" TEXT,
  "hasReadme" BOOLEAN NOT NULL DEFAULT false,
  "hasTests" BOOLEAN NOT NULL DEFAULT false,
  "hasCI" BOOLEAN NOT NULL DEFAULT false,
  "hasLicense" BOOLEAN NOT NULL DEFAULT false,
  "isDeployed" BOOLEAN NOT NULL DEFAULT false,
  "loc" INTEGER,
  "lastCommitAt" TIMESTAMPTZ,
  "ingestedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Repository_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "GitHubConnection"("id") ON DELETE CASCADE,
  CONSTRAINT "Repository_connection_repo_unique" UNIQUE ("connectionId", "githubRepoId")
);
CREATE INDEX IF NOT EXISTS "Repository_connectionId_idx" ON "Repository"("connectionId");

-- Analysis
CREATE TABLE IF NOT EXISTS "Analysis" (
  "id" TEXT PRIMARY KEY,
  "repositoryId" TEXT NOT NULL UNIQUE,
  "overallScore" INTEGER NOT NULL,
  "hiringReadiness" INTEGER NOT NULL,
  "level" "DevLevel" NOT NULL,
  "repoQuality" INTEGER NOT NULL,
  "commitConsistency" INTEGER NOT NULL,
  "readmeQuality" INTEGER NOT NULL,
  "documentation" INTEGER NOT NULL,
  "complexity" INTEGER NOT NULL,
  "architecture" INTEGER NOT NULL,
  "portfolioCompleteness" INTEGER NOT NULL,
  "deploymentStatus" INTEGER NOT NULL,
  "uiQuality" INTEGER,
  "strengths" JSONB,
  "weaknesses" JSONB,
  "missingProjects" JSONB,
  "recommendedTech" JSONB,
  "raw" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Analysis_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "Analysis_repositoryId_idx" ON "Analysis"("repositoryId");

-- Resume
CREATE TABLE IF NOT EXISTS "Resume" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT 'My Resume',
  "content" TEXT NOT NULL,
  "fileUrl" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "Resume_userId_idx" ON "Resume"("userId");

CREATE TABLE IF NOT EXISTS "ResumeAnalysis" (
  "id" TEXT PRIMARY KEY,
  "resumeId" TEXT NOT NULL UNIQUE,
  "score" INTEGER NOT NULL,
  "strengths" JSONB,
  "weaknesses" JSONB,
  "suggestions" JSONB,
  "missingKeywords" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "ResumeAnalysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE
);

-- Career
CREATE TABLE IF NOT EXISTS "CareerRoadmap" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "level" "DevLevel" NOT NULL,
  "title" TEXT NOT NULL,
  "steps" JSONB,
  "techToLearn" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "CareerRoadmap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "CareerRoadmap_userId_idx" ON "CareerRoadmap"("userId");

-- Reports
CREATE TABLE IF NOT EXISTS "Report" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" "ReportType" NOT NULL,
  "title" TEXT NOT NULL,
  "shareToken" TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "pdfUrl" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "expiresAt" TIMESTAMPTZ,
  CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "Report_userId_idx" ON "Report"("userId");
CREATE INDEX IF NOT EXISTS "Report_shareToken_idx" ON "Report"("shareToken");

-- Activity / Skills
CREATE TABLE IF NOT EXISTS "ActivitySnapshot" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "weekStart" TIMESTAMPTZ NOT NULL,
  "commits" INTEGER NOT NULL DEFAULT 0,
  "pullRequests" INTEGER NOT NULL DEFAULT 0,
  "issues" INTEGER NOT NULL DEFAULT 0,
  "reviews" INTEGER NOT NULL DEFAULT 0,
  "activeDays" INTEGER NOT NULL DEFAULT 0,
  "languages" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "ActivitySnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "ActivitySnapshot_user_week_unique" UNIQUE ("userId", "weekStart")
);
CREATE INDEX IF NOT EXISTS "ActivitySnapshot_userId_idx" ON "ActivitySnapshot"("userId");

CREATE TABLE IF NOT EXISTS "SkillProgress" (
  "id" TEXT PRIMARY KEY,
  "snapshotId" TEXT NOT NULL,
  "skill" TEXT NOT NULL,
  "category" "SkillCategory" NOT NULL,
  "level" INTEGER NOT NULL,
  "trend" DOUBLE PRECISION NOT NULL DEFAULT 0,
  CONSTRAINT "SkillProgress_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "ActivitySnapshot"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "SkillProgress_snapshotId_idx" ON "SkillProgress"("snapshotId");

-- Feedback / AI / Admin
CREATE TABLE IF NOT EXISTS "Feedback" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "rating" INTEGER NOT NULL,
  "message" TEXT,
  "status" "FeedbackStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "Feedback_userId_idx" ON "Feedback"("userId");

CREATE TABLE IF NOT EXISTS "AIUsage" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "feature" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "promptTokens" INTEGER NOT NULL DEFAULT 0,
  "completionTokens" INTEGER NOT NULL DEFAULT 0,
  "costUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "AIUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "AIUsage_userId_idx" ON "AIUsage"("userId");
CREATE INDEX IF NOT EXISTS "AIUsage_createdAt_idx" ON "AIUsage"("createdAt");

CREATE TABLE IF NOT EXISTS "AdminLog" (
  "id" TEXT PRIMARY KEY,
  "adminId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entity" TEXT,
  "entityId" TEXT,
  "meta" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "AdminLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "AdminLog_adminId_idx" ON "AdminLog"("adminId");
