import { ThreatFinding } from "../analysis/analysisModels";

export interface UrlFinding {
  url: string;
  domain: string;
  score: number;
  warnings: string[];
}

const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly", "shorturl.at", "rb.gy", "shorturl", "tinyurl", "cutt.ly"];
const RISKY_TLDS = ["xyz", "top", "info", "click", "link", "loan", "zip"];
const TRUSTED_BRANDS = ["sbi", "hdfc", "icici", "axis", "paypal", "amazon", "paytm", "phonepe", "googlepay"];

export function extractUrls(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s"'<>]+|www\.[^\s"'<>]+|[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s"'<>]*)?/gi);
  return Array.from(new Set(matches ?? []));
}

function getDomain(url: string): string {
  try {
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    return new URL(normalized).hostname.toLowerCase();
  } catch {
    return url.split("/")[0].toLowerCase();
  }
}

export function analyzeUrlHeuristics(url: string): UrlFinding {
  const domain = getDomain(url);
  const warnings: string[] = [];
  let score = 0;

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(domain)) {
    score += 35;
    warnings.push("Uses an IP address instead of a recognizable domain.");
  }

  if (SHORTENERS.includes(domain.replace(/^www\./, ""))) {
    score += 35;
    warnings.push("Uses a shortened URL commonly used to hide malicious destinations.");
  }

  const tld = domain.split(".").pop() ?? "";
  if (RISKY_TLDS.includes(tld)) {
    score += 20;
    warnings.push(`Uses a higher-risk .${tld} domain.`);
  }

  if (domain.split(".").length > 4) {
    score += 15;
    warnings.push("Has excessive subdomains, which can hide the real domain.");
  }

  const compact = domain.replace(/[^a-z0-9]/g, "");
  const brandLike = TRUSTED_BRANDS.find((brand) => compact.includes(brand) && !domain.endsWith(`${brand}.com`));
  if (brandLike) {
    score += 25;
    warnings.push(`Mentions ${brandLike.toUpperCase()} in a non-official looking domain.`);
  }

  if (warnings.length === 0) warnings.push("No major local URL warning found.");

  return {
    url,
    domain,
    score: Math.min(100, score),
    warnings,
  };
}

export function urlsToThreatFindings(urlFindings: UrlFinding[]): ThreatFinding[] {
  return urlFindings
    .filter((finding) => finding.score > 0)
    .map((finding) => ({
      category: "url",
      label: "Suspicious URL",
      evidence: finding.url,
      explanation: finding.warnings[0] ?? "The URL has suspicious domain traits.",
      weight: Math.min(35, Math.max(15, Math.round(finding.score / 2))),
    }));
}
