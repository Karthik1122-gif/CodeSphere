"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageSquare, X, ShieldCheck, FileText, ChevronRight } from "lucide-react";

export default function SupportBubble() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Quick Option Card */}
      {isOpen && (
        <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 w-72 shadow-2xl rounded-sm mb-3 animate-fade-in-up overflow-hidden">
          
          {/* Card Header */}
          <div className="bg-brand text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <MessageSquare className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full border border-[#25D366] animate-pulse"></span>
              </div>
              <span className="font-heading font-bold text-sm tracking-wide">
                CodeSphere Support
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Card Options */}
          <div className="p-3 bg-gray-50 border-b border-gray-100 text-[10px] font-semibold text-gray-500 flex items-center justify-between">
            <span>OFFICIAL LIVE LINE</span>
            <span className="text-brand animate-pulse flex items-center">
              ● PROCTOR ACTIVE
            </span>
          </div>

          <div className="p-2 space-y-1">
            <Link
              href="/student/support"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-150 rounded-sm group transition-colors text-ink-charcoal"
            >
              <div className="flex items-center space-x-2.5">
                <div className="bg-brand/10 p-1.5 rounded-sm">
                  <MessageSquare className="w-4 h-4 text-brand" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold">Chat with Faculty</span>
                  <span className="text-[9px] text-gray-500">Ask questions regarding test details</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/#trust"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-150 rounded-sm group transition-colors text-ink-charcoal"
            >
              <div className="flex items-center space-x-2.5">
                <div className="bg-brand/10 p-1.5 rounded-sm">
                  <ShieldCheck className="w-4 h-4 text-brand" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold">Security & Compliance</span>
                  <span className="text-[9px] text-gray-500">Proctoring rules and auto-grading specs</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <a
              href="https://hitam.edu.in"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-2 hover:bg-gray-150 rounded-sm group transition-colors text-ink-charcoal"
            >
              <div className="flex items-center space-x-2.5">
                <div className="bg-[#D4A017]/10 p-1.5 rounded-sm">
                  <FileText className="w-4 h-4 text-brand" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold">College Home</span>
                  <span className="text-[9px] text-gray-500">Visit institutional web portal</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          <div className="bg-[var(--color-brand-green-darkest)] text-white/50 text-[8px] text-center py-2 uppercase tracking-widest font-bold">
            Affiliated to HITAM Autonomous
          </div>

        </div>
      )}

      {/* Floating Circle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-brand hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl relative transition-transform hover:scale-105 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-[#25D366]/40 cursor-pointer"
        aria-label="Support chat"
      >
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-yellow-400 border border-white"></span>
        </span>
        <MessageSquare className="w-6 h-6 transition-transform group-hover:rotate-6" />
      </button>

    </div>
  );
}
