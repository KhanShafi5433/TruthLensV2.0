import { Capacitor } from "@capacitor/core";

export interface CallInfo {
  phoneNumber: string;
  timestamp: number;
  isIncoming: boolean;
}

export interface CallAnalysisResult {
  call: CallInfo;
  riskScore: number;
  riskLevel: "Safe" | "Suspicious" | "High Risk";
  warnings: string[];
  isSpam: boolean;
}

export class CallScamDetectorService {
  private static instance: CallScamDetectorService;
  private isMonitoring = false;
  private spamNumbers = new Set<string>();

  static getInstance(): CallScamDetectorService {
    if (!CallScamDetectorService.instance) {
      CallScamDetectorService.instance = new CallScamDetectorService();
    }
    return CallScamDetectorService.instance;
  }

  async startMonitoring(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.log("Call monitoring only available on Android");
      return false;
    }
    
    // Future: Implement native Android call state listener
    // Requires Android permissions: READ_PHONE_STATE, READ_CALL_LOG
    this.isMonitoring = true;
    return true;
  }

  async stopMonitoring(): Promise<void> {
    this.isMonitoring = false;
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  addSpamNumber(phoneNumber: string): void {
    this.spamNumbers.add(phoneNumber);
  }

  removeSpamNumber(phoneNumber: string): void {
    this.spamNumbers.delete(phoneNumber);
  }

  async analyzeCall(call: CallInfo): Promise<CallAnalysisResult> {
    const warnings: string[] = [];
    let riskScore = 0;

    // Check if number is in spam database
    if (this.spamNumbers.has(call.phoneNumber)) {
      warnings.push("Number reported as spam");
      riskScore += 50;
    }

    // Check for suspicious number patterns
    const suspiciousPatterns = this.detectSuspiciousPatterns(call.phoneNumber);
    warnings.push(...suspiciousPatterns);
    riskScore += suspiciousPatterns.length * 15;

    // Check for international numbers
    if (call.phoneNumber.startsWith("+") && !call.phoneNumber.startsWith("+91")) {
      warnings.push("International number - verify before engaging");
      riskScore += 20;
    }

    // Check for short codes
    if (/^\d{4,5}$/.test(call.phoneNumber)) {
      warnings.push("Short code number - may be premium service");
      riskScore += 10;
    }

    let riskLevel: CallAnalysisResult["riskLevel"] = "Safe";
    if (riskScore >= 50) riskLevel = "High Risk";
    else if (riskScore >= 25) riskLevel = "Suspicious";

    return {
      call,
      riskScore: Math.min(100, riskScore),
      riskLevel,
      warnings,
      isSpam: riskScore >= 50,
    };
  }

  private detectSuspiciousPatterns(phoneNumber: string): string[] {
    const patterns: string[] = [];

    // Check for repeated digits
    if (/(\d)\1{4,}/.test(phoneNumber)) {
      patterns.push("Number has repeated digit pattern");
    }

    // Check for sequential digits
    if (/0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210/.test(phoneNumber)) {
      patterns.push("Number has sequential digit pattern");
    }

    // Check for premium rate prefixes
    if (/^(\+91)?[0-9]{4}00/.test(phoneNumber)) {
      patterns.push("Possible premium rate number");
    }

    return patterns;
  }
}
