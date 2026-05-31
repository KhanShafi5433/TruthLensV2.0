import { Capacitor } from "@capacitor/core";

export interface SMSMessage {
  id: string;
  sender: string;
  body: string;
  timestamp: number;
}

export interface SMSAnalysisResult {
  message: SMSMessage;
  riskScore: number;
  riskLevel: "Safe" | "Suspicious" | "High Risk";
  warnings: string[];
}

export class SMSScannerService {
  private static instance: SMSScannerService;
  private isMonitoring = false;

  static getInstance(): SMSScannerService {
    if (!SMSScannerService.instance) {
      SMSScannerService.instance = new SMSScannerService();
    }
    return SMSScannerService.instance;
  }

  async startMonitoring(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.log("SMS monitoring only available on Android");
      return false;
    }
    
    // Future: Implement native Android SMS listener
    // Requires Android permissions: RECEIVE_SMS, READ_SMS
    this.isMonitoring = true;
    return true;
  }

  async stopMonitoring(): Promise<void> {
    this.isMonitoring = false;
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  async analyzeSMS(message: SMSMessage): Promise<SMSAnalysisResult> {
    // Import dynamically to avoid circular dependencies
    const { scoreThreats } = await import("./analysis/riskScoringEngine");
    const scoreBreakdown = scoreThreats(message.body);

    let riskLevel: SMSAnalysisResult["riskLevel"] = "Safe";
    if (scoreBreakdown.score >= 60) riskLevel = "High Risk";
    else if (scoreBreakdown.score >= 30) riskLevel = "Suspicious";

    return {
      message,
      riskScore: scoreBreakdown.score,
      riskLevel,
      warnings: scoreBreakdown.findings.map(f => f.explanation),
    };
  }
}
