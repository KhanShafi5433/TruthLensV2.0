import React, { useState } from "react";
import { ArrowLeft, Shield, Volume2, Eye, CheckCircle, AlertTriangle } from "lucide-react";
import { getElderlyWarningMessage, getElderlyRecommendation, ElderlyProtectionSettings, DEFAULT_ELDERLY_SETTINGS } from "../services/elderlyProtection";

interface ElderModeScreenProps {
  onGoBack: () => void;
}

export default function ElderModeScreen({ onGoBack }: ElderModeScreenProps) {
  const [settings, setSettings] = useState<ElderlyProtectionSettings>(DEFAULT_ELDERLY_SETTINGS);
  const [language, setLanguage] = useState<"English" | "Hindi" | "Marathi">("English");

  const toggleSetting = (key: keyof ElderlyProtectionSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "Hindi" ? "hi-IN" : language === "Marathi" ? "mr-IN" : "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "High Risk":
        return "text-red-400 border-red-500/30 bg-red-950/20";
      case "Suspicious":
        return "text-amber-400 border-amber-500/30 bg-amber-950/20";
      case "Moderate":
        return "text-yellow-400 border-yellow-500/30 bg-yellow-950/20";
      default:
        return "text-emerald-400 border-emerald-500/30 bg-emerald-950/20";
    }
  };

  return (
    <div className="flex-grow flex flex-col h-full bg-[#05070A]">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 bg-[#05070A] border-b border-slate-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onGoBack}
            className="p-2.5 bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white rounded-2xl cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xl font-display font-bold text-white uppercase tracking-widest">
            Elder Protection Mode
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-6 space-y-6 overflow-y-auto">
        {/* Main Toggle */}
        <div className={`p-6 border-2 rounded-3xl flex items-center justify-between ${settings.enabled ? "border-emerald-500/50 bg-emerald-950/20" : "border-slate-800 bg-slate-900/50"}`}>
          <div className="flex items-center gap-4">
            <Shield className={`w-8 h-8 ${settings.enabled ? "text-emerald-400" : "text-slate-500"}`} />
            <div>
              <h3 className={`text-2xl font-bold ${settings.enabled ? "text-emerald-400" : "text-slate-400"}`}>
                {settings.enabled ? "PROTECTION ON" : "PROTECTION OFF"}
              </h3>
              <p className="text-lg text-slate-500 mt-1">
                {settings.enabled ? "Enhanced safety features active" : "Standard mode"}
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleSetting("enabled")}
            className={`w-20 h-20 rounded-full border-4 transition-all ${settings.enabled ? "bg-emerald-500 border-emerald-400" : "bg-slate-800 border-slate-700"}`}
          >
            {settings.enabled && <CheckCircle className="w-10 h-10 text-white mx-auto mt-2" />}
          </button>
        </div>

        {/* Language Selection */}
        <div className="space-y-3">
          <h4 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-blue-400" />
            Language / भाषा / भाषा
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {["English", "Hindi", "Marathi"].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang as "English" | "Hindi" | "Marathi")}
                className={`p-4 border-2 rounded-2xl text-xl font-bold transition-all ${
                  language === lang
                    ? "border-blue-500 bg-blue-950/30 text-blue-400"
                    : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-3">
          <h4 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <Eye className="w-6 h-6 text-purple-400" />
            Display Settings
          </h4>
          <div className="space-y-3">
            <button
              onClick={() => toggleSetting("largeText")}
              className={`w-full p-4 border-2 rounded-2xl flex items-center justify-between ${settings.largeText ? "border-purple-500 bg-purple-950/30" : "border-slate-800 bg-slate-900/50"}`}
            >
              <span className="text-xl font-bold text-slate-300">Large Text</span>
              <div className={`w-12 h-12 rounded-full border-4 ${settings.largeText ? "bg-purple-500 border-purple-400" : "bg-slate-800 border-slate-700"}`}>
                {settings.largeText && <CheckCircle className="w-6 h-6 text-white mx-auto mt-1.5" />}
              </div>
            </button>
            <button
              onClick={() => toggleSetting("highContrast")}
              className={`w-full p-4 border-2 rounded-2xl flex items-center justify-between ${settings.highContrast ? "border-purple-500 bg-purple-950/30" : "border-slate-800 bg-slate-900/50"}`}
            >
              <span className="text-xl font-bold text-slate-300">High Contrast</span>
              <div className={`w-12 h-12 rounded-full border-4 ${settings.highContrast ? "bg-purple-500 border-purple-400" : "bg-slate-800 border-slate-700"}`}>
                {settings.highContrast && <CheckCircle className="w-6 h-6 text-white mx-auto mt-1.5" />}
              </div>
            </button>
            <button
              onClick={() => toggleSetting("voiceWarnings")}
              className={`w-full p-4 border-2 rounded-2xl flex items-center justify-between ${settings.voiceWarnings ? "border-purple-500 bg-purple-950/30" : "border-slate-800 bg-slate-900/50"}`}
            >
              <span className="text-xl font-bold text-slate-300">Voice Warnings</span>
              <div className={`w-12 h-12 rounded-full border-4 ${settings.voiceWarnings ? "bg-purple-500 border-purple-400" : "bg-slate-800 border-slate-700"}`}>
                {settings.voiceWarnings && <CheckCircle className="w-6 h-6 text-white mx-auto mt-1.5" />}
              </div>
            </button>
            <button
              onClick={() => toggleSetting("simplifiedUI")}
              className={`w-full p-4 border-2 rounded-2xl flex items-center justify-between ${settings.simplifiedUI ? "border-purple-500 bg-purple-950/30" : "border-slate-800 bg-slate-900/50"}`}
            >
              <span className="text-xl font-bold text-slate-300">Simplified Interface</span>
              <div className={`w-12 h-12 rounded-full border-4 ${settings.simplifiedUI ? "bg-purple-500 border-purple-400" : "bg-slate-800 border-slate-700"}`}>
                {settings.simplifiedUI && <CheckCircle className="w-6 h-6 text-white mx-auto mt-1.5" />}
              </div>
            </button>
          </div>
        </div>

        {/* Safety Examples */}
        <div className="space-y-3">
          <h4 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            Safety Warnings
          </h4>
          <div className="space-y-3">
            {["High Risk", "Suspicious", "Moderate", "Low"].map((risk) => (
              <div key={risk} className={`p-4 border-2 rounded-2xl ${getRiskColor(risk)}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h5 className="text-xl font-bold mb-2">{risk}</h5>
                <p className="text-lg leading-relaxed">{getElderlyWarningMessage(risk, language)}</p>
              </div>
              <button
                onClick={() => handleSpeak(getElderlyWarningMessage(risk, language))}
                className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors shrink-0"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>
          </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-3">
          <h4 className="text-xl font-bold text-white uppercase tracking-wide">
            Emergency Contact
          </h4>
          <input
            type="tel"
            placeholder="Enter emergency contact number"
            value={settings.emergencyContact || ""}
            onChange={(e) => setSettings(prev => ({ ...prev, emergencyContact: e.target.value }))}
            className="w-full p-4 bg-slate-900/50 border-2 border-slate-800 rounded-2xl text-xl text-slate-300 placeholder:text-slate-600 focus:border-blue-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
