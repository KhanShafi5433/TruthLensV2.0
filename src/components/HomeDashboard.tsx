import React, { useState, useRef, useEffect } from "react";
import {
  AudioLines,
  FileVideo,
  FileImage,
  FileText,
  Upload,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  LogOut,
  HelpCircle,
  Loader2,
  Camera,
  QrCode,
  Users,
  Eye,
  Scan,
  MessageSquare,
  Phone,
  Flame,
} from "lucide-react";
import { Camera as CameraPlugin, CameraResultType } from "@capacitor/camera";
import { DEMO_SCENARIOS, SECURITY_TIPS } from "../data";
import { MediaFileType, DemoScenario, HistoryItem, SecurityTip } from "../types";
import { AnalysisInput } from "../services/analysisTypes";
import { getHistoryRiskClasses } from "../services/riskLevelUtils";
import { readImageFile, revokeImagePreview } from "../utils/readImageFile";
import { APP_VERSION } from "../config/version";

interface UploadedFile {
  name: string;
  size: string;
  previewUrl?: string;
  image?: { base64: string; mimeType: string; previewUrl: string };
}

interface HomeDashboardProps {
  userName: string;
  history: HistoryItem[];
  historyLoading: boolean;
  onStartAnalysis: (input: AnalysisInput) => void;
  onNavigateToScreen: (screen: "HOME" | "THREAT_EXPLANATIONS" | "HISTORY" | "CHAT_ASSISTANT" | "QR_SCANNER" | "DEEPFAKE_DETECTOR" | "COMMUNITY_FEED" | "ELDER_MODE") => void;
  onSelectHistoryItem: (reportId: string) => void;
  onLogout: () => void;
}

export default function HomeDashboard({
  userName,
  history,
  historyLoading,
  onStartAnalysis,
  onNavigateToScreen,
  onSelectHistoryItem,
  onLogout,
}: HomeDashboardProps) {
  const [selectedType, setSelectedType] = useState<MediaFileType>("audio");
  const [customFile, setCustomFile] = useState<UploadedFile | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("scen_grandson_audio");
  const [imageLoading, setImageLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [viralCheckMode, setViralCheckMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (customFile?.previewUrl) revokeImagePreview(customFile.previewUrl);
      if (customFile?.image?.previewUrl) revokeImagePreview(customFile.image.previewUrl);
    };
  }, [customFile]);

  const activePresets = DEMO_SCENARIOS.filter((s) => s.type === selectedType);
  const selectedScenario = DEMO_SCENARIOS.find((s) => s.id === selectedScenarioId);

  const clearCustomFile = () => {
    if (customFile?.previewUrl) revokeImagePreview(customFile.previewUrl);
    if (customFile?.image?.previewUrl) revokeImagePreview(customFile.image.previewUrl);
    setCustomFile(null);
    setUploadError(null);
  };

  const handleSelectPreset = (id: string) => {
    setSelectedScenarioId(id);
    clearCustomFile();
    setPastedText("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setSelectedScenarioId("");

    if (selectedType === "screenshot") {
      setImageLoading(true);
      try {
        const prepared = await readImageFile(file);
        if (customFile?.previewUrl) revokeImagePreview(customFile.previewUrl);
        setCustomFile({
          name: prepared.name,
          size: prepared.sizeLabel,
          previewUrl: prepared.previewUrl,
          image: {
            base64: prepared.base64,
            mimeType: prepared.mimeType,
            previewUrl: prepared.previewUrl,
          },
        });
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Could not load image.");
        clearCustomFile();
      } finally {
        setImageLoading(false);
      }
      return;
    }

    setCustomFile({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    });
  };

  const handleCameraCapture = async () => {
    try {
      const image = await CameraPlugin.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
      });

      if (image.dataUrl) {
        setImageLoading(true);
        setUploadError(null);
        setSelectedScenarioId("");

        // Convert data URL to base64
        const base64Data = image.dataUrl.split(',')[1];
        const mimeType = image.dataUrl.split(';')[0].split(':')[1];

        if (customFile?.previewUrl) revokeImagePreview(customFile.previewUrl);

        setCustomFile({
          name: "Camera Capture",
          size: "Camera",
          previewUrl: image.dataUrl,
          image: {
            base64: base64Data,
            mimeType: mimeType,
            previewUrl: image.dataUrl,
          },
        });

        setImageLoading(false);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setUploadError("Could not access camera. Please check permissions.");
      setImageLoading(false);
    }
  };

  const loadPhishingSMSTemplate = () => {
    const textPreset = DEMO_SCENARIOS.find((s) => s.id === "scen_emergency_sms_text");
    if (textPreset) {
      setPastedText(textPreset.sampleContent);
      setSelectedScenarioId(textPreset.id);
      clearCustomFile();
    }
  };

  const buildAnalysisInput = (): AnalysisInput | null => {
    if (selectedType === "text") {
      const content = pastedText.trim();
      if (!content) return null;

      return {
        type: "text",
        title: viralCheckMode ? "Viral content analysis" : "Pasted message analysis",
        subtitle: viralCheckMode ? "Analyze virality and misinformation patterns" : "Review based on the exact text you provided",
        content,
        viralMode: viralCheckMode,
      };
    }

    if (customFile?.image && selectedType === "screenshot") {
      return {
        type: "screenshot",
        title: viralCheckMode ? "Viral screenshot analysis" : "Screenshot scam check",
        subtitle: viralCheckMode ? "Analyze virality and misinformation patterns" : "Gemini Vision will read visible text in your image",
        content: "",
        fileName: customFile.name,
        image: {
          base64: customFile.image.base64,
          mimeType: customFile.image.mimeType,
          previewUrl: customFile.image.previewUrl,
        },
        viralMode: viralCheckMode,
      };
    }

    if (customFile) {
      return {
        type: selectedType,
        title: viralCheckMode ? `Viral ${selectedType} analysis` : `Uploaded ${selectedType} file`,
        subtitle: viralCheckMode ? "Analyze virality and misinformation patterns" : "Upload a screenshot image for vision analysis, or use a sample scenario",
        content: `The user uploaded a ${selectedType} file named "${customFile.name}". Only screenshot images support visual analysis.`,
        fileName: customFile.name,
        viralMode: viralCheckMode,
      };
    }

    if (!selectedScenario) return null;

    return {
      type: selectedScenario.type,
      title: viralCheckMode ? `Viral ${selectedScenario.title}` : selectedScenario.title,
      subtitle: viralCheckMode ? "Analyze virality and misinformation patterns" : selectedScenario.subtitle,
      content: selectedScenario.sampleContent,
      fileName: selectedScenario.fileDetails?.name,
      viralMode: viralCheckMode,
    };
  };

  const handleAnalyzeClick = () => {
    if (imageLoading) return;

    const input = buildAnalysisInput();
    if (!input) {
      if (selectedType === "screenshot") {
        alert("Upload a screenshot image to analyze.");
      } else {
        alert("Please paste the message text you want to analyze.");
      }
      return;
    }

    if (selectedType === "screenshot" && customFile && !customFile.image) {
      alert("Upload an image file (JPEG, PNG, WebP, or GIF) for screenshot analysis.");
      return;
    }

    onStartAnalysis(input);
  };

  const analyzeButtonLabel =
    selectedType === "screenshot" && customFile?.image
      ? "ANALYZE IMAGE FOR SCAMS"
      : selectedType === "text"
        ? "RUN SCAM TEXT ANALYSIS"
        : "RUN ANALYSIS";

  return (
    <div className="flex-grow flex flex-col justify-between" id="dashboard-view">
      <div className="px-5 pt-4 pb-3 bg-[#05070A] flex justify-between items-center border-b border-slate-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-bold">
              SYS STATUS // ENGAGED
            </span>
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <h4 className="text-sm font-display font-bold text-white tracking-tight mt-0.5">
            Hi, {userName || "User"}
          </h4>
        </div>

        <button
          id="logout-btn"
          onClick={onLogout}
          className="p-2.5 bg-slate-900/50 hover:bg-slate-800 border border-slate-805 rounded-2xl text-slate-400 hover:text-red-400 cursor-pointer transition-colors"
          title="Sign Out Account"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 py-3 space-y-5 flex-1 select-none">
        <div className="p-3.5 bg-red-950/20 border border-red-500/35 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-500/10 rounded-xl text-red-400 shrink-0">
              <ShieldAlert className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div>
              <p className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-wider">
                SCAM AWARENESS TIP
              </p>
              <p className="text-[10px] text-red-200/60 mt-0.5 leading-tight">
                Paste suspicious messages — scores reflect your actual text.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-red-500/55" />
        </div>

        <div className="space-y-3">
          <div>
            <h5 className="text-xs font-display font-semibold text-slate-200 uppercase tracking-wide">
              Quick Safety Tools
            </h5>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Access all scam detection and safety features.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                console.log("Scan Screenshot button clicked");
                setSelectedType("screenshot");
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                } else {
                  console.error("fileInputRef is null");
                }
              }}
              className="p-3 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center gap-2 transition-colors cursor-pointer"
            >
              <Scan className="w-5 h-5 text-blue-400" />
              <span className="text-[10px] font-mono text-slate-300">Scan Screenshot</span>
            </button>
            <button
              onClick={() => {
                console.log("QR Scanner button clicked");
                onNavigateToScreen("QR_SCANNER");
              }}
              className="p-3 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center gap-2 transition-colors cursor-pointer"
            >
              <QrCode className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-mono text-slate-300">QR Scanner</span>
            </button>
            <button
              onClick={() => {
                console.log("Deepfake Check button clicked");
                onNavigateToScreen("DEEPFAKE_DETECTOR");
              }}
              className="p-3 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center gap-2 transition-colors cursor-pointer"
            >
              <Eye className="w-5 h-5 text-purple-400" />
              <span className="text-[10px] font-mono text-slate-300">Deepfake Check</span>
            </button>
            <button
              onClick={() => {
                console.log("Community Feed button clicked");
                onNavigateToScreen("COMMUNITY_FEED");
              }}
              className="p-3 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center gap-2 transition-colors cursor-pointer"
            >
              <Users className="w-5 h-5 text-orange-400" />
              <span className="text-[10px] font-mono text-slate-300">Community Feed</span>
            </button>
            <button
              onClick={() => {
                console.log("SMS Protection button clicked - Feature coming soon");
                // SMS Protection feature exists in code but requires Android permissions
                // For now, show a message indicating it's Android-only
                alert("SMS Protection is available on Android. Please use the APK version.");
              }}
              className="p-3 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center gap-2 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 text-green-400" />
              <span className="text-[10px] font-mono text-slate-300">SMS Protection</span>
            </button>
            <button
              onClick={() => {
                console.log("Call Scam Detection button clicked - Feature coming soon");
                // Call Scam Detection feature exists in code but requires Android permissions
                // For now, show a message indicating it's Android-only
                alert("Call Scam Detection is available on Android. Please use the APK version.");
              }}
              className="p-3 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center gap-2 transition-colors cursor-pointer"
            >
              <Phone className="w-5 h-5 text-red-400" />
              <span className="text-[10px] font-mono text-slate-300">Call Scam Detect</span>
            </button>
            <button
              onClick={() => {
                console.log("Elder Protection button clicked");
                onNavigateToScreen("ELDER_MODE");
              }}
              className="p-3 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center gap-2 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-5 h-5 text-pink-400" />
              <span className="text-[10px] font-mono text-slate-300">Elder Protection</span>
            </button>
            <button
              onClick={() => {
                console.log("AI Assistant button clicked");
                onNavigateToScreen("CHAT_ASSISTANT");
              }}
              className="p-3 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-xl flex flex-col items-center gap-2 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <span className="text-[10px] font-mono text-slate-300">AI Assistant</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h5 className="text-xs font-display font-semibold text-slate-200 uppercase tracking-wide">
              Inspect Suspicious Content
            </h5>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Paste text or upload a screenshot for scam analysis.
            </p>
          </div>

          {/* Viral Check Mode Toggle */}
          <button
            onClick={() => setViralCheckMode(!viralCheckMode)}
            className={`w-full p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
              viralCheckMode
                ? "bg-orange-950/30 border-orange-500/50"
                : "bg-slate-900/50 border-slate-800 hover:border-orange-500/30"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${viralCheckMode ? "bg-orange-500/20" : "bg-slate-800"}`}>
                <Flame className={`w-4 h-4 ${viralCheckMode ? "text-orange-400" : "text-slate-500"}`} />
              </div>
              <div className="text-left">
                <p className={`text-[10px] font-mono font-bold uppercase tracking-wider ${viralCheckMode ? "text-orange-400" : "text-slate-400"}`}>
                  🔥 Viral Check Mode
                </p>
                <p className={`text-[9px] mt-0.5 ${viralCheckMode ? "text-orange-200/70" : "text-slate-500"}`}>
                  {viralCheckMode ? "Analyze virality & misinformation patterns" : "Focus on scam detection"}
                </p>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full relative transition-colors ${viralCheckMode ? "bg-orange-500" : "bg-slate-700"}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${viralCheckMode ? "left-5" : "left-1"}`} />
            </div>
          </button>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "audio", label: "Voice/Audio", icon: AudioLines },
              { id: "video", label: "Video", icon: FileVideo },
              { id: "screenshot", label: "Screenshot", icon: FileImage },
              { id: "text", label: "Pasted Text", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedType === tab.id;
              return (
                <button
                  id={`tab-select-${tab.id}`}
                  key={tab.id}
                  onClick={() => {
                    setSelectedType(tab.id as MediaFileType);
                    const matching = DEMO_SCENARIOS.find((s) => s.type === tab.id);
                    if (matching) {
                      setSelectedScenarioId(matching.id);
                    } else {
                      setSelectedScenarioId("");
                    }
                    clearCustomFile();
                    setPastedText("");
                  }}
                  className={`py-3 px-1 flex flex-col items-center justify-center rounded-2xl border transition-all text-center cursor-pointer ${
                    isActive
                      ? "bg-slate-800/90 border-blue-500 text-blue-400 shadow-md shadow-blue-550/10 font-bold"
                      : "bg-slate-905 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 font-medium"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 mb-1.5 ${isActive ? "text-blue-400" : "text-slate-500"}`}
                  />
                  <span className="text-[9px] tracking-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 space-y-4 min-h-[175px] flex flex-col justify-between">
            {selectedType !== "text" ? (
              <>
                <input
                  id="raw-file-input"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={
                    selectedType === "audio"
                      ? "audio/*"
                      : selectedType === "video"
                        ? "video/*"
                        : "image/*"
                  }
                  className="hidden"
                />

                {imageLoading ? (
                  <div className="flex-1 border border-dashed border-blue-500/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                    <p className="text-[10px] font-mono text-slate-400">Preparing image…</p>
                  </div>
                ) : customFile ? (
                  <div className="p-3.5 bg-blue-950/20 border border-blue-800/30 rounded-2xl space-y-3 text-left">
                    {customFile.previewUrl && selectedType === "screenshot" && (
                      <img
                        src={customFile.previewUrl}
                        alt="Upload preview"
                        className="w-full max-h-36 object-contain rounded-xl border border-slate-800 bg-slate-950"
                      />
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 bg-blue-900/40 border border-blue-600/30 rounded-xl text-blue-400 shrink-0">
                          {selectedType === "audio" ? (
                            <AudioLines className="w-5 h-5" />
                          ) : selectedType === "video" ? (
                            <FileVideo className="w-5 h-5" />
                          ) : (
                            <FileImage className="w-5 h-5" />
                          )}
                        </div>
                        <div className="truncate min-w-0">
                          <p className="text-xs font-mono font-bold text-slate-100 truncate">
                            {customFile.name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {customFile.size}
                            {customFile.image ? " • Ready for vision scan" : " • Upload"}
                          </p>
                        </div>
                      </div>
                      <button
                        id="clear-upload-btn"
                        type="button"
                        onClick={() => {
                          clearCustomFile();
                          const fallbackPreset = DEMO_SCENARIOS.find((s) => s.type === selectedType);
                          if (fallbackPreset) setSelectedScenarioId(fallbackPreset.id);
                        }}
                        className="text-[10px] font-mono text-red-400 hover:underline cursor-pointer shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      id="trigger-file-select"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 border border-dashed border-slate-800 hover:border-blue-500/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-slate-900/10 hover:bg-slate-950/30 group"
                    >
                      <Upload className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors mb-2" />
                      <p className="text-[10px] font-mono text-slate-300 group-hover:text-white">
                        {selectedType === "screenshot"
                          ? "Upload screenshot"
                          : `Select ${selectedType}`}
                      </p>
                    </button>
                    {selectedType === "screenshot" && (
                      <button
                        id="trigger-camera-capture"
                        type="button"
                        onClick={handleCameraCapture}
                        className="flex-1 border border-dashed border-slate-800 hover:border-blue-500/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-slate-900/10 hover:bg-slate-950/30 group"
                      >
                        <Camera className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors mb-2" />
                        <p className="text-[10px] font-mono text-slate-300 group-hover:text-white">
                          Scan with Camera
                        </p>
                      </button>
                    )}
                  </div>
                )}

                {uploadError && (
                  <p className="text-[10px] text-red-400 font-mono">{uploadError}</p>
                )}

                <div className="pt-2">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 block mb-2 font-bold">
                    SAMPLE SCENARIOS
                  </span>
                  <div className="space-y-2">
                    {activePresets.map((preset) => {
                      const isChosen = selectedScenarioId === preset.id && !customFile;
                      return (
                        <button
                          id={`preset-select-${preset.id}`}
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset.id)}
                          className={`w-full text-left p-3.5 rounded-2xl border text-xs flex justify-between items-center transition-all cursor-pointer ${
                            isChosen
                              ? "bg-slate-800 border-slate-700 text-white font-bold shadow-sm shadow-black/30"
                              : "bg-slate-900/20 border-slate-805 text-slate-400 hover:bg-slate-900/50 hover:text-slate-300 font-medium"
                          }`}
                        >
                          <div className="truncate pr-2">
                            <p className="truncate font-sans leading-tight">{preset.title}</p>
                            <p className="text-[9px] text-slate-500 font-normal truncate mt-0.5">
                              {preset.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3 flex flex-col justify-between flex-grow">
                <textarea
                  id="phishing-text-area"
                  placeholder="Paste the exact suspicious SMS, email, or chat message here..."
                  value={pastedText}
                  onChange={(e) => {
                    setPastedText(e.target.value);
                    setSelectedScenarioId("");
                  }}
                  className="w-full h-24 p-3 bg-slate-950 border border-slate-800/80 focus:border-blue-500 rounded-2xl outline-none text-xs text-slate-200 resize-none font-sans placeholder:text-slate-700"
                />

                <div className="flex justify-between items-center">
                  <button
                    id="load-smishing-preset"
                    type="button"
                    onClick={loadPhishingSMSTemplate}
                    className="px-3 py-1.5 bg-slate-900/50 border border-slate-800 hover:bg-slate-800 rounded-xl text-[9px] font-mono text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    <span>Load sample smishing text</span>
                  </button>

                  <span className="text-[9px] font-mono text-slate-650">{pastedText.length} chars</span>
                </div>
              </div>
            )}

            <button
              id="analyze-run-trigger"
              type="button"
              onClick={handleAnalyzeClick}
              disabled={imageLoading}
              className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2.5 tracking-wider"
            >
              {imageLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-white/90 animate-pulse" />
              )}
              <span className="text-[11px]">{analyzeButtonLabel}</span>
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <h6 className="text-[11px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Educational Protection Guides
            </h6>
            <button
              id="read-all-tips-btn"
              onClick={() => onNavigateToScreen("THREAT_EXPLANATIONS")}
              className="text-[10px] text-blue-400 hover:underline cursor-pointer flex items-center"
            >
              Learn More
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {SECURITY_TIPS.slice(0, 2).map((tip: SecurityTip) => (
              <div
                key={tip.id}
                className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl relative overflow-hidden group text-left"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="px-1.5 py-0.5 bg-blue-950/80 border border-blue-900/60 rounded-md text-[8px] font-mono uppercase text-blue-400 font-bold">
                    {tip.category}
                  </span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </div>
                <p className="text-xs font-bold font-display text-white mt-1.5 group-hover:text-blue-400 transition-colors">
                  {tip.title}
                </p>
                <p className="text-[10px] text-slate-400 leading-normal mt-1 line-clamp-2">
                  {tip.summary}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h6 className="text-[11px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              Recent scans
            </h6>
            <button
              id="goto-full-history-btn"
              onClick={() => onNavigateToScreen("HISTORY")}
              className="text-[10px] text-blue-400 hover:underline cursor-pointer font-semibold"
            >
              See all
            </button>
          </div>

          {historyLoading && (
            <div className="flex items-center justify-center gap-2 py-6 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span className="text-[10px] font-mono">Loading scans…</span>
            </div>
          )}

          {!historyLoading && history.length === 0 && (
            <p className="text-[10px] text-slate-500 font-mono py-2">No scans found.</p>
          )}

          <div className="space-y-2">
            {!historyLoading &&
              history.slice(0, 3).map((item) => {
                const riskStyle = getHistoryRiskClasses(item.riskLevel);
                return (
                  <button
                    id={`history-item-row-${item.id}`}
                    key={item.id}
                    type="button"
                    onClick={() => onSelectHistoryItem(item.reportId)}
                    className="w-full text-left p-3.5 bg-slate-900/40 hover:bg-slate-900/60 border border-slate-805 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">
                        {item.previewText}
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono mt-1">{item.timestamp}</p>
                      <span
                        className={`inline-block mt-1.5 text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md border ${riskStyle.badge}`}
                      >
                        {item.riskLevel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-mono font-extrabold px-2 py-1 rounded-lg border bg-slate-950/80 ${riskStyle.badge}`}
                      >
                        {item.riskScore}%
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
      
      {/* Version Footer */}
      <div className="px-5 pb-4">
        <p className="text-[9px] font-mono text-slate-600 text-center">
          Fabric V{APP_VERSION}
        </p>
      </div>
    </div>
  );
}
