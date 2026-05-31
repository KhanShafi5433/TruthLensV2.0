import { ThreatFinding } from "./analysis/analysisModels";

export function generateRoast(findings: ThreatFinding[], score: number): string {
  if (score < 30) {
    return "This message is cleaner than your search history. Nothing suspicious here! ✨";
  }

  const roasts: string[] = [];

  if (findings.some(f => f.category === "urgency")) {
    roasts.push("This scammer thinks they're your boss with all that 'urgent' nonsense. 🙄");
  }

  if (findings.some(f => f.category === "otp")) {
    roasts.push("Asking for OTP? That's like asking for your house keys while wearing a ski mask. 🎭");
  }

  if (findings.some(f => f.category === "financial_panic")) {
    roasts.push("Trying to scare you about money? Original. Did they get this script from 2010? 📜");
  }

  if (findings.some(f => f.category === "grammar_manipulation")) {
    roasts.push("The grammar in this is worse than autocorrect fails. At least try harder! 📝");
  }

  if (findings.some(f => f.category === "shortened_url")) {
    roasts.push("Using a shortened URL? How original. Next they'll tell you to click a link for free pizza. 🍕");
  }

  if (findings.some(f => f.category === "impersonation")) {
    roasts.push("Pretending to be a bank? That's like wearing a fake mustache and thinking nobody notices. 🥸");
  }

  if (roasts.length === 0) {
    return "This scam attempt is so basic, it's almost cute. Almost. 😏";
  }

  return roasts.join(" ");
}
