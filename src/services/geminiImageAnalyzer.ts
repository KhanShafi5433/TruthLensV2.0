import { recognize } from "tesseract.js";
import {
  AnalysisInput,
  ImageCategory,
  ImageAttachment,
  ScamAnalysisResult,
} from "./analysisTypes";
import { parseAnalysisResponse } from "./parseAnalysisResponse";
import { getGeminiApiKey } from "./geminiShared";
import { generateGeminiImage } from "./geminiRest";
import { analyzeWithRules } from "./ruleBasedFallback";
import { scoreToRiskLevel } from "./riskLevelUtils";
import { analyzeScreenshotContent } from "./screenshotContentAnalyzer";
import { ScreenshotClassifier } from "./vision/screenshotClassifier";
import { ImagePreprocessor } from "./ocr/imagePreprocessor";

const IMAGE_CATEGORIES: ImageCategory[] = [
  "SMS screenshot",
  "email screenshot",
  "payment screenshot",
  "WhatsApp chat",
  "QR/payment scam",
  "phishing attempt",
  "fake alert",
  "suspicious link",
  "normal harmless image",
];

const IMAGE_ANALYSIS_PROMPT = `You are Ai-Shafi, a helpful and analytical AI assistant focused on online safety. Your goal is to provide balanced, clear guidance without being overly alarmist.
You are reviewing a screenshot or uploaded image to analyze the content INSIDE it for potential scams, phishing, social engineering, or security risks.

TASK:
1. Detect what the image shows and classify it into exactly ONE of the following categories (put this in "imageType"):
   - "SMS screenshot"
   - "email screenshot"
   - "payment screenshot"
   - "WhatsApp chat"
   - "QR/payment scam"
   - "phishing attempt"
   - "fake alert"
   - "suspicious link"
   - "normal harmless image"

2. Read and extract ALL visible text and meaning in the image (OCR/understanding).
   Include the visible text at the start of "reasoning" using this format:
   "Visible text: ... Analysis: ..."
   If there is no readable text, write "Visible text: No readable text found. Analysis: ..."

3. Analyze the actual content, layout, messaging, sender information, and details shown INSIDE the image. Do NOT just classify file safety or check whether the image is "safe to download". Analyze the content itself for:
   - Smishing/Phishing indicators (urgent actions, threat of account lockout, asset suspension)
   - Risky/Suspicious links (fake bank portals, typosquatting domains, info-stealer portals)
   - WhatsApp/SMS chats pushing for urgent money transfers, verification codes, or impersonating relatives (grandchild emergency)
   - QR code payment scams or fake receipts/payment screenshots showing false transactions
   - OTP or credential theft cues
   - Fake alerts (security warnings, tax refunds, fake government notifications)

4. Determine risk level and score:
   - "Low" (score 0-30): Harmless images (e.g. standard photos, text messages with relatives, memes, clean UI with no scam cues). Be honest and return low risk for harmless/normal content!
   - "Moderate" (score 31-60): Slightly suspicious elements, requests from unknown sources without strong pressure.
   - "Suspicious" (score 61-80): High probability of being a scam (contains urgency, suspicious links, generic greetings, unrecognized login warnings).
   - "High Risk" (score 81-100): Clear, obvious scams (phishing links, fake alerts, OTP requests, urgent transfer demands, QR code scams).

STRICT RULES:
- Return STRICT JSON ONLY. No markdown, no code fences, no extra text.
- Return exactly the keys shown below: imageType, score, riskLevel, indicators, reasoning, advice.
- Do not invent technical jargon (no neural networks, deepfake claims, spectral analysis, metadata checks). Keep explanations realistic and contextual.
- No generic "safe to download" or "safe image" style responses. Analyze the actual textual and visual context inside the screenshot.
- Each indicator "text" MUST be a short phrase or element visible in the image.
- Each indicator "reason" explains in plain language why that specific element is suspicious in context.
- If the image is harmless, indicators should be empty [].
- Be helpful and analytical, not fear-based. Focus on providing useful information rather than unnecessary warnings.
- If uncertain, acknowledge uncertainty clearly without assuming danger.

JSON format (exact keys):
{
  "imageType": "SMS screenshot",
  "score": 0,
  "riskLevel": "Low",
  "indicators": [
    {
      "text": "exact phrase or link",
      "reason": "why it's suspicious"
    }
  ],
  "reasoning": "A realistic, contextual explanation of the image content and why it is a scam or why it is harmless.",
  "advice": "Short, practical safety advice for the user based on the content."
}

File name: {{FILE_NAME}}`;

export interface ImageAnalysisOutput {
  analysis: ScamAnalysisResult;
  extractedText: string;
  imageCategory: ImageCategory;
}

function normalizeImageCategory(value: unknown): ImageCategory {
  const raw = String(value ?? "").trim();
  const match = IMAGE_CATEGORIES.find((c) => c.toLowerCase() === raw.toLowerCase());
  return match ?? "normal harmless image";
}

function parseImageResponse(
  rawText: string,
  fallbackContent: string
): ImageAnalysisOutput | null {
  const jsonText = rawText.trim();
  const start = jsonText.indexOf("{");
  const end = jsonText.lastIndexOf("}");
  if (start < 0 || end <= start) return null;

  try {
    const parsed = JSON.parse(jsonText.slice(start, end + 1)) as Record<string, unknown>;
    const reasoning = String(parsed.reasoning ?? "").trim();
    const visibleTextMatch = reasoning.match(/visible text:\s*([\s\S]*?)(?:\s*analysis:\s*|$)/i);
    const visibleText = visibleTextMatch?.[1]?.trim() ?? "";
    const contentForParse =
      visibleText && !/^no readable text found\.?$/i.test(visibleText) ? visibleText : fallbackContent;

    const base = parseAnalysisResponse(jsonText, contentForParse, {
      strictPhrases: false,
      bypassSubstringCheck: true,
    });
    if (!base) return null;

    const score = base.score;
    return {
      analysis: {
        ...base,
        riskLevel: scoreToRiskLevel(score),
      },
      extractedText: contentForParse,
      imageCategory: normalizeImageCategory(parsed.imageType),
    };
  } catch {
    return null;
  }
}

function imageFallback(): ImageAnalysisOutput {
  return {
    analysis: {
      score: 0,
      riskLevel: "Low",
      indicators: [],
      reasoning:
        "Image analysis is unavailable without a Gemini API key. Add VITE_GEMINI_API_KEY to analyze screenshots.",
      advice: "Configure your API key, or paste visible text under Pasted Text for a text-only review.",
    },
    extractedText: "",
    imageCategory: "normal harmless image",
  };
}

function getImageErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const lower = message.toLowerCase();

  if (lower.includes("quota") || lower.includes("429") || lower.includes("resource_exhausted")) {
    return "Gemini quota is temporarily exhausted for this API key or model.";
  }

  if (lower.includes("api key") || lower.includes("permission") || lower.includes("403")) {
    return "Gemini rejected the API key or project permissions.";
  }

  return "Image analysis failed due to a network or API error.";
}

function getImageTypeFromText(text: string): ImageCategory {
  const lower = text.toLowerCase();

  if (lower.includes("whatsapp")) return "WhatsApp chat";
  if (lower.includes("upi") || lower.includes("paid") || lower.includes("payment")) return "payment screenshot";
  if (lower.includes("qr")) return "QR/payment scam";
  if (lower.includes("@") || lower.includes("subject:")) return "email screenshot";
  if (lower.includes("otp") || lower.includes("kyc") || lower.includes("alert")) return "SMS screenshot";
  if (/https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|io|xyz|info)/i.test(text)) {
    return "suspicious link";
  }

  return "normal harmless image";
}

async function analyzeImageWithOcrFallback(
  input: AnalysisInput,
  image: ImageAttachment,
  error?: unknown
): Promise<ImageAnalysisOutput> {
  try {
    // Preprocess image to improve OCR quality
    const preprocessor = ImagePreprocessor.getInstance();
    const preprocessed = await preprocessor.preprocess(image.base64, image.mimeType);
    
    // Extract base64 from data URL for Tesseract
    const preprocessedBase64 = preprocessed.processedImage.split(',')[1];
    const dataUrl = `data:${image.mimeType};base64,${preprocessedBase64}`;
    
    // Use multiple languages for better Indian scam detection
    const result = await recognize(dataUrl, "eng+hin+mar");
    const extractedText = result.data.text.trim();

    if (extractedText) {
      // Use the new screenshot classifier for better content understanding
      const classifier = ScreenshotClassifier.getInstance();
      const screenshotClassification = classifier.classify(extractedText);
      
      // Also use the old content analyzer for backward compatibility
      const contentAnalysis = analyzeScreenshotContent(extractedText);
      
      const analysis = analyzeWithRules({
        ...input,
        content: extractedText,
      });

      const analysisResult = await analysis;
      return {
        analysis: {
          ...analysisResult,
          reasoning: `Detected: ${screenshotClassification.description}. ${contentAnalysis.description}. OCR fallback read visible text from the image and reviewed it for scam patterns. ${analysisResult.reasoning}`,
        },
        extractedText,
        imageCategory: getImageTypeFromText(extractedText),
      };
    }
  } catch (ocrError) {
    console.error("[TruthLens OCR] fallback failed:", ocrError);
  }

  return {
    ...imageFallback(),
    analysis: {
      score: 10,
      riskLevel: "Low",
      indicators: [],
      reasoning: getImageErrorMessage(error),
      advice: "Paste the visible message text into Pasted Text, or use a Gemini key/project with generateContent access.",
    },
  };
}

export async function analyzeImage(
  input: AnalysisInput,
  image: ImageAttachment
): Promise<ImageAnalysisOutput> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return analyzeImageWithOcrFallback(input, image);
  }

  const prompt = IMAGE_ANALYSIS_PROMPT.replace(
    "{{FILE_NAME}}",
    input.fileName ?? "uploaded-screenshot"
  );

  try {
    const text = await generateGeminiImage(apiKey, prompt, image);
    const parsed = parseImageResponse(text, input.content);

    if (parsed) {
      return parsed;
    }

    console.error("[Gemini Vision] Invalid JSON response:", text.slice(0, 200));
    return analyzeImageWithOcrFallback(input, image);
  } catch (error) {
    console.error("[Gemini Vision] analyzeImage failed:", error);
    return analyzeImageWithOcrFallback(input, image, error);
  }
}
