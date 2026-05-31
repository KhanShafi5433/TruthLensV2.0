import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  increment,
} from "firebase/firestore";
import { db } from "../../firebase";

export interface ScamDomain {
  id: string;
  domain: string;
  reportCount: number;
  lastSeen: any;
  severity: "info" | "warning" | "danger";
  riskLevel: "Low" | "Moderate" | "Suspicious" | "High Risk";
  category: string;
}

export interface ScamNumber {
  id: string;
  phoneNumber: string;
  reportCount: number;
  lastSeen: any;
  severity: "info" | "warning" | "danger";
  riskLevel: "Low" | "Moderate" | "Suspicious" | "High Risk";
  category: string;
}

export interface ScamPhrase {
  id: string;
  phrase: string;
  reportCount: number;
  lastSeen: any;
  severity: "info" | "warning" | "danger";
  riskLevel: "Low" | "Moderate" | "Suspicious" | "High Risk";
  category: string;
}

export class ScamReputationDatabase {
  private static instance: ScamReputationDatabase;

  static getInstance(): ScamReputationDatabase {
    if (!ScamReputationDatabase.instance) {
      ScamReputationDatabase.instance = new ScamReputationDatabase();
    }
    return ScamReputationDatabase.instance;
  }

  // Extract domain from URL
  private extractDomain(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return null;
    }
  }

  // Report a domain
  async reportDomain(
    domain: string,
    category: string,
    riskLevel: string = "Suspicious"
  ): Promise<void> {
    const domainId = domain.replace(/\./g, "_");
    const domainRef = doc(db, "scamDomains", domainId);

    const severity = this.getSeverityFromRisk(riskLevel);

    await setDoc(
      domainRef,
      {
        domain,
        reportCount: increment(1),
        lastSeen: new Date(),
        severity,
        riskLevel,
        category,
      },
      { merge: true }
    );
  }

  // Report a phone number
  async reportNumber(
    phoneNumber: string,
    category: string,
    riskLevel: string = "Suspicious"
  ): Promise<void> {
    const numberId = phoneNumber.replace(/[^0-9]/g, "");
    const numberRef = doc(db, "scamNumbers", numberId);

    const severity = this.getSeverityFromRisk(riskLevel);

    await setDoc(
      numberRef,
      {
        phoneNumber,
        reportCount: increment(1),
        lastSeen: new Date(),
        severity,
        riskLevel,
        category,
      },
      { merge: true }
    );
  }

  // Report a phrase
  async reportPhrase(
    phrase: string,
    category: string,
    riskLevel: string = "Suspicious"
  ): Promise<void> {
    const phraseId = phrase.replace(/\s+/g, "_").toLowerCase().substring(0, 50);
    const phraseRef = doc(db, "scamPhrases", phraseId);

    const severity = this.getSeverityFromRisk(riskLevel);

    await setDoc(
      phraseRef,
      {
        phrase,
        reportCount: increment(1),
        lastSeen: new Date(),
        severity,
        riskLevel,
        category,
      },
      { merge: true }
    );
  }

  // Get domain reputation
  async getDomainReputation(domain: string): Promise<ScamDomain | null> {
    const domainId = domain.replace(/\./g, "_");
    const domainRef = doc(db, "scamDomains", domainId);
    const domainDoc = await getDoc(domainRef);

    if (domainDoc.exists()) {
      return domainDoc.data() as ScamDomain;
    }
    return null;
  }

  // Get number reputation
  async getNumberReputation(phoneNumber: string): Promise<ScamNumber | null> {
    const numberId = phoneNumber.replace(/[^0-9]/g, "");
    const numberRef = doc(db, "scamNumbers", numberId);
    const numberDoc = await getDoc(numberRef);

    if (numberDoc.exists()) {
      return numberDoc.data() as ScamNumber;
    }
    return null;
  }

  // Get dangerous domains
  async getDangerousDomains(limit: number = 10): Promise<ScamDomain[]> {
    const domainsRef = collection(db, "scamDomains");
    const q = query(
      domainsRef,
      orderBy("reportCount", "desc"),
      where("severity", "==", "danger")
    );

    const snapshot = await getDocs(q);
    const domains: ScamDomain[] = [];

    snapshot.forEach((doc) => {
      domains.push(doc.data() as ScamDomain);
    });

    return domains.slice(0, limit);
  }

  // Get dangerous numbers
  async getDangerousNumbers(limit: number = 10): Promise<ScamNumber[]> {
    const numbersRef = collection(db, "scamNumbers");
    const q = query(
      numbersRef,
      orderBy("reportCount", "desc"),
      where("severity", "==", "danger")
    );

    const snapshot = await getDocs(q);
    const numbers: ScamNumber[] = [];

    snapshot.forEach((doc) => {
      numbers.push(doc.data() as ScamNumber);
    });

    return numbers.slice(0, limit);
  }

  // Analyze content and report entities
  async analyzeAndReport(
    content: string,
    detectedUrls: string[],
    detectedPhone: string,
    category: string,
    riskLevel: string
  ): Promise<void> {
    // Report domains
    for (const url of detectedUrls) {
      const domain = this.extractDomain(url);
      if (domain) {
        await this.reportDomain(domain, category, riskLevel);
      }
    }

    // Report phone number
    if (detectedPhone) {
      await this.reportNumber(detectedPhone, category, riskLevel);
    }

    // Report common phrases
    const phrases = this.extractPhrases(content);
    for (const phrase of phrases) {
      await this.reportPhrase(phrase, category, riskLevel);
    }
  }

  // Extract suspicious phrases from content
  private extractPhrases(content: string): string[] {
    const suspiciousPhrases: string[] = [];
    const phrases = [
      "account blocked",
      "account suspended",
      "withdraw process",
      "upi refund",
      "kyc update",
      "lottery winner",
      "job offer",
      "investment return",
      "customer care",
      "verify account",
      "immediate action",
      "urgent",
    ];

    const lowerContent = content.toLowerCase();
    for (const phrase of phrases) {
      if (lowerContent.includes(phrase)) {
        suspiciousPhrases.push(phrase);
      }
    }

    return suspiciousPhrases;
  }

  // Check if content matches known scams
  async checkContentReputation(content: string): Promise<{
    domainMatches: ScamDomain[];
    numberMatches: ScamNumber[];
    phraseMatches: ScamPhrase[];
    overallRisk: number;
  }> {
    const domainMatches: ScamDomain[] = [];
    const numberMatches: ScamNumber[] = [];
    const phraseMatches: ScamPhrase[] = [];

    // Extract URLs and check domains
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex) || [];
    for (const url of urls) {
      const domain = this.extractDomain(url);
      if (domain) {
        const reputation = await this.getDomainReputation(domain);
        if (reputation) {
          domainMatches.push(reputation);
        }
      }
    }

    // Extract phone numbers and check
    const phoneRegex = /(\+?\d{1,3}[- ]?)?\d{10}/g;
    const phones = content.match(phoneRegex) || [];
    for (const phone of phones) {
      const reputation = await this.getNumberReputation(phone);
      if (reputation) {
        numberMatches.push(reputation);
      }
    }

    // Check phrases
    const phrases = this.extractPhrases(content);
    for (const phrase of phrases) {
      const phraseId = phrase.replace(/\s+/g, "_").toLowerCase().substring(0, 50);
      const phraseRef = doc(db, "scamPhrases", phraseId);
      const phraseDoc = await getDoc(phraseRef);
      if (phraseDoc.exists()) {
        phraseMatches.push(phraseDoc.data() as ScamPhrase);
      }
    }

    // Calculate overall risk
    const domainRisk = domainMatches.reduce((sum, d) => sum + d.reportCount, 0);
    const numberRisk = numberMatches.reduce((sum, n) => sum + n.reportCount, 0);
    const phraseRisk = phraseMatches.reduce((sum, p) => sum + p.reportCount, 0);
    const overallRisk = domainRisk + numberRisk + phraseRisk;

    return {
      domainMatches,
      numberMatches,
      phraseMatches,
      overallRisk,
    };
  }

  private getSeverityFromRisk(riskLevel: string): "info" | "warning" | "danger" {
    switch (riskLevel) {
      case "High Risk":
        return "danger";
      case "Suspicious":
        return "warning";
      case "Moderate":
        return "warning";
      default:
        return "info";
    }
  }
}
