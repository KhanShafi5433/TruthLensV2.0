import { Capacitor } from "@capacitor/core";

export interface SharedContent {
  text?: string;
  image?: string; // base64
  url?: string;
  mimeType?: string;
}

export async function handleIncomingShare(): Promise<SharedContent | null> {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  try {
    // This would integrate with Android's intent handling
    // For now, return null as this requires native Android code
    // Future implementation would use Capacitor plugins or custom native code
    return null;
  } catch (error) {
    console.error("Error handling share:", error);
    return null;
  }
}

export function parseSharedContent(content: any): SharedContent {
  const result: SharedContent = {};

  if (content.text) {
    result.text = content.text;
  }

  if (content.image) {
    result.image = content.image;
    result.mimeType = content.mimeType || "image/jpeg";
  }

  if (content.url) {
    result.url = content.url;
  }

  return result;
}

export function isWhatsAppShare(content: any): boolean {
  // Check if content came from WhatsApp
  return content?.source === "whatsapp" || 
         content?.packageName === "com.whatsapp" ||
         content?.type === "whatsapp";
}

export function getShareSource(content: any): string {
  if (isWhatsAppShare(content)) return "WhatsApp";
  if (content?.packageName) return content.packageName;
  return "Unknown";
}
