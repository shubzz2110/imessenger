import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: () => boolean;
  setAuth: (user: User, token: string) => void;
  updateUserStatus: (userId: string, isOnline: boolean) => void;
  clearAuth: () => void;
}

const useAuthstore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: function () {
        return !!this.accessToken && !!this.user;
      },
      setAuth: (user, token) => set(() => ({ user, accessToken: token })),
      updateUserStatus: (userId, isOnline) =>
        set((state) => ({
          user:
            state.user && state.user._id === userId
              ? { ...state.user, isOnline }
              : state.user,
        })),
      clearAuth: () => set(() => ({ user: null, accessToken: null })),
    }),
    {
      name: "auth-storage",
    },
  ),
);

export default useAuthstore;
