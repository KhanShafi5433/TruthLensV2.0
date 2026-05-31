import { SuspiciousPhrase } from "../analysisTypes";
import { scoreToRiskLevel } from "../riskLevelUtils";
import { MULTILINGUAL_RULES } from "../multilingual/keywordDictionaries";
import { ThreatFinding, RiskScoreBreakdown } from "./analysisModels";
import { extractUrls, analyzeUrlHeuristics, urlsToThreatFindings } from "../urls/heuristicUrlAnalyzer";

function findKeyword(text: string, keyword: string): string | null {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(escaped, "i"));
  return match?.[0] ?? null;
}

export function collectThreatFindings(text: string): ThreatFinding[] {
  const findings: ThreatFinding[] = [];
  const seen = new Set<string>();

  for (const rule of MULTILINGUAL_RULES) {
    const evidence = rule.keywords.map((keyword) => findKeyword(text, keyword)).find(Boolean);
    if (!evidence) continue;

    const key = `${rule.category}:${evidence.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    findings.push({
      category: rule.category,
      label: rule.label,
      evidence,
      explanation: rule.reason,
      weight: rule.weight,
    });
  }

  return findings;
}

export function collectUrlFindings(text: string): ThreatFinding[] {
  const urls = extractUrls(text);
  const urlFindings = urls.map(analyzeUrlHeuristics);
  return urlsToThreatFindings(urlFindings);
}

export function scoreThreats(
  text: string,
  extraFindings: ThreatFinding[] = []
): RiskScoreBreakdown {
  const textFindings = collectThreatFindings(text);
  const urlFindings = collectUrlFindings(text);
  const findings = [...textFindings, ...urlFindings, ...extraFindings];

  // Check for combined risk boost conditions
  const hasShortenedUrl = findings.some(f => f.category === "url" || f.category === "shortened_url");
  const hasFinancialPanic = findings.some(f => f.category === "financial_panic");

  let rawScore = findings.reduce((sum, finding) => sum + finding.weight, findings.length ? 8 : 5);

  // Apply combined risk boost
  if (hasShortenedUrl && hasFinancialPanic) {
    rawScore = Math.max(rawScore, 75);
  }

  const score = Math.min(100, Math.max(0, Math.round(rawScore)));
  const confidence = Math.min(98, Math.max(12, findings.length * 18 + (score > 60 ? 18 : 0)));

  let riskLevel = scoreToRiskLevel(score);

  // Force HIGH_RISK if combined risk boost conditions are met
  if (hasShortenedUrl && hasFinancialPanic) {
    riskLevel = "High Risk";
  }

  return {
    score,
    riskLevel,
    confidence,
    findings,
  };
}

export function findingsToIndicators(findings: ThreatFinding[]): SuspiciousPhrase[] {
  return findings.slice(0, 10).map((finding) => ({
    text: finding.evidence,
    reason: finding.explanation,
  }));
}
