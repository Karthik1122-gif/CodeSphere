"use client";

import React from "react";
import { Shield, Lock, CheckCircle2 } from "lucide-react";

export default function AccreditationStrip() {
  return (
    <div className="w-full bg-brand text-white border-b border-brand-green-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col md:flex-row items-center justify-between text-xs font-semibold space-y-2 md:space-y-0">
        
        {/* Left: Institution Title */}
        <div className="flex items-center space-x-2">
          <div className="bg-surface-white text-brand p-1 rounded-sm font-bold text-sm tracking-wider">
            HITAM
          </div>
          <span className="tracking-wide">
            Hyderabad Institute of Technology and Management
          </span>
        </div>

        {/* Center: Accreditation/Trust Badges */}
        <div className="flex flex-wrap justify-center items-center gap-3">
          <div className="flex items-center space-x-1 bg-brand-green-dark/40 px-2 py-1 rounded-sm border border-brand-green-dark">
            <Shield className="w-3.5 h-3.5 text-accent-gold" />
            <span className="text-[10px] tracking-tight">ISO 27001 ALIGNED</span>
          </div>
          <div className="flex items-center space-x-1 bg-brand-green-dark/40 px-2 py-1 rounded-sm border border-brand-green-dark">
            <Lock className="w-3.5 h-3.5 text-accent-gold" />
            <span className="text-[10px] tracking-tight">256-BIT ENCRYPTED</span>
          </div>
          <div className="flex items-center space-x-1 bg-brand-green-dark/40 px-2 py-1 rounded-sm border border-brand-green-dark">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent-gold" />
            <span className="text-[10px] tracking-tight">NBA-STYLE AUDITED</span>
          </div>
        </div>

        {/* Right: Tagline */}
        <div className="text-[10px] md:text-xs text-brand-green-dark font-bold bg-surface-white px-2.5 py-0.5 rounded-full border border-brand-green-dark">
          Autonomous Evaluation Platform
        </div>
      </div>
    </div>
  );
}
