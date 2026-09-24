import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CollectorUser {
  id: string;
  email?: string;
  phone?: string;
  full_name: string;
  location: string;
  role: "COLLECTOR";
  is_verified: boolean;
  token?: string;
}

interface CollectorAuthState {
  user: CollectorUser | null;
  isAuthenticated: boolean;
  login: (user: CollectorUser) => void;
  logout: () => void;
  updateLocation: (loc: string) => void;
}

export const useCollectorAuthStore = create<CollectorAuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateLocation: (location) =>
        set((state) => (state.user ? { user: { ...state.user, location } } : state)),
    }),
    {
      name: "sahirate-collector-auth",
    }
  )
);
