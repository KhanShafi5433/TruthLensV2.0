export interface ScreenshotAnalysis {
  isSuspicious: boolean;
  confidence: number;
  warnings: string[];
  indicators: {
    inconsistentFonts: boolean;
    unusualArtifacts: boolean;
    editedElements: boolean;
    metadataIssues: boolean;
  };
}

export function analyzeScreenshotForManipulation(
  ocrText: string,
  imageMetadata?: {
    width?: number;
    height?: number;
    format?: string;
  }
): ScreenshotAnalysis {
  const warnings: string[] = [];
  const indicators = {
    inconsistentFonts: false,
    unusualArtifacts: false,
    editedElements: false,
    metadataIssues: false,
  };
  let confidence = 0;

  // Check for inconsistent font patterns in OCR text
  const fontInconsistencies = detectFontInconsistencies(ocrText);
  if (fontInconsistencies > 0) {
    indicators.inconsistentFonts = true;
    warnings.push(`Detected ${fontInconsistencies} font inconsistencies`);
    confidence += fontInconsistencies * 10;
  }

  // Check for unusual spacing or formatting
  const spacingIssues = detectSpacingIssues(ocrText);
  if (spacingIssues > 0) {
    indicators.unusualArtifacts = true;
    warnings.push("Unusual spacing patterns detected");
    confidence += spacingIssues * 5;
  }

  // Check for common fake screenshot patterns
  const fakePatterns = detectFakePatterns(ocrText);
  if (fakePatterns.length > 0) {
    indicators.editedElements = true;
    warnings.push(...fakePatterns);
    confidence += fakePatterns.length * 15;
  }

  // Check metadata issues
  if (imageMetadata) {
    const metaIssues = detectMetadataIssues(imageMetadata);
    if (metaIssues.length > 0) {
      indicators.metadataIssues = true;
      warnings.push(...metaIssues);
      confidence += metaIssues.length * 10;
    }
  }

  // Normalize confidence
  confidence = Math.min(100, confidence);

  const isSuspicious = confidence > 40;

  return {
    isSuspicious,
    confidence,
    warnings,
    indicators,
  };
}

function detectFontInconsistencies(text: string): number {
  let inconsistencies = 0;

  // Check for mixed case patterns that suggest editing
  const lines = text.split("\n");
  for (const line of lines) {
    if (line.length > 0) {
      const hasUpper = /[A-Z]/.test(line);
      const hasLower = /[a-z]/.test(line);
      const hasMixed = hasUpper && hasLower;

      // Check for random capitalization
      if (hasMixed) {
        const upperCount = (line.match(/[A-Z]/g) || []).length;
        const lowerCount = (line.match(/[a-z]/g) || []).length;
        const ratio = upperCount / (upperCount + lowerCount);

        // Unusual capitalization ratio
        if (ratio > 0.7 || ratio < 0.3) {
          inconsistencies++;
        }
      }
    }
  }

  return inconsistencies;
}

function detectSpacingIssues(text: string): number {
  let issues = 0;

  // Check for multiple consecutive spaces
  if (/\s{3,}/.test(text)) {
    issues++;
  }

  // Check for inconsistent line spacing
  const lines = text.split("\n");
  const lineLengths = lines.map((l) => l.length);
  const avgLength = lineLengths.reduce((a, b) => a + b, 0) / lineLengths.length;

  const significantDeviations = lineLengths.filter(
    (len) => Math.abs(len - avgLength) > avgLength * 0.5
  ).length;

  if (significantDeviations > lineLengths.length * 0.3) {
    issues++;
  }

  return issues;
}

function detectFakePatterns(text: string): string[] {
  const patterns: string[] = [];
  const lowerText = text.toLowerCase();

  // Common fake screenshot indicators
  const fakeIndicators = [
    { pattern: "edited", message: "Contains 'edited' text" },
    { pattern: "photoshopped", message: "Contains 'photoshopped' text" },
    { pattern: "fake", message: "Contains 'fake' text" },
    { pattern: "screenshot", message: "Contains 'screenshot' label" },
    { pattern: "proof", message: "Contains 'proof' text" },
  ];

  for (const indicator of fakeIndicators) {
    if (lowerText.includes(indicator.pattern)) {
      patterns.push(indicator.message);
    }
  }

  // Check for transaction inconsistencies
  if (lowerText.includes("rs.") || lowerText.includes("₹")) {
    const amounts = text.match(/(?:Rs\.|₹)\s*[\d,]+\.?\d*/g) || [];
    if (amounts.length > 1) {
      patterns.push("Multiple different amounts detected");
    }
  }

  // Check for date inconsistencies
  const dates = text.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/g) || [];
  if (dates.length > 1) {
    patterns.push("Multiple different dates detected");
  }

  return patterns;
}

function detectMetadataIssues(metadata: {
  width?: number;
  height?: number;
  format?: string;
}): string[] {
  const issues: string[] = [];

  // Check for unusual dimensions
  if (metadata.width && metadata.height) {
    const aspectRatio = metadata.width / metadata.height;
    
    // Unusual aspect ratios for screenshots
    if (aspectRatio < 0.5 || aspectRatio > 2) {
      issues.push("Unusual image aspect ratio");
    }

    // Very small dimensions suggest editing
    if (metadata.width < 300 || metadata.height < 300) {
      issues.push("Very small image dimensions");
    }
  }

  // Check for unusual formats
  if (metadata.format && !["jpeg", "jpg", "png", "webp"].includes(metadata.format.toLowerCase())) {
    issues.push("Unusual image format");
  }

  return issues;
}

export function getScreenshotWarningMessage(analysis: ScreenshotAnalysis): string {
  if (analysis.confidence > 70) {
    return "⚠️ HIGH PROBABILITY: This screenshot appears to be edited or fake!";
  }

  if (analysis.confidence > 40) {
    return "⚠️ SUSPICIOUS: This screenshot may have been manipulated.";
  }

  return "✅ Screenshot appears authentic.";
}
