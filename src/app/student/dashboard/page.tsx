"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { 
  Calendar, Clock, BookOpen, ChevronRight, Award, User, 
  GraduationCap, ArrowRight, LayoutDashboard, ClipboardList, 
  MessageSquare, LogOut, Settings, Play, Send, AlertTriangle, Loader2
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
}

interface PastResult {
  id: string;
  title: string;
  date: string;
  passed: number;
  total: number;
  marks: string;
  status: "Graded" | "Awaiting evaluation";
}

export default function StudentDashboard() {
  const router = useRouter();
  const { user, clearUser } = useStore();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "pending">("overview");

  // Student support chat state
  const [supportChat, setSupportChat] = useState<{ sender: "faculty" | "student"; text: string }[]>([]);
  const [supportInput, setSupportInput] = useState("");
  const [sending, setSending] = useState(false);

  // Dynamic Past Results
  const [pastResults, setPastResults] = useState<PastResult[]>([]);

  useEffect(() => {
    async function loadTests() {
      try {
        const res = await fetch("/api/tests");
        const data = await res.json();
        if (res.ok) {
          setTests(data.tests || []);
        }
      } catch (err) {
        console.error("Error loading tests:", err);
      } finally {
        setLoading(false);
      }
    }

    async function loadPastResults() {
      try {
        const res = await fetch("/api/grades");
        const data = await res.json();
        if (res.ok && data.grades) {
          const formatted = data.grades.map((g: any) => {
            const passed = g.submission?.results?.filter((r: any) => r.passed).length || 0;
            const total = g.submission?.results?.length || 0;
            return {
              id: g.id,
              title: g.test.title,
              date: new Date(g.createdAt).toLocaleDateString("en-US", { day: '2-digit', month: 'short', year: 'numeric' }),
              passed,
              total,
              marks: g.status === "GRADED" ? `${g.finalMarks} / 100` : "—",
              status: g.status === "GRADED" ? "Graded" : "Awaiting evaluation",
            };
          });
          setPastResults(formatted);
        }
      } catch (err) {
        console.error("Error loading grades:", err);
      }
    }

    async function loadSupportChat() {
      try {
        const res = await fetch("/api/support");
        const data = await res.json();
        if (res.ok && data.messages) {
          const formatted = data.messages.map((m: any) => ({
            sender: m.sender.role === "STUDENT" ? "student" : "faculty",
            text: m.body,
          }));
          if (formatted.length === 0) {
            setSupportChat([
              { sender: "faculty", text: "Welcome to CodeSphere Support! Let us know if you face any issues during your test." }
            ]);
          } else {
            setSupportChat(formatted);
          }
        }
      } catch (err) {
        console.error("Error loading support chat:", err);
      }
    }

    loadTests();
    loadPastResults();
    loadSupportChat();

    // Poll support chat every 5 seconds
    const interval = setInterval(loadSupportChat, 5000);
    return () => clearInterval(interval);
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

  const handleSendSupportMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportInput.trim()) return;

    const userText = supportInput;
    setSupportChat((prev) => [...prev, { sender: "student", text: userText }]);
    setSupportInput("");
    setSending(true);

    try {
      await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: userText }),
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-offwhite">
      {/* Header Bar */}
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
          
          {/* Student Profile Card */}
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-full bg-brand text-[var(--color-brand-green-darkest)] font-extrabold text-xs flex items-center justify-center border border-brand/20">
              RM
            </div>
            <div className="text-[10px] leading-tight text-left hidden sm:block">
              <span className="font-bold text-white block">Rahul Mehta</span>
              <span className="text-[#A0A0A0] text-[9px] font-medium block">Student · B.Tech CSE, Sem V</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main split dashboard layout */}
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
              <button
                onClick={() => setActiveTab("pending")}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-sm transition-colors text-left cursor-pointer ${
                  activeTab === "pending"
                    ? "bg-brand/10 text-brand border-l-4 border-brand font-bold"
                    : "text-gray-300 hover:text-white hover:bg-[var(--color-brand-green-dark-border)]"
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Pending Tests</span>
              </button>
              <Link href="/student/results" className="flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-[var(--color-brand-green-dark-border)] rounded-sm transition-colors">
                <Award className="w-4 h-4" />
                <span>My Results</span>
              </Link>
              <Link href="/student/support" className="flex items-center space-x-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-[var(--color-brand-green-dark-border)] rounded-sm transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span>Student Support</span>
              </Link>
            </nav>
          </div>

          <div className="border-t border-[var(--color-brand-green-dark-border)] p-4 space-y-2 text-xs font-bold uppercase tracking-wider text-gray-300">
            <div className="px-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
              Account
            </div>
            <button className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-[var(--color-brand-green-dark-border)] hover:text-white rounded-sm transition-colors">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-red-950/30 text-red-400 hover:text-red-300 rounded-sm transition-colors text-left">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* MIDDLE REPORTS PANEL AND RIGHT SIDEBAR CHAT/TRENDS */}
        <main className="flex-grow overflow-y-auto flex flex-col lg:flex-row h-full">
          
          {/* MIDDLE COLUMN - Student exams report board */}
          <div className="flex-grow p-6 sm:p-8 space-y-6 max-w-5xl">
            
            {/* User welcome */}
            <div>
              <span className="text-[9px] text-[#A0A0A0] uppercase font-bold tracking-widest block">
                CodeSphere / Student Dashboard
              </span>
              <h2 className="font-heading font-extrabold text-2xl text-ink-black mt-1">
                Welcome back, Rahul
              </h2>
              <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                Roll No. 21CS1042 · Section B · <span suppressHydrationWarning>Last login: {new Date().toLocaleDateString()}</span>
              </p>
            </div>

            {activeTab === "overview" ? (
              <>
                {/* Alert notification strip */}
                <div className="bg-[var(--color-brand-green-extralight)] border border-[#FFE7B3] p-3.5 rounded-sm flex items-start space-x-3 text-xs text-yellow-800 font-semibold">
                  <AlertTriangle className="w-4.5 h-4.5 text-brand flex-shrink-0 mt-0.5" />
                  <div className="flex-grow flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span>
                      <strong>Graph Traversal — BFS/DFS</strong> marks have been published.
                    </span>
                    <Link href="/student/results" className="text-brand hover:underline flex items-center gap-1.5 uppercase font-bold text-[10px]">
                      <span>View result</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Student Stats Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 p-4 shadow-sm rounded-sm">
                    <span className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-wider block">Pending Tests</span>
                    <span className="text-2xl font-heading font-extrabold text-ink-black block mt-1">2</span>
                    <span className="text-[10px] text-red-500 font-bold uppercase block mt-1">1 closes today</span>
                  </div>
                  <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 p-4 shadow-sm rounded-sm">
                    <span className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-wider block">Completed Tests</span>
                    <span className="text-2xl font-heading font-extrabold text-ink-black block mt-1">9</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mt-1">This semester</span>
                  </div>
                  <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 p-4 shadow-sm rounded-sm">
                    <span className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-wider block">Average Score</span>
                    <span className="text-2xl font-heading font-extrabold text-brand block mt-1">84%</span>
                    <span className="text-[10px] text-brand font-bold uppercase block mt-1">▲ 3% vs last month</span>
                  </div>
                  <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 p-4 shadow-sm rounded-sm">
                    <span className="text-[9px] text-[#A0A0A0] font-bold uppercase tracking-wider block">Class Rank</span>
                    <span className="text-2xl font-heading font-extrabold text-ink-black block mt-1">#12</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block mt-1">of 64 students</span>
                  </div>
                </div>

                {/* Pending Tests cards grid */}
                <div className="space-y-4">
                  <h3 className="font-heading font-bold text-base text-ink-black uppercase tracking-wide border-b border-[var(--color-brand-green-dark-border)]/20 pb-2 text-left">
                    Pending Tests
                  </h3>

                  {loading ? (
                    <div className="flex justify-center py-6 space-x-2">
                      <Loader2 className="w-5 h-5 text-brand animate-spin" />
                      <span className="text-xs uppercase font-bold text-gray-400">Syncing active tests...</span>
                    </div>
                  ) : tests.length === 0 ? (
                    <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 p-6 rounded-sm text-center text-gray-400 font-semibold text-xs leading-relaxed">
                      No pending tests registered. Enjoy your study break!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tests.map((test) => (
                        <div
                          key={test.id}
                          className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 p-5 rounded-sm shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
                        >
                          <div className="space-y-1.5">
                            <h4 className="font-heading font-extrabold text-base text-ink-black leading-tight">
                              {test.title}
                            </h4>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center space-x-4">
                              <span>{test.subject}</span>
                              <span>•</span>
                              <span>{test.durationMinutes} min</span>
                              <span>•</span>
                              <span className="text-red-500"><span suppressHydrationWarning>Closes: {new Date(test.closesAt).toLocaleDateString()}</span></span>
                            </div>
                          </div>

                          <Link
                            href={`/student/test/${test.id}`}
                            className="px-4 py-2.5 bg-brand hover:bg-[var(--color-brand-green-dark)] border border-brand-green-dark text-white text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors shadow-sm cursor-pointer flex items-center space-x-1"
                          >
                            <span>Start Test</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Past Tests Grades table */}
                <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 shadow-sm rounded-sm overflow-hidden">
                  <div className="bg-gray-50 border-b border-[var(--color-brand-green-dark-border)]/20 p-4 text-left">
                    <h3 className="font-heading font-bold text-sm text-ink-black uppercase tracking-wide">
                      Past Tests & Marks
                    </h3>
                    <span className="text-[10px] text-gray-400 font-medium">Testcases passed shown instantly; marks appear once faculty evaluates</span>
                  </div>

                  <div className="overflow-x-auto text-xs text-left">
                    <table className="w-full">
                      <thead className="bg-surface-offwhite border-b border-gray-255 font-bold uppercase text-[9px] text-gray-500 tracking-wider">
                        <tr>
                          <th className="p-3">Test</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Testcases Passed</th>
                          <th className="p-3">Marks</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 font-semibold text-ink-charcoal">
                        {pastResults.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50/50">
                            <td className="p-3 font-bold text-ink-black">{p.title}</td>
                            <td className="p-3 font-mono text-gray-500">{p.date}</td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                                  <div className="bg-brand h-full" style={{ width: `${(p.passed / p.total) * 100}%` }}></div>
                                </div>
                                <span className="font-bold text-[10px]">{p.passed}/{p.total}</span>
                              </div>
                            </td>
                            <td className="p-3 font-bold text-ink-charcoal">{p.marks}</td>
                            <td className="p-3 text-right">
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm border ${
                                p.status === "Graded" ? "text-brand bg-brand/10 border-brand/20" : "text-yellow-700 bg-yellow-50 border-yellow-250"
                              }`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              /* Isolated Pending Tests view panel */
              <div className="space-y-4">
                <h3 className="font-heading font-bold text-base text-ink-black uppercase tracking-wide border-b border-[var(--color-brand-green-dark-border)]/20 pb-2 text-left">
                  My Active & Pending Assessments
                </h3>

                {loading ? (
                  <div className="flex justify-center py-12 space-x-2">
                    <Loader2 className="w-6 h-6 text-brand animate-spin" />
                    <span className="text-xs uppercase font-bold text-gray-400">Syncing active tests...</span>
                  </div>
                ) : tests.length === 0 ? (
                  <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 p-12 rounded-sm text-center text-gray-400 font-semibold text-xs leading-relaxed">
                    No active tests registered at the moment.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {tests.map((test) => (
                      <div
                        key={test.id}
                        className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 p-6 rounded-sm shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left border-l-4 border-brand"
                      >
                        <div className="space-y-2">
                          <h4 className="font-heading font-extrabold text-lg text-ink-black leading-tight">
                            {test.title}
                          </h4>
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center space-x-4">
                            <span>Subject: {test.subject}</span>
                            <span>•</span>
                            <span>Duration: {test.durationMinutes} min</span>
                            <span>•</span>
                            <span className="text-red-500"><span suppressHydrationWarning>Deadline: {new Date(test.closesAt).toLocaleDateString()}</span></span>
                          </div>
                        </div>

                        <Link
                          href={`/student/test/${test.id}`}
                          className="px-5 py-3 bg-brand hover:bg-[var(--color-brand-green-dark)] border border-brand-green-dark text-white text-xs font-bold uppercase tracking-wider rounded-sm transition-all shadow-md cursor-pointer flex items-center space-x-2"
                        >
                          <span>Enter Exam Room</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          )
        }
      </div>

          {/* RIGHT SIDEBAR PANEL - support chat + trend lines */}
          <div className="w-full lg:w-80 bg-[var(--color-brand-green-darkest)] border-t lg:border-t-0 lg:border-l border-[var(--color-brand-green-dark-border)] flex flex-col justify-between flex-shrink-0 text-white select-none">
            
            {/* Student Support direct chat */}
            <div className="flex flex-col h-[400px] border-b border-[var(--color-brand-green-dark-border)] overflow-hidden">
              <div className="bg-[var(--color-brand-green-darkest)] p-4.5 border-b border-[var(--color-brand-green-dark-border)] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4.5 h-4.5 text-brand" />
                  <span className="font-heading font-bold text-xs uppercase tracking-wide">
                    Student Support
                  </span>
                </div>
                <span className="text-[8px] bg-brand/20 border border-brand/35 text-brand font-bold uppercase px-2 py-0.5 rounded-sm">
                  Dr. Ananya Rao
                </span>
              </div>

              {/* Support messages history */}
              <div className="flex-grow p-4 overflow-y-auto space-y-4 text-xs">
                {supportChat.map((msg, idx) => (
                  <div key={idx} className={`flex items-start space-x-2.5 ${msg.sender === "student" ? "justify-end" : ""}`}>
                    {msg.sender === "faculty" && (
                      <div className="h-6 w-6 rounded-full bg-brand text-[var(--color-brand-green-darkest)] font-extrabold flex items-center justify-center text-[10px] flex-shrink-0">
                        AR
                      </div>
                    )}
                    <div className={`p-2.5 rounded-sm leading-relaxed ${
                      msg.sender === "student" ? "bg-brand text-white border border-brand-green-dark" : "bg-[var(--color-brand-green-darkest)] text-gray-300"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Send message text block */}
              <form onSubmit={handleSendSupportMessage} className="p-3 border-t border-[var(--color-brand-green-dark-border)] bg-[var(--color-brand-green-darkest)] flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Message your faculty..."
                  value={supportInput}
                  onChange={(e) => setSupportInput(e.target.value)}
                  className="flex-grow bg-[var(--color-brand-green-darkest)] border border-[var(--color-brand-green-dark-border)] text-[11px] px-2.5 py-2 text-white focus:outline-none focus:border-brand rounded-sm placeholder:text-gray-600"
                />
                <button type="submit" disabled={sending} className="p-2 bg-[var(--color-brand-green-darkest)] hover:bg-brand text-white hover:text-[var(--color-brand-green-darkest)] rounded-sm transition-colors cursor-pointer">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Performance Trends progress block */}
            <div className="p-5 flex-grow space-y-4">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-gray-400 border-b border-[var(--color-brand-green-dark-border)] pb-2">
                Performance Trend
              </h4>

              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>DSA</span>
                    <span className="text-brand">88%</span>
                  </div>
                  <div className="w-full bg-[#333333] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand h-full" style={{ width: "88%" }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>DBMS</span>
                    <span className="text-brand">91%</span>
                  </div>
                  <div className="w-full bg-[#333333] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand h-full" style={{ width: "91%" }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Java Programming</span>
                    <span className="text-brand">76%</span>
                  </div>
                  <div className="w-full bg-[#333333] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand h-full" style={{ width: "76%" }}></div>
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
