import { ScamAnalysisResult, SuspiciousPhrase } from "./analysisTypes";
import { normalizeRiskLevel, scoreToRiskLevel } from "./riskLevelUtils";

function clampScore(score: unknown): number {
  const n = typeof score === "number" ? score : Number(score);
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function phraseAppearsInContent(phrase: string, content: string): boolean {
  if (!phrase.trim() || !content.trim()) return false;
  return new RegExp(escapeRegex(phrase.trim()), "i").test(content);
}

function extractExactPhrase(content: string, phrase: string): string {
  const match = content.match(new RegExp(escapeRegex(phrase.trim()), "i"));
  return match ? match[0] : phrase.trim();
}

function toIndicators(
  value: unknown,
  content: string,
  bypassSubstringCheck = false
): SuspiciousPhrase[] {
  if (!Array.isArray(value)) return [];

  const results: SuspiciousPhrase[] = [];

  for (const item of value) {
    if (typeof item === "string") {
      const text = item.trim();
      if (!text) continue;
      if (!bypassSubstringCheck && !phraseAppearsInContent(text, content)) continue;
      results.push({
        text: bypassSubstringCheck ? text : extractExactPhrase(content, text),
        reason: "This wording stood out as worth reviewing in context.",
      });
      continue;
    }

    if (item && typeof item === "object") {
      const row = item as Record<string, unknown>;
      const rawText = String(row.text ?? row.phrase ?? row.name ?? "").trim();
      const reason = String(row.reason ?? row.explanation ?? row.description ?? "").trim();
      if (!rawText) continue;

      if (!bypassSubstringCheck && !phraseAppearsInContent(rawText, content)) continue;

      results.push({
        text: bypassSubstringCheck ? rawText : extractExactPhrase(content, rawText),
        reason: reason || "This phrase can be used to pressure or mislead recipients.",
      });
    }
  }

  return results.slice(0, 10);
}

function extractJsonObject(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1);
  }
  return null;
}

export function parseAnalysisResponse(
  rawText: string,
  content: string,
  options?: { strictPhrases?: boolean; bypassSubstringCheck?: boolean }
): ScamAnalysisResult | null {
  const strictPhrases = options?.strictPhrases !== false;
  const bypassSubstringCheck = options?.bypassSubstringCheck === true;
  const jsonText = extractJsonObject(rawText.trim());
  if (!jsonText) return null;

  try {
    const parsed = JSON.parse(jsonText) as Record<string, unknown>;
    const score = clampScore(parsed.score ?? parsed.riskScore);
    const riskLevel = normalizeRiskLevel(parsed.riskLevel ?? parsed.risk_level, score);
    const alignedLevel = scoreToRiskLevel(score);

    let indicators = toIndicators(
      parsed.indicators ?? parsed.suspiciousPhrases ?? parsed.detectedIndicators,
      content,
      bypassSubstringCheck
    );

    if (!strictPhrases && indicators.length === 0 && Array.isArray(parsed.indicators)) {
      indicators = (parsed.indicators as unknown[])
        .map((item) => {
          if (typeof item === "string") {
            return { text: item.trim(), reason: "Visible text flagged in the image." };
          }
          if (item && typeof item === "object") {
            const row = item as Record<string, unknown>;
            const text = String(row.text ?? row.phrase ?? "").trim();
            const reason = String(row.reason ?? row.explanation ?? "").trim();
            if (!text) return null;
            return {
              text,
              reason: reason || "This visible wording may indicate a scam pattern.",
            };
          }
          return null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
        .slice(0, 10);
    }

    const reasoning = String(parsed.reasoning ?? parsed.explanation ?? "").trim();
    const advice = String(parsed.advice ?? parsed.safetyAdvice ?? "").trim();

    if (!reasoning || !advice) return null;

    return {
      score,
      riskLevel: alignedLevel === riskLevel ? riskLevel : alignedLevel,
      indicators,
      reasoning,
      advice,
    };
  } catch {
    return null;
  }
}
