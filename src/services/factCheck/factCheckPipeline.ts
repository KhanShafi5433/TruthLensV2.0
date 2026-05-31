// Types for the fact-checking pipeline
export interface Source {
  title: string;
  url: string;
  reliability_score: number; // 0.0-1.0
  content: string;
}

export interface FactCheckResult {
  claim: string;
  verdict: "true" | "false" | "uncertain";
  confidence_score: number;
  conflict_detected: boolean;
  reasoning: string;
  evidence_strength: number;
  evidenceStrengthLabel: "Strong" | "Moderate" | "Limited";
  sourceAgreement: "High" | "Mixed" | "Low";
  sources: Source[];
  limitations: string[];
  cached: boolean;
}

export interface CacheEntry {
  result: FactCheckResult;
  timestamp: number;
}

// In-memory cache for MVP
const factCheckCache = new Map<string, CacheEntry>();

// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Normalize query string for cache key
function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "");
}

// Check if cache entry is still valid
function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

// Get cached result if available
export function getCachedResult(query: string): FactCheckResult | null {
  const cacheKey = normalizeQuery(query);
  const entry = factCheckCache.get(cacheKey);
  
  if (entry && isCacheValid(entry)) {
    return { ...entry.result, cached: true };
  }
  
  return null;
}

// Store result in cache
export function cacheResult(query: string, result: FactCheckResult): void {
  const cacheKey = normalizeQuery(query);
  factCheckCache.set(cacheKey, {
    result: { ...result, cached: false },
    timestamp: Date.now(),
  });
}

// Calculate confidence score based on sources
export function calculateConfidence(
  supportingSources: Source[],
  contradictingSources: Source[]
): number {
  const totalSources = supportingSources.length + contradictingSources.length;
  
  if (totalSources === 0) {
    return 0.3; // Low confidence with no sources
  }
  
  // Weight sources by reliability_score
  let supportingWeight = 0;
  let contradictingWeight = 0;
  
  supportingSources.forEach(source => {
    supportingWeight += source.reliability_score;
  });
  
  contradictingSources.forEach(source => {
    contradictingWeight += source.reliability_score;
  });
  
  const totalWeight = supportingWeight + contradictingWeight;
  
  if (totalWeight === 0) {
    return 0.3;
  }
  
  // Calculate base confidence from source agreement
  const agreementRatio = supportingWeight / totalWeight;
  
  // Adjust confidence based on number of sources
  const sourceCountBonus = Math.min(totalSources * 0.05, 0.2); // Max 0.2 bonus
  
  // Final confidence calculation
  let confidence = agreementRatio + sourceCountBonus;
  
  // If there are contradicting sources, reduce confidence
  if (contradictingSources.length > 0) {
    confidence *= 0.7; // 30% reduction for conflicts
  }
  
  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, confidence));
}

// Determine verdict based on source agreement
export function determineVerdict(
  supportingSources: Source[],
  contradictingSources: Source[]
): { verdict: "true" | "false" | "uncertain"; conflict_detected: boolean } {
  const hasSupporting = supportingSources.length > 0;
  const hasContradicting = contradictingSources.length > 0;
  
  if (hasSupporting && !hasContradicting) {
    return { verdict: "true", conflict_detected: false };
  }
  
  if (!hasSupporting && hasContradicting) {
    return { verdict: "false", conflict_detected: false };
  }
  
  if (hasSupporting && hasContradicting) {
    // Check if one side significantly outweighs the other
    const supportWeight = supportingSources.reduce((sum, s) => sum + s.reliability_score, 0);
    const contradictWeight = contradictingSources.reduce((sum, s) => sum + s.reliability_score, 0);
    
    // If one side is significantly stronger (2x), go with that
    if (supportWeight >= contradictWeight * 2) {
      return { verdict: "true", conflict_detected: true };
    }
    if (contradictWeight >= supportWeight * 2) {
      return { verdict: "false", conflict_detected: true };
    }
    
    // Both sides have similar weight - uncertain with conflict detected
    return { verdict: "uncertain", conflict_detected: true };
  }
  
  // No sources at all
  return { verdict: "uncertain", conflict_detected: false };
}

// Calculate evidence strength
export function calculateEvidenceStrength(
  supportingSources: Source[],
  contradictingSources: Source[]
): number {
  const supportingWeight = supportingSources.reduce((sum, s) => sum + s.reliability_score, 0);
  const contradictingWeight = contradictingSources.reduce((sum, s) => sum + s.reliability_score, 0);
  
  return supportingWeight - contradictingWeight;
}

// Convert evidence strength to label
export function getEvidenceStrengthLabel(strength: number): "Strong" | "Moderate" | "Limited" {
  if (strength >= 2) return "Strong";
  if (strength >= 0.5) return "Moderate";
  return "Limited";
}

// Calculate source agreement
export function getSourceAgreement(
  supportingSources: Source[],
  contradictingSources: Source[]
): "High" | "Mixed" | "Low" {
  const totalSources = supportingSources.length + contradictingSources.length;
  
  if (totalSources === 0) return "Low";
  
  const supportingRatio = supportingSources.length / totalSources;
  
  if (supportingRatio >= 0.8 || supportingRatio <= 0.2) return "High";
  if (supportingRatio >= 0.6 || supportingRatio <= 0.4) return "Mixed";
  return "Low";
}

// Generate limitations list
export function generateLimitations(
  supportingSources: Source[],
  contradictingSources: Source[]
): string[] {
  const limitations: string[] = [
    "Depends on external sources",
    "May misinterpret conflicting information",
    "Cannot guarantee absolute truth",
  ];
  
  const totalSources = supportingSources.length + contradictingSources.length;
  
  if (totalSources === 0) {
    limitations.push("No sources available for verification");
  }
  
  const lowReliabilitySources = [...supportingSources, ...contradictingSources].filter(
    s => s.reliability_score < 0.5
  );
  
  if (lowReliabilitySources.length > 0) {
    limitations.push("Some sources have low reliability scores");
  }
  
  return limitations;
}

// Main fact-check pipeline
export async function factCheckClaim(
  claim: string,
  retrieveSources: (claim: string) => Promise<{ supporting: Source[]; contradicting: Source[] }>,
  analyzeWithLLM: (claim: string, sources: { supporting: Source[]; contradicting: Source[] }) => Promise<{ reasoning: string }>
): Promise<FactCheckResult> {
  // Check cache first
  const cached = getCachedResult(claim);
  if (cached) {
    return cached;
  }
  
  // Retrieve sources
  const sources = await retrieveSources(claim);
  
  // Smart fallback: if no sources or only low reliability sources
  const totalSources = sources.supporting.length + sources.contradicting.length;
  const hasLowReliabilityOnly = [...sources.supporting, ...sources.contradicting].every(
    s => s.reliability_score < 0.5
  );
  
  if (totalSources === 0 || hasLowReliabilityOnly) {
    const result: FactCheckResult = {
      claim,
      verdict: "uncertain",
      confidence_score: 0.3,
      conflict_detected: false,
      reasoning: totalSources === 0 
        ? "Insufficient evidence: No sources found to verify the claim."
        : "Insufficient evidence: Only low-reliability sources available.",
      evidence_strength: 0,
      evidenceStrengthLabel: "Limited",
      sourceAgreement: "Low",
      sources: [...sources.supporting, ...sources.contradicting],
      limitations: [
        "Insufficient evidence for verification",
        "No high-quality sources available",
        "Cannot provide definitive verdict",
      ],
      cached: false,
    };
    
    cacheResult(claim, result);
    return result;
  }
  
  // Calculate confidence
  const confidence_score = calculateConfidence(sources.supporting, sources.contradicting);
  
  // Determine verdict and conflict detection
  const { verdict, conflict_detected } = determineVerdict(sources.supporting, sources.contradicting);
  
  // Calculate evidence strength
  const evidence_strength = calculateEvidenceStrength(sources.supporting, sources.contradicting);
  
  // Generate limitations
  const limitations = generateLimitations(sources.supporting, sources.contradicting);
  
  // Get LLM reasoning
  const llmAnalysis = await analyzeWithLLM(claim, sources);
  
  // Build result
  const result: FactCheckResult = {
    claim,
    verdict,
    confidence_score,
    conflict_detected,
    reasoning: llmAnalysis.reasoning,
    evidence_strength,
    evidenceStrengthLabel: getEvidenceStrengthLabel(evidence_strength),
    sourceAgreement: getSourceAgreement(sources.supporting, sources.contradicting),
    sources: [...sources.supporting, ...sources.contradicting],
    limitations,
    cached: false,
  };
  
  // Cache the result
  cacheResult(claim, result);
  
  return result;
}

// Clear cache (useful for testing)
export function clearCache(): void {
  factCheckCache.clear();
}

// Get cache statistics
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: factCheckCache.size,
    keys: Array.from(factCheckCache.keys()),
  };
}
