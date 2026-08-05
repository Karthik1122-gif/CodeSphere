"use client";

import React from "react";
import Link from "next/link";
import AccreditationStrip from "@/components/AccreditationStrip";
import Navbar from "@/components/Navbar";
import ReportIssueTab from "@/components/ReportIssueTab";
import SupportBubble from "@/components/SupportBubble";
import { Terminal, ShieldAlert, Cpu, Award, BadgeCheck, FileCheck2, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Header & Layout Accessories */}
      <AccreditationStrip />
      <Navbar />
      <ReportIssueTab />
      <SupportBubble />

      {/* 2. Full-bleed Hero Banner */}
      <section className="relative w-full h-[550px] bg-[var(--color-brand-green-darkest)] flex items-center overflow-hidden">
        {/* Background Image Representation with Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#141414] to-brand-green-dark/20 z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-brand-green)_1px,transparent_1px)] [background-size:24px_24px] opacity-10 z-0"></div>
        
        {/* Corner Dot Grid Decoration */}
        <div className="absolute bottom-10 left-10 hidden lg:grid grid-cols-6 gap-2 opacity-20">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-brand rounded-full"></div>
          ))}
        </div>
        
        <div className="absolute top-10 right-10 hidden lg:grid grid-cols-6 gap-2 opacity-20">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-brand rounded-full"></div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="max-w-3xl text-left space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 bg-brand/10 border border-brand/20 px-3 py-1 rounded-sm">
              <Award className="w-4 h-4 text-accent-gold" />
              <span className="text-[10px] sm:text-xs font-bold text-brand uppercase tracking-widest">
                NBA-Style Audits & Autonomous Standards
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-white leading-tight">
              Autonomous College Evaluation
              <span className="block text-brand mt-2">Next-Gen Online Judge</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 max-w-xl font-medium leading-relaxed">
              CodeSphere is HITAM's official coding assessment platform. Built for faculty-run lab evaluations, mid-terms, and programming certifications. Secure sandboxing, real-time code runs, and audit-compliant scoring.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/login"
                className="px-6 py-3.5 bg-brand hover:bg-[var(--color-brand-green-dark)] text-white font-bold text-xs uppercase tracking-wider rounded-sm shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 border border-brand-green-dark"
              >
                <span>Access Student / Faculty Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="px-6 py-3.5 bg-[var(--color-brand-green-darkest)] hover:bg-[#333333] text-[#CCCCCC] hover:text-white font-bold text-xs uppercase tracking-wider rounded-sm border border-[var(--color-brand-green-dark-border)] transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Stats Strip */}
      <section className="bg-[var(--color-brand-green-darkest)] text-white py-8 border-y border-[var(--color-brand-green-dark-border)] z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-heading font-extrabold text-brand">100%</p>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">Isolated Sandboxing</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-heading font-extrabold text-brand">&lt; 3.0s</p>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">Execution Timeout</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-heading font-extrabold text-brand">ISO 27001</p>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">Aligned Security</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-heading font-extrabold text-brand">5,000+</p>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400">Evaluations Daily</p>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-20 bg-surface-offwhite w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-3xl font-heading font-extrabold text-ink-black uppercase tracking-wide">
              Official Assessment Standards
            </h2>
            <div className="h-1.5 w-16 bg-brand mx-auto rounded-full"></div>
            <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">
              Robust capabilities engineered for autonomous engineering colleges
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-surface-white p-6 border-t-4 border-brand shadow-md rounded-sm text-left space-y-4 hover:translate-y-[-4px] transition-transform">
              <div className="bg-brand/10 w-12 h-12 flex items-center justify-center rounded-sm">
                <Cpu className="w-6 h-6 text-brand" />
              </div>
              <h3 className="font-heading font-bold text-base text-ink-black">
                Multi-Language Judge
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Supports compiler evaluation for C, C++17, Python 3, and JavaScript/Node. Enforces timeout limits and memory checks per test case.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface-white p-6 border-t-4 border-red-600 shadow-md rounded-sm text-left space-y-4 hover:translate-y-[-4px] transition-transform">
              <div className="bg-surface-offwhite w-12 h-12 flex items-center justify-center rounded-sm">
                <ShieldAlert className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-heading font-bold text-base text-ink-black">
                Sandboxed Executions
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Runs students' code inside isolated, network-disabled ephemeral processes. Prevents system modifications and malicious calls.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface-white p-6 border-t-4 border-[#D4A017] shadow-md rounded-sm text-left space-y-4 hover:translate-y-[-4px] transition-transform">
              <div className="bg-[#D4A017]/10 w-12 h-12 flex items-center justify-center rounded-sm">
                <BadgeCheck className="w-6 h-6 text-brand" />
              </div>
              <h3 className="font-heading font-bold text-base text-ink-black">
                Faculty AI Assistant
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Draft test questions, constraints, and testcase inputs instantly in the test-editor using our integrated LLM helper.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-surface-white p-6 border-t-4 border-[#262626] shadow-md rounded-sm text-left space-y-4 hover:translate-y-[-4px] transition-transform">
              <div className="bg-gray-100 w-12 h-12 flex items-center justify-center rounded-sm">
                <FileCheck2 className="w-6 h-6 text-ink-charcoal" />
              </div>
              <h3 className="font-heading font-bold text-base text-ink-black">
                Auditable Gradebooks
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Maintains immutable logs of compilation output, execution timing, proctor overrides, and proctor chat receipts.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Trust Compliance / Accreditation Info */}
      <section id="trust" className="py-16 bg-surface-offwhite border-t border-[var(--color-brand-green-dark-border)]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-xl space-y-4">
              <span className="text-[10px] font-bold text-brand uppercase tracking-widest bg-surface-white border border-brand/20 px-2.5 py-1 rounded-sm">
                EXAM INTEGRITY POLICY
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink-black uppercase leading-tight">
                Accredited Proctoring Compliance
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
                Our platform enforces strict proctoring checks. In compliance with NBA standards and autonomy criteria, student activities—including tab switches, copy-paste shortcuts, and session timeouts—are securely audited to maintain evaluation credibility.
              </p>
            </div>
            <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 p-6 rounded-sm shadow-md w-full max-w-md space-y-3.5">
              <h3 className="font-heading font-bold text-sm text-ink-charcoal uppercase tracking-wide border-b border-gray-100 pb-2">
                Compliance Badges & Audits
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-xs">
                  <div className="h-2 w-2 rounded-full bg-brand"></div>
                  <span className="text-gray-600 font-semibold">ISO 27001 Compliant Server Sandboxes</span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <div className="h-2 w-2 rounded-full bg-brand"></div>
                  <span className="text-gray-600 font-semibold">256-bit TLS 1.3 Secure Session Tokens</span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <div className="h-2 w-2 rounded-full bg-brand"></div>
                  <span className="text-gray-600 font-semibold">Immutable Logs exportable for NAAC audits</span>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <div className="h-2 w-2 rounded-full bg-brand"></div>
                  <span className="text-gray-600 font-semibold">Automated duplicate IP detection and flagging</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="w-full bg-[var(--color-brand-green-darkest)] text-white py-12 mt-auto border-t-2 border-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between border-b border-[var(--color-brand-green-dark-border)] pb-8 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Terminal className="w-6 h-6 text-brand" />
              <span className="font-heading font-bold text-lg">
                CodeSphere<span className="text-brand">.</span>
              </span>
            </div>
            <div className="flex space-x-6 text-xs text-gray-400 font-semibold">
              <a href="#" className="hover:text-white transition-colors">Portal Access</a>
              <a href="#" className="hover:text-white transition-colors">Proctor Guidelines</a>
              <a href="#" className="hover:text-white transition-colors">Student FAQ</a>
              <a href="https://hitam.edu.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">HITAM Main Website</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-6 text-[10px] text-gray-400 font-bold uppercase tracking-wider space-y-2 md:space-y-0">
            <span>© {new Date().getFullYear()} Hyderabad Institute of Technology and Management.</span>
            <span>AUTONOMOUS LABORATORY EVALUATION SYSTEM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
