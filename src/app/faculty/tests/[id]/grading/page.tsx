"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import AccreditationStrip from "@/components/AccreditationStrip";
import Navbar from "@/components/Navbar";
import ReportIssueTab from "@/components/ReportIssueTab";
import SupportBubble from "@/components/SupportBubble";
import { ChevronLeft, Award, User, Code2, ShieldAlert, CheckCircle2, XCircle, FileCode2, Edit3, Save, Loader2 } from "lucide-react";

interface Grade {
  id: string;
  studentId: string;
  autoScore: number;
  finalMarks: number;
  status: string;
  gradedAt: string | null;
  submission: {
    language: string;
    submittedAt: string;
    status: string;
    sourceCode: string;
    results: {
      id: string;
      passed: boolean;
      runtimeMs: number;
      errorType: string | null;
      testCase: {
        isSample: boolean;
        points: number;
      };
    }[];
  } | null;
  test: {
    title: string;
    subject: string;
  };
}

export default function GradingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: testId } = use(params);
  const router = useRouter();

  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit marks states
  const [editingMarks, setEditingMarks] = useState<string | null>(null);
  const [editedScore, setEditedScore] = useState("");
  const [updating, setUpdating] = useState(false);

  const activeGrade = grades.find((g) => g.id === selectedGradeId) || grades[0];

  useEffect(() => {
    async function loadGrades() {
      try {
        const res = await fetch(`/api/grades?testId=${testId}`);
        const data = await res.json();
        if (res.ok) {
          setGrades(data.grades || []);
          if (data.grades?.length > 0) {
            setSelectedGradeId(data.grades[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading grading dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGrades();
  }, [testId]);

  const handleOverrideScore = async (gradeId: string) => {
    if (!editedScore.trim() || isNaN(parseInt(editedScore))) return;

    setUpdating(true);
    try {
      const scoreNum = parseInt(editedScore);
      if (scoreNum < 0 || scoreNum > 100) {
        alert("Score must be between 0 and 100.");
        setUpdating(false);
        return;
      }

      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeId,
          finalMarks: scoreNum,
          status: "GRADED",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGrades((prev) =>
          prev.map((g) => (g.id === gradeId ? { ...g, finalMarks: scoreNum, status: "GRADED" } : g))
        );
        setEditingMarks(null);
      }
    } catch (err) {
      console.error("Failed to override score:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-offwhite flex items-center justify-center space-x-2">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
        <span className="text-xs uppercase font-bold tracking-widest text-gray-500">Loading Grades Logs...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-offwhite">
      <AccreditationStrip />
      <Navbar />
      <ReportIssueTab />
      <SupportBubble />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in-up">
        
        {/* Header Block */}
        <div className="flex items-center space-x-3 border-b border-[var(--color-brand-green-dark-border)]/20 pb-4">
          <button
            onClick={() => router.push("/faculty/dashboard")}
            className="p-1 hover:bg-gray-100 border border-[var(--color-brand-green-dark-border)]/20 rounded-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] text-brand uppercase font-bold tracking-widest block">
              Grading Register
            </span>
            <h2 className="font-heading font-extrabold text-2xl text-ink-black uppercase tracking-wide">
              {activeGrade?.test.title}
            </h2>
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">
              {activeGrade?.test.subject}
            </span>
          </div>
        </div>

        {grades.length === 0 ? (
          <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 p-12 text-center text-gray-400 font-semibold rounded-sm shadow-sm">
            No submissions found for this test session yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Students Submissions Index Grid */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                Student submissions
              </h3>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {grades.map((gr) => {
                  const isSelected = gr.id === selectedGradeId;
                  return (
                    <div
                      key={gr.id}
                      onClick={() => {
                        setSelectedGradeId(gr.id);
                        setEditingMarks(null);
                      }}
                      className={`p-4 border-2 rounded-sm shadow-sm transition-all cursor-pointer ${
                        isSelected
                          ? "border-brand bg-brand/5"
                          : "border-[var(--color-brand-green-dark-border)]/20 bg-surface-white hover:border-gray-400"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-wider block">
                              Roll No: 22E81A0501
                            </span>
                            <h4 className="font-heading font-bold text-sm text-ink-charcoal">
                              Banoth Rahul
                            </h4>
                          </div>
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm border ${
                            gr.status === "GRADED"
                              ? "text-brand bg-brand/10 border-brand/20"
                              : "text-brand bg-[#D4A017]/10 border-[#D4A017]/20"
                          }`}>
                            {gr.status}
                          </span>
                        </div>

                        {/* Scores */}
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wide border-t border-gray-150 pt-2 bg-gray-50/50 p-1.5 rounded-sm">
                          <span>Auto: {gr.autoScore}%</span>
                          <span className="text-brand">Final: {gr.finalMarks}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Code Inspector + Grade Override Tool (takes 2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {activeGrade && (
                <div className="bg-surface-white border-2 border-brand p-6 shadow-md rounded-sm space-y-6">
                  
                  {/* Student Title banner */}
                  <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] text-brand uppercase font-bold tracking-widest block">
                        Evaluation detail
                      </span>
                      <h3 className="font-heading font-extrabold text-lg text-ink-black">
                        Student: Banoth Rahul
                      </h3>
                      <p className="text-xs text-gray-500 font-semibold mt-1">
                        B.Tech III-Year CSE · Roll No: 22E81A0501
                      </p>
                    </div>

                    {/* Interactive Grader Panel */}
                    <div className="flex items-center space-x-2">
                      {editingMarks === activeGrade.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            className="w-16 bg-gray-50 border border-[var(--color-brand-green-dark-border)]/30 text-xs px-2.5 py-1.5 rounded-sm focus:outline-none focus:border-brand font-bold text-center"
                            placeholder="Marks"
                            value={editedScore}
                            onChange={(e) => setEditedScore(e.target.value)}
                          />
                          <button
                            onClick={() => handleOverrideScore(activeGrade.id)}
                            disabled={updating}
                            className="p-1.5 bg-brand hover:bg-[var(--color-brand-green-dark)] text-white rounded-sm border border-brand-green-dark cursor-pointer disabled:opacity-50"
                          >
                            <Save className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingMarks(activeGrade.id);
                            setEditedScore(activeGrade.finalMarks.toString());
                          }}
                          className="px-3.5 py-1.5 bg-[var(--color-brand-green-darkest)] hover:bg-[#333333] border border-[var(--color-brand-green-dark-border)] text-white text-xs font-bold uppercase tracking-wider rounded-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Override Marks</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {activeGrade.submission ? (
                    <>
                      {/* Code Review */}
                      <div className="space-y-2">
                        <h4 className="font-heading font-bold text-xs text-ink-black uppercase tracking-wider flex items-center gap-1.5">
                          <FileCode2 className="w-4 h-4 text-brand" />
                          <span>Code Submission ({activeGrade.submission.language})</span>
                        </h4>
                        <pre className="bg-[var(--color-brand-green-darkest)] text-gray-200 p-4 font-mono text-xs overflow-x-auto rounded-sm border border-[var(--color-brand-green-dark-border)] max-h-60 select-text">
                          {activeGrade.submission.sourceCode}
                        </pre>
                      </div>

                      {/* Test cases run outcome logs */}
                      <div className="space-y-3">
                        <h4 className="font-heading font-bold text-xs text-ink-black uppercase tracking-wider">
                          Auto-Graded Test Cases
                        </h4>
                        
                        <div className="space-y-2.5">
                          {activeGrade.submission.results.map((res, rIdx) => (
                            <div
                              key={res.id}
                              className={`p-3 border rounded-sm flex items-center justify-between text-xs font-semibold ${
                                res.passed
                                  ? "border-brand/20 bg-brand/5 text-ink-charcoal"
                                  : "border-red-200 bg-surface-offwhite text-red-800"
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                {res.passed ? (
                                  <CheckCircle2 className="w-4 h-4 text-brand" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                )}
                                <span>Test Case #{rIdx + 1} ({res.testCase.isSample ? "Sample" : "Hidden"})</span>
                              </div>
                              <div className="flex items-center space-x-6 text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                                <span>Time: {res.runtimeMs}ms</span>
                                <span>Weight: {res.testCase.points} pts</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-sm text-center text-xs text-yellow-800 font-semibold space-y-1">
                      <ShieldAlert className="w-8 h-8 text-brand mx-auto mb-2" />
                      <h4>No compilation logs found for this grade entry.</h4>
                      <p className="text-gray-500 text-[10px] leading-relaxed">
                        This usually indicates the student opened the assessment but did not submit any code before time expired.
                      </p>
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Institutional Footer */}
      <footer className="w-full bg-[var(--color-brand-green-darkest)] text-white py-6 border-t border-[var(--color-brand-green-dark-border)] mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          HITAM Proctor Console · manual mark adjustments & lock files
        </div>
      </footer>
    </div>
  );
}
