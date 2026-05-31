import { getDocs, collection, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "../../firebase";
import { ScamCategorizer, ScamCategory } from "./scamCategorizer";

export interface CommunityIntelligence {
  phraseReportCount: number;
  categoryReportCount: number;
  similarReportCount: number;
  communityRiskBoost: number;
  communityWarning: string;
}

export class CommunityIntelligenceEngine {
  private static instance: CommunityIntelligenceEngine;

  static getInstance(): CommunityIntelligenceEngine {
    if (!CommunityIntelligenceEngine.instance) {
      CommunityIntelligenceEngine.instance = new CommunityIntelligenceEngine();
    }
    return CommunityIntelligenceEngine.instance;
  }

  private categorizer = ScamCategorizer.getInstance();

  // Analyze content against community intelligence
  async analyzeContent(content: string): Promise<CommunityIntelligence> {
    const lowerContent = content.toLowerCase();
    
    // Get phrase report count
    const phraseReportCount = await this.getPhraseReportCount(lowerContent);
    
    // Get category report count
    const category = this.categorizer.categorize(content);
    const categoryReportCount = await this.getCategoryReportCount(category.category);
    
    // Get similar report count
    const similarReportCount = await this.getSimilarReportCount(content);
    
    // Calculate community risk boost
    const communityRiskBoost = this.calculateRiskBoost(
      phraseReportCount,
      categoryReportCount,
      similarReportCount
    );
    
    // Generate community warning
    const communityWarning = this.generateCommunityWarning(
      phraseReportCount,
      categoryReportCount,
      similarReportCount,
      category.category
    );
    
    return {
      phraseReportCount,
      categoryReportCount,
      similarReportCount,
      communityRiskBoost,
      communityWarning,
    };
  }

  // Get report count for phrases in content
  private async getPhraseReportCount(content: string): Promise<number> {
    try {
      const phrasesRef = collection(db, "scamPhrases");
      const q = query(phrasesRef, orderBy("reportCount", "desc"), limit(10));
      
      const snapshot = await getDocs(q);
      let totalReportCount = 0;
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const phrase = data.phrase?.toLowerCase() || "";
        if (content.includes(phrase)) {
          totalReportCount += data.reportCount || 0;
        }
      }
      
      return totalReportCount;
    } catch (error) {
      console.error("Error getting phrase report count:", error);
      return 0;
    }
  }

  // Get report count for a category
  private async getCategoryReportCount(category: ScamCategory): Promise<number> {
    try {
      const reportsRef = collection(db, "communityReports");
      const q = query(
        reportsRef,
        where("scamType", "==", category.toLowerCase()),
        orderBy("timestamp", "desc"),
        limit(100)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error("Error getting category report count:", error);
      return 0;
    }
  }

  // Get count of similar reports
  private async getSimilarReportCount(content: string): Promise<number> {
    try {
      const reportsRef = collection(db, "communityReports");
      const q = query(reportsRef, orderBy("timestamp", "desc"), limit(50));
      
      const snapshot = await getDocs(q);
      let similarCount = 0;
      
      const words = new Set(content.toLowerCase().split(/\s+/).filter(w => w.length > 3));
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const reportContent = (data.content || "").toLowerCase();
        const reportWords = new Set(reportContent.split(/\s+/).filter(w => w.length > 3));
        
        // Calculate word overlap
        const intersection = new Set([...words].filter(x => reportWords.has(x)));
        const overlapPercentage = (intersection.size / Math.max(words.size, reportWords.size)) * 100;
        
        if (overlapPercentage >= 30) {
          similarCount++;
        }
      }
      
      return similarCount;
    } catch (error) {
      console.error("Error getting similar report count:", error);
      return 0;
    }
  }

  // Calculate risk boost based on community intelligence
  private calculateRiskBoost(
    phraseReportCount: number,
    categoryReportCount: number,
    similarReportCount: number
  ): number {
    let boost = 0;
    
    // Phrase-based boost
    if (phraseReportCount >= 50) boost += 20;
    else if (phraseReportCount >= 20) boost += 15;
    else if (phraseReportCount >= 10) boost += 10;
    else if (phraseReportCount >= 5) boost += 5;
    
    // Category-based boost
    if (categoryReportCount >= 100) boost += 15;
    else if (categoryReportCount >= 50) boost += 10;
    else if (categoryReportCount >= 20) boost += 5;
    
    // Similar report boost
    if (similarReportCount >= 30) boost += 15;
    else if (similarReportCount >= 15) boost += 10;
    else if (similarReportCount >= 5) boost += 5;
    
    return Math.min(30, boost); // Cap at 30% boost
  }

  // Generate community warning message
  private generateCommunityWarning(
    phraseReportCount: number,
    categoryReportCount: number,
    similarReportCount: number,
    category: ScamCategory
  ): string {
    const warnings: string[] = [];
    
    if (similarReportCount >= 20) {
      warnings.push(`⚠️ This message pattern has been reported ${similarReportCount} times by the community.`);
    } else if (similarReportCount >= 5) {
      warnings.push(`⚠️ ${similarReportCount} similar scams have been reported.`);
    }
    
    if (categoryReportCount >= 50) {
      warnings.push(`⚠️ ${category} scams are currently trending with ${categoryReportCount} reports.`);
    }
    
    if (phraseReportCount >= 20) {
      warnings.push(`⚠️ Suspicious phrases in this message have appeared in ${phraseReportCount} scam reports.`);
    }
    
    if (warnings.length === 0) {
      return "";
    }
    
    return warnings.join(" ");
  }

  // Get trending scam statistics
  async getTrendingStats(): Promise<{
    totalReports: number;
    mostCommonScam: string;
    todayReports: number;
    weekReports: number;
  }> {
    try {
      const reportsRef = collection(db, "communityReports");
      const q = query(reportsRef, orderBy("timestamp", "desc"), limit(500));
      
      const snapshot = await getDocs(q);
      const reports = snapshot.docs.map(doc => doc.data());
      
      const totalReports = reports.length;
      
      // Count by scam type
      const scamTypeCount: Record<string, number> = {};
      for (const report of reports) {
        const type = report.scamType || "other";
        scamTypeCount[type] = (scamTypeCount[type] || 0) + 1;
      }
      
      // Find most common scam
      let mostCommonScam = "Unknown";
      let maxCount = 0;
      for (const [type, count] of Object.entries(scamTypeCount)) {
        if (count > maxCount) {
          maxCount = count;
          mostCommonScam = type;
        }
      }
      
      // Calculate today's reports
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayReports = reports.filter(report => {
        const reportDate = report.timestamp?.toDate ? report.timestamp.toDate() : new Date(report.timestamp);
        return reportDate >= today;
      }).length;
      
      // Calculate week's reports
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekReports = reports.filter(report => {
        const reportDate = report.timestamp?.toDate ? report.timestamp.toDate() : new Date(report.timestamp);
        return reportDate >= weekAgo;
      }).length;
      
      return {
        totalReports,
        mostCommonScam: mostCommonScam.charAt(0).toUpperCase() + mostCommonScam.slice(1),
        todayReports,
        weekReports,
      };
    } catch (error) {
      console.error("Error getting trending stats:", error);
      return {
        totalReports: 0,
        mostCommonScam: "Unknown",
        todayReports: 0,
        weekReports: 0,
      };
    }
  }
}
