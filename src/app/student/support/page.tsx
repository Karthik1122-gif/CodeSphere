"use client";

import React, { useEffect, useState, useRef } from "react";
import { useStore } from "@/lib/store";
import AccreditationStrip from "@/components/AccreditationStrip";
import Navbar from "@/components/Navbar";
import ReportIssueTab from "@/components/ReportIssueTab";
import SupportBubble from "@/components/SupportBubble";
import { MessageSquare, Send, User, ShieldAlert, Check, CheckCheck, Loader2 } from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  sender: {
    id: string;
    name: string;
    role: string;
  };
}

interface ChatThread {
  threadId: string;
  student: {
    id: string;
    name: string;
    role: string;
    rollNo: string;
  };
  lastMessage: string;
  lastMessageTime: string;
}

export default function SupportChatPage() {
  const { user } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [messageBody, setMessageBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load chat threads (for faculty) or messages (for student)
  useEffect(() => {
    async function loadInitialData() {
      if (!user) return;

      try {
        if (user.role === "STUDENT") {
          // Students read directly from their single thread with faculty
          const res = await fetch("/api/support");
          const data = await res.json();
          if (res.ok) {
            setMessages(data.messages);
          }
        } else {
          // Faculty read inbox threads listing active students
          const res = await fetch("/api/support");
          const data = await res.json();
          if (res.ok) {
            setThreads(data.threads || []);
            if (data.threads?.length > 0 && !selectedStudentId) {
              setSelectedStudentId(data.threads[0].student.id);
            }
          }
        }
      } catch (err) {
        console.error("Error loading chat support data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [user, selectedStudentId]);

  // Load thread-specific messages for faculty when selectedStudentId changes
  useEffect(() => {
    if (!user || user.role === "STUDENT" || !selectedStudentId) return;

    async function loadThreadMessages() {
      try {
        const res = await fetch(`/api/support?userId=${selectedStudentId}`);
        const data = await res.json();
        if (res.ok) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error("Error loading thread messages:", err);
      }
    }
    loadThreadMessages();

    // Setup polling for new messages every 3 seconds
    const interval = setInterval(loadThreadMessages, 3000);
    return () => clearInterval(interval);

  }, [user, selectedStudentId]);

  // Student chat polling (every 3 seconds)
  useEffect(() => {
    if (!user || user.role !== "STUDENT") return;

    async function pollMessages() {
      try {
        const res = await fetch("/api/support");
        const data = await res.json();
        if (res.ok) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error("Error polling messages:", err);
      }
    }

    const interval = setInterval(pollMessages, 3000);
    return () => clearInterval(interval);
  }, [user]);

  // Scroll to bottom whenever messages are updated
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageBody.trim() || sending) return;

    setSending(true);

    try {
      const payload: any = { body: messageBody };
      if (user?.role !== "STUDENT" && selectedStudentId) {
        payload.recipientId = selectedStudentId;
      }

      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.message]);
        setMessageBody("");
      }
    } catch (err) {
      console.error("Failed to send support message:", err);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-surface-offwhite flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-offwhite">
      <AccreditationStrip />
      <Navbar />
      <ReportIssueTab />
      <SupportBubble />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col h-[calc(100vh-125px)]">
        
        {/* Header Strip */}
        <div className="border-b border-[var(--color-brand-green-dark-border)]/20 pb-3 flex items-center justify-between flex-shrink-0">
          <div>
            <span className="text-[10px] text-brand uppercase font-bold tracking-widest block">
              HITAM Communication Cell
            </span>
            <h2 className="font-heading font-extrabold text-2xl text-ink-black uppercase tracking-wide">
              Lab Proctor Support Chat
            </h2>
          </div>
          <MessageSquare className="w-7 h-7 text-brand" />
        </div>

        {/* Chat Frame Split */}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 rounded-sm shadow-md mt-6 overflow-hidden h-[calc(100%-80px)]">
          
          {/* Faculty Inbox Left Column (only visible to faculty/admin) */}
          {user.role !== "STUDENT" && (
            <div className="border-r border-[var(--color-brand-green-dark-border)]/20 flex flex-col h-full overflow-hidden">
              <div className="bg-gray-50 border-b border-[var(--color-brand-green-dark-border)]/20 p-4.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex-shrink-0">
                Active Student Inquiries
              </div>

              {threads.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400 font-semibold leading-relaxed">
                  No active student chat threads in inbox.
                </div>
              ) : (
                <div className="flex-grow overflow-y-auto divide-y divide-gray-100">
                  {threads.map((thr) => {
                    const isSelected = thr.student.id === selectedStudentId;
                    return (
                      <div
                        key={thr.threadId}
                        onClick={() => setSelectedStudentId(thr.student.id)}
                        className={`p-4 cursor-pointer select-none transition-colors ${
                          isSelected ? "bg-brand/5 border-l-4 border-brand" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-bold text-ink-charcoal line-clamp-1">{thr.student.name}</h4>
                            <span className="text-[9px] text-[#A0A0A0] font-bold">{thr.student.rollNo}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 line-clamp-1 italic">
                            {thr.lastMessage}
                          </p>
                          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider block">
                            <span suppressHydrationWarning>{new Date(thr.lastMessageTime).toLocaleTimeString()}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Active Conversation Frame Right Column (occupies full width for students, remaining for faculty) */}
          <div className={`flex flex-col h-full overflow-hidden ${user.role !== "STUDENT" ? "lg:col-span-3" : "lg:col-span-4"}`}>
            
            {/* Header info */}
            <div className="bg-[var(--color-brand-green-darkest)] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-brand animate-pulse"></div>
                <span className="font-heading font-bold text-xs uppercase tracking-wide">
                  {user.role === "STUDENT" ? "Active Line: Dr. K. Srinivas (CSE Dept)" : `Student Session: ${threads.find(t => t.student.id === selectedStudentId)?.student.name || "Loading..."}`}
                </span>
              </div>
              <span className="text-[9px] bg-brand/20 border border-brand/30 px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                Audited Communication
              </span>
            </div>

            {/* Warning strip */}
            <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-yellow-800 text-[10px] font-semibold flex items-center space-x-2 flex-shrink-0">
              <ShieldAlert className="w-4 h-4 text-brand flex-shrink-0" />
              <span>Compliancy Note: This chat log is linked directly to your exam session. Do not attempt to exchange answers or request prohibited coding help.</span>
            </div>

            {/* Conversation Messages logs list */}
            <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-surface-offwhite space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400 font-semibold uppercase tracking-wider leading-relaxed text-center">
                  Connection established.<br />Type a message below to coordinate with support.
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user.userId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      {/* Name tag */}
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                        {isMe ? "You" : msg.sender.name}
                      </span>
                      
                      {/* Message bubble */}
                      <div
                        className={`p-3 max-w-sm rounded-sm text-xs font-medium leading-relaxed border shadow-sm ${
                          isMe
                            ? "bg-brand text-white border-brand-green-dark"
                            : "bg-surface-white text-ink-charcoal border-[var(--color-brand-green-dark-border)]/20"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.body}</p>
                        
                        {/* Time & Read receipts */}
                        <div className={`flex justify-end items-center space-x-1 mt-1 text-[8px] uppercase tracking-wider font-bold ${
                          isMe ? "text-white/60" : "text-gray-400"
                        }`}>
                          <span suppressHydrationWarning>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && (
                            msg.readAt ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* TextInput form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--color-brand-green-dark-border)]/20 bg-surface-white flex items-center space-x-2.5 flex-shrink-0">
              <input
                type="text"
                required
                placeholder="Type your message regarding lab instructions or system issues..."
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="flex-grow bg-surface-offwhite border border-[var(--color-brand-green-dark-border)]/30 text-xs px-3.5 py-3 rounded-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-ink-charcoal font-semibold"
              />
              <button
                type="submit"
                disabled={sending || !messageBody.trim()}
                className="px-4 py-3 bg-brand hover:bg-[var(--color-brand-green-dark)] text-white rounded-sm transition-colors border border-brand-green-dark shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>

        </div>

      </main>
    </div>
  );
}
