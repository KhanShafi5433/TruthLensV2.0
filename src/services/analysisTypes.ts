export type RiskLevel = "Low" | "Moderate" | "Suspicious" | "High Risk";

export type ImageCategory =
  | "SMS screenshot"
  | "email screenshot"
  | "payment screenshot"
  | "WhatsApp chat"
  | "QR/payment scam"
  | "phishing attempt"
  | "fake alert"
  | "suspicious link"
  | "normal harmless image";

export interface ImageAttachment {
  base64: string;
  mimeType: string;
  /** Blob URL for UI preview only — not persisted to Firestore */
  previewUrl?: string;
}

export interface SuspiciousPhrase {
  /** Exact or close substring from the analyzed message */
  text: string;
  /** Plain-language explanation of why this phrase matters */
  reason: string;
}

export interface ScamAnalysisResult {
  score: number;
  riskLevel: RiskLevel;
  indicators: SuspiciousPhrase[];
  reasoning: string;
  advice: string;
  viralAnalysis?: {
    viralityRisk: "Low" | "Medium" | "High";
    misleadingPotential: "Yes" | "No" | "Partial";
    emotionalManipulation: "High" | "Medium" | "Low";
    explanation: {
      whyItMaySpread: string;
      misleadingFactors: string[];
      missingContext: string[];
      sensationalElements: string[];
    };
  };
}

export interface AnalysisInput {
  type: "audio" | "video" | "screenshot" | "text";
  title: string;
  subtitle: string;
  content: string;
  fileName?: string;
  image?: ImageAttachment;
  imageCategory?: ImageCategory;
  viralMode?: boolean;
}

export interface ContentAnalysisOutput {
  analysis: ScamAnalysisResult;
  /** Merged into AnalysisInput when building the report (e.g. vision extracted text). */
  enrichedInput?: Partial<AnalysisInput>;
}

export interface AnalysisReport {
  id: string;
  input: AnalysisInput;
  analysis: ScamAnalysisResult;
  createdAt: string;
}
