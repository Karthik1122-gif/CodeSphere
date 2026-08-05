"use client";

import React, { useEffect, useState } from "react";
import AccreditationStrip from "@/components/AccreditationStrip";
import Navbar from "@/components/Navbar";
import ReportIssueTab from "@/components/ReportIssueTab";
import SupportBubble from "@/components/SupportBubble";
import { ShieldCheck, History, Users, Database, Globe, Key, FileCheck2, Loader2 } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  ipAddress: string | null;
  metadataJson: string | null;
  createdAt: string;
  actor: {
    name: string;
    email: string;
    role: string;
  } | null;
}

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  rollNo: string | null;
  department: string | null;
}

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState<"audit" | "users">("audit");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        // Fetch audit logs
        const auditRes = await fetch("/api/admin/audit");
        const auditData = await auditRes.json();
        if (auditRes.ok) {
          setLogs(auditData.logs || []);
        }

        // Fetch user accounts (we will mock this since there is no separate API, or fetch from a simple query)
        // For the high fidelity dashboard, let's seed mock lists based on our Prisma seed accounts
        setUsers([
          { id: "1", name: "System Administrator", email: "admin@hitam.edu.in", role: "ADMIN", rollNo: "ADM001", department: "Administration" },
          { id: "2", name: "Dr. K. Srinivas", email: "faculty@hitam.edu.in", role: "FACULTY", rollNo: "FAC102", department: "CSE" },
          { id: "3", name: "Banoth Rahul", email: "student@hitam.edu.in", role: "STUDENT", rollNo: "22E81A0501", department: "CSE" },
        ]);

      } catch (err) {
        console.error("Failed to load admin telemetry:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [activeTab]);

  return (
    <div className="flex flex-col min-h-screen bg-surface-offwhite">
      <AccreditationStrip />
      <Navbar />
      <ReportIssueTab />
      <SupportBubble />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in-up">
        
        {/* Header Block */}
        <div className="border-b border-[var(--color-brand-green-dark-border)]/20 pb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-brand uppercase font-bold tracking-widest block">
              System Console
            </span>
            <h2 className="font-heading font-extrabold text-2xl text-ink-black uppercase tracking-wide">
              Compliance & Audit Controls
            </h2>
          </div>
          <ShieldCheck className="w-8 h-8 text-brand" />
        </div>

        {/* Tab switch navigation */}
        <div className="flex border-b border-[var(--color-brand-green-dark-border)]/20 font-bold uppercase tracking-wider text-xs space-x-4">
          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
              activeTab === "audit" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-1.5"><History className="w-4.5 h-4.5" />Immutable Audit Trails</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
              activeTab === "users" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-1.5"><Users className="w-4.5 h-4.5" />System Accounts</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 space-x-2">
            <Loader2 className="w-6 h-6 text-brand animate-spin" />
            <span className="text-xs uppercase font-bold text-gray-500">Loading system logs...</span>
          </div>
        ) : activeTab === "audit" ? (
          /* Audit Logs Table */
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-sm text-yellow-800 text-xs font-semibold flex items-start space-x-2.5 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">ISO 27001 Security Audit compliance</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">
                  All administrative operations, login triggers, compiler runs, and grade override activities are logged directly to the immutable database along with proctor terminal details.
                </p>
              </div>
            </div>

            <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 rounded-sm shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--color-brand-green-darkest)] border-b border-[var(--color-brand-green-dark-border)] font-bold uppercase text-[10px] text-white tracking-wider">
                    <tr>
                      <th className="p-3.5">Timestamp (UTC)</th>
                      <th className="p-3.5">Actor</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Security Event</th>
                      <th className="p-3.5">Modified Entity</th>
                      <th className="p-3.5">Client IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 font-semibold text-ink-charcoal">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50">
                        <td className="p-3.5 font-mono text-gray-500 text-[10px]">
                          {new Date(log.createdAt).toISOString()}
                        </td>
                        <td className="p-3.5">
                          {log.actor ? log.actor.name : "System Worker"}
                        </td>
                        <td className="p-3.5">
                          {log.actor ? (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-gray-100 border border-[var(--color-brand-green-dark-border)]/20 px-1.5 py-0.5 rounded-sm">
                              {log.actor.role}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-brand/10 border border-brand/20 text-brand px-1.5 py-0.5 rounded-sm">
                              SYSTEM
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            log.action.includes("OVERRIDE")
                              ? "text-red-600 bg-surface-offwhite border border-red-200 px-1.5 py-0.5 rounded-sm"
                              : "text-gray-700"
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3.5 uppercase text-[10px] text-gray-500">
                          {log.entity} ({log.entityId ? log.entityId.substring(0, 8) : "N/A"})
                        </td>
                        <td className="p-3.5 font-mono text-gray-500 text-[10px]">
                          {log.ipAddress || "127.0.0.1"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* User Registry Accounts List */
          <div className="bg-surface-white border border-[var(--color-brand-green-dark-border)]/20 rounded-sm shadow-md overflow-hidden animate-fade-in-up">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--color-brand-green-darkest)] border-b border-[var(--color-brand-green-dark-border)] font-bold uppercase text-[10px] text-white tracking-wider">
                  <tr>
                    <th className="p-3.5">Account Name</th>
                    <th className="p-3.5">Email Address</th>
                    <th className="p-3.5">Assigned Role</th>
                    <th className="p-3.5">ID / Roll Number</th>
                    <th className="p-3.5">Department</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 font-semibold text-ink-charcoal">
                  {users.map((usr) => (
                    <tr key={usr.id} className="hover:bg-gray-50/50">
                      <td className="p-3.5">{usr.name}</td>
                      <td className="p-3.5 text-gray-500 font-mono">{usr.email}</td>
                      <td className="p-3.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
                          usr.role === "ADMIN"
                            ? "text-red-600 bg-surface-offwhite border-red-250"
                            : usr.role === "FACULTY"
                            ? "text-brand bg-[#D4A017]/10 border-[#D4A017]/20"
                            : "text-brand bg-brand/10 border-brand/20"
                        }`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono">{usr.rollNo || "N/A"}</td>
                      <td className="p-3.5 uppercase text-[10px] text-gray-500">{usr.department || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Institutional Footer */}
      <footer className="w-full bg-[var(--color-brand-green-darkest)] text-white py-6 border-t border-[var(--color-brand-green-dark-border)] mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          HITAM System Operations Cell · secure audit console
        </div>
      </footer>
    </div>
  );
}
