import React, { useState, useEffect } from "react";
import { 
  Wifi, 
  Battery, 
  Signal, 
  Smartphone, 
  Monitor, 
  Volume2, 
  VolumeX, 
  Power,
  RefreshCw,
  Cpu,
  MessageSquare,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ScreenState } from "../types";
import { APP_VERSION } from "../config/version";

interface AndroidFrameProps {
  children: React.ReactNode;
  currentScreen: ScreenState;
  onHomeClick: () => void;
  onNavigateToScreen: (screen: ScreenState) => void;
  isPhoneMockup: boolean;
  setIsPhoneMockup: (v: boolean) => void;
  onResetApp: () => void;
}

export default function AndroidFrame({ 
  children, 
  currentScreen, 
  onHomeClick, 
  onNavigateToScreen,
  isPhoneMockup, 
  setIsPhoneMockup,
  onResetApp
}: AndroidFrameProps) {
  const [time, setTime] = useState("14:53");
  const [batteryLevel, setBatteryLevel] = useState(88);
  const [isMuted, setIsMuted] = useState(false);
  const [isPoweredOn, setIsPoweredOn] = useState(true);

  // Keep digital clock sync
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Simulate battery draining very slowly
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => (prev > 5 ? prev - 1 : 100));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handlePowerClick = () => {
    setIsPoweredOn(!isPoweredOn);
  };

  const bottomNav = (active: "HOME" | "THREAT_EXPLANATIONS" | "HISTORY" | "CHAT_ASSISTANT") => (
    <div className="w-full h-16 pt-1 border-t border-slate-900 bg-slate-950/95 flex justify-around items-center select-none shrink-0">
      <button
        onClick={() => onNavigateToScreen("HOME")}
        className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-colors ${
          active === "HOME" ? "text-blue-500" : "text-slate-500 hover:text-slate-300"
        }`}
      >
        <span className="w-5 h-5 block text-center">🛡</span>
        <span className="text-[10px] mt-1 font-mono">Sandbox</span>
      </button>
      <button
        onClick={() => onNavigateToScreen("CHAT_ASSISTANT")}
        className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-colors ${
          active === "CHAT_ASSISTANT" ? "text-blue-500" : "text-slate-500 hover:text-slate-300"
        }`}
      >
        <MessageSquare className={`w-5 h-5 ${active === "CHAT_ASSISTANT" ? "text-blue-500" : ""}`} />
        <span className="text-[10px] mt-1 font-mono">AI Help</span>
      </button>
      <button
        onClick={() => onNavigateToScreen("THREAT_EXPLANATIONS")}
        className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-colors ${
          active === "THREAT_EXPLANATIONS" ? "text-blue-500" : "text-slate-500 hover:text-slate-300"
        }`}
      >
        <span className="w-5 h-5 block text-center">📖</span>
        <span className="text-[10px] mt-1 font-mono">Guides</span>
      </button>
      <button
        id="nav-tab-history"
        onClick={() => onNavigateToScreen("HISTORY")}
        className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-colors ${
          active === "HISTORY" ? "text-blue-500" : "text-slate-500 hover:text-slate-300"
        }`}
      >
        <History className={`w-5 h-5 ${active === "HISTORY" ? "text-blue-500" : ""}`} />
        <span className="text-[10px] mt-1 font-medium mt-1 font-mono">History</span>
      </button>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#05070A] text-slate-100 p-4 font-sans selection:bg-blue-600/35 selection:text-white overflow-x-hidden">
      
      {/* Top Banner Control Panel (Hackathon Style) */}
      <div className="w-full max-w-4xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04m17.236 0a11.955 11.955 0 01-8.618 3.04A11.955 11.955 0 013.382 5.984M12 21.35s-8-4-8-11.35V5.984m8 15.366s8-4 8-11.35V5.984" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-display font-bold text-white tracking-tight">TruthLens V2.0</h1>
              <span className="px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-mono bg-blue-950 border border-blue-800 text-blue-400 rounded-md">
                PROTOTYPE V{APP_VERSION}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">AI Guardian V{APP_VERSION}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Security Status emulated panel */}
          <div className="hidden lg:flex flex-col text-right pr-2">
            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Security Status</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">● Encrypted Connection</span>
          </div>
          {/* Mockup mode Toggle */}
          <button
            id="toggle-mockup-btn"
            onClick={() => setIsPhoneMockup(!isPhoneMockup)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isPhoneMockup 
                ? "bg-blue-600 text-white border border-blue-500 shadow-md shadow-blue-500/20" 
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
            }`}
            title="Toggle Android Device Emulation Frame"
          >
            {isPhoneMockup ? (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone Frame</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>Full Width</span>
              </>
            )}
          </button>

          {/* Reset App state */}
          <button
            id="reset-app-btn"
            onClick={onResetApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 cursor-pointer transition-colors"
            title="Reset system history and credentials"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          {/* Hardware Sound trigger */}
          <button
            id="sound-trigger-btn"
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 cursor-pointer"
            title={isMuted ? "Unmute system click sounds" : "Mute system click sounds"}
          >
            {isMuted ? <VolumeX className="w-4.5 h-4.5 text-red-400" /> : <Volume2 className="w-4.5 h-4.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative flex justify-center items-center w-full max-w-lg transition-all duration-300">
        
        {isPhoneMockup ? (
          /* ANDROID DEVICE WRAPPER */
          <div className="relative bg-slate-900 border-[10px] border-slate-800 rounded-[48px] shadow-2xl p-0.5 overflow-visible w-full max-w-[395px] h-[780px] flex flex-col group transition-all duration-300">
            
            {/* Screen Reflect Line */}
            <div className="absolute top-0 right-10 w-24 h-full bg-linear-to-r from-transparent via-white/2 to-transparent pointer-events-none transform -skew-x-12 z-40 transition-opacity group-hover:opacity-60" />
            
            {/* Outer Physical Hardware Buttons */}
            {/* Volume Up */}
            <button 
              id="hw-vol-up"
              onClick={() => { if (!isMuted) console.log("Volume Up clicked"); }}
              className="absolute -left-[14px] top-32 w-1 h-12 bg-slate-700 border-l border-slate-800 rounded-l-md hover:bg-slate-500 cursor-pointer shadow-lg active:scale-95 transition-all"
              title="Hardware Volume Up"
            />
            {/* Volume Down */}
            <button 
              id="hw-vol-down"
              onClick={() => { if (!isMuted) console.log("Volume Down clicked"); }}
              className="absolute -left-[14px] top-48 w-1 h-12 bg-slate-700 border-l border-slate-800 rounded-l-md hover:bg-slate-500 cursor-pointer shadow-lg active:scale-95 transition-all"
              title="Hardware Volume Down"
            />
            {/* Power Button */}
            <button 
              id="hw-power"
              onClick={handlePowerClick}
              className={`absolute -right-[14px] top-40 w-1 h-16 rounded-r-md cursor-pointer shadow-lg active:scale-95 transition-all ${
                isPoweredOn ? "bg-slate-700 hover:bg-red-500" : "bg-red-600 animate-pulse hover:bg-red-500"
              }`}
              title="Power Button (Tap to Toggle Screen)"
            />

            {/* Top Ear Piece Speaker */}
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-slate-950 rounded-full z-45" />

            {/* Inner Phone Screen */}
            <div className="relative w-full h-full bg-[#05070A] rounded-[38px] overflow-hidden flex flex-col border border-slate-950">
              
              <AnimatePresence mode="wait">
                {isPoweredOn ? (
                  <motion.div 
                    key="powered-screen"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full flex flex-col"
                  >
                    {/* Top Device Notch with Camera Hole */}
                    <div className="absolute top-0 inset-x-0 h-6 flex justify-center items-center z-50 pointer-events-none">
                      <div className="w-[110px] h-[20px] bg-black rounded-b-xl flex items-center justify-between px-3 text-white">
                        {/* Fake camera lens */}
                        <div className="w-2.5 h-2.5 bg-slate-900 border border-slate-800/80 rounded-full flex items-center justify-center">
                          <div className="w-1 h-1 bg-blue-900 rounded-full" />
                        </div>
                        {/* Mini acoustic sensor */}
                        <div className="w-1 h-1 bg-slate-800 rounded-full" />
                      </div>
                    </div>

                    {/* Android System Status Bar */}
                    <div className="h-7 pt-1 px-5 flex justify-between items-center bg-[#05070A] text-slate-300 text-[11px] font-mono select-none z-48 border-b border-slate-900/40">
                      <div className="flex items-center gap-1 font-semibold text-slate-200">
                        <span>{time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Signal className="w-3 h-3 text-slate-400" />
                        <Wifi className="w-3 h-3 text-slate-400" />
                        <div className="flex items-center gap-0.5">
                          <span className="text-[10px] text-slate-400 font-medium">{batteryLevel}%</span>
                          <Battery className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                      </div>
                    </div>

                    {/* Screen Content Wrapper */}
                    <div className="flex-1 overflow-y-auto relative flex flex-col bg-[#05070A]">
                      {children}
                    </div>

                    {/* Bottom Navbar */}
                    {currentScreen === "HOME" && bottomNav("HOME")}
                    {currentScreen === "THREAT_EXPLANATIONS" && bottomNav("THREAT_EXPLANATIONS")}
                    {currentScreen === "CHAT_ASSISTANT" && bottomNav("CHAT_ASSISTANT")}
                    {currentScreen === "HISTORY" && bottomNav("HISTORY")}

                    {/* Bottom Nav Gesture Bar */}
                    <div className="h-6 bg-[#05070A] border-t border-slate-900/30 flex justify-center items-center select-none z-48">
                      <button 
                        id="back-to-home-gesture"
                        onClick={onHomeClick}
                        className="w-24 h-1.5 bg-slate-600 rounded-full hover:bg-blue-500 active:scale-95 transition-all"
                        title="Back to Dashboard"
                      />
                    </div>
                  </motion.div>
                ) : (
                  /* Black Screen (Power Off state) */
                  <motion.div 
                    key="off-screen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black z-49 flex flex-col items-center justify-center p-6 text-center select-none"
                  >
                    <Power className="w-8 h-8 text-red-500 opacity-60 animate-pulse mb-3" />
                    <p className="text-xs text-slate-500 font-mono">TruthLens V2.0 Screen Off</p>
                    <button 
                      id="turn-on-btn"
                      onClick={() => setIsPoweredOn(true)}
                      className="mt-4 px-4 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Turn On Screen
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        ) : (
          /* RESPONSIVE FULL PANEL PREVIEW */
          <div className="relative bg-[#05070A] border border-slate-800 rounded-3xl shadow-xl overflow-hidden w-full max-w-lg min-h-[700px] flex flex-col">
            
            {/* Minimal App Title in full-mode */}
            <div className="h-12 px-6 flex justify-between items-center bg-[#05070A]/90 text-slate-300 text-xs select-none z-48 border-b border-slate-850">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span className="font-mono text-slate-400">System Connected (UTC Time: {time})</span>
              </div>
              <div className="text-[10px] text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-900">
                Sandboxed Demo Environment
              </div>
            </div>

            {/* Inner Content */}
            <div className="flex-1 flex flex-col bg-[#05070A]">
              {children}
            </div>

            {/* Bottom mini-bar */}
            <div className="h-10 bg-[#05070A] border-t border-slate-900 px-6 flex justify-between items-center text-xs text-slate-400">
              <span>Android Demo Emulator</span>
              <button 
                id="footer-dashboard-btn"
                onClick={onHomeClick}
                className="text-blue-400 hover:underline cursor-pointer"
              >
                Go Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
