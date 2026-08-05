"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { 
  Plus, Users, BarChart3, ClipboardList, UserCheck, Settings, LogOut,
  BrainCircuit, X, Trash2, Calendar, FileText, ArrowRight, Loader2, 
  PlusCircle, CheckCircle, Info, HelpCircle, LayoutDashboard, Send
} from "lucide-react";

interface TestCaseForm {
  input: string;
  expectedOutput: string;
  isSample: boolean;
  points: number;
  visibility: "Sample" | "Hidden" | "Hidden - perf";
}

interface ProblemForm {
  title: string;
  statementMd: string;
  constraints: string;
  points: number;
  testCases: TestCaseForm[];
}

export default function CreateTestPage() {
  const router = useRouter();
  const { clearUser } = useStore();

  // Test details form states
  const [title, setTitle] = useState("Binary Search — First Occurrence");
  const [subject, setSubject] = useState("Data Structures & Algorithms");
  const [difficulty, setDifficulty] = useState("Medium");
  const [durationMinutes, setDurationMinutes] = useState("60 minutes");
  const [opensAt, setOpensAt] = useState("28 Jul 2026 - 09:00 AM");
  const [closesAt, setClosesAt] = useState("28 Jul 2026 - 11:00 AM");
  const [statement, setStatement] = useState("Given a sorted array arr of N integers (which may contain duplicates) and a target value x, return the index of the first occurrence of x. If x is not present, return -1. Solve in O(log N) time.");
  const [constraints, setConstraints] = useState("1 <= N <= 10^6\n-10^9 <= arr[i], x <= 10^9\narr is sorted in non-decreasing order");

  // Allowed Compilers checklist
  const [compilers, setCompilers] = useState({
    C: true,
    Cpp: true,
    Java: true,
    Python: true,
    JS: true,
    Go: false,
    Rust: false,
  });

  // Test Cases table
  const [testCases, setTestCases] = useState<TestCaseForm[]>([
    { input: "arr=[1,2,2,2,3], x=2", expectedOutput: "1", points: 2, visibility: "Sample", isSample: true },
    { input: "arr=[5,7,9], x=4", expectedOutput: "-1", points: 2, visibility: "Hidden", isSample: false },
    { input: "arr=[8], x=8", expectedOutput: "0", points: 2, visibility: "Hidden", isSample: false },
    { input: "arr=[], x=1", expectedOutput: "-1", points: 2, visibility: "Hidden", isSample: false },
    { input: "arr=[1..10^6], x=999999", expectedOutput: "999998", points: 2, visibility: "Hidden - perf", isSample: false },
  ]);

  // AI Chat logs
  const [aiChat, setAiChat] = useState<{ sender: "ai" | "user"; text: string; action?: { label: string; done: boolean } }[]>([
    { sender: "user", text: "Create a medium binary-search question with edge-case test cases." },
    { sender: "ai", text: 'Drafted **"Binary Search — First Occurrence"** with O(log N) constraint and 5 test cases covering duplicates, absence, single element, empty array, and a large-N performance case.', action: { label: "Inserted into form", done: true } },
    { sender: "user", text: "Add one more hidden test case with all duplicate elements." },
    { sender: "ai", text: "Added Test Case #6 — arr=[4,4,4,4], x=4 -> 0, worth 2 points, marked hidden.", action: { label: "Insert into table", done: false } },
    { sender: "ai", text: "Want me to also suggest plagiarism-resistant variants of this question for a retest pool?" }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [drafting, setDrafting] = useState(false);

  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      clearUser();
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCompiler = (lang: keyof typeof compilers) => {
    setCompilers((prev) => ({ ...prev, [lang]: !prev[lang] }));
  };

  const handleAddTestCase = () => {
    setTestCases((prev) => [
      ...prev,
      { input: "", expectedOutput: "", points: 2, visibility: "Hidden", isSample: false },
    ]);
  };

  const handleRemoveTestCase = (idx: number) => {
    setTestCases((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleActionClick = (idx: number) => {
    setAiChat((prev) =>
      prev.map((c, i) => {
        if (i === idx && c.action) {
          if (!c.action.done && c.action.label === "Insert into table") {
            // Add case to table
            setTestCases((current) => [
              ...current,
              { input: "arr=[4,4,4,4], x=4", expectedOutput: "0", points: 2, visibility: "Hidden", isSample: false }
            ]);
          }
          return { ...c, action: { ...c.action, done: true } };
        }
        return c;
      })
    );
  };

  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userText = aiInput;
    setAiChat((prev) => [...prev, { sender: "user", text: userText }]);
    setAiInput("");
    setDrafting(true);

    setTimeout(() => {
      setAiChat((prev) => [
        ...prev,
        { sender: "ai", text: "Adjusting question parameters... I've re-drafted the test conditions. You can check the problem statement preview or append test cases." }
      ]);
      setDrafting(false);
    }, 1500);
  };

  const handleSaveTest = async (published: boolean) => {
    setSaving(true);
    try {
      const dbLangs = Object.keys(compilers)
        .filter((k) => compilers[k as keyof typeof compilers])
        .join(",");

      const dbTestCases = testCases.map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isSample: tc.visibility === "Sample",
        points: tc.points,
        generatedBy: "ai",
      }));

      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subject,
          difficulty: difficulty.toUpperCase(),
          durationMinutes: parseInt(durationMinutes) || 60,
          opensAt: new Date(Date.now() + 10 * 60 * 1000), // opens in 10 mins
          closesAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // closes in 2 hours
          status: published ? "PUBLISHED" : "DRAFT",
          languagesAllowed: dbLangs.toLowerCase(),
          problems: [
            {
              title,
              statementMd: statement,
              constraints,
              points: 10,
              testCases: dbTestCases,
            },
          ],
        }),
      });

      if (res.ok) {
        router.push("/faculty/dashboard");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-offwhite">
      {/* Header Bar */}
      <header className="w-full bg-[var(--color-brand-green-darkest)] border-b-2 border-brand text-white z-40 sticky top-0 px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <div className="bg-brand text-[var(--color-brand-green-darkest)] h-8 w-8 rounded-sm font-bold flex items-center justify-center text-sm">
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

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-brand uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-brand animate-pulse"></span>
            <span>Secure Session · TLS 1.3</span>
          </div>
          <div className="h-8 w-px bg-surface-white/10"></div>
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-full bg-brand text-[var(--color-brand-green-darkest)] font-extrabold text-xs flex items-center justify-center border border-brand/20">
              DS
            </div>
            <div className="text-[10px] leading-tight text-left hidden sm:block">
              <span className="font-bold text-white block">Dr. K. Srinivas</span>
              <span className="text-[#A0A0A0] text-[9px] font-medium block">Faculty · Dept. of Computer Science</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Split */}
      <div className="flex flex-grow h-[calc(100vh-62px)] overflow-hidden">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-60 bg-[var(--color-brand-green-darkest)] border-r border-[var(--color-brand-green-dark-border)] text-white flex flex-col justify-between flex-shrink-0">
          <div className="py-6 space-y-8">
            <div className="px-4 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Menu
            </div>
            
            <nav className="space-y-1 px-2 text-xs font-bold uppercase tracking-wider">
              <Link href="/faculty/dashboard" className="flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-[var(--color-brand-green-dark-border)] rounded-sm transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link href="/faculty/tests/new" className="flex items-center space-x-3 px-4 py-2.5 bg-brand/10 text-brand rounded-sm border-l-4 border-brand transition-colors">
                <Plus className="w-4 h-4" />
                <span>Create New Test</span>
              </Link>
              <Link href="/faculty/dashboard" className="flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-[var(--color-brand-green-dark-border)] rounded-sm transition-colors">
                <ClipboardList className="w-4 h-4" />
                <span>My Tests</span>
              </Link>
              <Link href="/faculty/dashboard" className="flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-[var(--color-brand-green-dark-border)] rounded-sm transition-colors">
                <UserCheck className="w-4 h-4" />
                <span>Students & Results</span>
              </Link>
              <Link href="/faculty/dashboard" className="flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-[var(--color-brand-green-dark-border)] rounded-sm transition-colors">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </Link>
            </nav>
          </div>

          <div className="border-t border-[var(--color-brand-green-dark-border)] p-4 space-y-2 text-xs font-bold uppercase tracking-wider text-gray-300">
            <div className="px-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
              Account
            </div>
            <button className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-[var(--color-brand-green-dark-border)] hover:text-white rounded-sm transition-colors">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-red-950/30 text-red-400 hover:text-red-300 rounded-sm transition-colors text-left">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* MIDDLE FORM AND RIGHT SIDEBAR */}
        <main className="flex-grow overflow-y-auto flex flex-col lg:flex-row h-full">
          
          {/* MIDDLE COLUMN - Assessment Authoring Forms */}
          <div className="flex-grow p-6 sm:p-8 space-y-6 max-w-5xl">
            
            {/* Header Title */}
            <div>
              <span className="text-[9px] text-[#A0A0A0] uppercase font-bold tracking-widest block">
                CodeSphere / Faculty / Create New Test
              </span>
              <h2 className="font-heading font-extrabold text-2xl text-ink-black mt-1">
                Create New Test
              </h2>
              <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                Author a problem, choose allowed languages, and define the test cases students must pass.
              </p>
            </div>

            <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 p-6 shadow-sm rounded-sm space-y-6 text-left">
              <h3 className="font-heading font-bold text-xs text-ink-black uppercase tracking-wider border-b border-gray-150 pb-2">
                Test Details
              </h3>

              {/* Form details inputs layout grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Test Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-surface-white border border-[var(--color-brand-green-dark-border)]/30 text-xs px-3 py-2.5 rounded-sm focus:outline-none focus:border-brand text-ink-black font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-surface-white border border-[var(--color-brand-green-dark-border)]/30 text-xs px-3 py-2.5 rounded-sm focus:outline-none focus:border-brand text-ink-black font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Opens On
                  </label>
                  <input
                    type="text"
                    required
                    value={opensAt}
                    onChange={(e) => setOpensAt(e.target.value)}
                    className="w-full bg-surface-white border border-[var(--color-brand-green-dark-border)]/30 text-xs px-3 py-2.5 rounded-sm focus:outline-none focus:border-brand text-ink-black font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Closes On
                  </label>
                  <input
                    type="text"
                    required
                    value={closesAt}
                    onChange={(e) => setClosesAt(e.target.value)}
                    className="w-full bg-surface-white border border-[var(--color-brand-green-dark-border)]/30 text-xs px-3 py-2.5 rounded-sm focus:outline-none focus:border-brand text-ink-black font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Duration
                  </label>
                  <input
                    type="text"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full bg-surface-white border border-[var(--color-brand-green-dark-border)]/30 text-xs px-3 py-2.5 rounded-sm focus:outline-none focus:border-brand text-ink-black font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Difficulty
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-surface-white border border-[var(--color-brand-green-dark-border)]/30 text-xs px-3 py-2.5 pr-20 rounded-sm focus:outline-none focus:border-brand text-ink-black font-semibold"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-[var(--color-brand-green-extralight)] text-brand border border-[#FFE7B3] text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
                      AI-suggested
                    </span>
                  </div>
                </div>
              </div>

              {/* Permitted compilers list badges */}
              <div className="space-y-2 pt-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Allowed Languages
                </label>
                <div className="flex flex-wrap gap-2 text-xs font-bold uppercase">
                  {(Object.keys(compilers) as Array<keyof typeof compilers>).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleCompiler(lang)}
                      className={`px-3 py-1.5 border rounded-full transition-colors cursor-pointer ${
                        compilers[lang]
                          ? "bg-[var(--color-brand-green-darkest)] border-[var(--color-brand-green-darkest)] text-white"
                          : "bg-surface-white border-[var(--color-brand-green-dark-border)]/30 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {lang === "Cpp" ? "C++" : lang === "JS" ? "JavaScript" : lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Problem Markdown description textarea */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Problem Statement
                  </label>
                  <span className="bg-brand-green-extralight text-brand-green-dark border border-brand-green-light text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-sm flex items-center gap-1">
                    <span className="h-1 w-1 bg-brand rounded-full"></span>
                    <span>AI-drafted</span>
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  className="w-full bg-surface-white border border-[var(--color-brand-green-dark-border)]/30 text-xs p-3.5 rounded-sm focus:outline-none focus:border-brand text-ink-black font-semibold resize-none"
                ></textarea>
              </div>

            </div>

            {/* Test Cases Table */}
            <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 p-6 shadow-sm rounded-sm text-left space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-heading font-bold text-xs text-ink-black uppercase tracking-wider">
                    Test Cases
                  </h3>
                  <span className="text-[10px] text-gray-400 font-medium">Every submission is auto-run against these cases — students see the pass count instantly</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddTestCase}
                  className="px-3 py-1.5 border border-[var(--color-brand-green-dark-border)]/30 hover:bg-gray-50 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Manually</span>
                </button>
              </div>

              {/* Testcase rows */}
              <div className="border border-[var(--color-brand-green-dark-border)]/20 rounded-sm overflow-hidden text-xs text-left">
                <table className="w-full">
                  <thead className="bg-surface-offwhite border-b border-[var(--color-brand-green-dark-border)]/20 font-bold uppercase text-[9px] text-gray-500 tracking-wider">
                    <tr>
                      <th className="p-3 w-10 text-center">#</th>
                      <th className="p-3">Input</th>
                      <th className="p-3">Expected Output</th>
                      <th className="p-3 w-20">Points</th>
                      <th className="p-3 w-24">Visibility</th>
                      <th className="p-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 font-semibold text-ink-charcoal">
                    {testCases.map((tc, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="p-3 text-center text-gray-400 font-bold">{idx + 1}</td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={tc.input}
                            onChange={(e) => {
                              const updated = [...testCases];
                              updated[idx].input = e.target.value;
                              setTestCases(updated);
                            }}
                            className="w-full bg-surface-offwhite border border-[var(--color-brand-green-dark-border)]/30 text-xs px-2.5 py-1.5 rounded-sm focus:outline-none focus:border-brand font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={tc.expectedOutput}
                            onChange={(e) => {
                              const updated = [...testCases];
                              updated[idx].expectedOutput = e.target.value;
                              setTestCases(updated);
                            }}
                            className="w-full bg-surface-offwhite border border-[var(--color-brand-green-dark-border)]/30 text-xs px-2.5 py-1.5 rounded-sm focus:outline-none focus:border-brand font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={tc.points}
                            onChange={(e) => {
                              const updated = [...testCases];
                              updated[idx].points = parseInt(e.target.value) || 0;
                              setTestCases(updated);
                            }}
                            className="w-full bg-surface-offwhite border border-[var(--color-brand-green-dark-border)]/30 text-xs px-2.5 py-1.5 rounded-sm focus:outline-none focus:border-brand text-center"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={tc.visibility}
                            onChange={(e) => {
                              const updated = [...testCases];
                              updated[idx].visibility = e.target.value as any;
                              setTestCases(updated);
                            }}
                            className="w-full bg-surface-offwhite border border-[var(--color-brand-green-dark-border)]/30 text-xs px-2.5 py-1.5 rounded-sm focus:outline-none focus:border-brand"
                          >
                            <option value="Sample">Sample</option>
                            <option value="Hidden">Hidden</option>
                            <option value="Hidden - perf">Hidden - perf</option>
                          </select>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveTestCase(idx)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex justify-end space-x-3 text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => handleSaveTest(false)}
                className="px-5 py-2.5 border border-[var(--color-brand-green-dark-border)]/30 bg-surface-white hover:bg-gray-50 text-gray-600 rounded-sm transition-colors cursor-pointer"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSaveTest(true)}
                disabled={saving}
                className="px-6 py-2.5 bg-brand hover:bg-[var(--color-brand-green-dark)] text-white rounded-sm transition-colors border border-brand-green-dark cursor-pointer shadow-md disabled:opacity-50"
              >
                {saving ? "Publishing..." : "Publish Test to Students →"}
              </button>
            </div>

          </div>

          {/* RIGHT SIDEBAR - CodeBoard AI assistant problem author */}
          <div className="w-full lg:w-80 bg-[var(--color-brand-green-darkest)] border-t lg:border-t-0 lg:border-l border-[var(--color-brand-green-dark-border)] flex flex-col justify-between flex-shrink-0 text-white select-none">
            
            <div className="flex flex-col h-full overflow-hidden">
              <div className="bg-[var(--color-brand-green-darkest)] p-4.5 border-b border-[var(--color-brand-green-dark-border)] flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <BrainCircuit className="w-4.5 h-4.5 text-brand" />
                  <span className="font-heading font-bold text-xs uppercase tracking-wide">
                    CodeBoard AI Assistant
                  </span>
                </div>
                <span className="text-[9px] text-gray-500 font-medium block mt-0.5">Generate questions & test cases, insert with one click</span>
              </div>

              {/* Chat Thread */}
              <div className="flex-grow p-4 overflow-y-auto space-y-4 text-xs">
                {aiChat.map((msg, idx) => (
                  <div key={idx} className={`flex items-start space-x-2.5 ${msg.sender === "user" ? "justify-end" : ""}`}>
                    {msg.sender === "ai" && (
                      <div className="h-6 w-6 rounded-full bg-brand text-[var(--color-brand-green-darkest)] font-extrabold flex items-center justify-center text-[10px] flex-shrink-0">
                        AI
                      </div>
                    )}
                    
                    <div className="flex flex-col space-y-2 items-start">
                      <div className={`p-2.5 rounded-sm leading-relaxed ${
                        msg.sender === "user" ? "bg-[var(--color-brand-green-darkest)] text-white border border-[var(--color-brand-green-dark-border)]" : "bg-[var(--color-brand-green-darkest)] text-gray-300"
                      }`}>
                        <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></div>
                      </div>

                      {/* AI Action button */}
                      {msg.action && (
                        <button
                          type="button"
                          onClick={() => !msg.action?.done && handleActionClick(idx)}
                          disabled={msg.action.done}
                          className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 transition-all ${
                            msg.action.done
                              ? "bg-brand/10 border border-brand/20 text-brand cursor-default"
                              : "bg-brand text-ink-charcoal hover:bg-[var(--color-brand-green-dark)] hover:text-white border border-brand-green-dark cursor-pointer"
                          }`}
                        >
                          {msg.action.done ? <CheckCircle className="w-3.5 h-3.5" /> : null}
                          <span>{msg.action.label} {msg.action.done ? "✓" : ""}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {drafting && (
                  <div className="flex items-center space-x-2 text-gray-500 font-bold text-[9px] uppercase tracking-wider">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
                    <span>Analyzing constraints...</span>
                  </div>
                )}
              </div>

              {/* Text input chat */}
              <form onSubmit={handleSendAiMessage} className="p-3 border-t border-[var(--color-brand-green-dark-border)] bg-[var(--color-brand-green-darkest)] flex items-center space-x-2 flex-shrink-0">
                <input
                  type="text"
                  placeholder="Ask for a question, edge case, or rubric..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="flex-grow bg-[var(--color-brand-green-darkest)] border border-[var(--color-brand-green-dark-border)] text-[11px] px-2.5 py-2 text-white focus:outline-none focus:border-brand rounded-sm placeholder:text-gray-600"
                />
                <button type="submit" className="p-2 bg-[var(--color-brand-green-darkest)] border border-[var(--color-brand-green-dark-border)] hover:bg-brand hover:text-[var(--color-brand-green-darkest)] text-white transition-colors rounded-sm cursor-pointer">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
