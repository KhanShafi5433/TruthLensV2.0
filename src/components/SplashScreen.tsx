import { useEffect, useState } from "react";
import { Shield, Eye, Sparkles, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [loadingText, setLoadingText] = useState("Initializing safe zone coordinates...");
  const [progress, setProgress] = useState(0);

  const logs = [
    "Checking audio voiceprint classifiers...",
    "Securing communication channels...",
    "Mounting deepfake neural pattern decoders...",
    "System ready. Welcome to TruthLens."
  ];

  useEffect(() => {
    // Increment progress
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          return 100;
        }
        return p + 4;
      });
    }, 80);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress < 25) {
      setLoadingText(logs[0]);
    } else if (progress < 50) {
      setLoadingText(logs[1]);
    } else if (progress < 80) {
      setLoadingText(logs[2]);
    } else {
      setLoadingText(logs[3]);
    }

    if (progress === 100) {
      const delay = setTimeout(() => {
        onComplete();
      }, 550);
      return () => clearTimeout(delay);
    }
  }, [progress, onComplete]);

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-[#05070A] h-full relative select-none">
      
      {/* Background Subtle Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.04),transparent_60%)] pointer-events-none" />

      {/* Top Cyber Accents */}
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 px-2 mt-4">
        <span>SECURITY PROTOCOL // ACTIVE</span>
        <span className="text-emerald-400">● SECURE GATEWAY</span>
      </div>

      {/* Center Brand Identity */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-auto">
        <motion.div 
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative mb-6"
        >
          {/* Logo Container with rotating cyber circle */}
          <div className="relative w-24 h-24 flex items-center justify-center bg-slate-900/50 border border-slate-800 rounded-3xl shadow-xl shadow-blue-900/10">
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-3xl border border-blue-500/20 animate-ping opacity-25" />
            
            {/* Graphic Badge */}
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04m17.236 0a11.955 11.955 0 01-8.618 3.04A11.955 11.955 0 013.382 5.984M12 21.35s-8-4-8-11.35V5.984m8 15.366s8-4 8-11.35V5.984" />
                </svg>
              </div>
            </div>

            {/* Micro AI Indicator */}
            <Sparkles className="w-4.5 h-4.5 text-blue-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </motion.div>

        {/* Title & Tagline */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-3xl font-display font-extrabold text-white tracking-tight uppercase">
            Truth<span className="text-blue-500">Lens</span>
          </h2>
          <p className="mt-3 text-slate-300 text-sm max-w-[280px] leading-relaxed mx-auto">
            Detect Suspicious AI-Generated Scam Content
          </p>
        </motion.div>
      </div>

      {/* Bottom Loading Progress Container */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-2 px-1">
          <span className="truncate max-w-[210px] text-left">{loadingText}</span>
          <span className="text-blue-400 font-bold">{progress}%</span>
        </div>
        
        {/* Progress bar boundary */}
        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
          <motion.div 
            className="h-full bg-linear-to-r from-blue-600 to-indigo-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Action Skip prompt for speedy demonstration/retesting */}
        <div className="mt-4 flex justify-center">
          <button 
            id="skip-splash-btn"
            onClick={onComplete}
            className="text-[11px] font-mono text-slate-500 hover:text-blue-400 underline transition-colors cursor-pointer"
          >
            Skip Initialization
          </button>
        </div>

        <div className="mt-6 flex justify-center items-center gap-1.5 text-[10px] font-mono text-slate-600">
          <AlertTriangle className="w-3 h-3 text-amber-500/60" />
          <span>Hackathon Demo Version</span>
        </div>
      </div>

    </div>
  );
}
