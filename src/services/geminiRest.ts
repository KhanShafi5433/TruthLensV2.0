import { ImageAttachment } from "./analysisTypes";
import { GEMINI_MODEL } from "./geminiShared";

type GeminiPart = {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

async function callGemini(apiKey: string, parts: GeminiPart[]): Promise<string> {
  const proxyUrl = import.meta.env.VITE_GEMINI_PROXY_URL as string | undefined;
  const isCapacitor = window.location.protocol === "capacitor:";
  const endpoint = isCapacitor
    ? proxyUrl || "/api/gemini"
    : "/api/gemini";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts,
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }),
  });

  const responseText = await response.text();

  if (!response.ok && endpoint === "/api/gemini") {
    return callGeminiDirect(apiKey, parts);
  }

  if (!response.ok) {
    throw new Error(`Gemini request ${response.status}: ${responseText}`);
  }

  const data = JSON.parse(responseText) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";

  if (!text.trim()) {
    throw new Error("Gemini REST returned an empty response.");
  }

  return text.trim();
}

async function callGeminiDirect(apiKey: string, parts: GeminiPart[]): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts,
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Gemini direct ${response.status}: ${responseText}`);
  }

  const data = JSON.parse(responseText) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";

  if (!text.trim()) {
    throw new Error("Gemini direct returned an empty response.");
  }

  return text.trim();
}

export function generateGeminiText(apiKey: string, prompt: string): Promise<string> {
  return callGemini(apiKey, [{ text: prompt }]);
}

export function generateGeminiImage(
  apiKey: string,
  prompt: string,
  image: ImageAttachment
): Promise<string> {
  return callGemini(apiKey, [
    { text: prompt },
    {
      inline_data: {
        mime_type: image.mimeType,
        data: image.base64,
      },
    },
  ]);
}
