"use client";

import React, { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import AccreditationStrip from "@/components/AccreditationStrip";
import ReportIssueTab from "@/components/ReportIssueTab";
import SupportBubble from "@/components/SupportBubble";
import { Play, Send, ChevronLeft, Clock, ShieldAlert, CheckCircle2, XCircle, Loader2, FileCode2, Check, X } from "lucide-react";

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
  points: number;
  visibility?: string;
}

interface Problem {
  id: string;
  title: string;
  statementMd: string;
  constraints: string;
  points: number;
  testCases: TestCase[];
}

interface TestDetails {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  opensAt: string;
  closesAt: string;
  languagesAllowed: string;
  problems: Problem[];
}

interface SubmissionResult {
  id: string;
  passed: boolean;
  actualOutput: string | null;
  runtimeMs: number;
  errorType: string | null;
  testCase: {
    input: string;
    expectedOutput: string;
    isSample: boolean;
    points: number;
    visibility?: string;
  };
}

export default function CodingTestIDE({ params }: { params: Promise<{ id: string }> }) {
  const { id: testId } = use(params);
  const router = useRouter();

  // Test data states
  const [test, setTest] = useState<TestDetails | null>(null);
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Editor states
  const [language, setLanguage] = useState("cpp");
  const [codeMap, setCodeMap] = useState<Record<string, string>>({}); // problemId -> code

  // Console/Output states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalType, setEvalType] = useState<"run" | "submit" | null>(null);
  const [subResults, setSubResults] = useState<SubmissionResult[]>([]);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [generalError, setGeneralError] = useState("");
  const [activeConsoleTab, setActiveConsoleTab] = useState<"description" | "results">("description");

  // Timer states
  const [timeLeft, setTimeLeft] = useState(2538); // ~42:18 remaining
  const [timerExpired, setTimerExpired] = useState(false);

  // Proctor check states
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showProctorWarning, setShowProctorWarning] = useState(false);

  // Get active problem
  const activeProblem = test?.problems?.[selectedProblemIndex];

  // Default C++ code snippet
  const defaultCppCode = `// Q3 - Binary Search: First Occurrence
#include <iostream>
#include <vector>
#include <string>

using namespace std;

int firstOccurrence(vector<int>& arr, int x) {
    int lo = 0, hi = arr.size() - 1, res = -1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == x) {
            res = mid;
            hi = mid - 1; // look for earlier occurrence
        } else if (arr[mid] < x) {
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return res;
}

int main() { /* reads input, calls firstOccurrence() */ }
`;

  // Default code template library
  const getCodeTemplate = (lang: string, problemTitle: string) => {
    if (lang === "cpp") return defaultCppCode;
    if (lang === "python") {
      return `import sys

# Q3 - Binary Search: First Occurrence
def firstOccurrence(arr, x):
    lo, hi = 0, len(arr) - 1
    res = -1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == x:
            res = mid
            hi = mid - 1
        elif arr[mid] < x:
            lo = mid + 1
        else:
            hi = mid - 1
    return res

if __name__ == '__main__':
    # reads input
    pass
`;
    }
    return "";
  };

  // Load Test Data
  useEffect(() => {
    async function loadTest() {
      try {
        const res = await fetch(`/api/tests/${testId}`);
        const data = await res.json();
        
        if (!res.ok) {
          setGeneralError(data.error || "Failed to load test details.");
          setLoading(false);
          return;
        }

        setTest(data.test);
        setTimeLeft(data.test.durationMinutes * 60);

        // Prepopulate default snippets
        const initialCodeMap: Record<string, string> = {};
        const defaultLang = data.test.languagesAllowed.split(",")[0] || "cpp";
        setLanguage(defaultLang);

        data.test.problems.forEach((p: Problem) => {
          initialCodeMap[p.id] = getCodeTemplate(defaultLang, p.title);
        });
        setCodeMap(initialCodeMap);

        // Mock initial testcase runs to look like picture out-of-the-box
        setSubResults([
          { id: "c1", passed: true, actualOutput: "1", runtimeMs: 12, errorType: null, testCase: { input: "arr=[1,2,2,2,3], x=2", expectedOutput: "1", isSample: true, points: 2, visibility: "Sample" } },
          { id: "c2", passed: true, actualOutput: "-1", runtimeMs: 15, errorType: null, testCase: { input: "arr=[5,7,9], x=4", expectedOutput: "-1", isSample: true, points: 2, visibility: "Sample" } },
          { id: "c3", passed: true, actualOutput: "0", runtimeMs: 10, errorType: null, testCase: { input: "arr=[8], x=8", expectedOutput: "0", isSample: false, points: 2, visibility: "Hidden" } },
          { id: "c4", passed: true, actualOutput: "-1", runtimeMs: 8, errorType: null, testCase: { input: "arr=[], x=1", expectedOutput: "-1", isSample: false, points: 2, visibility: "Hidden" } },
          { id: "c5", passed: false, actualOutput: "Timeout > 1.00s", runtimeMs: 1020, errorType: "Time Limit Exceeded", testCase: { input: "arr=[1..10^6], x=999999", expectedOutput: "999998", isSample: false, points: 2, visibility: "Hidden - perf" } },
          { id: "c6", passed: true, actualOutput: "0", runtimeMs: 14, errorType: null, testCase: { input: "arr=[4,4,4,4], x=4", expectedOutput: "0", isSample: false, points: 2, visibility: "Hidden" } },
        ]);
        setSelectedCaseIndex(4); // Select Case 5 (the failed one as in image)
        setActiveConsoleTab("results");

      } catch (err) {
        console.error("Error loading test details:", err);
        setGeneralError("Could not retrieve test workspace.");
      } finally {
        setLoading(false);
      }
    }
    loadTest();
  }, [testId]);

  // Handle Tab Switch Proctor Warning
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const next = prev + 1;
          setShowProctorWarning(true);
          
          fetch("/api/admin/audit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "TAB_SWITCH_ATTEMPT",
              entity: "STUDENT_SESSION",
              metadataJson: JSON.stringify({ tabSwitches: next }),
            }),
          }).catch(() => {});

          return next;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (loading || timerExpired) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerExpired(true);
          alert("Time limit reached. Code locked.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, timerExpired]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")} remaining`;
  };

  const handleCodeChange = (val: string | undefined) => {
    if (activeProblem && val !== undefined) {
      setCodeMap((prev) => ({
        ...prev,
        [activeProblem.id]: val,
      }));
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (activeProblem) {
      setCodeMap((prev) => ({
        ...prev,
        [activeProblem.id]: getCodeTemplate(lang, activeProblem.title),
      }));
    }
  };

  const handleEvaluate = async (type: "run" | "submit") => {
    if (!activeProblem || isEvaluating || timerExpired) return;

    setIsEvaluating(true);
    setEvalType(type);
    setGeneralError("");
    setActiveConsoleTab("results");

    const code = codeMap[activeProblem.id] || "";

    try {
      const submitRes = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: activeProblem.id,
          language: language === "cpp" ? "cpp" : "python",
          sourceCode: code,
        }),
      });

      const submitData = await submitRes.json();
      if (!submitRes.ok) {
        throw new Error(submitData.error || "Submission failed");
      }

      const subId = submitData.submissionId;

      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        if (attempts > 20) {
          clearInterval(interval);
          setGeneralError("Judgement timed out. Local execution server is busy.");
          setIsEvaluating(false);
          return;
        }

        try {
          const pollRes = await fetch(`/api/submissions/${subId}`);
          const pollData = await pollRes.json();

          if (pollRes.ok && pollData.submission.status !== "QUEUED" && pollData.submission.status !== "RUNNING") {
            clearInterval(interval);
            
            const results = pollData.submission.results.map((r: any) => ({
              id: r.id,
              passed: r.passed,
              actualOutput: r.actualOutput,
              runtimeMs: r.runtimeMs,
              errorType: r.errorType,
              testCase: {
                input: r.testCase.input,
                expectedOutput: r.testCase.expectedOutput,
                isSample: r.testCase.isSample,
                points: r.testCase.points,
                visibility: r.testCase.isSample ? "Sample" : "Hidden",
              }
            }));

            setSubResults(results);
            setSelectedCaseIndex(0);
            setIsEvaluating(false);
          }
        } catch (pollErr) {
          clearInterval(interval);
          setGeneralError("Compiler synchronization failed.");
          setIsEvaluating(false);
        }
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setGeneralError(err.message || "Failed to trigger compilation sandbox.");
      setIsEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-brand-green-darkest)] text-white flex items-center justify-center space-x-2">
        <Loader2 className="w-6 h-6 text-brand animate-spin" />
        <span className="text-xs uppercase font-bold tracking-widest text-gray-400">Loading exam environment...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-offwhite select-none">
      
      {/* 1. Header Bar */}
      <header className="w-full bg-[var(--color-brand-green-darkest)] border-b-2 border-brand text-white z-40 sticky top-0 px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-4">
          <div className="bg-brand text-[var(--color-brand-green-darkest)] h-8 w-8 rounded-sm font-bold flex items-center justify-center text-sm">
            CS
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-sm uppercase tracking-wider leading-none text-white flex items-center">
              {test?.title || "Sessional Test 2 — Arrays & Recursion"}
            </h1>
            <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest block mt-0.5">
              Question {selectedProblemIndex + 1} of {test?.problems?.length || 10} · Dr. Ananya Rao · Roll No. 21CS1042
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Language selector badge */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-[var(--color-brand-green-dark-border)] border border-brand-green-dark/20 text-white text-xs px-2.5 py-1 rounded-sm focus:outline-none focus:border-brand font-bold uppercase tracking-wider"
          >
            <option value="cpp">C++17</option>
            <option value="python">Python 3</option>
          </select>

          {/* Countdown Clock */}
          <div className="flex items-center space-x-2 bg-[var(--color-brand-green-darkest)]/40 border border-brand/20 px-3.5 py-1.5 rounded-sm">
            <Clock className="w-4 h-4 text-brand animate-pulse" />
            <span className="font-mono text-brand text-xs font-extrabold tracking-wider">
              {formatTime(timeLeft)}
            </span>
          </div>

          <button
            onClick={() => handleEvaluate("run")}
            disabled={isEvaluating}
            className="px-4 py-2 border border-gray-400 hover:bg-[var(--color-brand-green-dark-border)] text-white hover:text-brand text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
          >
            Run Code
          </button>

          <button
            onClick={() => handleEvaluate("submit")}
            disabled={isEvaluating}
            className="px-5 py-2 bg-brand hover:bg-[var(--color-brand-green-dark)] text-white text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-md transition-colors border border-brand cursor-pointer"
          >
            Submit Solution →
          </button>
        </div>
      </header>

      {/* 2. Horizontal Question progress dots bar */}
      <div className="bg-[var(--color-brand-green-darkest)] border-b border-[var(--color-brand-green-dark-border)] px-6 py-2 flex items-center space-x-1">
        {Array.from({ length: test?.problems?.length || 10 }).map((_, i) => (
          <div
            key={i}
            onClick={() => setSelectedProblemIndex(Math.min(i, (test?.problems?.length || 10) - 1))}
            className={`h-1.5 flex-grow rounded-sm cursor-pointer transition-all ${
              i === selectedProblemIndex
                ? "bg-brand"
                : i < selectedProblemIndex
                ? "bg-brand-green-dark"
                : "bg-gray-600"
            }`}
          ></div>
        ))}
      </div>

      {showProctorWarning && (
        <div className="bg-brand-green-dark text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center space-x-2 z-40 relative">
          <ShieldAlert className="w-4.5 h-4.5" />
          <span>PROCTOR ALERT: Browser window focus switch detected. Events logged. Code lock active on next switch.</span>
        </div>
      )}

      {/* 3. Splitting workspace editor */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-132px)] overflow-hidden">
        
        {/* LEFT COLUMN - Problem statement markdown */}
        <div className="border-r border-[var(--color-brand-green-dark-border)]/30 bg-surface-white flex flex-col h-full overflow-hidden text-ink-charcoal">
          <div className="flex-grow overflow-y-auto p-8 space-y-6 text-left">
            
            {activeProblem && (
              <div className="space-y-5">
                <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-wider">
                  <span className="bg-[var(--color-brand-green-extralight)] text-brand border border-[#FFE7B3] px-2 py-0.5 rounded-sm">
                    Medium
                  </span>
                  <span className="bg-gray-150 border border-[var(--color-brand-green-dark-border)]/20 text-gray-500 px-2 py-0.5 rounded-sm">
                    {activeProblem.points} Points
                  </span>
                </div>

                <h3 className="font-heading font-extrabold text-lg text-ink-black border-b border-gray-100 pb-2">
                  Q{selectedProblemIndex + 1}. {activeProblem.title}
                </h3>

                <p className="text-xs leading-relaxed text-gray-600 font-semibold whitespace-pre-line prose">
                  {activeProblem.statementMd}
                </p>

                {/* Constraints */}
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <h4 className="font-heading font-bold text-xs text-ink-black uppercase tracking-wider">
                    Constraints
                  </h4>
                  <pre className="bg-gray-50 border border-[var(--color-brand-green-dark-border)]/20 p-3 text-xs font-mono rounded-sm text-gray-700 font-semibold">
                    {activeProblem.constraints || "No constraints specified."}
                  </pre>
                </div>

                {/* Sample Cases */}
                <div className="space-y-4 border-t border-gray-100 pt-4">
                  <h4 className="font-heading font-bold text-xs text-ink-black uppercase tracking-wider">
                    Samples
                  </h4>
                  {activeProblem.testCases.filter(t => t.isSample).map((tc, tcIdx) => (
                    <div key={tc.id} className="space-y-2 bg-gray-50 border border-gray-255 p-4 rounded-sm">
                      <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest block">
                        Sample {tcIdx + 1}
                      </span>
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono font-semibold">
                        <div>
                          <span className="text-[9px] text-gray-400 uppercase block mb-1">Input</span>
                          <pre className="text-gray-700 bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 p-2 rounded-sm">{tc.input}</pre>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 uppercase block mb-1">Output</span>
                          <pre className="text-gray-700 bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 p-2 rounded-sm">{tc.expectedOutput}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Note board info */}
                <div className="text-[10px] text-gray-500 font-medium border-t border-gray-100 pt-4">
                  This problem is auto-graded against 6 test cases (2 sample, 4 hidden). Your pass count is shown instantly below; final marks are confirmed by your faculty.
                </div>

              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN - Monaco Editor + compiler logs tabs */}
        <div className="flex flex-col h-full bg-[var(--color-brand-green-darkest)] overflow-hidden justify-between">
          
          {/* File Tab representation */}
          <div className="bg-[var(--color-brand-green-darkest)] border-b border-[var(--color-brand-green-dark-border)] px-4 py-2 flex items-center justify-between text-xs text-gray-400 font-bold flex-shrink-0">
            <div className="flex items-center space-x-2">
              <FileCode2 className="w-4 h-4 text-brand" />
              <span>solution.{language === "cpp" ? "cpp" : "py"}</span>
            </div>
            <span className="text-[9.5px] text-gray-500 uppercase tracking-wider font-semibold">
              Auto-save on · <span suppressHydrationWarning>Last saved {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </span>
          </div>

          {/* Monaco Editor */}
          <div className="flex-grow relative h-[60%] border-b border-[var(--color-brand-green-dark-border)]">
            {activeProblem && (
              <Editor
                height="100%"
                language={language === "cpp" ? "cpp" : "python"}
                theme="vs-dark"
                value={codeMap[activeProblem.id] || ""}
                onChange={handleCodeChange}
                options={{
                  fontSize: 13,
                  fontFamily: "Fira Code, monospace",
                  minimap: { enabled: false },
                  automaticLayout: true,
                  padding: { top: 12 },
                  readOnly: timerExpired,
                }}
              />
            )}
          </div>

          {/* LOWER CONSOLE - Test cases results logs tab */}
          <div className="h-[40%] bg-[var(--color-brand-green-darkest)] flex flex-col justify-between overflow-hidden text-gray-300 flex-shrink-0">
            
            {/* Case selector tabs */}
            <div className="bg-[var(--color-brand-green-darkest)] border-b border-[var(--color-brand-green-dark-border)] flex items-center p-1.5 space-x-1.5 flex-shrink-0 overflow-x-auto">
              {subResults.map((res, rIdx) => (
                <button
                  key={res.id}
                  onClick={() => setSelectedCaseIndex(rIdx)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors border cursor-pointer flex items-center space-x-1 ${
                    selectedCaseIndex === rIdx
                      ? "bg-[var(--color-brand-green-darkest)] border-[var(--color-brand-green-darkest)] text-white"
                      : "bg-[var(--color-brand-green-darkest)] border-[var(--color-brand-green-dark-border)] text-gray-400 hover:text-white"
                  }`}
                >
                  <span>Case {rIdx + 1}</span>
                  {res.passed ? (
                    <Check className="w-3 h-3 text-brand" />
                  ) : (
                    <X className="w-3 h-3 text-red-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Selected case detail representation logs */}
            <div className="flex-grow p-4.5 text-xs overflow-y-auto space-y-3 font-semibold text-left">
              {isEvaluating ? (
                <div className="h-full flex items-center justify-center space-x-2 text-[#A0A0A0] text-[10px] uppercase tracking-widest font-bold">
                  <Loader2 className="w-4 h-4 animate-spin text-brand" />
                  <span>Evaluating compiled files...</span>
                </div>
              ) : generalError ? (
                <div className="text-red-400 font-mono">{generalError}</div>
              ) : subResults[selectedCaseIndex] ? (
                <div className="space-y-3 font-semibold">
                  <div className="flex items-center space-x-2">
                    {subResults[selectedCaseIndex].passed ? (
                      <Check className="w-4 h-4 text-brand flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                    <span className="font-heading font-bold text-white">
                      Case {selectedCaseIndex + 1} — {subResults[selectedCaseIndex].testCase.visibility || "Sample"} case
                    </span>
                    {!subResults[selectedCaseIndex].passed && (
                      <span className="text-[9px] bg-red-950/40 border border-red-900 text-red-500 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                        {subResults[selectedCaseIndex].errorType || "Wrong Answer"}
                      </span>
                    )}
                  </div>

                  <div className="bg-[var(--color-brand-green-darkest)] border border-[var(--color-brand-green-dark-border)] p-3 text-xs font-mono rounded-sm text-gray-300 leading-normal space-y-1.5">
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider block">Input</span>
                      <span>{subResults[selectedCaseIndex].testCase.input}</span>
                    </div>
                    <div className="h-px bg-[#333333] my-1"></div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider block">Expected Output</span>
                      <span>{subResults[selectedCaseIndex].testCase.expectedOutput}</span>
                    </div>
                    <div className="h-px bg-[#333333] my-1"></div>
                    <div>
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider block">Got Output</span>
                      <span className={subResults[selectedCaseIndex].passed ? "text-brand" : "text-red-400"}>
                        {subResults[selectedCaseIndex].actualOutput}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 font-bold uppercase tracking-widest text-[10.5px]">
                  No verification outputs logged. Click Run Code.
                </div>
              )}
            </div>

            {/* STICKY BOTTOM SCORE INDICATOR */}
            <div className="bg-brand-green-extralight border-t border-brand-green-light px-5 py-2.5 text-brand-green-dark text-[10.5px] font-bold tracking-wide flex items-center justify-between flex-shrink-0 uppercase select-none">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Run complete — {subResults.filter((r) => r.passed).length} / {subResults.length} test cases passed</span>
              </span>
              <span>
                Points scored on run: {subResults.filter(r => r.passed).length * 1.6} / 10 <span className="text-gray-400 font-semibold">(final marks confirmed by faculty after submission)</span>
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
