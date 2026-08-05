"use client";

import React, { useEffect, useState } from "react";
import AccreditationStrip from "@/components/AccreditationStrip";
import Navbar from "@/components/Navbar";
import ReportIssueTab from "@/components/ReportIssueTab";
import SupportBubble from "@/components/SupportBubble";
import { Award, BookOpen, Clock, Calendar, CheckSquare, ChevronRight, Code2, AlertTriangle, FileCode2 } from "lucide-react";

interface Submission {
  id: string;
  language: string;
  sourceCode: string;
  status: string;
  submittedAt: string;
  problem: {
    title: string;
    testId: string;
    test: {
      title: string;
    };
  };
  results: {
    id: string;
    passed: boolean;
    runtimeMs: number;
    memoryKb: number | null;
    errorType: string | null;
    testCase: {
      isSample: boolean;
      points: number;
    };
  }[];
}

interface Grade {
  id: string;
  autoScore: number;
  finalMarks: number;
  status: string;
  gradedAt: string | null;
  test: {
    id: string;
    title: string;
    subject: string;
  };
}

export default function StudentResultsPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const activeSubmission = submissions.find((s) => s.id === selectedSubId) || submissions[0];

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch submissions
        const subRes = await fetch("/api/submissions");
        const subData = await subRes.json();
        
        if (subRes.ok) {
          setSubmissions(subData.submissions);
          if (subData.submissions.length > 0) {
            setSelectedSubId(subData.submissions[0].id);
          }
        }

        // Fetch grades (arbitrary mock test id from our seeds)
        const testsRes = await fetch("/api/tests");
        const testsData = await testsRes.json();
        if (testsRes.ok && testsData.tests?.length > 0) {
          const gradesRes = await fetch(`/api/grades?testId=${testsData.tests[0].id}`);
          const gradesData = await gradesRes.json();
          if (gradesRes.ok) {
            setGrades(gradesData.grades);
          }
        }
      } catch (err) {
        console.error("Error loading results logs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-surface-offwhite">
      <AccreditationStrip />
      <Navbar />
      <ReportIssueTab />
      <SupportBubble />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in-up">
        
        {/* Header Title */}
        <div className="border-b border-[var(--color-brand-green-dark-border)]/20 pb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-brand uppercase font-bold tracking-widest block">
              Student Records
            </span>
            <h2 className="font-heading font-extrabold text-2xl text-ink-black uppercase tracking-wide">
              Evaluation History & Logs
            </h2>
          </div>
          <Award className="w-8 h-8 text-accent-gold" />
        </div>

        {loading ? (
          <div className="h-64 bg-gray-200 animate-pulse rounded-sm"></div>
        ) : submissions.length === 0 ? (
          <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 p-12 text-center text-gray-500 rounded-sm font-semibold shadow-sm">
            No grading records or code submissions found in the database.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Submissions / Grades Log List */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                Select Submission Run
              </h3>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {submissions.map((sub) => {
                  const passedCount = sub.results.filter(r => r.passed).length;
                  const totalCount = sub.results.length;
                  const isSelected = sub.id === selectedSubId;
                  
                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSubId(sub.id)}
                      className={`p-4 border-2 rounded-sm shadow-sm transition-all cursor-pointer ${
                        isSelected
                          ? "border-brand bg-brand/5"
                          : "border-[var(--color-brand-green-dark-border)]/20 bg-surface-white hover:border-gray-400"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-wider block">
                            {sub.problem.test.title}
                          </span>
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm border ${
                            sub.status === "COMPLETED"
                              ? "text-brand bg-brand/10 border-brand/20"
                              : "text-red-600 bg-surface-offwhite border-red-200"
                          }`}>
                            {sub.status}
                          </span>
                        </div>

                        <h4 className="font-heading font-bold text-sm text-ink-charcoal">
                          {sub.problem.title}
                        </h4>

                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wide border-t border-gray-150 pt-2">
                          <span className="flex items-center space-x-1">
                            <Code2 className="w-3.5 h-3.5 text-brand" />
                            <span className="capitalize">{sub.language}</span>
                          </span>
                          <span className="text-gray-400">
                            {passedCount} / {totalCount} Cases
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Code Review and Proctor Grade Sheet (takes 2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              {activeSubmission && (
                <div className="bg-surface-white border-2 border-brand p-6 shadow-md rounded-sm space-y-6">
                  
                  {/* Submission Header */}
                  <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] text-brand uppercase font-bold tracking-widest block">
                        Submission ID: {activeSubmission.id.substring(0, 8)}...
                      </span>
                      <h3 className="font-heading font-extrabold text-lg text-ink-black">
                        {activeSubmission.problem.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-semibold flex items-center space-x-2.5 mt-1">
                        <span className="capitalize text-brand">{activeSubmission.language} Compiler</span>
                        <span>•</span>
                        <span suppressHydrationWarning>{new Date(activeSubmission.submittedAt).toLocaleString()}</span>
                      </p>
                    </div>

                    {/* Score badge */}
                    <div className="bg-brand/10 border border-brand/20 px-4 py-2 text-center rounded-sm">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">
                        Evaluation
                      </span>
                      <span className="text-lg font-extrabold text-brand">
                        {activeSubmission.results.filter((r) => r.passed).length} / {activeSubmission.results.length} Cases
                      </span>
                    </div>
                  </div>

                  {/* Submission Code Review Panel */}
                  <div className="space-y-2">
                    <h4 className="font-heading font-bold text-xs text-ink-black uppercase tracking-wider flex items-center gap-1.5">
                      <FileCode2 className="w-4 h-4 text-brand" />
                      <span>Code Snapshot</span>
                    </h4>
                    <pre className="bg-[var(--color-brand-green-darkest)] text-gray-200 p-4 font-mono text-xs overflow-x-auto rounded-sm border border-[var(--color-brand-green-dark-border)] max-h-72 select-text">
                      {activeSubmission.sourceCode}
                    </pre>
                  </div>

                  {/* Detailed test case evaluation tables */}
                  <div className="space-y-3">
                    <h4 className="font-heading font-bold text-xs text-ink-black uppercase tracking-wider">
                      Test Case Run Logs
                    </h4>
                    
                    <div className="border border-[var(--color-brand-green-dark-border)]/20 rounded-sm overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100 border-b border-[var(--color-brand-green-dark-border)]/20 font-bold uppercase text-[10px] text-gray-500 tracking-wider">
                          <tr>
                            <th className="p-3">Index</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Outcome</th>
                            <th className="p-3">Runtime</th>
                            <th className="p-3 text-right">Weight</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150 font-semibold text-ink-charcoal">
                          {activeSubmission.results.map((res, idx) => (
                            <tr key={res.id} className="hover:bg-gray-50/50">
                              <td className="p-3">Case {idx + 1}</td>
                              <td className="p-3 uppercase text-[10px] text-gray-500">
                                {res.testCase.isSample ? "Sample" : "Hidden"}
                              </td>
                              <td className="p-3">
                                {res.passed ? (
                                  <span className="text-brand">Passed</span>
                                ) : (
                                  <span className="text-red-600 uppercase text-[10px]">
                                    {res.errorType || "FAIL"}
                                  </span>
                                )}
                              </td>
                              <td className="p-3">{res.runtimeMs}ms</td>
                              <td className="p-3 text-right text-gray-500">{res.testCase.points} pts</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Institutional Footer */}
      <footer className="w-full bg-[var(--color-brand-green-darkest)] text-white py-6 border-t border-[var(--color-brand-green-dark-border)] mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          HITAM Academic Registry · audited exam evaluation code logs
        </div>
      </footer>
    </div>
  );
}
