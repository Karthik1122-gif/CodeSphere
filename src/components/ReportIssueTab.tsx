"use client";

import React, { useState } from "react";
import { AlertCircle, X, CheckCircle } from "lucide-react";

export default function ReportIssueTab() {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;
    
    // Simulate submission
    console.log("Bug reported:", { subject, description });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubject("");
      setDescription("");
      setIsOpen(false);
    }, 2000);
  };

  return (
    <>
      {/* Floating Vertical Tab */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 rotate-180 select-none z-50 bg-brand-green-dark hover:bg-red-700 text-white font-bold text-[11px] uppercase tracking-wider py-3.5 px-2.5 rounded-t-sm shadow-xl flex items-center space-x-1.5 transition-colors"
        style={{ writingMode: "vertical-rl" }}
      >
        <AlertCircle className="w-4 h-4 rotate-180" />
        <span>Report an Issue</span>
      </button>

      {/* Report Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-white border-2 border-red-600 w-full max-w-md shadow-2xl rounded-sm animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="bg-[var(--color-brand-green-darkest)] text-white px-4 py-3 flex items-center justify-between border-b border-[var(--color-brand-green-dark-border)]">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="font-heading font-bold text-sm tracking-wide">
                  REPORT EXAM ISSUE / SYSTEM BUG
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {submitted ? (
              <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
                <CheckCircle className="w-16 h-16 text-brand" />
                <h3 className="font-heading font-bold text-lg text-[#1A1A1A]">
                  Report Logged Successfully
                </h3>
                <p className="text-xs text-gray-500 max-w-xs">
                  Your ticket has been sent directly to the lab administrator and exam proctor. A tech assistant will resolve this shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="bg-surface-offwhite border border-red-200 p-3 text-red-800 text-[11px] font-semibold rounded-sm">
                  Proctoring Alert: Any issue reported is logged along with your current terminal state, active code snapshot, and browser compliance logs.
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase">
                    Issue Category / Subject
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IDE freeze, compilation timeout, etc."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-surface-offwhite border border-[var(--color-brand-green-dark-border)]/30 text-xs px-3 py-2 rounded-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-gray-800 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase">
                    Describe what happened
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details on the error message, compiler response, or steps leading to the system bug."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-surface-offwhite border border-[var(--color-brand-green-dark-border)]/30 text-xs px-3 py-2 rounded-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-gray-800 font-medium resize-none"
                  ></textarea>
                </div>

                <div className="flex space-x-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 border border-[var(--color-brand-green-dark-border)]/30 text-gray-700 hover:bg-gray-100 text-xs font-semibold rounded-sm tracking-wide transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-green-dark hover:bg-red-700 text-white text-xs font-semibold rounded-sm tracking-wide transition-colors shadow-sm"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </>
  );
}
