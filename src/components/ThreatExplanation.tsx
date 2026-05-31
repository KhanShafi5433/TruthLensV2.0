import React, { useState } from "react";
import { 
  ShieldAlert, 
  AudioLines, 
  FileVideo, 
  AlertTriangle, 
  UserMinus, 
  FileSearch, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck,
  Zap,
  Info
} from "lucide-react";

interface ThreatType {
  id: string;
  title: string;
  severity: "CRITICAL" | "HIGH" | "WARNING";
  logo: React.ComponentType<any>;
  description: string;
  markers: string[];
  rebuiltSimulation: string;
  defenseAction: string;
}

export default function ThreatExplanation() {
  const [expandedId, setExpandedId] = useState<string>("speech");

  const threats: ThreatType[] = [
    {
      id: "speech",
      title: "Unnatural Speech Patterns",
      severity: "CRITICAL",
      logo: AudioLines,
      description: "AI Voice synthesis models generate pitch-perfect word matches, but frequently fail to model true biological lung behavior or natural throat acoustics.",
      markers: [
        "Empty background noise spaces inside urgent distress calls.",
        "Perfect robotic periodicity with zero normal stuttering pauses.",
        "Synthetic format decay gaps at high voice bands (2kHz - 3.5kHz)."
      ],
      rebuiltSimulation: "Scammers clone a relative's voice from a short 5-second public video, simulating legal distress to bypass security validations.",
      defenseAction: "Formulate a verbal 'Emergency Code Word' with family. Call your relative back immediately on their verified primary phone number."
    },
    {
      id: "facial",
      title: "Synthetic Facial Inconsistencies",
      severity: "HIGH",
      logo: FileVideo,
      description: "Real-time face swaps and video frame injections suffer from physical temporal alignment warps during speedy gestures.",
      markers: [
        "Unnatural face margins or blurring along the hairline and cheekbones.",
        "Spectator glass lenses reflect non-reactive static shapes.",
        "Robotic blinks that fall outside standard physiological rhythms."
      ],
      rebuiltSimulation: "An attacker runs face-swap filters in a live video chat, pretending to raise custom security permissions on your behalf.",
      defenseAction: "Command the caller to rotate their face fully sideways, wave their hands in front of their forehead, or blink rapidly. Synthetic overlays will fail and glitch out spectacularly."
    },
    {
      id: "urgency",
      title: "Urgency Manipulation",
      severity: "HIGH",
      logo: AlertTriangle,
      description: "The primary attack vector isn't digital synthetic scripts, but linguistic pressure. This locks decision reasoning through panic.",
      markers: [
        "Tight timers ('Pay tax within 60 minutes or face immediate arrest').",
        "Instructing you to withhold communication with other relatives.",
        "Demands for untraceable crypto assets, gift cards, or instant coupons."
      ],
      rebuiltSimulation: "A message claiming your primary bank card is locked forces you to click a login verification link without auditing the true URL.",
      defenseAction: "Refuse to make instant decisions. State officials and major banks never demand cryptocurrency codes over WhatsApp or text messaging."
    },
    {
      id: "impersonation",
      title: "Impersonation Attempts",
      severity: "WARNING",
      logo: UserMinus,
      description: "Exploiting high trust profiles (government bureaus, bank managers, legal police units) using custom visual overlays.",
      markers: [
        "Message headers pairing official badge stickers directly inside images.",
        "Using email domains that contain minor, off-brand typos (e.g., support@paypaI-security.com).",
        "Unexpected contacts on consumer SMS lines demanding visual tax declarations."
      ],
      rebuiltSimulation: "Fake customer service agents contact you on Discord, mimicking support tags to harvest secondary secure visual credentials.",
      defenseAction: "Contact the physical branch of the office through public verified phone directory sources before providing any secure authorization code."
    },
    {
      id: "metadata",
      title: "Suspicious Metadata Warnings",
      severity: "WARNING",
      logo: FileSearch,
      description: "Deepfake videos often contain digital compression traces, and phishing portals rely on very young domain records.",
      markers: [
        "Container formats linking video streams with third-party stream injection.CJS files.",
        "Target URL platforms hosted inside a bulletproof offshore server cluster.",
        "Web domain records registered within the past 48 hours."
      ],
      rebuiltSimulation: "Phishing URLs disguise target folders using complicated sub-directories like bank.com.authorization-index.net."
    } as any // Allow optional field to fall back nicely
  ];

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? "" : id);
  };

  return (
    <div className="flex-1 flex flex-col justify-between" id="threat-explanations-view">
      
      {/* Dynamic Header */}
      <div className="px-5 pt-4 pb-3 bg-[#05070A] border-b border-slate-900/40 flex justify-between items-center select-none z-40">
        <div>
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
            CYBER INTELLIGENCE SUITE
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Explore common neural manipulation anomalies.</p>
        </div>
        <span className="px-2 py-0.5 bg-blue-950/80 text-blue-405 border border-blue-900 rounded-md text-[9px] font-mono font-bold animate-pulse">
          5 ACTIVE TOPICS
        </span>
      </div>

      {/* Main Threat Categories Scroll Area */}
      <div className="flex-grow p-5 space-y-4 select-none overflow-y-auto text-left">
        
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono text-slate-500 tracking-wider">
          <Info className="w-4 h-4 text-slate-600" />
          <span>Interactive Defensive Database</span>
        </div>

        <div className="space-y-3">
          {threats.map(threat => {
            const Icon = threat.logo;
            const isExpanded = expandedId === threat.id;
            return (
              <div 
                key={threat.id}
                className={`border rounded-2xl overflow-hidden transition-all duration-350 ${
                  isExpanded 
                    ? "bg-slate-900/70 border-slate-700/80 shadow-lg shadow-black/20" 
                    : "bg-slate-900/50 border-slate-805 hover:bg-slate-902 hover:border-slate-800"
                }`}
              >
                {/* Clickable Header row */}
                <button
                  id={`threat-trigger-${threat.id}`}
                  onClick={() => handleToggle(threat.id)}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      threat.severity === "CRITICAL" ? "bg-red-950/40 border border-red-900/30 text-red-400" :
                      threat.severity === "HIGH" ? "bg-amber-900/10 border border-amber-900/25 text-amber-500" :
                      "bg-blue-950 text-blue-400 border border-blue-900/30"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-display font-semibold text-slate-100 pr-1">{threat.title}</p>
                      <span className={`text-[8px] font-mono font-bold uppercase tracking-wider ${
                        threat.severity === "CRITICAL" ? "text-red-400" :
                        threat.severity === "HIGH" ? "text-amber-500" :
                        "text-blue-400"
                      }`}>
                        {threat.severity} threat rank
                      </span>
                    </div>
                  </div>

                  <div>
                    {isExpanded ? (
                      <ChevronUp className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4.5 h-4.5 text-slate-500 shrink-0" />
                    )}
                  </div>
                </button>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-950 pt-3.5 space-y-4 text-[11px] leading-relaxed select-text">
                    
                    {/* General Text */}
                    <p className="text-slate-300 font-medium">
                      {threat.description}
                    </p>

                    {/* Specific Bullet Indicators */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                        COMMON WARNING MARKS
                      </p>
                      <ul className="space-y-1.5 pl-1 text-[10.5px]">
                        {threat.markers.map((maker, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-red-500 font-bold mt-0.5 shrink-0">•</span>
                            <span className="text-slate-450">{maker}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Real Simulation Example */}
                    <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl space-y-1">
                      <p className="text-[9px] font-mono font-bold text-blue-500/80 uppercase tracking-widest flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" /> Typical Attack Vector Scenario
                      </p>
                      <p className="text-slate-400 leading-normal text-[10.5px]">
                        {threat.rebuiltSimulation}
                      </p>
                    </div>

                    {/* Defense Guidelines */}
                    {threat.defenseAction && (
                      <div className="p-3 bg-emerald-950/10 border border-emerald-950 rounded-xl space-y-1">
                        <p className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Proactive Security Action
                        </p>
                        <p className="text-slate-300 leading-normal text-[10.5px]">
                          {threat.defenseAction}
                        </p>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
