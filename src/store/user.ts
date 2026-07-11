import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserProfile } from "@/api";

type AuthPayload = {
  user: UserProfile;
  access_token: string;
  refresh_token: string;
};

type UserStore = {
  user: UserProfile | null;
  access_token: string | null;
  refresh_token: string | null;
  setAuth: (payload: AuthPayload) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      setAuth: ({ user, access_token, refresh_token }) =>
        set({ user, access_token, refresh_token }),
      clearUser: () =>
        set({ user: null, access_token: null, refresh_token: null }),
    }),
    {
      name: "user",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useIsAuthenticated = () =>
  useUserStore((state) => state.user !== null);
