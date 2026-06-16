import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import React, { useState } from "react";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";

interface RegisterScreenProps {
  onRegisterSuccess: (email: string, name: string) => void;
  onGoToLogin: () => void;
}

export default function RegisterScreen({
  onRegisterSuccess,
  onGoToLogin,
}: RegisterScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setErrorMsg("");

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("User Registered:", userCredential.user);

      alert("Registration Successful!");

      onRegisterSuccess(email, name);
    } catch (error: any) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        setErrorMsg("Email already registered");
      } else if (error.code === "auth/invalid-email") {
        setErrorMsg("Invalid email address");
      } else if (error.code === "auth/weak-password") {
        setErrorMsg("Weak password");
      } else {
        setErrorMsg("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-[#05070A] h-full relative">

      {/* Top Header */}
      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={onGoToLogin}
          className="p-2 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <span className="text-xs text-slate-400">
          Back to Login
        </span>
      </div>

      {/* Title */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold text-white">
          Create Account
        </h2>

        <p className="text-sm text-slate-400 mt-2">
          Register to access TruthLens V2.0 AI protection
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister();
        }}
        className="flex-1 flex flex-col justify-center gap-4 mt-6"
      >

        {/* Error */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
            {errorMsg}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="text-xs text-slate-400 block mb-2">
            Full Name
          </label>

          <div className="relative">
            <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />

            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-xs text-slate-400 block mb-2">
            Email
          </label>

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />

            <input
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-xs text-slate-400 block mb-2">
            Password
          </label>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />

            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="text-xs text-slate-400 block mb-2">
            Confirm Password
          </label>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />

            <input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Register Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold mt-4 transition-all"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      {/* Footer */}
      <div className="text-center mt-6 mb-2">
        <span className="text-sm text-slate-400">
          Already have an account?
        </span>

        <button
          type="button"
          onClick={onGoToLogin}
          className="ml-2 text-blue-400 hover:underline"
        >
          Login
        </button>
      </div>
    </div>
  );
}