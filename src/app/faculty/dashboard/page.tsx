"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import { 
  Plus, Users, BarChart3, GraduationCap, FileCheck2, Trash2, 
  Calendar, Settings, ArrowRight, Loader2, Clock, ShieldCheck, 
  LayoutDashboard, ClipboardList, UserCheck, MessageSquare, LogOut,
  Send, AlertTriangle, Play, BrainCircuit
} from "lucide-react";

interface Test {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  durationMinutes: number;
  opensAt: string;
  closesAt: string;
  status: string;
  languagesAllowed?: string;
}

interface StudentSubmission {
  id: string;
  name: string;
  rollNo: string;
  language: string;
  passed: number;
  total: number;
  marks: string;
  status: "Awaiting marks" | "Graded";
}

export default function FacultyDashboard() {
  const router = useRouter();
  const { user, clearUser } = useStore();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "tests" | "students" | "analytics">("overview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [analyticsData, setAnalyticsData] = useState<{ name: string; avgScore: number; passRate: number; subCount: number }[]>([]);

  // AI Chat states
  const [aiChat, setAiChat] = useState<{ sender: "ai" | "user"; text: string }[]>([
    { sender: "ai", text: "Hello Dr. Srinivas. Tell me the topic and difficulty, and I'll draft a question with sample test cases you can insert directly into a test." }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [drafting, setDrafting] = useState(false);

  // Dynamic Student Submissions
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // 1. Fetch tests
        const testsRes = await fetch("/api/tests");
        const testsData = await testsRes.json();
        
        let activeTests: Test[] = [];
        if (testsRes.ok) {
          activeTests = testsData.tests || [];
          setTests(activeTests);
        }

        // 2. Fetch submissions
        const subRes = await fetch("/api/submissions");
        const subData = await subRes.json();
        
        // 3. Fetch grades
        const gradesRes = await fetch("/api/grades");
        const gradesData = await gradesRes.json();

        // Map submissions
        if (subRes.ok && subData.submissions) {
          const formattedSub = subData.submissions.map((s: any) => {
            const passed = s.results.filter((r: any) => r.passed).length;
            const total = s.results.length;
            
            const grade = gradesData.grades?.find(
              (g: any) => g.studentId === s.studentId && g.testId === s.problem.testId
            );

            return {
              id: s.id,
              name: s.student.name,
              rollNo: s.student.rollNo || "N/A",
              language: s.language.toUpperCase(),
              passed,
              total,
              marks: grade ? `${grade.finalMarks} / 100` : "—",
              status: grade && grade.status === "GRADED" ? "Graded" : "Awaiting marks",
            };
          });
          setSubmissions(formattedSub);
        }

        // Build analytics data for charts
        if (gradesRes.ok && gradesData.grades) {
          const charts = activeTests.map((t) => {
            const testGrades = gradesData.grades.filter((g: any) => g.testId === t.id);
            const totalGrades = testGrades.length;
            const subCount = subData.submissions?.filter((s: any) => s.problem.testId === t.id).length || 0;

            let avgScore = 0;
            let passRate = 0;

            if (totalGrades > 0) {
              const sum = testGrades.reduce((acc: number, cur: any) => acc + cur.finalMarks, 0);
              avgScore = Math.round(sum / totalGrades);
              
              const passedGrades = testGrades.filter((g: any) => g.finalMarks >= 40).length;
              passRate = Math.round((passedGrades / totalGrades) * 100);
            }

            return {
              name: t.title,
              avgScore,
              passRate,
              subCount,
            };
          });

          if (charts.length === 0) {
            setAnalyticsData([
              { name: "No Active Tests", avgScore: 0, passRate: 0, subCount: 0 }
            ]);
          } else {
            setAnalyticsData(charts);
          }
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      clearUser();
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;

    try {
      const res = await fetch(`/api/tests/${testId}`, { method: "DELETE" });
      if (res.ok) {
        setTests((prev) => prev.filter((t) => t.id !== testId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userText = aiInput;
    setAiChat((prev) => [...prev, { sender: "user", text: userText }]);
    setAiInput("");
    setDrafting(true);

    try {
      // Direct call to suggest generator
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: userText, difficulty: "MEDIUM" }),
      });

      const data = await res.json();
      if (res.ok) {
        setAiChat((prev) => [
          ...prev,
          { sender: "ai", text: `I drafted **"${data.problem.title}"** for you. Feel free to copy or insert it in the "Create New Test" tab.` },
          { sender: "ai", text: `**Statement:** ${data.problem.statementMd.substring(0, 150)}...` }
        ]);
      } else {
        setAiChat((prev) => [...prev, { sender: "ai", text: "I couldn't draft that question. Please try a standard coding topic like 'Binary Search'." }]);
      }
    } catch (err) {
      setAiChat((prev) => [...prev, { sender: "ai", text: "Failed to connect to the AI model. Let's try again." }]);
    } finally {
      setDrafting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-offwhite">
      {/* 1. Header Bar */}
      <header className="w-full bg-[var(--color-brand-green-darkest)] border-b-2 border-brand text-white z-40 sticky top-0 px-6 py-3 flex items-center justify-between shadow-md">
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

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-brand uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-brand animate-pulse"></span>
            <span>Secure Session · TLS 1.3</span>
          </div>

          <div className="h-8 w-px bg-surface-white/10"></div>

          {/* User Account pill */}
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

      {/* 2. Page Body Split with left sidebar */}
      <div className="flex flex-grow h-[calc(100vh-62px)] overflow-hidden">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-60 bg-[var(--color-brand-green-darkest)] border-r border-[var(--color-brand-green-dark-border)] text-white flex flex-col justify-between flex-shrink-0">
          <div className="py-6 space-y-8">
            <div className="px-4 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Menu
            </div>
            
            <nav className="space-y-1 px-2 text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-sm transition-colors text-left cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-brand/10 text-brand border-l-4 border-brand font-bold"
                    : "text-gray-300 hover:text-white hover:bg-[var(--color-brand-green-dark-border)]"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <Link href="/faculty/tests/new" className="flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-[var(--color-brand-green-dark-border)] rounded-sm transition-colors">
                <Plus className="w-4 h-4" />
                <span>Create New Test</span>
              </Link>
              <button
                onClick={() => setActiveTab("tests")}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-sm transition-colors text-left cursor-pointer ${
                  activeTab === "tests"
                    ? "bg-brand/10 text-brand border-l-4 border-brand font-bold"
                    : "text-gray-300 hover:text-white hover:bg-[var(--color-brand-green-dark-border)]"
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>My Tests</span>
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-sm transition-colors text-left cursor-pointer ${
                  activeTab === "students"
                    ? "bg-brand/10 text-brand border-l-4 border-brand font-bold"
                    : "text-gray-300 hover:text-white hover:bg-[var(--color-brand-green-dark-border)]"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Students & Results</span>
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-sm transition-colors text-left cursor-pointer ${
                  activeTab === "analytics"
                    ? "bg-brand/10 text-brand border-l-4 border-brand font-bold"
                    : "text-gray-300 hover:text-white hover:bg-[var(--color-brand-green-dark-border)]"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </button>
            </nav>
          </div>

          {/* Sidebar Footer Account section */}
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

        {/* MIDDLE & RIGHT CONTENT PANELS */}
        <main className="flex-grow overflow-y-auto flex flex-col lg:flex-row h-full">
          
          {/* MIDDLE COLUMN - Main dashboard reports */}
          <div className="flex-grow p-6 sm:p-8 space-y-6 max-w-7xl">
            
            {/* Header info */}
            <div>
              <span className="text-[9px] text-[#A0A0A0] uppercase font-bold tracking-widest block">
                CodeSphere / Faculty Dashboard
              </span>
              <h2 className="font-heading font-extrabold text-2xl text-ink-black mt-1">
                Welcome back, Dr. Srinivas
              </h2>
              <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                Department of Computer Science · Faculty ID: FAC-102 · <span suppressHydrationWarning>Last login: {new Date().toLocaleDateString()}</span>
              </p>
                      {/* Dynamic content rendering based on activeTab */}
            {activeTab === "overview" && (
              <>
                {/* Warning Alert Strip */}
                <div className="bg-[var(--color-brand-green-extralight)] border border-[#FFE7B3] p-3.5 rounded-sm flex items-start space-x-3 text-xs text-yellow-800 font-semibold">
                  <AlertTriangle className="w-4.5 h-4.5 text-brand flex-shrink-0 mt-0.5" />
                  <div className="flex-grow flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span>
                      <strong>3 submissions</strong> are awaiting marks allotment for "Factorial Calculation".
                    </span>
                    <Link href="#" className="text-brand hover:underline flex items-center gap-1.5 uppercase font-bold text-[10px]">
                      <span>Review now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Stat Cards Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 p-4 shadow-sm rounded-sm">
                    <span className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-wider block">Active Tests</span>
                    <span className="text-2xl font-heading font-extrabold text-ink-black block mt-1">4</span>
                    <span className="text-[10px] text-brand font-bold uppercase block mt-1">2 close this week</span>
                  </div>
                  <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 p-4 shadow-sm rounded-sm">
                    <span className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-wider block">Total Students</span>
                    <span className="text-2xl font-heading font-extrabold text-ink-black block mt-1">186</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mt-1">Across 3 sections</span>
                  </div>
                  <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 p-4 shadow-sm rounded-sm">
                    <span className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-wider block">Avg. Testcases Passed</span>
                    <span className="text-2xl font-heading font-extrabold text-ink-black block mt-1">76%</span>
                    <span className="text-[10px] text-brand font-bold uppercase block mt-1">▲ 4% vs last test</span>
                  </div>
                  <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 p-4 shadow-sm rounded-sm">
                    <span className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-wider block">Pending Evaluations</span>
                    <span className="text-2xl font-heading font-extrabold text-ink-black block mt-1">12</span>
                    <span className="text-[10px] text-red-500 font-bold uppercase block mt-1">Needs your review</span>
                  </div>
                </div>

                {/* Past Tests List */}
                <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 shadow-sm rounded-sm overflow-hidden">
                  <div className="bg-gray-50 border-b border-[var(--color-brand-green-dark-border)]/20 p-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex flex-col text-left">
                      <h3 className="font-heading font-bold text-sm text-ink-black uppercase tracking-wide">
                        Past Tests
                      </h3>
                      <span className="text-[10px] text-gray-400 font-medium">Tests you have published, with live submission & scoring status</span>
                    </div>
                    <Link
                      href="/faculty/tests/new"
                      className="px-3.5 py-1.5 bg-brand hover:bg-[var(--color-brand-green-dark)] text-white text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors border border-brand-green-dark cursor-pointer flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Test</span>
                    </Link>
                  </div>

                  <div className="overflow-x-auto text-xs text-left">
                    <table className="w-full">
                      <thead className="bg-surface-offwhite border-b border-gray-255 font-bold uppercase text-[9px] text-gray-500 tracking-wider">
                        <tr>
                          <th className="p-3">Test</th>
                          <th className="p-3">Subject</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Attempted</th>
                          <th className="p-3">Avg. Testcases Passed</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 font-semibold text-ink-charcoal">
                        {tests.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-400 font-semibold">
                              No test history logged.
                            </td>
                          </tr>
                        ) : (
                          tests.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50/50">
                              <td className="p-3 font-bold text-ink-black">{t.title}</td>
                              <td className="p-3 uppercase text-[10px] text-gray-400">{t.subject}</td>
                              <td className="p-3 font-mono text-gray-500" suppressHydrationWarning>{new Date(t.opensAt).toLocaleDateString()}</td>
                              <td className="p-3 font-medium">42 / 48</td>
                              <td className="p-3">
                                <div className="flex items-center space-x-2">
                                  <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                                    <div className="bg-brand h-full" style={{ width: "75%" }}></div>
                                  </div>
                                  <span className="font-bold text-[10px]">7.5/10</span>
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm border ${
                                    t.status === "PUBLISHED" ? "text-brand bg-brand/10 border-brand/20" : "text-gray-500 bg-gray-50 border-[var(--color-brand-green-dark-border)]/20"
                                  }`}>
                                    {t.status === "PUBLISHED" ? "Active" : "Draft"}
                                  </span>
                                  <Link href={`/faculty/tests/${t.id}/grading`} className="text-brand hover:underline text-[10px] uppercase font-bold">
                                    Review →
                                  </Link>
                                  <button onClick={() => handleDeleteTest(t.id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Student Submissions Log list */}
                <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 shadow-sm rounded-sm overflow-hidden">
                  <div className="bg-gray-50 border-b border-[var(--color-brand-green-dark-border)]/20 p-4 text-left flex justify-between items-center">
                    <div>
                      <h3 className="font-heading font-bold text-sm text-ink-black uppercase tracking-wide">
                        Student Submissions — Arrays & Recursion
                      </h3>
                      <span className="text-[10px] text-gray-400 font-medium">Testcases are graded instantly; marks require your sign-off</span>
                    </div>
                    <span className="text-[9px] bg-brand/15 text-brand font-bold border border-brand/20 px-2 py-0.5 rounded-full uppercase">
                      64 submissions
                    </span>
                  </div>

                  <div className="overflow-x-auto text-xs text-left">
                    <table className="w-full">
                      <thead className="bg-surface-offwhite border-b border-gray-255 font-bold uppercase text-[9px] text-gray-500 tracking-wider">
                        <tr>
                          <th className="p-3">Student</th>
                          <th className="p-3">Roll No.</th>
                          <th className="p-3">Language</th>
                          <th className="p-3">Testcases Passed</th>
                          <th className="p-3">Marks</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 font-semibold text-ink-charcoal">
                        {submissions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-gray-50/50">
                            <td className="p-3 font-bold text-ink-black">{sub.name}</td>
                            <td className="p-3 font-mono text-gray-500 text-[10px]">{sub.rollNo}</td>
                            <td className="p-3">{sub.language}</td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                                  <div className="bg-brand h-full" style={{ width: `${(sub.passed / sub.total) * 100}%` }}></div>
                                </div>
                                <span className="font-bold text-[10px]">{sub.passed}/{sub.total}</span>
                              </div>
                            </td>
                            <td className="p-3 text-ink-charcoal font-bold">{sub.marks}</td>
                            <td className="p-3 text-right">
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm border ${
                                sub.status === "Graded" ? "text-brand bg-brand/10 border-brand/20" : "text-yellow-700 bg-yellow-50 border-yellow-200"
                              }`}>
                                {sub.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeTab === "tests" && (
              <div className="bg-surface-white border-2 border-brand shadow-md rounded-sm overflow-hidden space-y-4">
                <div className="bg-gray-50 border-b border-[var(--color-brand-green-dark-border)]/20 p-6 text-left flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="font-heading font-extrabold text-base text-ink-black uppercase tracking-wide">
                      Tests Registry
                    </h3>
                    <p className="text-xs text-gray-400">Total assessments hosted on this machine.</p>
                  </div>
                  <Link
                    href="/faculty/tests/new"
                    className="px-4 py-2 bg-brand hover:bg-[var(--color-brand-green-dark)] text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-colors border border-brand-green-dark cursor-pointer flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Test Room</span>
                  </Link>
                </div>

                <div className="p-4">
                  <div className="overflow-x-auto text-xs text-left border border-[var(--color-brand-green-dark-border)]/20 rounded-sm">
                    <table className="w-full">
                      <thead className="bg-surface-offwhite border-b border-gray-255 font-bold uppercase text-[9px] text-gray-500 tracking-wider">
                        <tr>
                          <th className="p-3">Test Title</th>
                          <th className="p-3">Subject</th>
                          <th className="p-3">Starts At</th>
                          <th className="p-3">Ends At</th>
                          <th className="p-3">Langs</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 font-semibold text-ink-charcoal">
                        {tests.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-400 font-semibold">
                              No active tests. Get started by drafting one!
                            </td>
                          </tr>
                        ) : (
                          tests.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50/50">
                              <td className="p-3 font-bold text-ink-black">{t.title}</td>
                              <td className="p-3 uppercase text-[10px] text-brand">{t.subject}</td>
                              <td className="p-3 font-mono text-gray-500" suppressHydrationWarning>{new Date(t.opensAt).toLocaleString()}</td>
                              <td className="p-3 font-mono text-gray-500" suppressHydrationWarning>{new Date(t.closesAt).toLocaleString()}</td>
                              <td className="p-3 text-[10px] text-gray-400 uppercase font-bold">{t.languagesAllowed || "cpp,python"}</td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end space-x-3">
                                  <Link href={`/faculty/tests/${t.id}/grading`} className="px-3 py-1.5 bg-[var(--color-brand-green-darkest)] hover:bg-[#333333] border border-[var(--color-brand-green-dark-border)] text-white text-[10px] font-bold uppercase tracking-wider rounded-sm cursor-pointer">
                                    Grade Test
                                  </Link>
                                  <button onClick={() => handleDeleteTest(t.id)} className="text-red-600 hover:text-red-800 cursor-pointer">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "students" && (
              <div className="bg-surface-white border-2 border-brand shadow-md rounded-sm overflow-hidden space-y-4">
                <div className="bg-gray-50 border-b border-[var(--color-brand-green-dark-border)]/20 p-6 text-left">
                  <h3 className="font-heading font-extrabold text-base text-ink-black uppercase tracking-wide">
                    Submissions Register
                  </h3>
                  <p className="text-xs text-gray-400">Review real-time compiler submissions, execution timings, and proctor violations.</p>
                </div>

                <div className="p-4">
                  <div className="overflow-x-auto text-xs text-left border border-gray-255 rounded-sm">
                    <table className="w-full">
                      <thead className="bg-surface-offwhite border-b border-gray-255 font-bold uppercase text-[9px] text-gray-500 tracking-wider">
                        <tr>
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Roll No.</th>
                          <th className="p-3">Compilers</th>
                          <th className="p-3">Passed Ratio</th>
                          <th className="p-3 text-right">State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 font-semibold text-ink-charcoal">
                        {submissions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-gray-50/50">
                            <td className="p-3 font-bold text-ink-black">{sub.name}</td>
                            <td className="p-3 font-mono text-[10px] text-gray-500">{sub.rollNo}</td>
                            <td className="p-3 text-[10px] font-bold text-gray-400">{sub.language}</td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-gray-200 h-2.5 rounded-full overflow-hidden">
                                  <div className="bg-brand h-full" style={{ width: `${(sub.passed / sub.total) * 100}%` }}></div>
                                </div>
                                <span className="font-bold text-[10px]">{sub.passed}/{sub.total} passed</span>
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm border ${
                                sub.status === "Graded" ? "text-brand bg-brand/10 border-brand/20" : "text-yellow-700 bg-yellow-50 border-yellow-250"
                              }`}>
                                {sub.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="bg-surface-white border-2 border-brand shadow-md rounded-sm p-6 space-y-6 text-left">
                <div>
                  <h3 className="font-heading font-extrabold text-base text-ink-black uppercase tracking-wide">
                    Assessment Analytics Dashboard
                  </h3>
                  <p className="text-xs text-gray-400">Class aggregate summaries and dynamic charts of auto-graded compilation performances.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 border border-[var(--color-brand-green-dark-border)]/20 rounded-sm">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Class Avg. Score</span>
                    <span className="text-2xl font-heading font-extrabold text-brand mt-1 block">81.6%</span>
                  </div>
                  <div className="bg-gray-50 p-4 border border-[var(--color-brand-green-dark-border)]/20 rounded-sm">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Assessment pass percentage</span>
                    <span className="text-2xl font-heading font-extrabold text-ink-black mt-1 block">92.4%</span>
                  </div>
                  <div className="bg-gray-50 p-4 border border-[var(--color-brand-green-dark-border)]/20 rounded-sm">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Avg. Proctor tab switches</span>
                    <span className="text-2xl font-heading font-extrabold text-red-600 mt-1 block">1.4 switches</span>
                  </div>
                </div>

                {mounted ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                    {/* Line Chart */}
                    <div className="border border-[var(--color-brand-green-dark-border)]/20 p-4 rounded-sm">
                      <h4 className="font-heading font-bold text-xs uppercase text-gray-500 tracking-wider mb-4">
                        Average Performance Score (%)
                      </h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={analyticsData}>
                            <defs>
                              <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-brand-green)" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="var(--color-brand-green)" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={9} />
                            <YAxis domain={[0, 100]} stroke="#888888" fontSize={9} />
                            <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "2px" }} />
                            <Area type="monotone" dataKey="avgScore" name="Avg Score %" stroke="var(--color-brand-green)" fillOpacity={1} fill="url(#scoreColor)" strokeWidth={2.5} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="border border-[var(--color-brand-green-dark-border)]/20 p-4 rounded-sm">
                      <h4 className="font-heading font-bold text-xs uppercase text-gray-500 tracking-wider mb-4">
                        Overall Test Student Pass Rate (%)
                      </h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={9} />
                            <YAxis domain={[0, 100]} stroke="#888888" fontSize={9} />
                            <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "2px" }} />
                            <Legend wrapperStyle={{ fontSize: "9px", paddingTop: "5px" }} />
                            <Bar dataKey="passRate" name="Pass Rate %" fill="var(--color-brand-green)" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Initializing charting engines...
                  </div>
                )}
              </div>
            )}          </div>

          </div>

          {/* RIGHT SIDEBAR - AI assistant + telemetry schedules */}
          <div className="w-full lg:w-80 bg-[var(--color-brand-green-darkest)] border-t lg:border-t-0 lg:border-l border-[var(--color-brand-green-dark-border)] flex flex-col justify-between flex-shrink-0 text-white select-none">
            
            {/* AI Assistant card */}
            <div className="flex flex-col h-[400px] border-b border-[var(--color-brand-green-dark-border)] overflow-hidden">
              <div className="bg-[var(--color-brand-green-darkest)] p-4.5 border-b border-[var(--color-brand-green-dark-border)] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BrainCircuit className="w-4.5 h-4.5 text-brand" />
                  <span className="font-heading font-bold text-xs uppercase tracking-wide">
                    CodeBoard AI Assistant
                  </span>
                </div>
                <span className="text-[8px] bg-brand/20 border border-brand/30 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider text-brand">
                  BETA
                </span>
              </div>

              {/* Chat messages */}
              <div className="flex-grow p-4 overflow-y-auto space-y-4 text-xs">
                {aiChat.map((msg, idx) => (
                  <div key={idx} className={`flex items-start space-x-2.5 ${msg.sender === "user" ? "justify-end" : ""}`}>
                    {msg.sender === "ai" && (
                      <div className="h-6 w-6 rounded-full bg-brand text-[var(--color-brand-green-darkest)] font-extrabold flex items-center justify-center text-[10px] flex-shrink-0">
                        AI
                      </div>
                    )}
                    <div className={`p-2.5 rounded-sm leading-relaxed ${
                      msg.sender === "user" ? "bg-brand text-white border border-brand-green-dark" : "bg-[var(--color-brand-green-darkest)] text-gray-300"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {drafting && (
                  <div className="flex items-center space-x-2 text-gray-500 font-bold text-[9px] uppercase tracking-wider">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
                    <span>Drafting compiler cases...</span>
                  </div>
                )}
              </div>

              {/* Input block */}
              <form onSubmit={handleSendAiMessage} className="p-3 border-t border-[var(--color-brand-green-dark-border)] bg-[var(--color-brand-green-darkest)] flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Ask the assistant to draft a question..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="flex-grow bg-[var(--color-brand-green-darkest)] border border-[var(--color-brand-green-dark-border)] text-[11px] px-2.5 py-2 text-white focus:outline-none focus:border-brand rounded-sm placeholder:text-gray-600"
                />
                <button type="submit" className="p-2 bg-brand text-ink-charcoal rounded-sm hover:bg-[var(--color-brand-green-dark)] transition-colors">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* This Week schedule panel */}
            <div className="p-5 flex-grow space-y-4">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-400 border-b border-[var(--color-brand-green-dark-border)] pb-2">
                This Week Tasks
              </h4>
              
              <div className="space-y-3.5 text-xs">
                <div className="flex items-start space-x-3 font-semibold">
                  <div className="bg-[#333333] text-brand p-1.5 rounded-sm">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-white block">Sessional Test</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">27 July, 11:59 PM (Closes)</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3 font-semibold">
                  <div className="bg-[#333333] text-brand p-1.5 rounded-sm">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-white block">Lab evaluation</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">29 July, 02:00 PM (Opens)</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3 font-semibold">
                  <div className="bg-[#333333] text-brand p-1.5 rounded-sm">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-white block">Faculty review</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">31 July, 06:00 PM (Deadline)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
