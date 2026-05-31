import { RiskLevel } from "./analysisTypes";

/** Score bands: 0–30 Low, 31–60 Moderate, 61–80 Suspicious, 81–100 High Risk */
export function scoreToRiskLevel(score: number): RiskLevel {
  const s = Math.min(100, Math.max(0, Math.round(score)));
  if (s >= 81) return "High Risk";
  if (s >= 61) return "Suspicious";
  if (s >= 31) return "Moderate";
  return "Low";
}

export function normalizeRiskLevel(level: unknown, score: number): RiskLevel {
  const raw = String(level ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");

  if (raw === "high risk" || raw === "high" || raw === "critical" || raw === "severe") {
    return "High Risk";
  }
  if (raw === "suspicious" || raw === "elevated") return "Suspicious";
  if (raw === "moderate" || raw === "medium") return "Moderate";
  if (raw === "low" || raw === "minimal" || raw === "safe") return "Low";

  return scoreToRiskLevel(score);
}

export type RiskVisualStyle = {
  color: string;
  bg: string;
  borderGlow: string;
  stroke: string;
  statusLabel: string;
};

export function getRiskVisualStyle(level: RiskLevel): RiskVisualStyle {
  switch (level) {
    case "High Risk":
      return {
        color: "text-red-500",
        bg: "bg-red-950/40 border-red-900/30",
        borderGlow: "border-red-500/20 shadow-red-500/5",
        stroke: "stroke-red-500",
        statusLabel: "High risk — do not comply with requests in this message",
      };
    case "Suspicious":
      return {
        color: "text-orange-500",
        bg: "bg-orange-950/40 border-orange-900/30",
        borderGlow: "border-orange-500/20 shadow-orange-500/5",
        stroke: "stroke-orange-500",
        statusLabel: "Suspicious wording — verify before you act",
      };
    case "Moderate":
      return {
        color: "text-amber-500",
        bg: "bg-amber-950/40 border-amber-900/30",
        borderGlow: "border-amber-500/20 shadow-amber-500/5",
        stroke: "stroke-amber-500",
        statusLabel: "Some warning signs — proceed carefully",
      };
    default:
      return {
        color: "text-emerald-500",
        bg: "bg-emerald-950/40 border-emerald-900/30",
        borderGlow: "border-emerald-500/20 shadow-emerald-500/5",
        stroke: "stroke-emerald-500",
        statusLabel: "Low concern based on this text",
      };
  }
}

/** Compact badge classes for history list rows */
export function getHistoryRiskClasses(level: RiskLevel): {
  badge: string;
  icon: string;
} {
  switch (level) {
    case "High Risk":
      return {
        badge: "text-red-400 border-red-900/30",
        icon: "bg-red-950/20 border-red-900/30 text-red-400",
      };
    case "Suspicious":
      return {
        badge: "text-orange-400 border-orange-900/30",
        icon: "bg-orange-950/20 border-orange-900/30 text-orange-400",
      };
    case "Moderate":
      return {
        badge: "text-amber-500 border-amber-950",
        icon: "bg-amber-950/20 border-amber-900/30 text-amber-500",
      };
    default:
      return {
        badge: "text-emerald-400 border-emerald-950",
        icon: "bg-emerald-950/20 border-emerald-900 text-emerald-400",
      };
  }
}
