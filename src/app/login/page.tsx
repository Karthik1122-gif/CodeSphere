"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Lock, Eye, EyeOff, ShieldAlert, Check, Shield } from "lucide-react";

export default function LoginPage() {
  const [role, setRole] = useState<"STUDENT" | "FACULTY">("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { setUser } = useStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!captchaChecked) {
      setError("Please check the security verification box.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed. Please verify credentials.");
        setLoading(false);
        return;
      }

      setUser(data.user);

      if (data.user.role === "STUDENT") {
        router.push("/student/dashboard");
      } else {
        router.push("/faculty/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Connection failure. Check dev server logs.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      {/* 1. Header Bar */}
      <header className="w-full bg-ink-charcoal border-b-2 border-brand text-white z-40 sticky top-0 px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <div className="bg-brand text-ink-charcoal h-8 w-8 rounded-sm font-bold flex items-center justify-center text-sm">
            CS
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-sm uppercase tracking-wider leading-none text-white">
              CodeSphere
            </h1>
            <span className="text-[9px] text-[#A0A0A0] uppercase font-bold tracking-widest block mt-0.5">
              Central Coding Evaluation Cell
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span className="h-2 w-2 rounded-full bg-brand animate-pulse"></span>
          <span>Secure Session · TLS 1.3</span>
        </div>
      </header>

      {/* 2. Main Login Area */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:20px_20px] opacity-95">
        <div className="w-full max-w-5xl bg-surface-white shadow-2xl rounded-sm border border-[var(--color-brand-green-dark-border)]/20 overflow-hidden flex flex-col md:flex-row h-auto min-h-[550px] animate-fade-in-up">
          
          {/* LEFT PANEL - Informational Notice Block */}
          <div className="w-full md:w-[45%] bg-[var(--color-brand-green-darkest)] text-white p-8 sm:p-10 flex flex-col justify-between space-y-8 relative overflow-hidden">
            {/* Background Decorative Rings */}
            <div className="absolute right-0 top-0 w-32 h-32 rounded-full border border-white/5 translate-x-12 -translate-y-12"></div>
            <div className="absolute right-0 top-0 w-48 h-48 rounded-full border border-white/5 translate-x-12 -translate-y-12"></div>

            <div className="space-y-6">
              <span className="text-[10px] text-brand font-bold uppercase tracking-widest border border-brand/35 bg-brand/5 px-2.5 py-1 rounded-sm">
                Institutional Assessment Portal
              </span>
              
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl leading-tight text-white">
                One portal to set, take and evaluate coding tests.
              </h2>
              
              <p className="text-xs text-gray-300 leading-relaxed font-medium">
                CodeSphere runs faculty-authored programming tests across all major languages, checks submissions against instructor test cases in real time, and keeps a verified record of every result.
              </p>

              {/* Checklist */}
              <div className="space-y-3.5 pt-4 text-xs font-semibold text-gray-200">
                <div className="flex items-center space-x-2.5">
                  <div className="h-4.5 w-4.5 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center text-brand">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Multi-language execution engine — C, C++, Python, JavaScript</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="h-4.5 w-4.5 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center text-brand">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Faculty-defined test cases with instant pass/fail scoring</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="h-4.5 w-4.5 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center text-brand">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Encrypted result records with full evaluation audit trail</span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-[var(--color-brand-green-dark-border)] border-l-2 border-brand p-3.5 text-[11px] leading-relaxed text-gray-300 font-semibold rounded-r-sm">
                <span className="text-[#C4B5FD] font-bold uppercase block mb-1">Security notice</span>
                <span className="text-[#C4B5FD]">
                  This is a monitored academic system. Unauthorized access or impersonation of a student/faculty identity is a disciplinary offence and is logged with timestamp and IP.
                </span>
              </div>
            </div>

            {/* Notice Board at bottom of left panel */}
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pt-6 border-t border-white/10">
              <span className="text-brand block mb-0.5">NOTICE BOARD</span>
              Semester-end practical evaluations open from 04 Aug 2026. Result appeals close 15 Aug 2026.
            </div>
          </div>

          {/* RIGHT PANEL - Form and inputs */}
          <div className="w-full md:w-[55%] p-8 sm:p-10 flex flex-col justify-between space-y-6">
            
            <div className="space-y-6">
              {/* Logo block */}
              <div className="flex items-center justify-between border-b border-gray-150 pb-4">
                <div className="h-10 w-10 bg-brand/10 border border-brand/20 text-brand rounded-sm flex items-center justify-center">
                  <Shield className="w-5 h-5 animate-pulse" />
                </div>
                {error && (
                  <div className="bg-surface-offwhite border border-red-200 text-red-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm flex items-center space-x-1.5 animate-bounce">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Failed</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-heading font-extrabold text-xl text-ink-black uppercase tracking-wide">
                  Sign in to your account
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Use your institution-issued credentials to continue.
                </p>
              </div>

              {/* Role selector buttons */}
              <div className="grid grid-cols-2 border border-[var(--color-brand-green-dark-border)]/30 rounded-sm overflow-hidden p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setRole("STUDENT");
                    setEmail("student@hitam.edu.in");
                  }}
                  className={`py-2 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    role === "STUDENT"
                      ? "bg-brand text-white"
                      : "text-gray-500 hover:text-ink-charcoal bg-surface-white hover:bg-gray-50"
                  }`}
                >
                  Student Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole("FACULTY");
                    setEmail("faculty@hitam.edu.in");
                  }}
                  className={`py-2 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    role === "FACULTY"
                      ? "bg-brand text-white"
                      : "text-gray-500 hover:text-ink-charcoal bg-surface-white hover:bg-gray-50"
                  }`}
                >
                  Faculty Login
                </button>
              </div>

              {/* Input Form fields */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Registration / Roll Number
                  </label>
                  <input
                    type="email"
                    required
                    placeholder={role === "STUDENT" ? "e.g. student@hitam.edu.in" : "e.g. faculty@hitam.edu.in"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-white border border-[var(--color-brand-green-dark-border)]/30 text-xs px-3.5 py-3 rounded-sm focus:outline-none focus:border-brand text-ink-black font-semibold placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Password
                    </label>
                    <a href="#" className="text-[10px] font-bold text-brand uppercase hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface-white border border-[var(--color-brand-green-dark-border)]/30 text-xs px-3.5 py-3 rounded-sm focus:outline-none focus:border-brand text-ink-black font-semibold placeholder:text-gray-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Keep me signed in */}
                <div className="flex items-center space-x-2 text-xs font-semibold text-gray-600">
                  <input type="checkbox" id="keep" className="accent-brand" />
                  <label htmlFor="keep" className="cursor-pointer select-none">Keep me signed in</label>
                </div>

                {/* CAPTCHA box */}
                <div
                  onClick={() => setCaptchaChecked(!captchaChecked)}
                  className="border border-[var(--color-brand-green-dark-border)]/30 p-3 rounded-sm bg-gray-50 flex items-center space-x-3 cursor-pointer select-none hover:bg-gray-100 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={captchaChecked}
                    onChange={() => {}}
                    className="accent-brand"
                  />
                  <span className="text-[11px] font-bold text-gray-700">
                    I'm not a robot — security verification (CBcaptcha)
                  </span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-brand hover:bg-[var(--color-brand-green-dark)] text-white font-bold text-xs uppercase tracking-wider rounded-sm shadow-sm transition-colors border border-brand-green-dark cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Authenticating session..." : "Secure Sign In →"}
                </button>
              </form>
            </div>

            {/* Bottom trust badges */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-150 text-[9px] font-bold uppercase tracking-wider text-gray-400">
              <span className="flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand"></span>
                <span>256-bit encrypted</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand"></span>
                <span>ISO 27001 aligned</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand"></span>
                <span>Audited access logs</span>
              </span>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[var(--color-brand-green-darkest)] border-t border-white/5 text-white py-6 z-10 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 space-y-4 sm:space-y-0">
          <span>© {new Date().getFullYear()} CodeSphere · Central Coding Evaluation Cell. All rights reserved.</span>
          <div className="flex space-x-6 text-[10px]">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
            <a href="#" className="hover:text-white transition-colors">Help Desk</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
