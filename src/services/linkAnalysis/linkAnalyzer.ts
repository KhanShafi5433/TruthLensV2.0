/**
 * Smart Link Analysis Service
 * Implements domain classification and trust score system
 */

export interface LinkAnalysisResult {
  url: string;
  trustScore: number; // 0-100
  trustAssessment: "Trusted" | "Caution Advised" | "Unknown";
  reason: string;
  riskIndicators: string[];
  domainClassification: "trusted" | "unknown" | "suspicious";
}

// List of trusted domains (can be expanded)
const TRUSTED_DOMAINS = [
  "google.com",
  "microsoft.com",
  "apple.com",
  "amazon.com",
  "facebook.com",
  "twitter.com",
  "linkedin.com",
  "github.com",
  "stackoverflow.com",
  "wikipedia.org",
  "reddit.com",
  "youtube.com",
  "netflix.com",
  "spotify.com",
  "adobe.com",
  "oracle.com",
  "ibm.com",
  "salesforce.com",
  "zoom.us",
  "slack.com",
  "dropbox.com",
  "notion.so",
  "figma.com",
  "canva.com",
  "gov.in",
  "gov.uk",
  "gov.au",
  "nasa.gov",
  "who.int",
  "un.org",
];

// Suspicious patterns (only flag when strong indicators exist)
const SUSPICIOUS_PATTERNS = [
  /free.*gift/i,
  /you.*won/i,
  /claim.*reward/i,
  /verify.*account/i,
  /update.*payment/i,
  /urgent.*action/i,
  /limited.*time/i,
  /click.*here.*now/i,
  /\.xyz$/i,
  /\.top$/i,
  /\.tk$/i,
  /\.ml$/i,
  /\.ga$/i,
  /\.cf$/i,
];

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function classifyDomain(domain: string): "trusted" | "unknown" | "suspicious" {
  // Check if it's a trusted domain
  if (TRUSTED_DOMAINS.some(trusted => domain === trusted || domain.endsWith('.' + trusted))) {
    return "trusted";
  }

  // Check for suspicious patterns
  if (SUSPICIOUS_PATTERNS.some(pattern => pattern.test(domain))) {
    return "suspicious";
  }

  return "unknown";
}

function getTrustAssessment(
  classification: "trusted" | "unknown" | "suspicious",
  trustScore: number
): "Trusted" | "Caution Advised" | "Unknown" {
  if (classification === "trusted") return "Trusted";
  if (classification === "suspicious") return "Caution Advised";
  if (trustScore >= 60) return "Unknown";
  return "Caution Advised";
}

function calculateTrustScore(
  domain: string,
  classification: "trusted" | "unknown" | "suspicious"
): number {
  if (classification === "trusted") {
    // Trusted domains get high scores
    return 85 + Math.floor(Math.random() * 15); // 85-100
  }

  if (classification === "suspicious") {
    // Suspicious domains get low scores
    return 10 + Math.floor(Math.random() * 30); // 10-40
  }

  // Unknown domains get moderate scores based on domain characteristics
  let score = 50; // Base score

  // Bonus for common TLDs
  const commonTLDs = ['.com', '.org', '.net', '.edu', '.io'];
  if (commonTLDs.some(tld => domain.endsWith(tld))) {
    score += 10;
  }

  // Bonus for longer domain names (less likely to be random)
  if (domain.length > 10) {
    score += 5;
  }

  // Bonus for HTTPS in original URL
  // (This would be checked in the calling function)

  return Math.min(80, Math.max(30, score));
}

function generateReason(
  domain: string,
  classification: "trusted" | "unknown" | "suspicious",
  trustScore: number
): string {
  if (classification === "trusted") {
    return `Recognized domain with established reputation. Commonly used for legitimate services.`;
  }

  if (classification === "suspicious") {
    return `Domain contains patterns associated with suspicious activity. Exercise caution.`;
  }

  if (trustScore >= 60) {
    return `Domain structure appears standard. Limited reputation data available, but no obvious concerns.`;
  }

  if (trustScore >= 40) {
    return `Domain structure is recognizable but has limited reputation data. Verify before sharing sensitive information.`;
  }

  return `Domain has limited reputation data and uncommon characteristics. Approach with caution.`;
}

function detectRiskIndicators(
  url: string,
  classification: "trusted" | "unknown" | "suspicious"
): string[] {
  const indicators: string[] = [];

  if (classification === "suspicious") {
    indicators.push("Contains suspicious patterns in domain");
  }

  // Check for URL shorteners
  const shortenerDomains = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co'];
  const domain = extractDomain(url);
  if (shortenerDomains.some(shortener => domain.includes(shortener))) {
    indicators.push("URL shortener - destination may be hidden");
  }

  // Check for IP address in URL
  if (/^\d+\.\d+\.\d+\.\d+/.test(domain)) {
    indicators.push("Uses IP address instead of domain name");
  }

  // Check for excessive subdomains
  const subdomainCount = domain.split('.').length - 2;
  if (subdomainCount > 3) {
    indicators.push("Complex subdomain structure");
  }

  return indicators;
}

export function analyzeLink(url: string): LinkAnalysisResult {
  const domain = extractDomain(url);
  const classification = classifyDomain(domain);
  const trustScore = calculateTrustScore(domain, classification);
  const trustAssessment = getTrustAssessment(classification, trustScore);
  const reason = generateReason(domain, classification, trustScore);
  const riskIndicators = detectRiskIndicators(url, classification);

  return {
    url,
    trustScore,
    trustAssessment,
    reason,
    riskIndicators,
    domainClassification: classification,
  };
}

export function formatLinkAnalysis(result: LinkAnalysisResult): string {
  const classificationEmoji = {
    trusted: "✓",
    unknown: "?",
    suspicious: "⚠",
  };

  let response = `**Link Analysis**\n\n`;
  response += `**Trust Assessment:** ${result.trustAssessment} ${classificationEmoji[result.domainClassification]}\n`;
  response += `**Domain:** ${extractDomain(result.url)}\n`;
  response += `**Classification:** ${result.domainClassification.toUpperCase()}\n\n`;
  response += `**Reason:** ${result.reason}\n`;

  if (result.riskIndicators.length > 0) {
    response += `\n**Indicators:**\n`;
    result.riskIndicators.forEach(indicator => {
      response += `• ${indicator}\n`;
    });
  }

  response += `\n**My assessment:** `;
  
  if (result.domainClassification === "trusted") {
    response += "This appears to be a legitimate domain from a known organization. You can likely proceed, but always verify the specific page content.";
  } else if (result.domainClassification === "suspicious") {
    response += "This domain shows patterns associated with suspicious activity. I recommend avoiding this link and verifying through official channels.";
  } else {
    response += "This domain has limited reputation data. I don't see obvious concerns, but I recommend being cautious and verifying the source before sharing sensitive information.";
  }

  return response;
}
