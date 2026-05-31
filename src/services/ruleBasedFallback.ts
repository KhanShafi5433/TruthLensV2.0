import { AnalysisInput, ScamAnalysisResult, SuspiciousPhrase } from "./analysisTypes";
import { scoreToRiskLevel } from "./riskLevelUtils";
import { scoreThreats, findingsToIndicators } from "./analysis/riskScoringEngine";
import { generateExplanations } from "./analysis/explanationEngine";
import { generateRecommendations } from "./analysis/recommendationEngine";
import { ThreatIntelligenceEngine } from "./analysis/threatIntelligenceEngine";
import { CommunityIntelligenceEngine } from "./intelligence/communityIntelligence";

type PhraseRule = {
  patterns: string[];
  reason: string;
  weight: number;
};

const PHRASE_RULES: PhraseRule[] = [
  {
    patterns: ["urgent", "immediately", "act now", "right away", "asap", "within 24", "expires"],
    reason: "Creates time pressure so you act before verifying.",
    weight: 12,
  },
  {
    patterns: [
      "suspend",
      "suspended",
      "locked",
      "lockout",
      "restricted",
      "account closed",
      "asset suspension",
    ],
    reason: "Uses account fear to push you into quick compliance.",
    weight: 14,
  },
  {
    patterns: ["wire", "gift card", "bitcoin", "crypto", "pay now", "transfer", "refund fee"],
    reason: "Asks for money or payment in ways common in scams.",
    weight: 16,
  },
  {
    patterns: [
      "otp",
      "verification code",
      "password",
      "pin",
      "verify your account",
      "confirm your identity",
    ],
    reason: "Requests sensitive codes or credentials, which legitimate services rarely ask for by message.",
    weight: 18,
  },
  {
    patterns: [
      "tested positive",
      "self-isolate",
      "covid",
      "covid-19",
      "exposed",
      "alert",
      "claim",
      "kyc",
      "courier",
      "delivery failed",
    ],
    reason: "Uses health, identity, or delivery concern to push the reader toward a link or action.",
    weight: 14,
  },
  {
    patterns: [
      "irs",
      "your bank",
      "paypal",
      "amazon",
      "microsoft",
      "support team",
      "security department",
      "customs",
    ],
    reason: "May impersonate a trusted organization to gain credibility.",
    weight: 10,
  },
];

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findFirstMatch(content: string, patterns: string[]): string | null {
  for (const pattern of patterns) {
    const match = content.match(new RegExp(escapeRegex(pattern), "i"));
    if (match) return match[0];
  }
  return null;
}

function hasSuspiciousLink(text: string): string | null {
  const match = text.match(
    /https?:\/\/[^\s]+|www\.[^\s]+|[a-z0-9-]+\.(com|net|org|io|xyz|info)(?:\/[^\s]*)?/i
  );
  return match ? match[0] : null;
}

function clampScore(score: number): number {
  return Math.min(100, Math.max(0, Math.round(score)));
}

function collectIndicators(content: string): { indicators: SuspiciousPhrase[]; score: number } {
  const indicators: SuspiciousPhrase[] = [];
  const seen = new Set<string>();
  let score = 8;

  for (const rule of PHRASE_RULES) {
    const matched = findFirstMatch(content, rule.patterns);
    if (!matched) continue;
    const key = matched.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    indicators.push({ text: matched, reason: rule.reason });
    score += rule.weight;
  }

  const link = hasSuspiciousLink(content);
  if (link && !seen.has(link.toLowerCase())) {
    indicators.push({
      text: link,
      reason: "Contains a link that should be checked through official channels, not by clicking.",
    });
    score += 28;
  }

  return { indicators, score: clampScore(score) };
}

/**
 * Local fallback when Gemini is unavailable or returns invalid JSON.
 */
export async function analyzeWithRules(input: AnalysisInput): Promise<ScamAnalysisResult> {
  const content = input.content.trim();

  if (!content) {
    return {
      score: 0,
      riskLevel: "Low",
      indicators: [],
      reasoning:
        "No message text was provided to review. Add the exact wording you received before running analysis.",
      advice: "Paste the full message, including links and sender details, then analyze again.",
    };
  }

  const lower = content.toLowerCase();
  const isShortGreeting =
    content.length < 80 &&
    /^(hi|hello|hey|good\s+(morning|afternoon|evening)|how are you)/i.test(lower) &&
    !hasSuspiciousLink(content);

  if (isShortGreeting) {
    return {
      score: 5,
      riskLevel: "Low",
      indicators: [],
      reasoning:
        "The message reads like a normal greeting with no requests for money, passwords, links, or urgent action.",
      advice: "No action needed unless the conversation later asks for codes, payments, or links.",
    };
  }

  // Use the new advanced threat intelligence engine
  const threatEngine = ThreatIntelligenceEngine.getInstance();
  const threatResult = threatEngine.analyze(content);
  
  // Use community intelligence engine for community-based risk boost
  const communityEngine = CommunityIntelligenceEngine.getInstance();
  const communityResult = await communityEngine.analyzeContent(content);
  
  // Also use the existing scoring system for backward compatibility
  const scoreBreakdown = scoreThreats(content);
  const indicators = findingsToIndicators(scoreBreakdown.findings);
  const explanations = generateExplanations(scoreBreakdown.findings);
  const recommendations = generateRecommendations(scoreBreakdown.findings);
  
  // Use threat intelligence engine results for better accuracy
  const finalScore = Math.max(threatResult.riskScore, scoreBreakdown.score + communityResult.communityRiskBoost);
  const finalRiskLevel = threatResult.severity;
  const finalReasoning = threatResult.explanations.join(". ") + ". " + (explanations.map(e => `${e.title}: ${e.detail}`).join(" ")) + (communityResult.communityWarning ? `. ${communityResult.communityWarning}` : "");
  const finalAdvice = threatResult.recommendations.join(". ") + ". " + (recommendations.map(r => r.detail).join(" "));

  return {
    score: finalScore,
    riskLevel: finalRiskLevel,
    indicators,
    reasoning: finalReasoning || "Analysis completed using advanced scam detection patterns.",
    advice: finalAdvice || "Stay cautious and verify through official channels.",
  };
}
