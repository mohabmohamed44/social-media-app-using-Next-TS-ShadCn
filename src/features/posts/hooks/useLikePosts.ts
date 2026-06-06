"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost } from "../api/postsApi";
import toast from "react-hot-toast";


export function useLikePosts() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (postId: string) => likePost(postId),
        onSuccess: () => {
            // Invalidate any queries whose first key segment is "posts" or "post"
            queryClient.invalidateQueries({
                predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === "posts",
            });
            queryClient.invalidateQueries({
                predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === "post",
            });
            toast.success("Post liked successfully!");
        },
        onError: (error) => {
            console.error("Error liking post:", error);
            toast.error("Failed to like post");
        }
    })
}