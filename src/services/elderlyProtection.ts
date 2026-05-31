export interface ElderlyProtectionSettings {
  enabled: boolean;
  largeText: boolean;
  highContrast: boolean;
  voiceWarnings: boolean;
  simplifiedUI: boolean;
  emergencyContact?: string;
  preferredLanguage: "English" | "Hindi" | "Marathi";
}

export const DEFAULT_ELDERLY_SETTINGS: ElderlyProtectionSettings = {
  enabled: false,
  largeText: true,
  highContrast: true,
  voiceWarnings: true,
  simplifiedUI: true,
  preferredLanguage: "English",
};

export function getElderlyWarningMessage(
  riskLevel: string,
  language: "English" | "Hindi" | "Marathi"
): string {
  const warnings: Record<string, Record<string, string>> = {
    "High Risk": {
      English: "⚠️ DANGER! This is a SCAM! DO NOT CLICK! DO NOT SHARE ANYTHING!",
      Hindi: "⚠️ खतरा! यह एक धोखाधड़ी है! क्लिक न करें! कुछ भी साझा न करें!",
      Marathi: "⚠️ धोका! हे एक फसवणूक आहे! क्लिक करू नका! काहीही शेअर करू नका!",
    },
    "Suspicious": {
      English: "⚠️ WARNING! This looks suspicious. Be very careful!",
      Hindi: "⚠️ चेतावनी! यह संदिग्ध लगता है। बहुत सावधान रहें!",
      Marathi: "⚠️ चेतावनी! हे संशयास्पद दिसते. खूप काळजी घ्या!",
    },
    "Moderate": {
      English: "⚠️ CAUTION! Check this carefully before acting.",
      Hindi: "⚠️ सावधान! कार्य करने से पहले इसे ध्यान से जांचें।",
      Marathi: "⚠️ सावधान! कृती करण्यापूर्वी हे काळजीपूर्वन तपासा.",
    },
    "Low": {
      English: "✅ This appears safe, but stay alert.",
      Hindi: "✅ यह सुरक्षित प्रतीत होता है, लेकिन सतर्क रहें।",
      Marathi: "✅ हे सुरक्षित दिसते, परंतु सावधान रहा.",
    },
  };

  return warnings[riskLevel]?.[language] || warnings[riskLevel]?.["English"] || "⚠️ Warning detected";
}

export function getElderlyRecommendation(
  category: string,
  language: "English" | "Hindi" | "Marathi"
): string {
  const recommendations: Record<string, Record<string, string>> = {
    otp: {
      English: "NEVER share OTP! Call your bank immediately if you did.",
      Hindi: "OTP कभी शेयर न करें! यदि आपने किया है तो तुरंत अपने बैंक को कॉल करें।",
      Marathi: "OTP कधीही शेअर करू नका! तुम्ही केले असल्यास तुरंत तुमच्या बँकेला कॉल करा.",
    },
    payment: {
      English: "DO NOT PAY! This is a scam. Contact your bank.",
      Hindi: "भुगतान न करें! यह एक धोखाधड़ी है। अपने बैंक से संपर्क करें।",
      Marathi: "पेमेंट करू नका! हे एक फसवणूक आहे. तुमच्या बँकेशी संपर्क साधा.",
    },
    kyc: {
      English: "NEVER update KYC from messages! Use official app only.",
      Hindi: "संदेशों से KYC अपडेट न करें! केवल आधिकारिक ऐप का उपयोग करें।",
      Marathi: "संदेशांमधून KYC अपडेट करू नका! केवल अधिकृत अॅप वापरा.",
    },
    default: {
      English: "BE CAREFUL! Do not click links or share information.",
      Hindi: "सावधान रहें! लिंक पर क्लिक न करें और जानकारी साझा न करें।",
      Marathi: "सावधान रहा! लिंकवर क्लिक करू नका आणि माहिती शेअर करू नका.",
    },
  };

  return recommendations[category]?.[language] || recommendations[category]?.["English"] || recommendations["default"][language];
}
