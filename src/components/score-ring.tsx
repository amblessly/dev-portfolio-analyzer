import { cn } from "@/lib/utils";

interface ScoreRingProps {
  value: number;
  max?: number;
  size?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

function scoreColor(value: number): string {
  if (value >= 75) return "var(--color-success)";
  if (value >= 50) return "var(--color-warning)";
  return "var(--color-destructive)";
}

export function ScoreRing({
  value,
  max = 100,
  size = 140,
  label,
  sublabel,
  className,
}: ScoreRingProps) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const offset = circumference - (pct / 100) * circumference;
  const color = scoreColor(pct);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums" style={{ color }}>
            {Math.round(value)}
          </span>
          {label && (
            <span className="text-xs text-[var(--color-muted-foreground)]">{label}</span>
          )}
        </div>
      </div>
      {sublabel && (
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{sublabel}</p>
      )}
    </div>
  );
}
