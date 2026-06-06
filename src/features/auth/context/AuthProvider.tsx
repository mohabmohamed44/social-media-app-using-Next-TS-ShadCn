"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/shared/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/providers/queryKeys";
import type { IUserProfile } from "@/features/profile/types";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: IUserProfile | null;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<IUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
        setUser(null);
        setIsLoading(false);
        queryClient.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      const profile: IUserProfile = {
        id: data.id,
        name: data.name,
        email: data.email ?? "",
        dateOfBirth: data.date_of_birth ?? "",
        gender: data.gender ?? "",
        photo: data.photo,
      };
      setUser(profile);
      queryClient.setQueryData(queryKeys.profile, { user: profile });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId, queryClient]);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId, loadProfile]);

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserId(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const refreshAuth = useCallback(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: !!userId,
      isLoading,
      user,
      logout,
      refreshAuth,
    }),
    [userId, isLoading, user, logout, refreshAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
}