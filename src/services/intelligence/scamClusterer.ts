export interface ScamReport {
  id: string;
  content: string;
  category: string;
  riskLevel: string;
  timestamp: any;
}

export interface ScamCluster {
  id: string;
  name: string;
  category: string;
  reportCount: number;
  riskLevel: string;
  severity: "info" | "warning" | "danger";
  commonKeywords: string[];
  lastSeen: string;
  sampleContent: string;
}

export class ScamClusterer {
  private static instance: ScamClusterer;

  static getInstance(): ScamClusterer {
    if (!ScamClusterer.instance) {
      ScamClusterer.instance = new ScamClusterer();
    }
    return ScamClusterer.instance;
  }

  // Calculate similarity between two scam reports
  private calculateSimilarity(report1: string, report2: string): number {
    const words1 = report1.toLowerCase().split(/\s+/);
    const words2 = report2.toLowerCase().split(/\s+/);
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
  }

  // Extract common keywords from a group of reports
  private extractCommonKeywords(reports: ScamReport[]): string[] {
    const keywordFrequency: Record<string, number> = {};
    
    for (const report of reports) {
      const words = report.content.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      for (const word of words) {
        keywordFrequency[word] = (keywordFrequency[word] || 0) + 1;
      }
    }
    
    // Get keywords that appear in at least 30% of reports
    const threshold = Math.max(2, Math.floor(reports.length * 0.3));
    const commonKeywords = Object.entries(keywordFrequency)
      .filter(([_, count]) => count >= threshold)
      .map(([word, _]) => word)
      .slice(0, 10); // Top 10 keywords
    
    return commonKeywords;
  }

  // Cluster similar scam reports
  clusterReports(reports: ScamReport[], similarityThreshold: number = 40): ScamCluster[] {
    const clusters: ScamCluster[] = [];
    const processed = new Set<string>();

    for (const report of reports) {
      if (processed.has(report.id)) continue;

      const similarReports: ScamReport[] = [report];
      processed.add(report.id);

      // Find similar reports
      for (const otherReport of reports) {
        if (processed.has(otherReport.id)) continue;

        const similarity = this.calculateSimilarity(report.content, otherReport.content);
        if (similarity >= similarityThreshold) {
          similarReports.push(otherReport);
          processed.add(otherReport.id);
        }
      }

      // Only create cluster if we have multiple reports
      if (similarReports.length >= 2) {
        const commonKeywords = this.extractCommonKeywords(similarReports);
        const category = this.determineClusterCategory(similarReports);
        const riskLevel = this.determineClusterRisk(similarReports);
        const name = this.generateClusterName(category, commonKeywords);

        clusters.push({
          id: `cluster_${Date.now()}_${clusters.length}`,
          name,
          category,
          reportCount: similarReports.length,
          riskLevel,
          severity: this.getSeverityFromRisk(riskLevel),
          commonKeywords,
          lastSeen: this.getMostRecentTimestamp(similarReports),
          sampleContent: similarReports[0].content.substring(0, 100) + "...",
        });
      }
    }

    // Sort clusters by report count (descending)
    return clusters.sort((a, b) => b.reportCount - a.reportCount);
  }

  private determineClusterCategory(reports: ScamReport[]): string {
    const categoryCount: Record<string, number> = {};
    
    for (const report of reports) {
      categoryCount[report.category] = (categoryCount[report.category] || 0) + 1;
    }
    
    let bestCategory = "Unknown";
    let maxCount = 0;
    
    for (const [category, count] of Object.entries(categoryCount)) {
      if (count > maxCount) {
        maxCount = count;
        bestCategory = category;
      }
    }
    
    return bestCategory;
  }

  private determineClusterRisk(reports: ScamReport[]): string {
    const riskCount: Record<string, number> = {
      "High Risk": 0,
      "Suspicious": 0,
      "Moderate": 0,
      "Low": 0,
    };
    
    for (const report of reports) {
      riskCount[report.riskLevel as keyof typeof riskCount] = 
        (riskCount[report.riskLevel as keyof typeof riskCount] || 0) + 1;
    }
    
    // If majority are high risk, cluster is high risk
    if (riskCount["High Risk"] >= reports.length * 0.5) {
      return "High Risk";
    }
    
    if (riskCount["Suspicious"] >= reports.length * 0.5) {
      return "Suspicious";
    }
    
    return "Moderate";
  }

  private generateClusterName(category: string, keywords: string[]): string {
    if (keywords.length > 0) {
      const topKeyword = keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1);
      return `${category} - ${topKeyword} Pattern`;
    }
    return `${category} Campaign`;
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

  private getMostRecentTimestamp(reports: ScamReport[]): string {
    let mostRecent = reports[0].timestamp;
    
    for (const report of reports) {
      if (report.timestamp && report.timestamp.toDate) {
        const reportDate = report.timestamp.toDate();
        const mostRecentDate = mostRecent.toDate();
        if (reportDate > mostRecentDate) {
          mostRecent = report.timestamp;
        }
      }
    }
    
    return this.formatTimestamp(mostRecent);
  }

  private formatTimestamp(timestamp: any): string {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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
}
