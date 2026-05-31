import React, { useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Share2,
  Info,
  Shield,
  FileText,
  Globe,
  Target,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";
import { FactCheckResult } from "../services/factCheck/factCheckPipeline";

interface FactCheckResultProps {
  result: FactCheckResult;
  onGoBack: () => void;
}

// Sample claims for demo
const SAMPLE_CLAIMS = [
  "Climate change is real",
  "The earth is flat",
  "Vaccines cause autism",
];

export default function FactCheckResultScreen({ result, onGoBack }: FactCheckResultProps) {
  const [judgeMode, setJudgeMode] = useState(false);
  const [whyExpanded, setWhyExpanded] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Determine verdict icon and color
  const getVerdictIcon = () => {
    switch (result.verdict) {
      case "true":
        return <CheckCircle className="w-6 h-6" />;
      case "false":
        return <XCircle className="w-6 h-6" />;
      case "uncertain":
        return <AlertCircle className="w-6 h-6" />;
    }
  };

  const getVerdictColor = () => {
    switch (result.verdict) {
      case "true":
        return "text-emerald-400";
      case "false":
        return "text-red-400";
      case "uncertain":
        return "text-amber-400";
    }
  };

  const getVerdictBg = () => {
    switch (result.verdict) {
      case "true":
        return "bg-emerald-500";
      case "false":
        return "bg-red-500";
      case "uncertain":
        return "bg-amber-500";
    }
  };

  const getVerdictBorder = () => {
    switch (result.verdict) {
      case "true":
        return "border-emerald-500/30";
      case "false":
        return "border-red-500/30";
      case "uncertain":
        return "border-amber-500/30";
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return "text-emerald-400";
    if (conf >= 60) return "text-yellow-400";
    if (conf >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getConfidenceBg = (conf: number) => {
    if (conf >= 80) return "bg-emerald-500";
    if (conf >= 60) return "bg-yellow-500";
    if (conf >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const verdictIcon = getVerdictIcon();
  const verdictColor = getVerdictColor();
  const verdictBg = getVerdictBg();
  const verdictBorder = getVerdictBorder();
  const confidenceColor = getConfidenceColor(result.confidence_score);
  const confidenceBg = getConfidenceBg(result.confidence_score);

  const handleCopyText = () => {
    navigator.clipboard.writeText(result.claim);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TruthLens Fact Check',
          text: `Verdict: ${result.verdict.toUpperCase()}\nEvidence Strength: ${result.evidenceStrengthLabel}\nSource Agreement: ${result.sourceAgreement}\n\n${result.reasoning}`,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    }
  };

  const handleSampleClaim = (claim: string) => {
    // This would trigger a new fact check
    console.log("Sample claim:", claim);
  };

  return (
    <div className="flex-grow flex flex-col justify-between h-full bg-[#05070A]">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 bg-[#05070A] border-b border-slate-900/40 flex items-center justify-between z-40 select-none">
        <div className="flex items-center gap-2">
          <button
            onClick={onGoBack}
            className="p-2.5 bg-slate-900/50 border border-slate-805 text-slate-350 hover:text-white rounded-2xl cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            FACT CHECK
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setJudgeMode(!judgeMode)}
            className={`p-2 rounded-xl border cursor-pointer transition-all ${
              judgeMode 
                ? "bg-purple-600/20 border-purple-500/50 text-purple-400" 
                : "bg-slate-900/50 border-slate-805 text-slate-400 hover:text-white"
            }`}
            title="Toggle Judge Mode"
          >
            {judgeMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <span
            className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-md border ${verdictBg} ${verdictColor}`}
          >
            {result.verdict.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex-1 px-5 py-4 space-y-4 select-none text-left overflow-y-auto">
        {/* Transparency Banner */}
        <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-2xl flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-400 leading-relaxed">
            This system evaluates evidence and confidence rather than blindly generating answers.
          </p>
        </div>

        {/* Verdict Card */}
        <div className={`p-5 bg-slate-900/50 border ${verdictBorder} rounded-3xl shadow-lg`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-2xl bg-slate-950/50 ${verdictColor}`}>
              {verdictIcon}
            </div>
            <div className="flex-grow">
              <h3 className={`text-lg font-display font-extrabold ${verdictColor} uppercase tracking-wide`}>
                {result.verdict === "true" ? "TRUE" : result.verdict === "false" ? "FALSE" : "UNCERTAIN"}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                Verdict Status
              </p>
            </div>
          </div>

          {/* Evidence Strength & Source Agreement */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-slate-400">EVIDENCE STRENGTH</span>
              <span className={`text-lg font-mono font-extrabold ${
                result.evidenceStrengthLabel === "Strong" ? "text-emerald-400" :
                result.evidenceStrengthLabel === "Moderate" ? "text-yellow-400" : "text-orange-400"
              }`}>
                {result.evidenceStrengthLabel.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-slate-400">SOURCE AGREEMENT</span>
              <span className={`text-lg font-mono font-extrabold ${
                result.sourceAgreement === "High" ? "text-emerald-400" :
                result.sourceAgreement === "Mixed" ? "text-yellow-400" : "text-orange-400"
              }`}>
                {result.sourceAgreement.toUpperCase()}
              </span>
            </div>
          </div>

          {/* One-line summary */}
          <div className="p-3 bg-slate-950/50 rounded-2xl">
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {result.reasoning}
            </p>
          </div>
        </div>

        {/* Analysis Workflow */}
        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-3xl">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Analysis Workflow
            </h5>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {[
              { step: "Step 1", label: "Gather Evidence", icon: FileText },
              { step: "Step 2", label: "Evaluate Sources", icon: Shield },
              { step: "Step 3", label: "Compare Findings", icon: Target },
              { step: "Step 4", label: "Generate Verdict", icon: CheckCircle },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-slate-950/50 rounded-xl border border-slate-800"
                >
                  <Icon className="w-3 h-3 text-emerald-400" />
                  <div>
                    <span className="text-[8px] font-mono text-slate-500 block">{item.step}</span>
                    <span className="text-[9px] text-slate-300">{item.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conflict Detection */}
        {result.conflict_detected && (
          <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-3xl">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-grow">
                <h5 className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold mb-2">
                  ⚠ Conflicting Evidence Detected
                </h5>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Sources disagree on this claim. The verdict remains uncertain due to conflicting information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Why This Verdict? */}
        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-3xl">
          <button
            onClick={() => setWhyExpanded(!whyExpanded)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Why This Verdict?
              </h5>
            </div>
            {whyExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          
          {whyExpanded && (
            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center p-2 bg-slate-950/50 rounded-lg">
                <span className="text-[9px] font-mono text-slate-400">Sources Analyzed</span>
                <span className="text-[9px] font-mono text-blue-400 font-bold">{result.sources.length}</span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-slate-950/50 rounded-lg">
                <span className="text-[9px] font-mono text-slate-400">Source Agreement</span>
                <span className="text-[9px] font-mono text-blue-400 font-bold">
                  {result.evidence_strength > 0 ? "High" : result.evidence_strength < 0 ? "Low" : "Mixed"}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-slate-950/50 rounded-lg">
                <span className="text-[9px] font-mono text-slate-400">Reliability Assessment</span>
                <span className="text-[9px] font-mono text-blue-400 font-bold">
                  {result.confidence_score >= 0.8 ? "High" : result.confidence_score >= 0.6 ? "Medium" : "Low"}
                </span>
              </div>
              
              <div className="p-3 bg-slate-950/50 rounded-xl">
                <span className="text-[9px] font-mono text-slate-400 block mb-2">Confidence Reason</span>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Confidence score based on source reliability, agreement level, and evidence strength.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Evidence Organization */}
        <div className="space-y-4">
          {/* Supporting Evidence */}
          {result.sources.filter(s => s.reliability_score > 0.5).length > 0 && (
            <div className="p-4 bg-emerald-950/10 border border-emerald-900/20 rounded-3xl">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <h5 className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Supporting Evidence
                </h5>
                <span className="text-[9px] font-mono text-emerald-300 ml-auto">
                  {result.sources.filter(s => s.reliability_score > 0.5).length} sources
                </span>
              </div>
              
              <div className="space-y-2">
                {result.sources
                  .filter(s => s.reliability_score > 0.5)
                  .slice(0, 3)
                  .map((source, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-950/50 rounded-xl border border-slate-800"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <Globe className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="flex-grow">
                          <p className="text-[10px] font-bold text-emerald-100">{source.title}</p>
                          <p className="text-[8px] font-mono text-slate-500 mt-1">
                            Reliability: {(source.reliability_score * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 leading-relaxed line-clamp-2">
                        {source.content}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Contradicting Evidence */}
          {result.sources.filter(s => s.reliability_score < 0.5).length > 0 && (
            <div className="p-4 bg-red-950/10 border border-red-900/20 rounded-3xl">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4 text-red-400" />
                <h5 className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold">
                  Contradicting Evidence
                </h5>
                <span className="text-[9px] font-mono text-red-300 ml-auto">
                  {result.sources.filter(s => s.reliability_score < 0.5).length} sources
                </span>
              </div>
              
              <div className="space-y-2">
                {result.sources
                  .filter(s => s.reliability_score < 0.5)
                  .slice(0, 3)
                  .map((source, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-950/50 rounded-xl border border-slate-800"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <Globe className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                        <div className="flex-grow">
                          <p className="text-[10px] font-bold text-red-100">{source.title}</p>
                          <p className="text-[8px] font-mono text-slate-500 mt-1">
                            Reliability: {(source.reliability_score * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 leading-relaxed line-clamp-2">
                        {source.content}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Judge Mode Details */}
        {judgeMode && (
          <div className="p-4 bg-purple-950/20 border border-purple-900/30 rounded-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-purple-400" />
              <h5 className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                Judge Mode: Advanced Analysis
              </h5>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-slate-900/30 rounded-lg">
                <span className="text-[9px] font-mono text-slate-400">Evidence Strength</span>
                <span className="text-[9px] font-mono text-purple-400 font-bold">
                  {result.evidence_strength.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-slate-900/30 rounded-lg">
                <span className="text-[9px] font-mono text-slate-400">Conflict Detected</span>
                <span className="text-[9px] font-mono text-purple-400 font-bold">
                  {result.conflict_detected ? "Yes" : "No"}
                </span>
              </div>
              
              <div className="p-2 bg-slate-900/30 rounded-lg">
                <span className="text-[9px] font-mono text-slate-400 block mb-1">Limitations</span>
                <ul className="text-[9px] text-slate-400 space-y-1">
                  {result.limitations.map((limit, index) => (
                    <li key={index}>• {limit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Sample Claims for Demo */}
        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-3xl">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-blue-400" />
            <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Try Sample Claims
            </h5>
          </div>
          
          <div className="space-y-2">
            {SAMPLE_CLAIMS.map((claim, index) => (
              <button
                key={index}
                onClick={() => handleSampleClaim(claim)}
                className="w-full p-3 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-colors text-left"
              >
                <p className="text-[10px] text-slate-300">{claim}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-900/65 bg-[#05070A] flex gap-3 select-none">
        <button
          onClick={onGoBack}
          className="flex-1 py-3 bg-slate-900/50 hover:bg-slate-800 border border-slate-805 text-slate-300 rounded-2xl text-xs font-mono font-bold cursor-pointer transition-colors"
        >
          Back to Hub
        </button>

        <button
          onClick={handleShare}
          className="py-3 px-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-805 text-slate-300 rounded-2xl cursor-pointer transition-colors"
          title="Share analysis"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          onClick={handleCopyText}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/10 text-white rounded-2xl text-xs font-mono font-bold cursor-pointer transition-all"
        >
          {copiedText ? "Copied!" : "Copy Claim"}
        </button>
      </div>
    </div>
  );
}
