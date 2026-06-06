"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/features/auth/context/AuthProvider";
import { queryKeys } from "@/shared/providers/queryKeys";
import { getLatestPosts } from "../api/postsApi";

export function useLatestPosts() {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: queryKeys.latestPosts,
    queryFn: getLatestPosts,
    enabled: isAuthenticated,
    select: (data) =>
      [...data.posts].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
  });
}