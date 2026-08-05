import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserOut } from "./types";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: UserOut | null;
  setAuth: (token: string, refreshToken: string, user: UserOut) => void;
  setTokens: (token: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      setAuth: (token, refreshToken, user) => set({ token, refreshToken, user }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      clearAuth: () => set({ token: null, refreshToken: null, user: null }),
    }),
    { name: "sentinel-auth" }
  )
);
