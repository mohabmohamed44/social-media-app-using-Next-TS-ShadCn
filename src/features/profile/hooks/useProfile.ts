"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/features/auth/context/AuthProvider";
import { queryKeys } from "@/shared/providers/queryKeys";
import { getProfile } from "../api/profileApi";

export function useProfile() {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
    enabled: isAuthenticated,
    select: (data) => data.user,
  });
}