export type ScamCategory =
  | "Banking Scam"
  | "UPI Scam"
  | "KYC Scam"
  | "Lottery Scam"
  | "Job Scam"
  | "Investment Scam"
  | "Crypto Scam"
  | "Social Engineering"
  | "Fake Customer Support"
  | "Unknown Scam";

export interface ScamCategoryResult {
  category: ScamCategory;
  confidence: number;
  keywords: string[];
  reasoning: string;
}

export class ScamCategorizer {
  private static instance: ScamCategorizer;

  static getInstance(): ScamCategorizer {
    if (!ScamCategorizer.instance) {
      ScamCategorizer.instance = new ScamCategorizer();
    }
    return ScamCategorizer.instance;
  }

  private categoryPatterns: Record<ScamCategory, string[]> = {
    "Banking Scam": [
      "account blocked",
      "account suspended",
      "withdraw process",
      "bank account",
      "debit card",
      "credit card",
      "transaction failed",
      "payment failed",
      "bank verification",
      "account verification",
      "atm card",
      "net banking",
    ],
    "UPI Scam": [
      "upi",
      "upi id",
      "upi payment",
      "upi refund",
      "upi request",
      "paytm",
      "phonepe",
      "gpay",
      "google pay",
      "bhim",
      "qr code payment",
      "upi pin",
    ],
    "KYC Scam": [
      "kyc",
      "know your customer",
      "aadhaar",
      "pan card",
      "document verification",
      "identity verification",
      "update kyc",
      "kyc update",
      "aadhaar verification",
      "pan verification",
    ],
    "Lottery Scam": [
      "lottery",
      "prize",
      "winner",
      "jackpot",
      "congratulations",
      "you have won",
      "claim prize",
      "lucky draw",
      "reward",
      "gift",
    ],
    "Job Scam": [
      "job offer",
      "work from home",
      "part time job",
      "earn money",
      "salary",
      "interview",
      "job application",
      "recruitment",
      "hiring",
      "remote job",
    ],
    "Investment Scam": [
      "investment",
      "return",
      "profit",
      "trading",
      "stock",
      "share market",
      "crypto",
      "bitcoin",
      "double your money",
      "guaranteed return",
      "high return",
    ],
    "Crypto Scam": [
      "bitcoin",
      "cryptocurrency",
      "crypto",
      "blockchain",
      "wallet",
      "ethereum",
      "mining",
      "crypto investment",
      "digital currency",
    ],
    "Social Engineering": [
      "urgent",
      "immediately",
      "act now",
      "limited time",
      "expire soon",
      "don't tell anyone",
      "keep secret",
      "confidential",
      "emergency",
      "critical",
    ],
    "Fake Customer Support": [
      "customer care",
      "support",
      "helpline",
      "service center",
      "help desk",
      "customer service",
      "technical support",
      "assistance",
    ],
    "Unknown Scam": [],
  };

  categorize(content: string, detectedUrls: string[] = [], detectedPhone: string = ""): ScamCategoryResult {
    const lowerContent = content.toLowerCase();
    const scores: Record<ScamCategory, number> = {
      "Banking Scam": 0,
      "UPI Scam": 0,
      "KYC Scam": 0,
      "Lottery Scam": 0,
      "Job Scam": 0,
      "Investment Scam": 0,
      "Crypto Scam": 0,
      "Social Engineering": 0,
      "Fake Customer Support": 0,
      "Unknown Scam": 0,
    };

    const matchedKeywords: Record<ScamCategory, string[]> = {
      "Banking Scam": [],
      "UPI Scam": [],
      "KYC Scam": [],
      "Lottery Scam": [],
      "Job Scam": [],
      "Investment Scam": [],
      "Crypto Scam": [],
      "Social Engineering": [],
      "Fake Customer Support": [],
      "Unknown Scam": [],
    };

    // Score based on keyword matches
    for (const [category, patterns] of Object.entries(this.categoryPatterns)) {
      for (const pattern of patterns) {
        if (lowerContent.includes(pattern.toLowerCase())) {
          scores[category as ScamCategory] += 10;
          matchedKeywords[category as ScamCategory].push(pattern);
        }
      }
    }

    // Additional scoring for URLs
    if (detectedUrls.length > 0) {
      scores["Banking Scam"] += 5;
      scores["Social Engineering"] += 5;
    }

    // Additional scoring for phone numbers
    if (detectedPhone) {
      scores["Fake Customer Support"] += 5;
      scores["Social Engineering"] += 5;
    }

    // Find highest scoring category
    let bestCategory: ScamCategory = "Unknown Scam";
    let bestScore = 0;

    for (const [category, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category as ScamCategory;
      }
    }

    // Calculate confidence
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const confidence = totalScore > 0 ? (bestScore / totalScore) * 100 : 0;

    // Generate reasoning
    const keywords = matchedKeywords[bestCategory];
    const reasoning = keywords.length > 0
      ? `Detected keywords: ${keywords.join(", ")}. This pattern matches ${bestCategory} characteristics.`
      : "No specific scam pattern detected. Categorized as Unknown Scam.";

    return {
      category: bestCategory,
      confidence: Math.min(95, Math.max(10, confidence)),
      keywords,
      reasoning,
    };
  }
}
