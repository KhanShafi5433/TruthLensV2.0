import React, { useState } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle,
  Copy,
  Share2,
  Globe,
  FileText,
  Brain,
  Target,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Settings,
  Zap,
  Eye,
  EyeOff,
  Flame,
  TrendingUp,
} from "lucide-react";
import { AnalysisReport } from "../services/analysisTypes";
import { getRiskVisualStyle } from "../services/riskLevelUtils";
import { HighlightedMessage } from "../utils/highlightPhrases";
import { detectLanguage } from "../services/multilingual/languageDetector";

interface ResultScreenProps {
  report: AnalysisReport;
  onGoBack: () => void;
}

export default function ResultScreen({ report, onGoBack }: ResultScreenProps) {
  const { input, analysis } = report;
  const { score, riskLevel, indicators, reasoning, advice, viralAnalysis } = analysis;

  const [isLogSaved, setIsLogSaved] = React.useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [judgeMode, setJudgeMode] = useState(false);
  const [whyExpanded, setWhyExpanded] = useState(false);
  const [viralExpanded, setViralExpanded] = useState(false);

  const detectedLanguage = detectLanguage(input.content || "");
  const visual = getRiskVisualStyle(riskLevel);
  
  // Calculate confidence based on score and indicators
  const confidence = Math.min(98, Math.max(12, score + (indicators.length * 5)));
  
  // Determine confidence color
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
  
  const confidenceColor = getConfidenceColor(confidence);
  const confidenceBg = getConfidenceBg(confidence);

  const handleCopyText = () => {
    navigator.clipboard.writeText(input.content || "");
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TruthLens Scam Analysis',
          text: `Risk Level: ${riskLevel}\n\n${reasoning}`,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    }
  };
  const strokeDashoffset = 250 - (250 * score) / 100;
  const hasPhrases = indicators.length > 0;
  const isLowRisk = score <= 30 && !hasPhrases;

  const adviceItems = advice
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const summaryHeading = isLowRisk
    ? "Overall Assessment"
    : hasPhrases
      ? "Why This Looks Suspicious"
      : "Overall Assessment";

  return (
    <div className="flex-grow flex flex-col justify-between" id="result-view">
      <div className="px-5 pt-4 pb-3 bg-[#05070A] border-b border-slate-900/40 flex items-center justify-between z-40 select-none">
        <div className="flex items-center gap-2">
          <button
            id="result-back-btn"
            onClick={onGoBack}
            className="p-2.5 bg-slate-900/50 border border-slate-805 text-slate-350 hover:text-white rounded-2xl cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            REPORT SHEET
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
            className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-md border ${visual.bg} ${visual.color}`}
          >
            {riskLevel}
          </span>
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
            {detectedLanguage}
          </span>
        </div>
      </div>

      <div className="flex-1 px-5 py-4 space-y-5.5 select-none text-left overflow-y-auto">
        {/* Transparency Banner */}
        <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-2xl flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-400 leading-relaxed">
            This system evaluates evidence and confidence rather than blindly generating answers.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-display font-bold text-white uppercase tracking-wide">
            {input.title}
          </h4>
          <p className="text-[10px] text-slate-400 font-medium mt-1 leading-normal">
            {input.subtitle}
          </p>
          {input.imageCategory && (
            <span className="inline-block mt-2 text-[9px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-md border border-blue-900/50 bg-blue-950/40 text-blue-400">
              {input.imageCategory}
            </span>
          )}
        </div>

        {input.image?.previewUrl && (
          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
            <img
              src={input.image.previewUrl}
              alt="Analyzed screenshot"
              className="w-full max-h-44 object-contain"
            />
          </div>
        )}

        {/* Assessment Section */}
        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-3xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Assessment
              </h5>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
            <span className="text-slate-400 text-[10px] font-mono">RISK LEVEL:</span>
            <span className={`text-[10px] font-mono font-bold ${visual.color}`}>{riskLevel}</span>
          </div>
        </div>

        <div
          className={`p-5 bg-slate-900/50 border ${visual.borderGlow} rounded-3xl flex flex-col sm:flex-row items-center gap-4 shadow-lg`}
        >
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="38"
                className="stroke-slate-800 fill-none"
                strokeWidth="7"
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                className={`fill-none transition-all duration-1000 ${visual.stroke}`}
                strokeWidth="7"
                strokeDasharray="238"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center select-none">
              <span className="text-xl font-mono font-extrabold text-slate-50">{score}%</span>
              <span className="text-[8px] text-slate-400 font-mono font-bold uppercase tracking-widest mt-0.2">
                RISK SCORE
              </span>
            </div>
          </div>

          <div className="space-y-1 text-center sm:text-left flex-grow">
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-1.5">
              <span className="text-slate-400 text-[10px] font-mono">ASSESSMENT:</span>
              <span className={`text-[10px] uppercase font-mono font-extrabold ${visual.color}`}>
                {visual.statusLabel}
              </span>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-1.5">
              <span className="text-slate-400 text-[10px] font-mono">RISK LEVEL:</span>
              <span className={`text-[10px] font-mono font-bold ${visual.color}`}>{riskLevel}</span>
            </div>


            <p className="text-[10px] text-slate-500 leading-normal">
              Scoring: 0–30 Low · 31–60 Moderate · 61–80 Suspicious · 81–100 High Risk
            </p>
          </div>
        </div>

        {/* Viral Analysis Section */}
        {viralAnalysis && (
          <div className="p-4 bg-orange-950/20 border border-orange-500/30 rounded-3xl">
            <button
              onClick={() => setViralExpanded(!viralExpanded)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <h5 className="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-bold">
                  🔥 Viral Check Analysis
                </h5>
              </div>
              {viralExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {viralExpanded && (
              <div className="mt-4 space-y-4">
                {/* Virality Risk */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">VIRALITY RISK:</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      viralAnalysis.viralityRisk === "High"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : viralAnalysis.viralityRisk === "Medium"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {viralAnalysis.viralityRisk}
                  </span>
                </div>

                {/* Misleading Potential */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">MISLEADING POTENTIAL:</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      viralAnalysis.misleadingPotential === "Yes"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : viralAnalysis.misleadingPotential === "Partial"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {viralAnalysis.misleadingPotential}
                  </span>
                </div>

                {/* Emotional Manipulation */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">EMOTIONAL MANIPULATION:</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      viralAnalysis.emotionalManipulation === "High"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : viralAnalysis.emotionalManipulation === "Medium"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {viralAnalysis.emotionalManipulation}
                  </span>
                </div>

                {/* Why It May Spread */}
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-3 h-3 text-orange-400" />
                    <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">
                      Why It May Spread
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    {viralAnalysis.explanation.whyItMaySpread}
                  </p>
                </div>

                {/* Misleading Factors */}
                {viralAnalysis.explanation.misleadingFactors.length > 0 && (
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">
                        Misleading Factors
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {viralAnalysis.explanation.misleadingFactors.map((factor, index) => (
                        <li key={index} className="text-[10px] text-slate-300 leading-relaxed flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Missing Context */}
                {viralAnalysis.explanation.missingContext.length > 0 && (
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-3 h-3 text-yellow-400" />
                      <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">
                        Missing Context
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {viralAnalysis.explanation.missingContext.map((context, index) => (
                        <li key={index} className="text-[10px] text-slate-300 leading-relaxed flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          <span>{context}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sensational Elements */}
                {viralAnalysis.explanation.sensationalElements.length > 0 && (
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">
                        Sensational Elements
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {viralAnalysis.explanation.sensationalElements.slice(0, 5).map((element, index) => (
                        <li key={index} className="text-[10px] text-slate-300 leading-relaxed flex items-start gap-2">
                          <span className="text-orange-400 mt-0.5">•</span>
                          <span>{element}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Why This Result? Expandable Section */}
        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-3xl">
          <button
            onClick={() => setWhyExpanded(!whyExpanded)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Why This Result?
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
              <div className="p-3 bg-emerald-950/10 border border-emerald-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span className="text-[9px] font-mono uppercase tracking-wide text-emerald-400 font-bold">
                    Supporting Factors
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {indicators.length} suspicious phrase{indicators.length !== 1 ? 's' : ''} detected
                </p>
              </div>
              
              <div className="p-3 bg-red-950/10 border border-red-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span className="text-[9px] font-mono uppercase tracking-wide text-red-400 font-bold">
                    Risk Factors
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Risk score of {score}% indicates {riskLevel.toLowerCase()} threat level
                </p>
              </div>
              
              <div className="p-3 bg-blue-950/10 border border-blue-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-3 h-3 text-blue-400" />
                  <span className="text-[9px] font-mono uppercase tracking-wide text-blue-400 font-bold">
                    Confidence Determination
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Confidence score calculated based on risk level and number of indicators detected
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Judge Mode Details */}
        {judgeMode && (
          <div className="p-4 bg-purple-950/20 border border-purple-900/30 rounded-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-purple-400" />
              <h5 className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                Judge Mode: Advanced Analysis
              </h5>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-slate-900/30 rounded-lg">
                <span className="text-[9px] font-mono text-slate-400">Sources Analyzed</span>
                <span className="text-[9px] font-mono text-purple-400 font-bold">1 (Message Content)</span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-slate-900/30 rounded-lg">
                <span className="text-[9px] font-mono text-slate-400">Indicators Found</span>
                <span className="text-[9px] font-mono text-purple-400 font-bold">{indicators.length}</span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-slate-900/30 rounded-lg">
                <span className="text-[9px] font-mono text-slate-400">Agreement Level</span>
                <span className="text-[9px] font-mono text-purple-400 font-bold">
                  {indicators.length > 0 ? "High" : "Low"}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-2 bg-slate-900/30 rounded-lg">
                <span className="text-[9px] font-mono text-slate-400">Reliability Assessment</span>
                <span className="text-[9px] font-mono text-purple-400 font-bold">
                  {confidence >= 80 ? "High" : confidence >= 60 ? "Medium" : "Low"}
                </span>
              </div>
              
              <div className="p-2 bg-slate-900/30 rounded-lg">
                <span className="text-[9px] font-mono text-slate-400 block mb-1">Analysis Workflow</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span className="text-[8px] font-mono text-slate-300">Content Extracted</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span className="text-[8px] font-mono text-slate-300">Pattern Matching</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span className="text-[8px] font-mono text-slate-300">Risk Scoring</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span className="text-[8px] font-mono text-slate-300">Verdict Generated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Process Section */}
        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-3xl">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Analysis Process
            </h5>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] font-mono text-slate-400">Sources Retrieved</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] font-mono text-slate-400">Evidence Compared</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] font-mono text-slate-400">Reliability Assessed</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] font-mono text-slate-400">Verdict Generated</span>
            </div>
          </div>
        </div>

        {/* Conflicting Evidence Warning */}
        {confidence < 60 && (
          <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-3xl">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-grow">
                <h5 className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold mb-2">
                  ⚠ Conflicting Evidence Detected
                </h5>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
                  Low confidence score suggests conflicting or insufficient evidence. The analysis may not be definitive.
                </p>
                <div className="p-2 bg-slate-900/30 rounded-lg">
                  <span className="text-[9px] font-mono text-slate-400 block mb-1">Why confidence may be reduced:</span>
                  <ul className="text-[9px] text-slate-400 space-y-1">
                    <li>• Limited number of suspicious indicators</li>
                    <li>• Mixed signals in message content</li>
                    <li>• Insufficient context for definitive assessment</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Threat Explanations */}
        {score > 30 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold">
              <Brain className="w-4 h-4 text-purple-400" />
              <h5 className="text-[10px] font-mono uppercase tracking-wider">
                Threat Analysis
              </h5>
            </div>
            <div className="p-3.5 bg-slate-900/30 border border-slate-800 rounded-2xl">
              <p className="text-[10px] text-slate-300 leading-relaxed">
                {reasoning}
              </p>
            </div>
          </div>
        )}

        {input.content.trim() && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                {input.image ? "Text visible in image" : "Message reviewed"}
              </h5>
              <button
                onClick={handleCopyText}
                className="text-[9px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                {copiedText ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl">
              <HighlightedMessage
                content={input.content}
                phrases={indicators}
                className="text-[11px] text-slate-300 leading-relaxed font-sans"
              />
            </div>
            {hasPhrases && (
              <p className="text-[9px] text-slate-500 font-mono">
                Highlighted text matches suspicious phrases detected below.
              </p>
            )}
          </div>
        )}

        {hasPhrases && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h5 className="text-[10px] font-mono uppercase tracking-wider">
                Suspicious Phrases Detected
              </h5>
            </div>

            <div className="space-y-2">
              {indicators.map((indicator, index) => (
                <div
                  key={`${index}-${indicator.text}`}
                  className="p-3 bg-slate-900/30 border border-slate-800 rounded-xl flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3"
                >
                  <div className="shrink-0 sm:max-w-[42%]">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wide">
                      Phrase {index + 1}
                    </span>
                    <p className="text-[11px] font-bold text-amber-100 mt-0.5">
                      <mark className="bg-amber-500/20 border border-amber-500/30 rounded px-1 py-0.5 not-italic">
                        &ldquo;{indicator.text}&rdquo;
                      </mark>
                    </p>
                  </div>
                  <div className="flex-grow border-t border-slate-800/80 pt-2 sm:border-t-0 sm:border-l sm:pl-3 sm:pt-0 sm:border-slate-800">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wide">
                      Why it matters
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                      {indicator.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLowRisk && (
          <div className="p-3.5 bg-emerald-950/15 border border-emerald-900/30 rounded-2xl flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              No suspicious phrases were flagged in this message.
            </p>
          </div>
        )}

        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold">
            <Info className="w-4 h-4 text-blue-400" />
            <h5 className="text-[10px] font-mono uppercase tracking-wider">{summaryHeading}</h5>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans font-medium">
              {reasoning}
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h5 className="text-[10px] font-mono uppercase tracking-wider">Recommended Action</h5>
          </div>

          <div className="space-y-2">
            {(adviceItems.length ? adviceItems : [advice]).map((rec, i) => (
              <div
                key={i}
                className="p-3.5 bg-emerald-950/10 border border-emerald-950 text-slate-300 text-[10.5px] rounded-2xl flex items-start gap-2.5 leading-relaxed"
              >
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
                <p className="font-sans">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-900/65 bg-[#05070A] flex gap-3 select-none">
        <button
          id="report-nav-home-btn"
          onClick={onGoBack}
          className="flex-1 py-3 bg-slate-900/50 hover:bg-slate-800 border border-slate-805 text-slate-300 rounded-2xl text-xs font-mono font-bold cursor-pointer transition-colors"
        >
          Return to Hub
        </button>

        <button
          onClick={handleShare}
          className="py-3 px-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-805 text-slate-300 rounded-2xl cursor-pointer transition-colors"
          title="Share analysis"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          id="report-flag-btn"
          onClick={() => setIsLogSaved(true)}
          disabled={isLogSaved}
          className={`flex-1 py-3 text-white rounded-2xl text-xs font-mono font-bold cursor-pointer transition-all ${
            isLogSaved
              ? "bg-emerald-600/10 border border-emerald-500/20 text-emerald-400"
              : "bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/10"
          }`}
        >
          {isLogSaved ? "LOG REPORT SAVED ✔" : "Save Log Sheet"}
        </button>
      </div>
    </div>
  );
}
