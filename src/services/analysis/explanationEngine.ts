import { ExplanationItem, ThreatFinding } from "./analysisModels";

export function generateExplanations(findings: ThreatFinding[]): ExplanationItem[] {
  if (findings.length === 0) {
    return [
      {
        title: "No strong scam pattern found",
        detail: "The analyzed content did not contain clear urgency, payment, OTP, impersonation, or URL danger signals.",
        category: "urgency",
      },
    ];
  }

  const explanations: ExplanationItem[] = [];

  // Group findings by category for better explanations
  const categoryGroups = new Map<string, ThreatFinding[]>();
  for (const finding of findings) {
    if (!categoryGroups.has(finding.category)) {
      categoryGroups.set(finding.category, []);
    }
    categoryGroups.get(finding.category)!.push(finding);
  }

  // Generate explanations for each category
  for (const [category, categoryFindings] of categoryGroups) {
    const firstFinding = categoryFindings[0];

    switch (category) {
      case "shortened_url":
        explanations.push({
          title: "Contains shortened suspicious URL",
          detail: "Uses shortened URL commonly used to hide malicious destinations. These links often lead to phishing sites or malware.",
          evidence: firstFinding.evidence,
          category: "shortened_url",
        });
        break;

      case "financial_panic":
        explanations.push({
          title: "Creates financial panic",
          detail: "Uses account issues, transaction problems, or money loss fears to create panic and force quick action without verification.",
          evidence: firstFinding.evidence,
          category: "financial_panic",
        });
        break;

      case "urgency":
        explanations.push({
          title: "Uses urgency tactics",
          detail: "Creates time pressure to act before verifying. Scammers use urgency to bypass critical thinking.",
          evidence: firstFinding.evidence,
          category: "urgency",
        });
        break;

      case "grammar_manipulation":
        explanations.push({
          title: "Suspicious grammar patterns",
          detail: "Uses malformed grammar, robotic wording, or suspicious spacing common in scam messages.",
          evidence: firstFinding.evidence,
          category: "grammar_manipulation",
        });
        break;

      case "unknown_sender":
        explanations.push({
          title: "Unknown sender impersonation",
          detail: "Financial/banking language from unknown or unrecognized sender. Legitimate banks use verified channels.",
          evidence: firstFinding.evidence,
          category: "unknown_sender",
        });
        break;

      case "otp":
        explanations.push({
          title: "Requests sensitive information",
          detail: "Asks for OTPs or credentials that should never be shared. Legitimate services never request this via message.",
          evidence: firstFinding.evidence,
          category: "otp",
        });
        break;

      case "payment":
        explanations.push({
          title: "Requests payment or transfer",
          detail: "Pushes for payment, transfer, fee, or UPI action. Unsolicited payment requests are highly suspicious.",
          evidence: firstFinding.evidence,
          category: "payment",
        });
        break;

      case "impersonation":
        explanations.push({
          title: "Impersonates trusted entity",
          detail: "Pretends to be a trusted company, bank, support team, or authority to gain credibility.",
          evidence: firstFinding.evidence,
          category: "impersonation",
        });
        break;

      default:
        explanations.push({
          title: firstFinding.label,
          detail: firstFinding.explanation,
          evidence: firstFinding.evidence,
          category: firstFinding.category,
        });
    }
  }

  return explanations.slice(0, 8);
}
