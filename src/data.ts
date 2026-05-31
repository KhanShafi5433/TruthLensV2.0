import { DemoScenario, SecurityTip } from "./types";

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "scen_grandson_audio",
    title: "Voice message: urgent family help",
    subtitle: "Sample transcript of a grandparent-style urgent call",
    type: "audio",
    fileDetails: {
      name: "grandson_voice_urgent.wav",
      size: "1.2 MB",
      duration: "0:24",
    },
    sampleContent:
      "Grandma, it's me. I was in a car accident and I need money wired right away. Please don't call mom and dad — they're upset with me. Can you send $2,000 today? I'll pay you back.",
  },
  {
    id: "scen_bank_agent_video",
    title: "Video call: bank security verification",
    subtitle: "Sample script of a fake bank verification request",
    type: "video",
    fileDetails: {
      name: "cyber_bank_verification.mp4",
      size: "11.4 MB",
      duration: "0:36",
    },
    sampleContent:
      "This is your bank security team. We detected fraud on your account. Stay on this video call and read your one-time code aloud so we can unlock your account immediately.",
  },
  {
    id: "scen_phishing_screenshot",
    title: "Chat message: tax refund fee",
    subtitle: "Sample text from a fake refund message",
    type: "screenshot",
    fileDetails: {
      name: "custom_tax_verification_sms.png",
      size: "340 KB",
    },
    sampleContent:
      "Federal Customs Refund: Your refund of $1,240 is on hold. Pay the $89 clearance fee within 2 hours using this link or your refund will be cancelled: customs-refund-portal.verify-id.net/pay",
  },
  {
    id: "scen_emergency_sms_text",
    title: "SMS: bank account lockout",
    subtitle: "Sample smishing text with a suspicious link",
    type: "text",
    sampleContent:
      "ALERT: Online banking access restricted due to unrecognized logins from Seattle, WA. To unlock and avoid temporary asset suspension, verify primary phone ownership immediately at info-bank-secure.com/auth or contact terminal support.",
  },
  {
    id: "scen_dinner_mom_low",
    title: "Voice message: dinner plans",
    subtitle: "Sample of a normal, low-risk family message",
    type: "audio",
    fileDetails: {
      name: "mom_grocery_dinner.m4a",
      size: "480 KB",
      duration: "0:15",
    },
    sampleContent:
      "Hi honey, can you pick up milk and pasta on your way home? Dinner is around 7. Love you.",
  },
];

export const SECURITY_TIPS: SecurityTip[] = [
  {
    id: "tip_voice",
    title: "How to spot urgent family impersonation calls",
    category: "Deepfake Voice",
    summary:
      "Scammers may clone a relative's voice or pretend to be family in distress to rush you into sending money.",
    guidelines: [
      "Agree on a family code word or callback number that only you share in person.",
      "Hang up and call your relative on a number you already trust.",
      "Never wire money, buy gift cards, or send crypto because someone says it is an emergency.",
    ],
  },
  {
    id: "tip_video",
    title: "Red flags on unexpected video verification calls",
    category: "Video Manipulations",
    summary:
      "Fraudsters may pose as bank staff on video and ask you to share codes or approve transfers.",
    guidelines: [
      "Real banks do not ask for one-time codes over a live video chat.",
      "End the call and reach your bank using the number on your card or official app.",
      "Never share passwords, PINs, or verification codes with anyone who called you.",
    ],
  },
  {
    id: "tip_urgency",
    title: "Slow down when messages create panic",
    category: "Urgency Traps",
    summary:
      "Urgent deadlines and threats of account closure are common ways scammers block careful thinking.",
    guidelines: [
      "Watch for phrases like immediate action, account suspended, or payment due today.",
      "Pause before clicking links — open the official app or website yourself instead.",
      "Talk to someone you trust before sending money or personal information.",
    ],
  },
];
