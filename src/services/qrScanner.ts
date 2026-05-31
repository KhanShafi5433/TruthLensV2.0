import { analyzeUrlHeuristics, extractUrls } from "./urls/heuristicUrlAnalyzer";

export interface QRScanResult {
  data: string;
  type: "url" | "text" | "upi" | "phone" | "email" | "other";
  riskScore: number;
  riskLevel: "Safe" | "Suspicious" | "High Risk";
  warnings: string[];
  extractedUrl?: string;
  upiDetails?: {
    pa: string; // payee address
    pn?: string; // payee name
    am?: string; // amount
    cu?: string; // currency
  };
}

export function analyzeQRData(data: string): QRScanResult {
  const warnings: string[] = [];
  let riskScore = 0;
  let type: QRScanResult["type"] = "other";
  let extractedUrl: string | undefined;
  let upiDetails: QRScanResult["upiDetails"] | undefined;

  // Detect UPI payment links
  if (data.toLowerCase().startsWith("upi://")) {
    type = "upi";
    const upiParams = parseUPIParams(data);
    upiDetails = upiParams;

    // Check for suspicious UPI patterns
    if (upiParams.pa && !isValidUPIAddress(upiParams.pa)) {
      warnings.push("Suspicious UPI address format");
      riskScore += 30;
    }

    if (upiParams.am && parseFloat(upiParams.am) > 50000) {
      warnings.push("Unusually high payment amount");
      riskScore += 20;
    }

    if (!upiParams.pn) {
      warnings.push("Missing payee name - suspicious");
      riskScore += 15;
    }
  }

  // Detect URLs
  const urls = extractUrls(data);
  if (urls.length > 0) {
    type = "url";
    extractedUrl = urls[0];
    const urlAnalysis = analyzeUrlHeuristics(urls[0]);
    riskScore += urlAnalysis.score;
    warnings.push(...urlAnalysis.warnings);
  }

  // Detect phone numbers
  if (/^(\+?\d{1,3}[- ]?)?\d{10}$/.test(data.trim())) {
    type = "phone";
    // Check for suspicious country codes or patterns
    if (data.startsWith("+") && !data.startsWith("+91")) {
      warnings.push("International number - verify before calling");
      riskScore += 15;
    }
  }

  // Detect email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)) {
    type = "email";
    // Check for suspicious email domains
    const domain = data.split("@")[1]?.toLowerCase();
    const suspiciousDomains = ["tempmail.com", "throwaway.email", "guerrillamail.com"];
    if (suspiciousDomains.some(d => domain?.includes(d))) {
      warnings.push("Temporary email address - suspicious");
      riskScore += 25;
    }
  }

  // Default text analysis
  if (type === "other") {
    const lowerData = data.toLowerCase();
    if (lowerData.includes("otp") || lowerData.includes("password")) {
      warnings.push("Contains sensitive keywords");
      riskScore += 30;
    }
  }

  // Determine risk level
  let riskLevel: QRScanResult["riskLevel"] = "Safe";
  if (riskScore >= 50) {
    riskLevel = "High Risk";
  } else if (riskScore >= 25) {
    riskLevel = "Suspicious";
  }

  return {
    data,
    type,
    riskScore: Math.min(100, riskScore),
    riskLevel,
    warnings,
    extractedUrl,
    upiDetails,
  };
}

function parseUPIParams(upiString: string): QRScanResult["upiDetails"] {
  const params: Record<string, string> = {};
  const paramString = upiString.replace("upi://", "").split("?")[1];

  if (paramString) {
    paramString.split("&").forEach((param) => {
      const [key, value] = param.split("=");
      if (key && value) {
        params[key.toLowerCase()] = decodeURIComponent(value);
      }
    });
  }

  return {
    pa: params.pa || "",
    pn: params.pn,
    am: params.am,
    cu: params.cu,
  };
}

function isValidUPIAddress(address: string): boolean {
  // Basic UPI address validation
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
  return upiRegex.test(address);
}

export function getQRWarningMessage(result: QRScanResult): string {
  if (result.riskLevel === "High Risk") {
    return "⚠️ HIGH RISK QR CODE! Do not scan or make payments!";
  }

  if (result.riskLevel === "Suspicious") {
    return "⚠️ Suspicious QR code. Verify before proceeding.";
  }

  return "✅ QR code appears safe.";
}
