import { ThreatFinding, SafetyRecommendation } from "./analysisModels";

export function generateRecommendations(findings: ThreatFinding[]): SafetyRecommendation[] {
  const recommendations: SafetyRecommendation[] = [];
  const categories = new Set(findings.map(f => f.category));

  // URL-based recommendations
  if (categories.has("url") || categories.has("shortened_url")) {
    recommendations.push({
      title: "Do not click the link",
      detail: "Shortened URLs often hide malicious destinations. Verify through official channels.",
      severity: "danger",
      actionType: "avoid",
    });
    recommendations.push({
      title: "Check URL safely",
      detail: "Use URL scanners or visit the official website directly instead of clicking.",
      severity: "warning",
      actionType: "verify",
    });
  }

  // Financial panic recommendations
  if (categories.has("financial_panic")) {
    recommendations.push({
      title: "Contact your bank immediately",
      detail: "If this mentions your account, call your bank using the official number from their website or app.",
      severity: "danger",
      actionType: "contact",
    });
    recommendations.push({
      title: "Do not share account details",
      detail: "Never share OTPs, passwords, or account details in response to such messages.",
      severity: "danger",
      actionType: "avoid",
    });
  }

  // OTP recommendations
  if (categories.has("otp")) {
    recommendations.push({
      title: "Never share OTP",
      detail: "Legitimate organizations never ask for OTPs via SMS, email, or phone.",
      severity: "danger",
      actionType: "avoid",
    });
    recommendations.push({
      title: "Block the sender",
      detail: "This is likely a phishing attempt. Block the number to prevent further attempts.",
      severity: "warning",
      actionType: "block",
    });
  }

  // Urgency recommendations
  if (categories.has("urgency")) {
    recommendations.push({
      title: "Ignore time pressure",
      detail: "Scammers use urgency to make you act without thinking. Take time to verify.",
      severity: "warning",
      actionType: "avoid",
    });
  }

  // Impersonation recommendations
  if (categories.has("impersonation") || categories.has("unknown_sender")) {
    recommendations.push({
      title: "Verify sender identity",
      detail: "Contact the organization through official channels to verify the message.",
      severity: "warning",
      actionType: "verify",
    });
    recommendations.push({
      title: "Report to cybercrime",
      detail: "Report impersonation attempts to cybercrime.gov.in or your local authorities.",
      severity: "info",
      actionType: "report",
    });
  }

  // KYC recommendations
  if (categories.has("kyc")) {
    recommendations.push({
      title: "KYC updates are in-app only",
      detail: "Banks and wallets never ask for KYC updates via SMS or external links.",
      severity: "danger",
      actionType: "avoid",
    });
  }

  // Payment recommendations
  if (categories.has("payment")) {
    recommendations.push({
      title: "Do not make payments",
      detail: "Never transfer money or make payments based on unsolicited messages.",
      severity: "danger",
      actionType: "avoid",
    });
  }

  // Prize/lottery recommendations
  if (categories.has("prize")) {
    recommendations.push({
      title: "It's likely fake",
      detail: "You cannot win a lottery you didn't enter. Delete and ignore.",
      severity: "warning",
      actionType: "avoid",
    });
  }

  // Crypto recommendations
  if (categories.has("crypto")) {
    recommendations.push({
      title: "Avoid crypto investment scams",
      detail: "Guaranteed returns are a red flag. Research thoroughly before investing.",
      severity: "danger",
      actionType: "avoid",
    });
  }

  // Emotional manipulation recommendations
  if (categories.has("emotional")) {
    recommendations.push({
      title: "Stay calm and verify",
      detail: "Emotional appeals are designed to bypass your critical thinking. Verify facts independently.",
      severity: "warning",
      actionType: "verify",
    });
  }

  // Courier recommendations
  if (categories.has("courier")) {
    recommendations.push({
      title: "Check with courier directly",
      detail: "Contact the courier company using their official website or customer service.",
      severity: "warning",
      actionType: "verify",
    });
  }

  // Grammar manipulation recommendations
  if (categories.has("grammar_manipulation")) {
    recommendations.push({
      title: "Watch for poor grammar",
      detail: "Suspicious grammar and robotic wording are common in scam messages.",
      severity: "info",
      actionType: "avoid",
    });
  }

  // Default recommendation if no specific threats found
  if (recommendations.length === 0) {
    recommendations.push({
      title: "Stay vigilant",
      detail: "While no strong scam patterns were detected, always verify suspicious messages.",
      severity: "info",
      actionType: "verify",
    });
  }

  return recommendations.slice(0, 6);
}
