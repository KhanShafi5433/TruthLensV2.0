import { ThreatCategory } from "../analysis/analysisModels";

export interface KeywordRule {
  category: ThreatCategory;
  label: string;
  reason: string;
  weight: number;
  keywords: string[];
}

export const MULTILINGUAL_RULES: KeywordRule[] = [
  {
    category: "otp",
    label: "OTP or credential request",
    reason: "Asks for sensitive codes or credentials that should never be shared.",
    weight: 25,
    keywords: ["otp", "one time password", "verification code", "pin", "password", "ओटीपी", "पासवर्ड"],
  },
  {
    category: "urgency",
    label: "Urgency tactic",
    reason: "Creates pressure to act before verifying.",
    weight: 15,
    keywords: ["urgent", "immediately", "act now", "within 24", "expires", "today", "now", "tonight", "@9pm", "@8pm", "@7pm", "@6pm", "@5pm", "@4pm", "@3pm", "@2pm", "@1pm", "@12pm", "@11am", "@10am", "@9am", "final warning", "within 1 hour", "within 2 hours", "within 30 minutes", "तात्काळ", "जल्दी", "लवकर"],
  },
  {
    category: "payment",
    label: "Payment or UPI request",
    reason: "Pushes for payment, transfer, fee, refund, or UPI action.",
    weight: 20,
    keywords: ["upi", "pay now", "transfer", "refund fee", "payment", "clearance fee", "पेमेंट", "पैसे", "भुगतान"],
  },
  {
    category: "impersonation",
    label: "Impersonation attempt",
    reason: "Pretends to be a trusted company, bank, support team, or authority.",
    weight: 20,
    keywords: ["bank support", "security team", "customs", "police", "government", "support team", "बँक", "सरकार"],
  },
  {
    category: "kyc",
    label: "Fake KYC wording",
    reason: "Uses KYC/account update language often seen in bank and wallet scams.",
    weight: 18,
    keywords: ["kyc", "update kyc", "verify account", "account blocked", "खाता बंद", "केवायसी"],
  },
  {
    category: "prize",
    label: "Prize or gift scam language",
    reason: "Promises rewards, lottery, gifts, or claims to lure the user.",
    weight: 18,
    keywords: ["winner", "lottery", "gift", "prize", "claim now", "इनाम", "लॉटरी", "बक्षीस"],
  },
  {
    category: "crypto",
    label: "Crypto scam indicator",
    reason: "Mentions crypto or guaranteed returns, common in investment scams.",
    weight: 22,
    keywords: ["crypto", "bitcoin", "usdt", "guaranteed return", "investment profit"],
  },
  {
    category: "emotional",
    label: "Emotional manipulation",
    reason: "Uses fear, family emergency, health alerts, or panic to influence decisions.",
    weight: 14,
    keywords: ["emergency", "don't tell", "accident", "tested positive", "self-isolate", "मदत", "अपघात"],
  },
  {
    category: "courier",
    label: "Courier or delivery pressure",
    reason: "Uses parcel or delivery failure language to lure users into links/payments.",
    weight: 16,
    keywords: ["courier", "parcel", "delivery failed", "customs fee", "package held"],
  },
  {
    category: "financial_panic",
    label: "Financial panic language",
    reason: "Uses account issues, transaction problems, or money loss fears to create panic.",
    weight: 25,
    keywords: ["withdraw process", "account issue", "transaction pending", "suspicious transfer", "money deducted", "debit alert", "payment failed", "unauthorized transaction", "bank blocked", "account suspended", "account locked", "amount", "rs.", "₹", "balance", "transaction"],
  },
  {
    category: "grammar_manipulation",
    label: "Suspicious grammar patterns",
    reason: "Uses malformed grammar, robotic wording, or suspicious spacing common in scams.",
    weight: 10,
    keywords: ["pls call click", "pls call", "click here", "urgent action", "act immediately", "verify now", "click link", "tap here"],
  },
  {
    category: "unknown_sender",
    label: "Unknown sender impersonation",
    reason: "Financial/banking language from unknown or unrecognized sender.",
    weight: 15,
    keywords: ["from unknown", "unknown number", "private number", "withheld", "anonymous"],
  },
];
