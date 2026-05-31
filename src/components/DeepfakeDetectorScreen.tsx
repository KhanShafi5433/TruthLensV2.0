import React, { useState, useRef } from "react";
import { ArrowLeft, Eye, Upload, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { DeepfakeDetectorService } from "../services/deepfakeDetector";
import { readImageFile } from "../utils/readImageFile";

interface DeepfakeDetectorScreenProps {
  onGoBack: () => void;
}

export default function DeepfakeDetectorScreen({ onGoBack }: DeepfakeDetectorScreenProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detector = DeepfakeDetectorService.getInstance();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    if (file.type.startsWith("image/")) {
      try {
        const prepared = await readImageFile(file);
        setPreviewUrl(prepared.previewUrl);
      } catch (err) {
        console.error("Error loading image:", err);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      let analysisResult;
      
      if (selectedFile.type.startsWith("image/")) {
        analysisResult = await detector.analyzeImage(selectedFile);
      } else if (selectedFile.type.startsWith("video/")) {
        analysisResult = await detector.analyzeVideo(selectedFile);
      } else {
        alert("Please select an image or video file");
        setIsAnalyzing(false);
        return;
      }

      setResult(analysisResult);
    } catch (err) {
      console.error("Analysis error:", err);
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (isSuspicious: boolean) => {
    return isSuspicious 
      ? "text-red-400 border-red-500/30 bg-red-950/20"
      : "text-emerald-400 border-emerald-500/30 bg-emerald-950/20";
  };

  return (
    <div className="flex-grow flex flex-col h-full bg-[#05070A]">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 bg-[#05070A] border-b border-slate-900/40 flex items-center justify-between z-40 select-none">
        <div className="flex items-center gap-2">
          <button
            onClick={onGoBack}
            className="p-2.5 bg-slate-900/50 border border-slate-805 text-slate-350 hover:text-white rounded-2xl cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <Eye className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              DEEPFAKE DETECTOR
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto">
        <div className="space-y-2">
          <h5 className="text-xs font-display font-semibold text-slate-200 uppercase tracking-wide">
            Upload Media for Analysis
          </h5>
          <p className="text-[10px] text-slate-500">
            Upload images or videos to detect AI-generated or manipulated content.
          </p>
        </div>

        {/* Upload Area */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {!selectedFile ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-8 border-2 border-dashed border-slate-800 hover:border-purple-500/40 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer bg-slate-900/10 hover:bg-slate-950/30"
            >
              <Upload className="w-8 h-8 text-slate-500" />
              <div className="text-center">
                <p className="text-xs text-slate-300 font-medium">Click to upload</p>
                <p className="text-[10px] text-slate-500 mt-1">Images or videos</p>
              </div>
            </button>
          ) : (
            <div className="space-y-2">
              {previewUrl && (
                <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-h-64 object-contain"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      ANALYZING...
                    </>
                  ) : (
                    "ANALYZE MEDIA"
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl("");
                    setResult(null);
                  }}
                  className="py-3 px-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-2xl text-xs font-mono transition-colors cursor-pointer"
                >
                  CLEAR
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {result && result.analysisAvailable ? (
          <div className="space-y-4">
            {/* Risk Level */}
            <div className={`p-4 border rounded-2xl ${getRiskColor(result.isSuspicious)}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.isSuspicious ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                <span className="text-sm font-bold uppercase">
                  {result.isSuspicious ? "POTENTIALLY MANIPULATED" : "APPEARS AUTHENTIC"}
                </span>
              </div>
              <p className="text-xs">
                {result.isSuspicious 
                  ? "This media may contain AI-generated or manipulated content."
                  : "No strong indicators of manipulation detected."}
              </p>
            </div>

            {/* Risk Level Badge */}
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <h6 className="text-[10px] font-mono text-slate-500 uppercase mb-2">
                Authenticity Assessment
              </h6>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  result.authenticityAssessment === "Likely Authentic"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : result.authenticityAssessment === "Suspicious"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                }`}>
                  {result.authenticityAssessment.toUpperCase()}
                </span>
                <span className={`text-xs font-mono font-bold ${
                  result.riskLevel === "High" 
                    ? "text-red-400"
                    : result.riskLevel === "Medium"
                    ? "text-yellow-400"
                    : "text-emerald-400"
                }`}>
                  {result.riskLevel.toUpperCase()} RISK
                </span>
              </div>
            </div>

            {/* AI Reasoning Layer */}
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <h6 className="text-[10px] font-mono text-slate-500 uppercase mb-2">
                AI Reasoning
              </h6>
              
              <div className="mb-3">
                <p className="text-[9px] text-slate-400 mb-1">Analyzed Features:</p>
                <div className="flex flex-wrap gap-1">
                  {result.analyzedFeatures.map((feature, index) => (
                    <span key={index} className="px-2 py-1 bg-cyan-950/30 text-cyan-400 text-[9px] rounded-md border border-cyan-500/20">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-[9px] text-slate-400 mb-1">Explanation:</p>
                <ul className="space-y-1">
                  {result.explanation.map((item, index) => (
                    <li key={index} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-cyan-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-2 bg-slate-950/50 rounded-lg">
                <p className="text-[9px] text-slate-400">
                  <span className="text-purple-400">Uncertainty:</span> {result.uncertainty}
                </p>
              </div>
            </div>

            {/* Indicators */}
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
              <h6 className="text-[10px] font-mono text-slate-500 uppercase mb-2">
                Detected Indicators
              </h6>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${result.indicators.audioInconsistencies ? 'bg-red-400' : 'bg-slate-600'}`} />
                  <span className="text-xs text-slate-300">Audio Inconsistencies</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${result.indicators.visualArtifacts ? 'bg-red-400' : 'bg-slate-600'}`} />
                  <span className="text-xs text-slate-300">Visual Artifacts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${result.indicators.unnaturalMovements ? 'bg-red-400' : 'bg-slate-600'}`} />
                  <span className="text-xs text-slate-300">Unnatural Movements</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${result.indicators.syntheticVoice ? 'bg-red-400' : 'bg-slate-600'}`} />
                  <span className="text-xs text-slate-300">Synthetic Voice</span>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {result.warnings && result.warnings.length > 0 && (
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <h6 className="text-[10px] font-mono text-slate-500 uppercase mb-2">
                  Warnings
                </h6>
                <ul className="space-y-2">
                  {result.warnings.map((warning: string, index: number) => (
                    <li key={index} className="text-xs text-slate-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-3 bg-slate-900/30 border border-slate-800 rounded-xl">
              <p className="text-[9px] text-slate-500">
                This is an AI Media Authenticity Analyzer based on file characteristics. For definitive verification, use professional forensic tools.
              </p>
            </div>
          </div>
        ) : result && !result.analysisAvailable ? (
          <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-2xl">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h6 className="text-sm font-bold text-amber-400 mb-2">Analysis Unavailable</h6>
                <p className="text-xs text-slate-400">
                  Insufficient or invalid visual data for analysis.
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  <span className="text-cyan-400">Suggestion:</span> Upload a clearer image or video frame.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
