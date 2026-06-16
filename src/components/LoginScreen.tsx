import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import React, { useState } from "react";
import { Shield, Mail, Lock, CheckCircle, HelpCircle, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";

interface LoginScreenProps {
  onLoginSuccess: (email: string) => void;
  onGoToRegister: () => void;
}

export default function LoginScreen({ onLoginSuccess, onGoToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    setErrorMsg("");
  
    if (!email || !password) {
      setErrorMsg("Please fill all fields");
      return;
    }
  
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
  
      console.log("Logged In:", userCredential.user);
  
      onLoginSuccess(email);
    } catch (error: any) {
      console.error(error);
  
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setErrorMsg("Invalid email or password");
      } else {
        setErrorMsg("Login failed");
      }
    }
  };

  const fillQuickDemo = () => {
    setEmail("student.safety@hackathon.edu");
    setPassword("cyber-truthlens-2026");
    setErrorMsg("");
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-[#05070A] h-full relative">
      
      {/* Background Subtle Mesh */}
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.06),transparent_50%)] pointer-events-none" />

      {/* Top Brand Header */}
      <div className="flex flex-col items-center text-center mt-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04m17.236 0a11.955 11.955 0 01-8.618 3.04A11.955 11.955 0 013.382 5.984M12 21.35s-8-4-8-11.35V5.984m8 15.366s8-4 8-11.35V5.984" />
          </svg>
        </div>
        <h3 className="text-xl font-display font-extrabold text-white uppercase tracking-tight">
          TRUTH<span className="text-blue-500">LENS</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
          Secure login access to neural-deepfake inspection systems.
        </p>
      </div>

      {/* Middle Form Panel */}
      <form
  onSubmit={(e) => {
    e.preventDefault();
    handleLogin();
  }}
>        
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider block">
              Registered Security Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="login-email-input"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg("");
                }}
                className="w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-800 focus:border-blue-600 rounded-2xl text-xs text-slate-100 outline-none transition-all placeholder:text-slate-705"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider block">
                Security Passcode
              </label>
              <button
                type="button"
                onClick={() => {}}
                className="text-[10px] text-slate-500 hover:text-blue-400 transition-colors cursor-pointer"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="login-password-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg("");
                }}
                className="w-full pl-10 pr-10 py-3 bg-slate-900/50 border border-slate-800 focus:border-blue-600 rounded-2xl text-xs text-slate-100 outline-none transition-all placeholder:text-slate-705"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <button
            id="login-submit-btn"
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-blue-500/10 cursor-pointer transition-colors active:translate-y-px"
          >
            Authenticate Credentials
          </button>

          {/* Quick Sandbox Trigger */}
          <button
            id="login-fill-demo"
            type="button"
            onClick={fillQuickDemo}
            className="w-full py-2.5 bg-slate-900/50 border border-slate-805 hover:bg-slate-800 text-blue-400 hover:text-blue-300 rounded-2xl text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Instant Fill Demo Account</span>
          </button>
        </div>
      </form>

      {/* Bottom Footer Area */}
      <div className="pb-4">
        <div className="flex justify-center items-center text-xs text-slate-400 gap-1">
          <span>New to TruthLens V2.0 safety?</span>
          <button
            id="go-to-register-btn"
            type="button"
            onClick={onGoToRegister}
            className="text-blue-400 hover:underline font-semibold cursor-pointer"
          >
            Create Account
          </button>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-600 font-mono">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> SECURED PROTOCOL
          </span>
          <span>AES-256 ENCRYPTED</span>
        </div>
      </div>

    </div>
  );
}
