export const siteConfig = {
  name: "Dev Portfolio Analyzer",
  description:
    "AI-powered analysis of your GitHub portfolio — scores, career coaching, and a hiring-readiness roadmap.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  links: {
    github: "https://github.com",
    twitter: "https://twitter.com",
  },
} as const;

export type NavItem = {
  title: string;
  href: string;
  icon: string;
  description?: string;
};

export const dashboardNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "Repository Analyzer", href: "/analyzer", icon: "ScanSearch" },
  { title: "AI Career Coach", href: "/coach", icon: "Sparkles" },
  { title: "Resume Analyzer", href: "/resume", icon: "FileText" },
  { title: "Portfolio Checklist", href: "/checklist", icon: "CheckSquare" },
  { title: "Activity", href: "/activity", icon: "Activity" },
  { title: "Reports", href: "/reports", icon: "FileBarChart" },
];

export const adminNav: NavItem[] = [
  { title: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
  { title: "Users", href: "/admin/users", icon: "Users" },
  { title: "Feedback", href: "/admin/feedback", icon: "MessageSquare" },
];
