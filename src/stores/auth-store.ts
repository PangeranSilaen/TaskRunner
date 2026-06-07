import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { fetchProfile } from "@/features/auth/api";
import type { Profile } from "@/types/app";

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  /** True until the initial session check completes. */
  loading: boolean;
  initialized: boolean;

  init: () => void;
  refreshProfile: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  loading: true,
  initialized: false,

  init: () => {
    if (get().initialized) return;
    set({ initialized: true });

    const loadProfile = async (session: Session | null) => {
      if (!session?.user) {
        set({ session: null, profile: null, loading: false });
        return;
      }
      try {
        const profile = await fetchProfile(session.user.id);
        set({ session, profile, loading: false });
      } catch {
        set({ session, profile: null, loading: false });
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      void loadProfile(data.session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      void loadProfile(session);
    });
  },

  refreshProfile: async () => {
    const session = get().session;
    if (!session?.user) return;
    const profile = await fetchProfile(session.user.id);
    set({ profile });
  },

  reset: () => set({ session: null, profile: null, loading: false }),
}));

// Derived helpers
export const selectIsAuthenticated = (s: AuthState) => Boolean(s.session);
export const selectIsVerified = (s: AuthState) =>
  s.profile?.verification_status === "verified";
export const selectIsAdmin = (s: AuthState) => s.profile?.role === "admin";
