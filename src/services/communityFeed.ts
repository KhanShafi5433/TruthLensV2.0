import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { ScamCategorizer } from "./intelligence/scamCategorizer";
import { ScamReputationDatabase } from "./intelligence/scamReputation";
import { CommunityIntelligenceEngine } from "./intelligence/communityIntelligence";
import { extractUrls } from "./urls/heuristicUrlAnalyzer";

export interface ScamReport {
  id: string;
  reporterEmail: string;
  scamType: "sms" | "upi" | "kyc" | "otp" | "phishing" | "other";
  content: string;
  phone?: string;
  url?: string;
  imageUrl?: string;
  riskLevel: "Low" | "Moderate" | "Suspicious" | "High Risk";
  severity: "info" | "warning" | "danger";
  description: string;
  timestamp: Timestamp;
  verified: boolean;
  reportCount: number;
}

export interface CommunityFeedItem {
  id: string;
  scamType: string;
  content: string;
  riskLevel: string;
  severity: string;
  description: string;
  timestamp: string;
  reportCount: number;
  verified: boolean;
  imageUrl?: string;
  category?: string;
  categoryConfidence?: number;
  categoryKeywords?: string[];
}

export interface TrendingScam {
  scamType: string;
  reportCount: number;
  trend: "up" | "down" | "stable";
  severity: string;
}

export interface ThreatIntelligenceStats {
  totalReports: number;
  mostCommonScam: string;
  todayReports: number;
  weekReports: number;
}

const COMMUNITY_REPORTS_COLLECTION = "communityReports";
const POST_REPORTS_COLLECTION = "postReports";

export interface PostReport {
  id: string;
  postId: string;
  reporterEmail: string;
  reason: "spam" | "misinformation" | "offensive" | "other";
  description?: string;
  timestamp: Timestamp;
}

export async function reportPost(
  postId: string,
  reporterEmail: string,
  reason: PostReport["reason"],
  description?: string
): Promise<string> {
  console.log("Report Post Service: Starting post report submission");
  try {
    // Check if user has already reported this post
    const reportsRef = collection(db, POST_REPORTS_COLLECTION);
    const q = query(
      reportsRef,
      where("postId", "==", postId),
      where("reporterEmail", "==", reporterEmail.trim())
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      throw new Error("You have already reported this post");
    }

    // Add new report
    const docRef = await addDoc(collection(db, POST_REPORTS_COLLECTION), {
      postId,
      reporterEmail: reporterEmail.trim(),
      reason,
      description: description || "",
      timestamp: serverTimestamp(),
    });

    console.log("Report Post Service: Firestore write successful, document ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Report Post Service: Error reporting post:", error);
    throw error;
  }
}

export async function reportScam(
  reporterEmail: string,
  scamData: {
    scamType: ScamReport["scamType"];
    content: string;
    phone?: string;
    url?: string;
    imageUrl?: string;
    riskLevel: ScamReport["riskLevel"];
    description: string;
  }
): Promise<string> {
  console.log("Report Scam Service: Starting report submission");
  try {
    console.log("Report Scam Service: Step 1 - Calculate severity");
    const severity = getSeverityFromRiskLevel(scamData.riskLevel);
    
    console.log("Report Scam Service: Step 2 - Categorize scam");
    // Use scam categorizer for automatic categorization
    const categorizer = ScamCategorizer.getInstance();
    const detectedUrls = extractUrls(scamData.content);
    const categoryResult = categorizer.categorize(scamData.content, detectedUrls, scamData.phone || "");
    console.log("Report Scam Service: Category result:", categoryResult);
    
    console.log("Report Scam Service: Step 3 - Update reputation database");
    // Use scam reputation database to track entities
    try {
      const reputationDb = ScamReputationDatabase.getInstance();
      await reputationDb.analyzeAndReport(
        scamData.content,
        detectedUrls,
        scamData.phone || "",
        categoryResult.category,
        scamData.riskLevel
      );
      console.log("Report Scam Service: Reputation database updated successfully");
    } catch (reputationError) {
      console.error("Report Scam Service: Reputation database update failed (non-critical):", reputationError);
      // Continue with submission even if reputation update fails
    }

    console.log("Report Scam Service: Step 4 - Write to Firestore");
    console.log("Report Scam Service: Collection:", COMMUNITY_REPORTS_COLLECTION);
    console.log("Report Scam Service: Reporter email:", reporterEmail.trim());
    const docRef = await addDoc(collection(db, COMMUNITY_REPORTS_COLLECTION), {
      reporterEmail: reporterEmail.trim(),
      scamType: scamData.scamType,
      content: scamData.content,
      phone: scamData.phone,
      url: scamData.url,
      imageUrl: scamData.imageUrl,
      riskLevel: scamData.riskLevel,
      severity,
      description: scamData.description,
      timestamp: serverTimestamp(),
      verified: true, // Auto-verify new reports
      reportCount: 1,
      // Add automatic categorization
      category: categoryResult.category,
      categoryConfidence: categoryResult.confidence,
      categoryKeywords: categoryResult.keywords,
    });

    console.log("Report Scam Service: Firestore write successful, document ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Report Scam Service: Error reporting scam:", error);
    console.error("Report Scam Service: Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function getCommunityFeed(limit = 20): Promise<CommunityFeedItem[]> {
  try {
    const reportsRef = collection(db, COMMUNITY_REPORTS_COLLECTION);
    const q = query(
      reportsRef,
      orderBy("timestamp", "desc")
    );

    const snapshot = await getDocs(q);
    const items: CommunityFeedItem[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as Omit<ScamReport, "id">;
      items.push({
        id: doc.id,
        scamType: data.scamType,
        content: data.content,
        riskLevel: data.riskLevel,
        severity: data.severity,
        description: data.description,
        timestamp: formatTimestamp(data.timestamp),
        reportCount: data.reportCount,
        verified: data.verified,
        imageUrl: data.imageUrl,
      });
    });

    return items.slice(0, limit);
  } catch (error) {
    console.error("Error fetching community feed:", error);
    return [];
  }
}

export async function getTrendingScams(): Promise<CommunityFeedItem[]> {
  try {
    const reportsRef = collection(db, COMMUNITY_REPORTS_COLLECTION);
    const q = query(
      reportsRef,
      orderBy("reportCount", "desc")
    );

    const snapshot = await getDocs(q);
    const items: CommunityFeedItem[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as Omit<ScamReport, "id">;
      items.push({
        id: doc.id,
        scamType: data.scamType,
        content: data.content,
        riskLevel: data.riskLevel,
        severity: data.severity,
        description: data.description,
        timestamp: formatTimestamp(data.timestamp),
        reportCount: data.reportCount,
        verified: data.verified,
        imageUrl: data.imageUrl,
        category: (data as any).category,
        categoryConfidence: (data as any).categoryConfidence,
        categoryKeywords: (data as any).categoryKeywords,
      });
    });

    return items.slice(0, 10);
  } catch (error) {
    console.error("Error fetching trending scams:", error);
    return [];
  }
}

export async function getTrendingScamsByType(): Promise<TrendingScam[]> {
  try {
    const reportsRef = collection(db, COMMUNITY_REPORTS_COLLECTION);
    const q = query(reportsRef, orderBy("timestamp", "desc"), limit(200));

    const snapshot = await getDocs(q);
    const scamTypeCount: Record<string, number> = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      const scamType = data.scamType || "other";
      scamTypeCount[scamType] = (scamTypeCount[scamType] || 0) + 1;
    });

    const trendingScams: TrendingScam[] = Object.entries(scamTypeCount)
      .map(([scamType, count]) => ({
        scamType: scamType.charAt(0).toUpperCase() + scamType.slice(1),
        reportCount: count,
        trend: "up" as const, // Default to up for simplicity
        severity: count > 20 ? "danger" : count > 10 ? "warning" : "info",
      }))
      .sort((a, b) => b.reportCount - a.reportCount)
      .slice(0, 5);

    return trendingScams;
  } catch (error) {
    console.error("Error fetching trending scams by type:", error);
    return [];
  }
}

export async function getThreatIntelligenceStats(): Promise<ThreatIntelligenceStats> {
  try {
    const intelligenceEngine = CommunityIntelligenceEngine.getInstance();
    return await intelligenceEngine.getTrendingStats();
  } catch (error) {
    console.error("Error fetching threat intelligence stats:", error);
    return {
      totalReports: 0,
      mostCommonScam: "Unknown",
      todayReports: 0,
      weekReports: 0,
    };
  }
}

export async function getDangerousDomains(limit: number = 5): Promise<any[]> {
  try {
    const reputationDb = ScamReputationDatabase.getInstance();
    return await reputationDb.getDangerousDomains(limit);
  } catch (error) {
    console.error("Error fetching dangerous domains:", error);
    return [];
  }
}

export async function getDangerousNumbers(limit: number = 5): Promise<any[]> {
  try {
    const reputationDb = ScamReputationDatabase.getInstance();
    return await reputationDb.getDangerousNumbers(limit);
  } catch (error) {
    console.error("Error fetching dangerous numbers:", error);
    return [];
  }
}

function getSeverityFromRiskLevel(riskLevel: ScamReport["riskLevel"]): ScamReport["severity"] {
  switch (riskLevel) {
    case "High Risk":
      return "danger";
    case "Suspicious":
      return "warning";
    case "Moderate":
      return "warning";
    case "Low":
      return "info";
    default:
      return "info";
  }
}

function formatTimestamp(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}
