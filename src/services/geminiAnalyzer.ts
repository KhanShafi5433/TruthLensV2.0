import { AnalysisInput, ContentAnalysisOutput } from "./analysisTypes";
import { parseAnalysisResponse } from "./parseAnalysisResponse";
import { analyzeWithRules } from "./ruleBasedFallback";
import { analyzeImage } from "./geminiImageAnalyzer";
import { getGeminiApiKey } from "./geminiShared";
import { generateGeminiText } from "./geminiRest";
import { analyzeViralContent } from "./viralAnalyzer";

const ANALYSIS_PROMPT = `You are Ai-Shafi, a helpful and analytical AI assistant focused on online safety. Your goal is to provide balanced, clear guidance without being overly alarmist.

Analyze ONLY the exact user-provided message below.

STRICT RULES:
- Return STRICT JSON ONLY. No markdown, no code fences, no extra text.
- Do not invent technical jargon (no neural networks, spectral analysis, deepfake claims, WHOIS, metadata).
- Do not assume facts not in the message.
- Each indicator "text" MUST be an exact substring copied from the message (same words, correct casing as it appears).
- Each indicator "reason" MUST explain in plain language WHY that exact phrase is suspicious in this context.
- If the message is harmless (e.g. "Hello how are you"), use score 0-15, riskLevel "Low", indicators [], and say honestly it looks normal.
- Do not exaggerate. Only flag urgency, suspicious links, impersonation, threats, financial pressure, OTP/password/account language when those words actually appear.
- Be helpful and analytical, not fear-based. Focus on providing useful information rather than unnecessary warnings.
- If uncertain, acknowledge uncertainty clearly without assuming danger.

SCORING (align riskLevel with score):
- 0-30 = "Low"
- 31-60 = "Moderate"
- 61-80 = "Suspicious"
- 81-100 = "High Risk"

JSON format (exact keys):
{
  "score": 0,
  "riskLevel": "Low",
  "indicators": [
    {
      "text": "verify immediately",
      "reason": "Creates urgency pressure"
    }
  ],
  "reasoning": "One or two sentences summarizing the overall pattern using words from the message.",
  "advice": "Short practical safety advice."
}

Content type: {{TYPE}}
Context label: {{TITLE}}
{{FILE_LINE}}

Message to analyze:
"""
{{CONTENT}}
"""`;

function buildPrompt(input: AnalysisInput): string {
  const fileLine = input.fileName
    ? `Note: A file was named "${input.fileName}" but only the message text below was provided for analysis.`
    : "";

  return ANALYSIS_PROMPT.replace("{{TYPE}}", input.type)
    .replace("{{TITLE}}", input.title)
    .replace("{{FILE_LINE}}", fileLine)
    .replace("{{CONTENT}}", input.content);
}

export async function analyzeContent(input: AnalysisInput): Promise<ContentAnalysisOutput> {
  if (input.image?.base64 && input.type === "screenshot") {
    const vision = await analyzeImage(input, input.image);
    const analysis = vision.analysis;
    
    // Add viral analysis if viral mode is enabled
    if (input.viralMode) {
      const viralAnalysis = analyzeViralContent(vision.extractedText || input.content);
      analysis.viralAnalysis = viralAnalysis;
    }
    
    return {
      analysis,
      enrichedInput: {
        content: vision.extractedText || input.content,
        imageCategory: vision.imageCategory,
        subtitle: `${vision.imageCategory} · Vision analysis`,
      },
    };
  }

  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    const analysis = await analyzeWithRules(input);
    if (input.viralMode) {
      analysis.viralAnalysis = analyzeViralContent(input.content);
    }
    return { analysis };
  }

  try {
    const text = await generateGeminiText(apiKey, buildPrompt(input));
    const parsed = parseAnalysisResponse(text, input.content);

    if (parsed) {
      if (input.viralMode) {
        parsed.viralAnalysis = analyzeViralContent(input.content);
      }
      return { analysis: parsed };
    }

    const analysis = await analyzeWithRules(input);
    if (input.viralMode) {
      analysis.viralAnalysis = analyzeViralContent(input.content);
    }
    return { analysis };
  } catch (error) {
    console.error("[Gemini] text analyzeContent failed:", error);
    const analysis = await analyzeWithRules(input);
    if (input.viralMode) {
      analysis.viralAnalysis = analyzeViralContent(input.content);
    }
    return { analysis };
  }
}
