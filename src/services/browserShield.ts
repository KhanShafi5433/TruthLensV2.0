import { analyzeUrlHeuristics } from "./urls/heuristicUrlAnalyzer";

export interface BrowserShieldResult {
  url: string;
  riskScore: number;
  riskLevel: "Safe" | "Suspicious" | "High Risk";
  warnings: string[];
  shouldBlock: boolean;
}

export function analyzeUrlForBrowser(url: string): BrowserShieldResult {
  const analysis = analyzeUrlHeuristics(url);
  const shouldBlock = analysis.score >= 60;

  let riskLevel: BrowserShieldResult["riskLevel"] = "Safe";
  if (analysis.score >= 60) riskLevel = "High Risk";
  else if (analysis.score >= 30) riskLevel = "Suspicious";

  return {
    url,
    riskScore: analysis.score,
    riskLevel,
    warnings: analysis.warnings,
    shouldBlock,
  };
}
