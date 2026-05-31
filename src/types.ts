import type { RiskLevel } from "./services/analysisTypes";

export type MediaFileType = "audio" | "video" | "screenshot" | "text";

export type { RiskLevel };

/** Educational demo samples — analysis scores are computed at runtime, not stored here. */
export interface DemoScenario {
  id: string;
  title: string;
  subtitle: string;
  type: MediaFileType;
  fileDetails?: {
    name: string;
    size: string;
    duration?: string;
  };
  sampleContent: string;
}

/** Scan row shown in history lists (backed by Firestore `scans` collection). */
export interface HistoryItem {
  id: string;
  previewText: string;
  riskScore: number;
  riskLevel: RiskLevel;
  timestamp: string;
  reportId: string;
}

export interface SecurityTip {
  id: string;
  title: string;
  category: "Deepfake Voice" | "Video Manipulations" | "Urgency Traps" | "Impersonation";
  summary: string;
  guidelines: string[];
}

export type ScreenState =
  | "SPLASH"
  | "LOGIN"
  | "REGISTER"
  | "HOME"
  | "LOADING"
  | "RESULT"
  | "THREAT_EXPLANATIONS"
  | "HISTORY"
  | "CHAT_ASSISTANT"
  | "QR_SCANNER"
  | "DEEPFAKE_DETECTOR"
  | "COMMUNITY_FEED"
  | "ELDER_MODE";
