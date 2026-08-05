"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { Terminal, LogOut, User as UserIcon, BookOpen } from "lucide-react";

export default function Navbar() {
  const { user, setUser, clearUser } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  // Fetch current user on mount to sync cookie auth
  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          clearUser();
        }
      } catch (err) {
        clearUser();
      }
    }
    fetchMe();
  }, [setUser, clearUser]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      clearUser();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="w-full bg-[var(--color-brand-green-darkest)] text-white border-b border-[var(--color-brand-green-dark-border)] z-40 sticky top-0 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Side: Brand Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="bg-brand text-ink-charcoal p-1.5 rounded-sm font-bold flex items-center justify-center transition-transform group-hover:scale-105">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-heading font-bold text-lg leading-tight tracking-wide flex items-center">
                  CodeSphere<span className="text-brand ml-0.5">.</span>
                </span>
                <span className="text-[9px] text-[#A0A0A0] uppercase font-semibold tracking-wider">
                  HITAM Online Judge
                </span>
              </div>
            </Link>

            {/* Middle: Conditional Navigation Links */}
            <div className="hidden md:flex items-center space-x-1.5 text-sm font-medium">
              {!user ? (
                <>
                  <Link
                    href="/"
                    className={`px-3 py-2 rounded-sm transition-colors ${
                      pathname === "/" ? "bg-[var(--color-brand-green-darkest)] text-brand" : "text-[#CCCCCC] hover:text-white hover:bg-[#333333]"
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    href="/#features"
                    className="px-3 py-2 rounded-sm text-[#CCCCCC] hover:text-white hover:bg-[#333333] transition-colors"
                  >
                    Platform Features
                  </Link>
                  <Link
                    href="/#trust"
                    className="px-3 py-2 rounded-sm text-[#CCCCCC] hover:text-white hover:bg-[#333333] transition-colors"
                  >
                    Compliance
                  </Link>
                </>
              ) : user.role === "STUDENT" ? (
                <>
                  <Link
                    href="/student/dashboard"
                    className={`px-3 py-2 rounded-sm transition-colors ${
                      pathname === "/student/dashboard" ? "bg-[var(--color-brand-green-darkest)] text-brand" : "text-[#CCCCCC] hover:text-white hover:bg-[#333333]"
                    }`}
                  >
                    My Dashboard
                  </Link>
                  <Link
                    href="/student/results"
                    className={`px-3 py-2 rounded-sm transition-colors ${
                      pathname === "/student/results" ? "bg-[var(--color-brand-green-darkest)] text-brand" : "text-[#CCCCCC] hover:text-white hover:bg-[#333333]"
                    }`}
                  >
                    Past Results
                  </Link>
                  <Link
                    href="/student/support"
                    className={`px-3 py-2 rounded-sm transition-colors ${
                      pathname === "/student/support" ? "bg-[var(--color-brand-green-darkest)] text-brand" : "text-[#CCCCCC] hover:text-white hover:bg-[#333333]"
                    }`}
                  >
                    Support Chat
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/faculty/dashboard"
                    className={`px-3 py-2 rounded-sm transition-colors ${
                      pathname === "/faculty/dashboard" ? "bg-[var(--color-brand-green-darkest)] text-brand" : "text-[#CCCCCC] hover:text-white hover:bg-[#333333]"
                    }`}
                  >
                    Faculty Board
                  </Link>
                  <Link
                    href="/faculty/tests/new"
                    className={`px-3 py-2 rounded-sm transition-colors ${
                      pathname === "/faculty/tests/new" ? "bg-[var(--color-brand-green-darkest)] text-brand" : "text-[#CCCCCC] hover:text-white hover:bg-[#333333]"
                    }`}
                  >
                    Create Test
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className={`px-3 py-2 rounded-sm transition-colors ${
                        pathname === "/admin" ? "bg-[var(--color-brand-green-darkest)] text-brand" : "text-[#CCCCCC] hover:text-white hover:bg-[#333333]"
                      }`}
                    >
                      System Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Side: Account Details / Login CTA */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden lg:flex flex-col items-end text-xs">
                  <span className="font-semibold text-white">{user.name}</span>
                  <span className="text-brand text-[10px] font-bold tracking-tight uppercase bg-brand/10 border border-brand/20 px-1.5 py-0.5 rounded-sm">
                    {user.role}
                  </span>
                </div>
                <div className="h-8 w-8 rounded-full bg-[#333333] border border-[var(--color-brand-green-dark-border)] flex items-center justify-center text-brand font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-sm bg-[var(--color-brand-green-darkest)] hover:bg-red-950/40 text-gray-300 hover:text-red-400 border border-[var(--color-brand-green-dark-border)] hover:border-red-900/50 text-xs font-semibold tracking-wide transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 bg-brand hover:bg-[var(--color-brand-green-dark)] text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm transition-colors flex items-center space-x-1.5 border border-brand-green-dark"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Portal Login</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
