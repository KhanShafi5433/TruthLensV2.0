import { ThreatFinding } from "../analysis/analysisModels";
import { checkSafeBrowsing } from "./safeBrowsingService";
import {
  analyzeUrlHeuristics,
  extractUrls,
  UrlFinding,
  urlsToThreatFindings,
} from "./heuristicUrlAnalyzer";

export interface UrlScanResult {
  urls: UrlFinding[];
  maxUrlRisk: number;
  safeBrowsingMatches: number;
  threatFindings: ThreatFinding[];
}

export async function scanUrlsInText(text: string): Promise<UrlScanResult> {
  const rawUrls = extractUrls(text);
  const urls = rawUrls.map(analyzeUrlHeuristics);
  const safeMatches = await checkSafeBrowsing(rawUrls);

  const safeBrowsingFindings: ThreatFinding[] = safeMatches.map((match) => ({
    category: "url",
    label: "Safe Browsing match",
    evidence: match.threat?.url ?? "URL match",
    explanation: `Google Safe Browsing flagged this as ${match.threatType}.`,
    weight: 40,
  }));

  return {
    urls,
    maxUrlRisk: urls.reduce((max, row) => Math.max(max, row.score), 0),
    safeBrowsingMatches: safeMatches.length,
    threatFindings: [...urlsToThreatFindings(urls), ...safeBrowsingFindings],
  };
}
