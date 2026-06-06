"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/providers/queryKeys";
import { getUserPosts } from "../api/profileApi";

export function useUserPosts(userId: string | undefined, limit = 6) {
  return useQuery({
    queryKey: queryKeys.userPosts(userId ?? "", limit),
    queryFn: () => getUserPosts(userId!, limit),
    enabled: !!userId,
    select: (data) => data.data?.posts ?? [],
  });
}