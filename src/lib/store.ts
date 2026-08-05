import { create } from "zustand";

interface UserProfile {
  userId: string;
  email: string;
  role: string;
  name: string;
  rollNo?: string;
  section?: string;
  department?: string;
}

interface AppState {
  // User state
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  clearUser: () => void;

  // IDE layout state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: "problems" | "results" | "support";
  setActiveTab: (tab: "problems" | "results" | "support") => void;

  // Test session state
  timeLeft: number; // in seconds
  setTimeLeft: (time: number) => void;
  decrementTime: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),

  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  activeTab: "problems",
  setActiveTab: (activeTab) => set({ activeTab }),

  timeLeft: 0,
  setTimeLeft: (timeLeft) => set({ timeLeft }),
  decrementTime: () => set((state) => ({ timeLeft: Math.max(0, state.timeLeft - 1) })),
}));
