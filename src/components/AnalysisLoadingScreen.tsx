import React, { useEffect, useState } from "react";
import { Cpu, Terminal, CheckCircle, Clock, Target, Shield, Brain } from "lucide-react";
import { motion } from "motion/react";

interface AnalysisLoadingScreenProps {
  mediaType: "audio" | "video" | "screenshot" | "text";
  fileName: string;
  isImageAnalysis?: boolean;
}

export default function AnalysisLoadingScreen({
  mediaType,
  fileName,
  isImageAnalysis = false,
}: AnalysisLoadingScreenProps) {
  const [percent, setPercent] = useState(0);
  const [currentMetric, setCurrentMetric] = useState(
    isImageAnalysis ? "Uploading image for vision review…" : "Preparing your message for review..."
  );
  const [currentStage, setCurrentStage] = useState(0);

  const textLogs = [
    { threshold: 10, msg: "Reading the text you provided...", stage: 0 },
    { threshold: 30, msg: "Checking for urgency or threat language...", stage: 1 },
    { threshold: 50, msg: "Looking for payment or credential requests...", stage: 2 },
    { threshold: 70, msg: "Checking links and impersonation wording...", stage: 3 },
    { threshold: 90, msg: "Building your risk summary...", stage: 4 },
  ];

  const imageLogs = [
    { threshold: 10, msg: "Sending screenshot to Gemini Vision…", stage: 0 },
    { threshold: 25, msg: "Detecting screenshot type (SMS, email, payment…)", stage: 1 },
    { threshold: 45, msg: "Reading visible text in the image…", stage: 2 },
    { threshold: 65, msg: "Checking for phishing and urgency cues…", stage: 3 },
    { threshold: 85, msg: "Building risk score and advice…", stage: 4 },
  ];

  const stages = isImageAnalysis 
    ? [
        { icon: Clock, label: "Image Upload", desc: "Sending to vision AI" },
        { icon: Target, label: "Type Detection", desc: "Identifying message type" },
        { icon: Brain, label: "Text Extraction", desc: "Reading visible content" },
        { icon: Shield, label: "Pattern Analysis", desc: "Checking for threats" },
        { icon: CheckCircle, label: "Risk Assessment", desc: "Generating verdict" },
      ]
    : [
        { icon: Clock, label: "Content Parsing", desc: "Reading message text" },
        { icon: Target, label: "Urgency Check", desc: "Detecting pressure tactics" },
        { icon: Brain, label: "Pattern Matching", desc: "Finding suspicious phrases" },
        { icon: Shield, label: "Link Analysis", desc: "Checking for phishing" },
        { icon: CheckCircle, label: "Risk Scoring", desc: "Calculating confidence" },
      ];

  const diagnosticLogs = isImageAnalysis ? imageLogs : textLogs;

  useEffect(() => {
    const timer = setInterval(() => {
      setPercent((p) => {
        if (p >= 100) {
          clearInterval(timer);
          return 100;
        }
        const add = Math.floor(Math.random() * 8) + 4;
        const next = p + add;
        return next > 100 ? 100 : next;
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const current = diagnosticLogs.filter((log) => percent >= log.threshold).pop();
    if (current) {
      setCurrentMetric(current.msg);
      setCurrentStage(current.stage);
    }
  }, [percent, isImageAnalysis]);

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-[#05070A] h-full relative font-mono select-none text-[11px] text-slate-300">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

      <div className="flex justify-between items-center text-slate-500 font-bold border-b border-slate-900 pb-2">
        <span className="flex items-center gap-1.5 text-slate-400">
          <Terminal className="w-3.5 h-3.5 text-blue-500" />
          {isImageAnalysis ? "IMAGE SCAM ANALYZER" : "MESSAGE RISK ANALYZER"}
        </span>
        <span className="text-blue-500 uppercase tracking-wider font-bold">RUNNING</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center my-auto px-4 py-6 gap-6">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-dashed border-blue-500/20"
          />

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            className="absolute inset-2.5 rounded-full border border-double border-blue-500/30 border-t-transparent"
          />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-1/2 h-[1px] bg-gradient-to-r from-transparent to-blue-500 origin-left"
              style={{ marginLeft: "50%" }}
            />
          </div>

          <div className="absolute inset-6 bg-slate-900/80 border border-slate-800 rounded-full flex flex-col items-center justify-center select-none shadow-xl">
            <span className="text-slate-500 font-bold text-[8px] tracking-wider">PROGRESS</span>
            <span className="text-xl font-display font-extrabold text-blue-400 mt-0.5 tracking-tight">
              {percent}%
            </span>
            <span className="text-slate-500 text-[8px] tracking-widest mt-0.5 uppercase">
              {isImageAnalysis ? "vision" : mediaType}
            </span>
          </div>
        </div>

        {/* Analysis Stages */}
        <div className="w-full grid grid-cols-5 gap-2">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = index === currentStage;
            const isCompleted = index < currentStage;
            const isPending = index > currentStage;
            
            return (
              <div
                key={index}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                  isActive
                    ? "bg-blue-950/30 border-blue-500/50"
                    : isCompleted
                    ? "bg-emerald-950/30 border-emerald-500/30"
                    : "bg-slate-900/30 border-slate-800 opacity-50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? "text-blue-400 animate-pulse"
                      : isCompleted
                      ? "text-emerald-400"
                      : "text-slate-600"
                  }`}
                />
                <span
                  className={`text-[7px] font-mono uppercase tracking-wider text-center ${
                    isActive
                      ? "text-blue-300"
                      : isCompleted
                      ? "text-emerald-300"
                      : "text-slate-600"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-md">
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>SOURCE:</span>
            <span className="text-blue-400 font-bold uppercase truncate max-w-[150px]">
              {fileName || "upload"}
            </span>
          </div>

          <div className="h-[2px] bg-slate-950 rounded-full overflow-hidden">
            <motion.div className="h-full bg-blue-500" style={{ width: `${percent}%` }} />
          </div>

          <div className="text-[10px] text-slate-400 flex items-start gap-1.5 leading-relaxed">
            <Cpu className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5 animate-spin duration-3000" />
            <span id="diagnostic-message-text" className="text-left text-slate-300 select-none">
              {currentMetric}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-900 pt-3">
        <div className="flex justify-between text-[9px] text-slate-600 font-bold tracking-wider">
          <span>TRUTHLENS · GEMINI</span>
          <span>{isImageAnalysis ? "VISION" : "TEXT"}</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-900/80 text-[10px] text-left text-slate-500 space-y-1 h-20 overflow-y-auto font-mono scrollbar-none select-none">
          <p className="text-blue-700/80">[SYSTEM] Analysis session started.</p>
          {percent >= 25 && (
            <p className="text-slate-600">
              {isImageAnalysis ? "[VISION] Classifying screenshot…" : "[CHECK] Scanning message wording…"}
            </p>
          )}
          {percent >= 50 && (
            <p className="text-slate-550">
              {isImageAnalysis ? "[VISION] Extracting visible text…" : "[CHECK] Reviewing links and requests…"}
            </p>
          )}
          {percent >= 75 && <p className="text-slate-500">[CHECK] Calculating risk score…</p>}
          {percent >= 95 && (
            <p className="text-blue-500 animate-pulse">[DONE] Preparing report…</p>
          )}
        </div>
      </div>
    </div>
  );
}
