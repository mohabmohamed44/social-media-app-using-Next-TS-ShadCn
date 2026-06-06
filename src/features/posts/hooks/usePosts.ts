"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/features/auth/context/AuthProvider";
import { queryKeys } from "@/shared/providers/queryKeys";
import { getPosts } from "../api/postsApi";

export function usePosts(page: number, limit = 10) {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: queryKeys.posts(page, limit),
    queryFn: () => getPosts(page, limit),
    enabled: isAuthenticated,
  });
}