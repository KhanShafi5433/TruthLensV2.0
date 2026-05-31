import { getDocs, collection, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "../../firebase";

export interface SimilarScamMatch {
  reportId: string;
  content: string;
  category: string;
  riskLevel: string;
  matchPercentage: number;
  matchedKeywords: string[];
  timestamp: any;
}

export class SimilarScamMatcher {
  private static instance: SimilarScamMatcher;

  static getInstance(): SimilarScamMatcher {
    if (!SimilarScamMatcher.instance) {
      SimilarScamMatcher.instance = new SimilarScamMatcher();
    }
    return SimilarScamMatcher.instance;
  }

  // Calculate keyword similarity
  private calculateKeywordSimilarity(content1: string, content2: string): number {
    const words1 = new Set(content1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(content2.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    if (union.size === 0) return 0;
    return (intersection.size / union.size) * 100;
  }

  // Extract keywords from content
  private extractKeywords(content: string): string[] {
    const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const keywordFrequency: Record<string, number> = {};
    
    for (const word of words) {
      keywordFrequency[word] = (keywordFrequency[word] || 0) + 1;
    }
    
    // Return top 10 keywords by frequency
    return Object.entries(keywordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  // Find similar scams from community reports
  async findSimilarScams(
    content: string,
    category: string,
    maxResults: number = 5
  ): Promise<SimilarScamMatch[]> {
    try {
      const reportsRef = collection(db, "communityReports");
      const q = query(reportsRef, orderBy("timestamp", "desc"), limit(100));
      
      const snapshot = await getDocs(q);
      const matches: SimilarScamMatch[] = [];
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const reportContent = data.content || "";
        const reportCategory = data.scamType || "other";
        
        // Calculate similarity
        const keywordSimilarity = this.calculateKeywordSimilarity(content, reportContent);
        
        // Boost similarity if categories match
        const categoryBoost = category === reportCategory ? 15 : 0;
        
        const totalSimilarity = Math.min(100, keywordSimilarity + categoryBoost);
        
        // Only include if similarity is above threshold
        if (totalSimilarity >= 50) {
          const matchedKeywords = this.extractKeywords(content)
            .filter(kw => reportContent.toLowerCase().includes(kw));
          
          matches.push({
            reportId: doc.id,
            content: reportContent.substring(0, 100) + "...",
            category: reportCategory,
            riskLevel: data.riskLevel || "Moderate",
            matchPercentage: Math.round(totalSimilarity),
            matchedKeywords,
            timestamp: data.timestamp,
          });
        }
      }
      
      // Sort by match percentage (descending) and limit results
      return matches
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, maxResults);
    } catch (error) {
      console.error("Error finding similar scams:", error);
      return [];
    }
  }

  // Find similar scams by category
  async findSimilarByCategory(
    category: string,
    maxResults: number = 5
  ): Promise<SimilarScamMatch[]> {
    try {
      const reportsRef = collection(db, "communityReports");
      const q = query(
        reportsRef,
        where("scamType", "==", category),
        orderBy("timestamp", "desc"),
        limit(maxResults)
      );
      
      const snapshot = await getDocs(q);
      const matches: SimilarScamMatch[] = [];
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        matches.push({
          reportId: doc.id,
          content: (data.content || "").substring(0, 100) + "...",
          category: data.scamType || "other",
          riskLevel: data.riskLevel || "Moderate",
          matchPercentage: 100, // Same category = 100% match
          matchedKeywords: [],
          timestamp: data.timestamp,
        });
      }
      
      return matches;
    } catch (error) {
      console.error("Error finding similar scams by category:", error);
      return [];
    }
  }

  // Calculate similarity score for display
  getSimilarityScoreLabel(score: number): string {
    if (score >= 90) return "Very High Match";
    if (score >= 75) return "High Match";
    if (score >= 60) return "Moderate Match";
    if (score >= 50) return "Low Match";
    return "No Match";
  }

  // Get similarity color class
  getSimilarityColorClass(score: number): string {
    if (score >= 90) return "text-red-400";
    if (score >= 75) return "text-orange-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 50) return "text-blue-400";
    return "text-slate-400";
  }
}
