"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/providers/queryKeys";
import {
  createComment,
  deleteComment,
  getComments,
  updateComment,
} from "../api/commentsApi";

export function useComments(postId: string) {
  return useQuery({
    queryKey: queryKeys.comments(postId),
    queryFn: () => getComments(postId),
    enabled: !!postId,
  });
}

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: { content: string; post: string }) =>
      createComment(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useUpdateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      values,
    }: {
      commentId: string;
      values: { content: string };
    }) => updateComment(commentId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) });
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments(postId) });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}