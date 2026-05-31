export const GEMINI_MODEL = "gemini-3.1-flash-lite";

export function getGeminiApiKey(): string | undefined {
  const viteKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  const geminiKey = import.meta.env.GEMINI_API_KEY as string | undefined;
  const key = viteKey || geminiKey;
  if (!key || key === "MY_GEMINI_API_KEY" || key.length < 10) return undefined;
  return key;
}
