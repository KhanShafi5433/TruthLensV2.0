import { Source } from "./factCheckPipeline";
import { getGeminiApiKey } from "../geminiShared";
import { generateGeminiText } from "../geminiRest";

const FACT_CHECK_PROMPT = `You are Ai-Shafi, a helpful and analytical AI assistant focused on fact-checking. Your goal is to provide balanced, clear guidance without being overly alarmist.

Analyze the claim and sources to provide a verdict.

STRICT RULES:
- Return STRICT JSON ONLY. No markdown, no code fences, no extra text.
- Output MUST be valid JSON with exact keys specified below.
- Consider source agreement, source quality (reliability scores), and contradictions.
- Prioritize evidence over model intuition.
- Downgrade confidence when sources conflict.
- Never output a definitive verdict without evidence.
- Clearly indicate uncertainty when needed.
- Be helpful and analytical, not fear-based. Focus on providing useful information rather than unnecessary warnings.
- If uncertain, acknowledge uncertainty clearly without assuming danger.

EXPLANATION REQUIREMENTS:
- MUST explain WHY the verdict was given
- MUST mention the number of sources
- MUST mention the agreement level between sources
- MUST mention the quality of sources (reliability scores)
- No vague answers allowed

JSON format (exact keys):
{
  "reasoning": "detailed explanation of decision considering source agreement, source quality, and contradictions"
}

Claim to fact-check:
"""
{{CLAIM}}
"""

Supporting sources:
{{SUPPORTING_SOURCES}}

Contradicting sources:
{{CONTRADICTING_SOURCES}}
`;

function formatSources(sources: Source[]): string {
  if (sources.length === 0) {
    return "None";
  }
  
  return sources
    .map((source, index) => 
      `${index + 1}. ${source.title} (${source.url}) - Reliability Score: ${source.reliability_score}\n   Content: ${source.content}`
    )
    .join("\n");
}

function buildPrompt(claim: string, supportingSources: Source[], contradictingSources: Source[]): string {
  return FACT_CHECK_PROMPT
    .replace("{{CLAIM}}", claim)
    .replace("{{SUPPORTING_SOURCES}}", formatSources(supportingSources))
    .replace("{{CONTRADICTING_SOURCES}}", formatSources(contradictingSources));
}

export async function analyzeWithLLM(
  claim: string,
  sources: { supporting: Source[]; contradicting: Source[] }
): Promise<{ reasoning: string }> {
  const apiKey = getGeminiApiKey();
  
  // Calculate source statistics for fallback reasoning
  const supportingCount = sources.supporting.length;
  const contradictingCount = sources.contradicting.length;
  const totalSources = supportingCount + contradictingCount;
  
  const supportingReliability = sources.supporting.reduce((sum, s) => sum + s.reliability_score, 0);
  const contradictingReliability = sources.contradicting.reduce((sum, s) => sum + s.reliability_score, 0);
  
  if (!apiKey) {
    // Fallback reasoning when no API key
    if (totalSources === 0) {
      return {
        reasoning: "No sources available to verify the claim. Unable to provide a definitive verdict due to insufficient evidence.",
      };
    }
    
    if (supportingCount > contradictingCount) {
      return {
        reasoning: `Supporting evidence from ${supportingCount} source(s) with average reliability score of ${(supportingReliability / supportingCount).toFixed(2)} outweighs contradicting evidence from ${contradictingCount} source(s) with average reliability score of ${contradictingCount > 0 ? (contradictingReliability / contradictingCount).toFixed(2) : 0}.`,
      };
    }
    
    if (contradictingCount > supportingCount) {
      return {
        reasoning: `Contradicting evidence from ${contradictingCount} source(s) with average reliability score of ${(contradictingReliability / contradictingCount).toFixed(2)} outweighs supporting evidence from ${supportingCount} source(s) with average reliability score of ${supportingCount > 0 ? (supportingReliability / supportingCount).toFixed(2) : 0}.`,
      };
    }
    
    return {
      reasoning: `Conflicting evidence with ${supportingCount} supporting source(s) with average reliability score of ${(supportingReliability / supportingCount).toFixed(2)} and ${contradictingCount} contradicting source(s) with average reliability score of ${(contradictingReliability / contradictingCount).toFixed(2)}. Unable to determine a definitive verdict.`,
    };
  }
  
  try {
    const prompt = buildPrompt(claim, sources.supporting, sources.contradicting);
    const response = await generateGeminiText(apiKey, prompt);
    
    // Parse JSON response
    const parsed = JSON.parse(response);
    
    if (parsed.reasoning) {
      return { reasoning: parsed.reasoning };
    }
    
    // Fallback if JSON structure is unexpected
    return {
      reasoning: "Unable to parse LLM reasoning. Please check the response format.",
    };
  } catch (error) {
    console.error("[LLM FactCheck] analyzeWithLLM failed:", error);
    
    // Fallback reasoning on error
    if (totalSources === 0) {
      return {
        reasoning: "No sources available to verify the claim. Unable to provide a definitive verdict due to insufficient evidence.",
      };
    }
    
    return {
      reasoning: `Analysis based on ${supportingCount} supporting source(s) and ${contradictingCount} contradicting source(s). Supporting sources have total reliability score of ${supportingReliability.toFixed(2)}, contradicting sources have total reliability score of ${contradictingReliability.toFixed(2)}.`,
    };
  }
}
