export interface ScreenshotContentAnalysis {
  contentType: "SMS" | "WhatsApp" | "Banking" | "Payment" | "Email" | "Social" | "QR" | "Other";
  detectedElements: string[];
  confidence: number;
  description: string;
}

export function analyzeScreenshotContent(ocrText: string): ScreenshotContentAnalysis {
  const lowerText = ocrText.toLowerCase();
  const detectedElements: string[] = [];
  let contentType: ScreenshotContentAnalysis["contentType"] = "Other";
  let confidence = 0;

  // Detect SMS
  if (lowerText.includes("sms") || lowerText.includes("message") || /^\d{10,}/.test(lowerText)) {
    contentType = "SMS";
    detectedElements.push("SMS message format");
    confidence += 30;
  }

  // Detect WhatsApp
  if (lowerText.includes("whatsapp") || lowerText.includes("end-to-end encrypted") || lowerText.includes("blue ticks")) {
    contentType = "WhatsApp";
    detectedElements.push("WhatsApp chat format");
    confidence += 35;
  }

  // Detect Banking
  if (lowerText.includes("bank") || lowerText.includes("account") || lowerText.includes("balance") || 
      lowerText.includes("transaction") || lowerText.includes("debit") || lowerText.includes("credit")) {
    contentType = "Banking";
    detectedElements.push("Banking terminology");
    confidence += 40;
  }

  // Detect Payment/UPI
  if (lowerText.includes("upi") || lowerText.includes("payment") || lowerText.includes("paid") || 
      lowerText.includes("rs.") || lowerText.includes("₹") || lowerText.includes("pay")) {
    contentType = "Payment";
    detectedElements.push("Payment/UPI terminology");
    confidence += 35;
  }

  // Detect Email
  if (lowerText.includes("subject:") || lowerText.includes("from:") || lowerText.includes("to:") || 
      lowerText.includes("@") && lowerText.includes(".com")) {
    contentType = "Email";
    detectedElements.push("Email format");
    confidence += 30;
  }

  // Detect Social Media
  if (lowerText.includes("like") || lowerText.includes("share") || lowerText.includes("comment") || 
      lowerText.includes("follow") || lowerText.includes("post")) {
    contentType = "Social";
    detectedElements.push("Social media terminology");
    confidence += 25;
  }

  // Detect QR
  if (lowerText.includes("qr") || lowerText.includes("scan") || lowerText.includes("upi://")) {
    contentType = "QR";
    detectedElements.push("QR code reference");
    confidence += 45;
  }

  // Detect specific scam indicators
  if (lowerText.includes("otp") || lowerText.includes("one time password")) {
    detectedElements.push("OTP request");
    confidence += 25;
  }

  if (lowerText.includes("kyc") || lowerText.includes("verify")) {
    detectedElements.push("KYC/verification request");
    confidence += 25;
  }

  if (lowerText.includes("urgent") || lowerText.includes("immediately") || lowerText.includes("today")) {
    detectedElements.push("Urgency language");
    confidence += 20;
  }

  if (lowerText.includes("withdraw") || lowerText.includes("account blocked") || lowerText.includes("suspended")) {
    detectedElements.push("Financial panic language");
    confidence += 30;
  }

  // Detect shortened URLs
  if (lowerText.includes("bit.ly") || lowerText.includes("tinyurl") || lowerText.includes("cutt.ly") || 
      lowerText.includes("rb.gy") || lowerText.includes("shorturl")) {
    detectedElements.push("Shortened URL");
    confidence += 35;
  }

  // Normalize confidence
  confidence = Math.min(100, confidence);

  // Generate description
  const description = generateContentDescription(contentType, detectedElements);

  return {
    contentType,
    detectedElements,
    confidence,
    description,
  };
}

function generateContentDescription(
  contentType: ScreenshotContentAnalysis["contentType"],
  elements: string[]
): string {
  const contentDescriptions: Record<ScreenshotContentAnalysis["contentType"], string> = {
    SMS: "SMS message screenshot",
    WhatsApp: "WhatsApp chat screenshot",
    Banking: "Banking/financial app screenshot",
    Payment: "Payment/UPI transaction screenshot",
    Email: "Email message screenshot",
    Social: "Social media post screenshot",
    QR: "QR code or payment link screenshot",
    Other: "General screenshot",
  };

  let description = contentDescriptions[contentType];
  
  if (elements.length > 0) {
    description += ` containing: ${elements.slice(0, 3).join(", ")}`;
  }

  return description;
}
