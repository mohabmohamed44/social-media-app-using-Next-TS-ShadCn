"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/features/auth/context/AuthProvider";
import { queryKeys } from "@/shared/providers/queryKeys";
import { getPost } from "../api/postsApi";

export function usePost(postId: string) {
  const { isAuthenticated } = useAuthContext();
  return useQuery({
    queryKey: queryKeys.post(postId),
    queryFn: () => getPost(postId),
    enabled: !!postId && isAuthenticated,
    select: (data) => data.post,
  });
}