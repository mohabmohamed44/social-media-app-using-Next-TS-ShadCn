"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/providers/queryKeys";
import { updatePost } from "../api/postsApi";

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      values,
    }: {
      postId: string;
      values: { body: string };
    }) => updatePost(postId, values),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.post(variables.postId),
      });
    },
  });
}