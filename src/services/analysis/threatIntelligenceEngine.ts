import { ThreatFinding } from "./analysisModels";

export interface ThreatSignal {
  type: "shortened_url" | "financial_panic" | "urgency" | "otp_kyc_upi" | "impersonation" | "suspicious_grammar";
  weight: number;
  detected: boolean;
  evidence: string[];
}

export interface ThreatIntelligenceResult {
  riskScore: number;
  confidence: number;
  severity: "Low" | "Moderate" | "Suspicious" | "High Risk";
  detectedThreats: ThreatSignal[];
  explanations: string[];
  recommendations: string[];
}

export class ThreatIntelligenceEngine {
  private static instance: ThreatIntelligenceEngine;

  static getInstance(): ThreatIntelligenceEngine {
    if (!ThreatIntelligenceEngine.instance) {
      ThreatIntelligenceEngine.instance = new ThreatIntelligenceEngine();
    }
    return ThreatIntelligenceEngine.instance;
  }

  analyze(text: string, urlFindings: ThreatFinding[] = []): ThreatIntelligenceResult {
    const signals = this.detectThreatSignals(text, urlFindings);
    const riskScore = this.calculateRiskScore(signals);
    const confidence = this.calculateConfidence(signals, riskScore);
    const severity = this.determineSeverity(riskScore, signals);
    const explanations = this.generateExplanations(signals);
    const recommendations = this.generateRecommendations(signals, severity);

    return {
      riskScore,
      confidence,
      severity,
      detectedThreats: signals,
      explanations,
      recommendations,
    };
  }

  private detectThreatSignals(text: string, urlFindings: ThreatFinding[]): ThreatSignal[] {
    const lowerText = text.toLowerCase();
    const signals: ThreatSignal[] = [];

    // 1. SHORTENED URL - Weight: +35
    const shortenedUrlEvidence = this.detectShortenedUrls(lowerText, urlFindings);
    signals.push({
      type: "shortened_url",
      weight: 35,
      detected: shortenedUrlEvidence.length > 0,
      evidence: shortenedUrlEvidence,
    });

    // 2. FINANCIAL PANIC - Weight: +25
    const financialPanicEvidence = this.detectFinancialPanic(lowerText);
    signals.push({
      type: "financial_panic",
      weight: 25,
      detected: financialPanicEvidence.length > 0,
      evidence: financialPanicEvidence,
    });

    // 3. URGENCY - Weight: +15
    const urgencyEvidence = this.detectUrgency(lowerText);
    signals.push({
      type: "urgency",
      weight: 15,
      detected: urgencyEvidence.length > 0,
      evidence: urgencyEvidence,
    });

    // 4. OTP/KYC/UPI FRAUD - Weight: +30
    const otpEvidence = this.detectOtpKycUpi(lowerText);
    signals.push({
      type: "otp_kyc_upi",
      weight: 30,
      detected: otpEvidence.length > 0,
      evidence: otpEvidence,
    });

    // 5. IMPERSONATION - Weight: +20
    const impersonationEvidence = this.detectImpersonation(lowerText);
    signals.push({
      type: "impersonation",
      weight: 20,
      detected: impersonationEvidence.length > 0,
      evidence: impersonationEvidence,
    });

    // 6. SUSPICIOUS GRAMMAR - Weight: +10
    const grammarEvidence = this.detectSuspiciousGrammar(lowerText);
    signals.push({
      type: "suspicious_grammar",
      weight: 10,
      detected: grammarEvidence.length > 0,
      evidence: grammarEvidence,
    });

    return signals;
  }

  private detectShortenedUrls(text: string, urlFindings: ThreatFinding[]): string[] {
    const evidence: string[] = [];
    const shorteners = ["bit.ly", "tinyurl", "cutt.ly", "rb.gy", "shorturl.at", "is.gd", "t.co", "goo.gl"];

    for (const shortener of shorteners) {
      if (text.includes(shortener)) {
        evidence.push(`Contains shortened URL: ${shortener}`);
      }
    }

    // Also check URL findings
    for (const finding of urlFindings) {
      if (finding.category === "url" || finding.category === "shortened_url") {
        evidence.push(finding.explanation);
      }
    }

    return evidence;
  }

  private detectFinancialPanic(text: string): string[] {
    const evidence: string[] = [];
    const panicPhrases = [
      "withdraw process",
      "account blocked",
      "suspicious transfer",
      "unauthorized transaction",
      "payment failed",
      "debit alert",
      "transaction pending",
      "money deducted",
      "bank blocked",
      "account suspended",
      "account locked",
      "amount",
      "rs.",
      "₹",
      "balance",
      "transaction",
    ];

    for (const phrase of panicPhrases) {
      if (text.includes(phrase)) {
        evidence.push(`Financial panic language: "${phrase}"`);
      }
    }

    return evidence;
  }

  private detectUrgency(text: string): string[] {
    const evidence: string[] = [];
    const urgencyPhrases = [
      "today",
      "immediately",
      "urgent",
      "now",
      "tonight",
      "@9pm",
      "@8pm",
      "@7pm",
      "@6pm",
      "@5pm",
      "@4pm",
      "@3pm",
      "@2pm",
      "@1pm",
      "@12pm",
      "@11am",
      "@10am",
      "@9am",
      "final warning",
      "within 1 hour",
      "within 2 hours",
      "within 30 minutes",
      "expires",
      "act now",
      "act immediately",
      "verify now",
      "click link",
      "tap here",
    ];

    for (const phrase of urgencyPhrases) {
      if (text.includes(phrase)) {
        evidence.push(`Urgency tactic: "${phrase}"`);
      }
    }

    return evidence;
  }

  private detectOtpKycUpi(text: string): string[] {
    const evidence: string[] = [];
    const fraudPhrases = [
      "otp",
      "one time password",
      "verification code",
      "pin",
      "password",
      "kyc",
      "update kyc",
      "verify account",
      "account blocked",
      "upi",
      "upi pin",
      "refund request",
      "collect request",
      "pay now",
      "transfer",
      "payment",
    ];

    for (const phrase of fraudPhrases) {
      if (text.includes(phrase)) {
        evidence.push(`Credential/payment request: "${phrase}"`);
      }
    }

    return evidence;
  }

  private detectImpersonation(text: string): string[] {
    const evidence: string[] = [];
    const impersonationPhrases = [
      "bank support",
      "security team",
      "customs",
      "police",
      "government",
      "support team",
      "income tax",
      "tax department",
      "rbi",
      "bank",
      "official",
      "authority",
    ];

    for (const phrase of impersonationPhrases) {
      if (text.includes(phrase)) {
        evidence.push(`Impersonation attempt: "${phrase}"`);
      }
    }

    return evidence;
  }

  private detectSuspiciousGrammar(text: string): string[] {
    const evidence: string[] = [];
    
    // Check for robotic wording patterns
    if (/pls call click|pls call|click here|urgent action/i.test(text)) {
      evidence.push("Robotic/manipulative wording detected");
    }

    // Check for excessive spacing
    if (/\s{3,}/.test(text)) {
      evidence.push("Unusual spacing patterns");
    }

    // Check for mixed case inconsistencies
    const hasUpper = /[A-Z]/.test(text);
    const hasLower = /[a-z]/.test(text);
    if (hasUpper && hasLower) {
      const upperCount = (text.match(/[A-Z]/g) || []).length;
      const lowerCount = (text.match(/[a-z]/g) || []).length;
      const ratio = upperCount / (upperCount + lowerCount);
      if (ratio > 0.7 || ratio < 0.3) {
        evidence.push("Inconsistent capitalization pattern");
      }
    }

    return evidence;
  }

  private calculateRiskScore(signals: ThreatSignal[]): number {
    let score = 5; // Base score

    for (const signal of signals) {
      if (signal.detected) {
        score += signal.weight;
      }
    }

    // Combined threat escalation
    const hasShortenedUrl = signals.find(s => s.type === "shortened_url")?.detected;
    const hasUrgency = signals.find(s => s.type === "urgency")?.detected;
    const hasFinancialPanic = signals.find(s => s.type === "financial_panic")?.detected;

    if (hasShortenedUrl && hasUrgency && hasFinancialPanic) {
      score = Math.max(score, 80);
    }

    return Math.min(100, Math.max(0, score));
  }

  private calculateConfidence(signals: ThreatSignal[], riskScore: number): number {
    const detectedCount = signals.filter(s => s.detected).length;
    let confidence = detectedCount * 15;

    if (riskScore > 60) {
      confidence += 15;
    }

    return Math.min(98, Math.max(12, confidence));
  }

  private determineSeverity(riskScore: number, signals: ThreatSignal[]): ThreatIntelligenceResult["severity"] {
    // Combined threat escalation forces HIGH_RISK
    const hasShortenedUrl = signals.find(s => s.type === "shortened_url")?.detected;
    const hasUrgency = signals.find(s => s.type === "urgency")?.detected;
    const hasFinancialPanic = signals.find(s => s.type === "financial_panic")?.detected;

    if (hasShortenedUrl && hasUrgency && hasFinancialPanic) {
      return "High Risk";
    }

    if (riskScore >= 75) return "High Risk";
    if (riskScore >= 50) return "Suspicious";
    if (riskScore >= 30) return "Moderate";
    return "Low";
  }

  private generateExplanations(signals: ThreatSignal[]): string[] {
    const explanations: string[] = [];

    for (const signal of signals) {
      if (signal.detected && signal.evidence.length > 0) {
        switch (signal.type) {
          case "shortened_url":
            explanations.push("Contains shortened URL commonly used to hide malicious destinations");
            break;
          case "financial_panic":
            explanations.push("Uses financial panic language to create urgency and fear");
            break;
          case "urgency":
            explanations.push("Employs urgency tactics to pressure immediate action");
            break;
          case "otp_kyc_upi":
            explanations.push("Requests sensitive credentials, OTPs, or payment information");
            break;
          case "impersonation":
            explanations.push("Attempts to impersonate trusted organizations or authorities");
            break;
          case "suspicious_grammar":
            explanations.push("Contains suspicious grammar patterns common in scam messages");
            break;
        }
      }
    }

    return explanations;
  }

  private generateRecommendations(signals: ThreatSignal[], severity: ThreatIntelligenceResult["severity"]): string[] {
    const recommendations: string[] = [];

    if (severity === "High Risk") {
      recommendations.push("Do not click any links in this message");
      recommendations.push("Never share OTP, PIN, or password");
      recommendations.push("Block the sender immediately");
      recommendations.push("Report to cybercrime authorities");
    }

    for (const signal of signals) {
      if (signal.detected) {
        switch (signal.type) {
          case "shortened_url":
            recommendations.push("Verify URLs directly with official sources");
            break;
          case "otp_kyc_upi":
            recommendations.push("Legitimate organizations never ask for OTP via SMS");
            break;
          case "impersonation":
            recommendations.push("Contact the organization directly using official channels");
            break;
          case "financial_panic":
            recommendations.push("Ignore financial threats and verify with your bank");
            break;
        }
      }
    }

    if (recommendations.length === 0) {
      recommendations.push("Stay vigilant and verify suspicious messages");
    }

    return recommendations;
  }
}
