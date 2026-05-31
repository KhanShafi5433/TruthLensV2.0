/**
 * Example usage of the Fact-Checking Pipeline
 * 
 * This demonstrates how to use the confidence scoring, caching,
 * and structured output features.
 */

import { factCheckClaim, clearCache, getCacheStats } from "./factCheckPipeline";
import { mockRetrieveSources } from "./mockSourceRetrieval";
import { analyzeWithLLM } from "./llmFactCheckService";

// Example 1: Fact-check a claim with multiple sources
async function example1() {
  console.log("=== Example 1: Climate Change ===");
  
  const claim = "Climate change is real";
  
  const result = await factCheckClaim(
    claim,
    mockRetrieveSources,
    analyzeWithLLM
  );
  
  console.log(JSON.stringify(result, null, 2));
  console.log("\n");
}

// Example 2: Fact-check a claim with conflicting sources
async function example2() {
  console.log("=== Example 2: Flat Earth ===");
  
  const claim = "The earth is flat";
  
  const result = await factCheckClaim(
    claim,
    mockRetrieveSources,
    analyzeWithLLM
  );
  
  console.log(JSON.stringify(result, null, 2));
  console.log("\n");
}

// Example 3: Demonstrate caching
async function example3() {
  console.log("=== Example 3: Caching Demonstration ===");
  
  const claim = "Water boils at 100 degrees celsius";
  
  // First call - not cached
  console.log("First call (not cached):");
  const result1 = await factCheckClaim(
    claim,
    mockRetrieveSources,
    analyzeWithLLM
  );
  console.log(`Cached: ${result1.cached}`);
  
  // Second call - should be cached
  console.log("\nSecond call (should be cached):");
  const result2 = await factCheckClaim(
    claim,
    mockRetrieveSources,
    analyzeWithLLM
  );
  console.log(`Cached: ${result2.cached}`);
  
  console.log("\n");
}

// Example 4: Confidence scoring and evidence strength demonstration
async function example4() {
  console.log("=== Example 4: Confidence Scoring & Evidence Strength ===");
  
  const claims = [
    "Climate change is real",
    "The earth is flat",
    "Vaccines cause autism",
    "Water boils at 100 degrees celsius",
  ];
  
  for (const claim of claims) {
    const result = await factCheckClaim(
      claim,
      mockRetrieveSources,
      analyzeWithLLM
    );
    
    console.log(`Claim: "${claim}"`);
    console.log(`Verdict: ${result.verdict}`);
    console.log(`Confidence: ${result.confidence_score.toFixed(2)}`);
    console.log(`Evidence Strength: ${result.evidence_strength.toFixed(2)}`);
    console.log(`Conflict Detected: ${result.conflict_detected}`);
    console.log(`Total Sources: ${result.sources.length}`);
    console.log(`Limitations: ${result.limitations.join(", ")}`);
    console.log("\n");
  }
}

// Example 5: Cache statistics
async function example5() {
  console.log("=== Example 5: Cache Statistics ===");
  
  // Clear cache first
  clearCache();
  
  // Run a few queries
  await factCheckClaim("Climate change is real", mockRetrieveSources, analyzeWithLLM);
  await factCheckClaim("The earth is flat", mockRetrieveSources, analyzeWithLLM);
  await factCheckClaim("Climate change is real", mockRetrieveSources, analyzeWithLLM); // This should be cached
  
  const stats = getCacheStats();
  console.log(`Cache size: ${stats.size}`);
  console.log(`Cached queries: ${stats.keys.join(", ")}`);
  console.log("\n");
}

// Example 6: Smart fallback behavior
async function example6() {
  console.log("=== Example 6: Smart Fallback Behavior ===");
  
  // Test with a claim that has no mock sources
  const claim = "The moon is made of cheese";
  
  const result = await factCheckClaim(
    claim,
    mockRetrieveSources,
    analyzeWithLLM
  );
  
  console.log(`Claim: "${claim}"`);
  console.log(`Verdict: ${result.verdict}`);
  console.log(`Confidence: ${result.confidence_score.toFixed(2)}`);
  console.log(`Reasoning: ${result.reasoning}`);
  console.log(`Limitations: ${result.limitations.join(", ")}`);
  console.log("\n");
}

// Run all examples
export async function runAllExamples() {
  console.log("=== Fact-Checking Pipeline Examples ===\n");
  
  await example1();
  await example2();
  await example3();
  await example4();
  await example5();
  await example6();
  
  console.log("=== All examples completed ===");
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
