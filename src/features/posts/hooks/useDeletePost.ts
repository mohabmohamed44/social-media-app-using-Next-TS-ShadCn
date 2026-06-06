"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost } from "../api/postsApi";

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
  });
}