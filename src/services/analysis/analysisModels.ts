import { RiskLevel } from "../analysisTypes";

export type ThreatCategory =
  | "urgency"
  | "otp"
  | "url"
  | "payment"
  | "impersonation"
  | "emotional"
  | "kyc"
  | "prize"
  | "crypto"
  | "threat"
  | "health"
  | "courier"
  | "shortened_url"
  | "financial_panic"
  | "grammar_manipulation"
  | "unknown_sender";

export interface ThreatFinding {
  category: ThreatCategory;
  label: string;
  evidence: string;
  explanation: string;
  weight: number;
}

export interface RiskScoreBreakdown {
  score: number;
  riskLevel: RiskLevel;
  confidence: number;
  findings: ThreatFinding[];
}

export interface ExplanationItem {
  title: string;
  detail: string;
  evidence?: string;
  category: ThreatCategory;
}

export interface SafetyRecommendation {
  title: string;
  detail: string;
  severity: "info" | "warning" | "danger";
  actionType: "avoid" | "block" | "verify" | "report" | "contact" | "copy";
}
