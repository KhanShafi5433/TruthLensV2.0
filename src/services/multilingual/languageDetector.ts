export type SupportedLanguage = "English" | "Hindi" | "Marathi" | "Hinglish";

export function detectLanguage(text: string): SupportedLanguage {
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  const lower = text.toLowerCase();
  const hasHinglish = /\b(aap|jaldi|paisa|bank|otp|kyc|kripya|turant)\b/.test(lower);

  if (hasDevanagari && /(आहे|करा|बँक|पैसे|तुम्ही)/.test(text)) return "Marathi";
  if (hasDevanagari) return "Hindi";
  if (hasHinglish) return "Hinglish";
  return "English";
}

export function warningLabelForLanguage(language: SupportedLanguage): string {
  switch (language) {
    case "Hindi":
      return "सावधान: यह संदेश संदिग्ध हो सकता है";
    case "Marathi":
      return "सावधान: हा संदेश संशयास्पद असू शकतो";
    case "Hinglish":
      return "Warning: Yeh message suspicious ho sakta hai";
    default:
      return "Warning: This content may be suspicious";
  }
}
