export interface ViralAnalysisResult {
  viralityRisk: "Low" | "Medium" | "High";
  misleadingPotential: "Yes" | "No" | "Partial";
  emotionalManipulation: "High" | "Medium" | "Low";
  explanation: {
    whyItMaySpread: string;
    misleadingFactors: string[];
    missingContext: string[];
    sensationalElements: string[];
  };
}

/**
 * Analyzes content for viral characteristics and misinformation patterns
 */
export function analyzeViralContent(content: string): ViralAnalysisResult {
  const lowerContent = content.toLowerCase();
  
  // Emotional manipulation indicators
  const emotionalIndicators = [
    "shocking", "unbelievable", "you won't believe", "must see", "urgent",
    "emergency", "breaking", "exclusive", "secret", "hidden", "they don't want you to know",
    "terrifying", "horrifying", "devastating", "heartbreaking", "outrageous",
    "incredible", "amazing", "miracle", "miraculous", "instant", "overnight",
    "finally revealed", "truth exposed", "cover-up", "conspiracy", "wake up"
  ];
  
  // Virality indicators
  const viralityIndicators = [
    "share this", "forward to everyone", "send to all contacts", "viral",
    "trending", "everyone is talking about", "don't ignore", "act now",
    "before it's too late", "limited time", "only today", "hurry",
    "tag your friends", "mention everyone", "copy and paste"
  ];
  
  // Misinformation patterns
  const misinformationPatterns = [
    "they say", "sources say", "anonymous source", "insider revealed",
    "experts confirm", "studies show", "research proves", "doctors recommend",
    "official statement", "government admits", "mainstream media won't report",
    "banned from social media", "censored", "suppressed information"
  ];
  
  // Sensational wording
  const sensationalWords = [
    "explosive", "bombshell", "shocking", "stunning", "jaw-dropping",
    "mind-blowing", "game-changer", "revolutionary", "unprecedented",
    "historic", "never before seen", "first time ever", "world-changing"
  ];
  
  // Context issues
  const contextIssues = [
    "without context", "out of context", "misleading context",
    "old photo", "from years ago", "not recent", "fake news",
    "photoshopped", "edited", "manipulated", "staged"
  ];
  
  // Count indicators
  const emotionalScore = emotionalIndicators.filter(ind => lowerContent.includes(ind)).length;
  const viralityScore = viralityIndicators.filter(ind => lowerContent.includes(ind)).length;
  const misinformationScore = misinformationPatterns.filter(ind => lowerContent.includes(ind)).length;
  const sensationalScore = sensationalWords.filter(ind => lowerContent.includes(ind)).length;
  const contextScore = contextIssues.filter(ind => lowerContent.includes(ind)).length;
  
  // Calculate overall scores
  const totalIndicators = emotionalScore + viralityScore + misinformationScore + sensationalScore;
  
  // Determine virality risk
  let viralityRisk: "Low" | "Medium" | "High";
  if (totalIndicators >= 5 || viralityScore >= 2) {
    viralityRisk = "High";
  } else if (totalIndicators >= 3 || viralityScore >= 1) {
    viralityRisk = "Medium";
  } else {
    viralityRisk = "Low";
  }
  
  // Determine misleading potential
  let misleadingPotential: "Yes" | "No" | "Partial";
  if (misinformationScore >= 2 || contextScore >= 2) {
    misleadingPotential = "Yes";
  } else if (misinformationScore >= 1 || contextScore >= 1 || emotionalScore >= 3) {
    misleadingPotential = "Partial";
  } else {
    misleadingPotential = "No";
  }
  
  // Determine emotional manipulation
  let emotionalManipulation: "High" | "Medium" | "Low";
  if (emotionalScore >= 3) {
    emotionalManipulation = "High";
  } else if (emotionalScore >= 1) {
    emotionalManipulation = "Medium";
  } else {
    emotionalManipulation = "Low";
  }
  
  // Build explanation
  const whyItMaySpread: string[] = [];
  if (viralityScore > 0) whyItMaySpread.push("Contains direct calls to share or forward");
  if (emotionalScore > 0) whyItMaySpread.push("Uses emotionally charged language to trigger reactions");
  if (sensationalScore > 0) whyItMaySpread.push("Uses sensational wording to grab attention");
  if (urgencyIndicators(lowerContent)) whyItMaySpread.push("Creates urgency to encourage immediate action");
  if (whyItMaySpread.length === 0) whyItMaySpread.push("Lacks strong viral triggers");
  
  const misleadingFactors: string[] = [];
  if (misinformationScore > 0) misleadingFactors.push("Uses vague attribution like 'sources say' or 'experts confirm'");
  if (contextScore > 0) misleadingFactors.push("May be presented without proper context");
  if (emotionalScore >= 3) misleadingFactors.push("Relies heavily on emotional manipulation");
  if (lowerContent.includes("fake") || lowerContent.includes("hoax")) misleadingFactors.push("Claims about fake content without verification");
  if (misleadingFactors.length === 0) misleadingFactors.push("No clear misleading patterns detected");
  
  const missingContext: string[] = [];
  if (contextScore > 0) missingContext.push("May be missing important context");
  if (!lowerContent.includes("when") && !lowerContent.includes("date") && !lowerContent.includes("time")) {
    missingContext.push("Lacks specific timing information");
  }
  if (!lowerContent.includes("where") && !lowerContent.includes("location")) {
    missingContext.push("Lacks specific location information");
  }
  if (missingContext.length === 0) missingContext.push("Context appears reasonably complete");
  
  const sensationalElements: string[] = [];
  sensationalWords.forEach(word => {
    if (lowerContent.includes(word)) {
      sensationalElements.push(`Uses sensational word: "${word}"`);
    }
  });
  emotionalIndicators.forEach(word => {
    if (lowerContent.includes(word)) {
      sensationalElements.push(`Uses emotional trigger: "${word}"`);
    }
  });
  if (sensationalElements.length === 0) sensationalElements.push("No sensational language detected");
  
  return {
    viralityRisk,
    misleadingPotential,
    emotionalManipulation,
    explanation: {
      whyItMaySpread: whyItMaySpread.join(". "),
      misleadingFactors,
      missingContext,
      sensationalElements,
    },
  };
}

function urgencyIndicators(content: string): boolean {
  const urgencyWords = ["urgent", "emergency", "immediately", "right now", "today only", "limited time", "act now", "before it's too late"];
  return urgencyWords.some(word => content.includes(word));
}
