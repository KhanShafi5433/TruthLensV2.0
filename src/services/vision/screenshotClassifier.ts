export interface ScreenshotClassification {
  type: "SMS" | "WhatsApp" | "Banking" | "Payment" | "Email" | "QR" | "Social" | "Transaction" | "Other";
  confidence: number;
  detectedElements: string[];
  description: string;
}

export class ScreenshotClassifier {
  private static instance: ScreenshotClassifier;

  static getInstance(): ScreenshotClassifier {
    if (!ScreenshotClassifier.instance) {
      ScreenshotClassifier.instance = new ScreenshotClassifier();
    }
    return ScreenshotClassifier.instance;
  }

  classify(ocrText: string): ScreenshotClassification {
    const lowerText = ocrText.toLowerCase();
    const detectedElements: string[] = [];
    let type: ScreenshotClassification["type"] = "Other";
    let confidence = 0;

    // Detect SMS
    if (this.detectSMS(lowerText)) {
      type = "SMS";
      detectedElements.push("SMS message format");
      confidence += 35;
    }

    // Detect WhatsApp
    if (this.detectWhatsApp(lowerText)) {
      type = "WhatsApp";
      detectedElements.push("WhatsApp chat format");
      confidence += 40;
    }

    // Detect Banking
    if (this.detectBanking(lowerText)) {
      type = "Banking";
      detectedElements.push("Banking/financial app UI");
      confidence += 45;
    }

    // Detect Payment/UPI
    if (this.detectPayment(lowerText)) {
      type = "Payment";
      detectedElements.push("Payment/UPI transaction screen");
      confidence += 40;
    }

    // Detect Email
    if (this.detectEmail(lowerText)) {
      type = "Email";
      detectedElements.push("Email message format");
      confidence += 35;
    }

    // Detect QR
    if (this.detectQR(lowerText)) {
      type = "QR";
      detectedElements.push("QR code reference");
      confidence += 50;
    }

    // Detect Social Media
    if (this.detectSocial(lowerText)) {
      type = "Social";
      detectedElements.push("Social media post");
      confidence += 30;
    }

    // Detect Fake Transaction
    if (this.detectFakeTransaction(lowerText)) {
      type = "Transaction";
      detectedElements.push("Transaction receipt");
      confidence += 45;
    }

    // Detect specific scam indicators
    const scamIndicators = this.detectScamIndicators(lowerText);
    detectedElements.push(...scamIndicators);
    confidence += scamIndicators.length * 10;

    // Normalize confidence
    confidence = Math.min(100, confidence);

    const description = this.generateDescription(type, detectedElements);

    return {
      type,
      confidence,
      detectedElements,
      description,
    };
  }

  private detectSMS(text: string): boolean {
    const smsIndicators = [
      "sms",
      "message",
      /^\d{10,}/, // Phone number at start
      "from:",
      "delivered",
      "read",
    ];
    return smsIndicators.some(indicator => {
      if (typeof indicator === 'string') return text.includes(indicator);
      return indicator.test(text);
    });
  }

  private detectWhatsApp(text: string): boolean {
    const whatsappIndicators = [
      "whatsapp",
      "end-to-end encrypted",
      "blue tick",
      "double tick",
      "typing...",
      "online",
      "last seen",
    ];
    return whatsappIndicators.some(indicator => text.includes(indicator));
  }

  private detectBanking(text: string): boolean {
    const bankingIndicators = [
      "bank",
      "account",
      "balance",
      "transaction",
      "debit",
      "credit",
      "statement",
      "passbook",
      "available balance",
      "current balance",
    ];
    return bankingIndicators.some(indicator => text.includes(indicator));
  }

  private detectPayment(text: string): boolean {
    const paymentIndicators = [
      "upi",
      "payment",
      "paid",
      "rs.",
      "₹",
      "pay to",
      "received",
      "sent",
      "transaction id",
      "ref no",
      "utr",
    ];
    return paymentIndicators.some(indicator => text.includes(indicator));
  }

  private detectEmail(text: string): boolean {
    const emailIndicators = [
      "subject:",
      "from:",
      "to:",
      "cc:",
      "bcc:",
      "reply to",
      "@",
      ".com",
      "forwarded message",
    ];
    return emailIndicators.some(indicator => text.includes(indicator));
  }

  private detectQR(text: string): boolean {
    const qrIndicators = [
      "qr",
      "scan",
      "upi://",
      "qrcode",
      "quick response",
    ];
    return qrIndicators.some(indicator => text.includes(indicator));
  }

  private detectSocial(text: string): boolean {
    const socialIndicators = [
      "like",
      "share",
      "comment",
      "follow",
      "post",
      "tweet",
      "retweet",
      "instagram",
      "facebook",
      "twitter",
    ];
    return socialIndicators.some(indicator => text.includes(indicator));
  }

  private detectFakeTransaction(text: string): boolean {
    const transactionIndicators = [
      "transaction successful",
      "payment successful",
      "amount debited",
      "amount credited",
      "receipt",
      "invoice",
      "bill",
    ];
    return transactionIndicators.some(indicator => text.includes(indicator));
  }

  private detectScamIndicators(text: string): string[] {
    const indicators: string[] = [];

    if (text.includes("otp") || text.includes("one time password")) {
      indicators.push("OTP request");
    }

    if (text.includes("kyc") || text.includes("verify")) {
      indicators.push("KYC/verification request");
    }

    if (text.includes("urgent") || text.includes("immediately") || text.includes("today")) {
      indicators.push("Urgency language");
    }

    if (text.includes("withdraw") || text.includes("account blocked") || text.includes("suspended")) {
      indicators.push("Financial panic language");
    }

    if (text.includes("bit.ly") || text.includes("tinyurl") || text.includes("cutt.ly")) {
      indicators.push("Shortened URL");
    }

    return indicators;
  }

  private generateDescription(type: ScreenshotClassification["type"], elements: string[]): string {
    const typeDescriptions: Record<ScreenshotClassification["type"], string> = {
      SMS: "SMS message screenshot",
      WhatsApp: "WhatsApp chat screenshot",
      Banking: "Banking/financial app screenshot",
      Payment: "Payment/UPI transaction screenshot",
      Email: "Email message screenshot",
      QR: "QR code or payment link screenshot",
      Social: "Social media post screenshot",
      Transaction: "Transaction receipt screenshot",
      Other: "General screenshot",
    };

    let description = typeDescriptions[type];
    
    if (elements.length > 0) {
      const topElements = elements.slice(0, 3);
      description += ` containing: ${topElements.join(", ")}`;
    }

    return description;
  }
}
