"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Edit, Heart, MessageCircle, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Textarea } from "@/shared/components/ui/textarea";
import type { Post } from "../types";
import { getSafeImageUrl } from "../lib/imageUtils";
import { useDeletePost } from "../hooks/useDeletePost";
import { useUpdatePost } from "../hooks/useUpdatePost";
import { useLikePosts } from "../hooks/useLikePosts";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onUpdated?: () => void;
}

export function PostCard({ post, currentUserId, onUpdated }: PostCardProps) {
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();
  const likePostMutation = useLikePosts();
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const isOwner = currentUserId === post.user?.id;

  const handleDelete = async () => {
    try {
      await deletePostMutation.mutateAsync(post.id);
      toast.success("Post deleted successfully");
      onUpdated?.();
      setEditingPostId(null);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete post");
    }
  };

  return (
    <Card className="p-4 flex flex-col hover:shadow-lg transition-shadow w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage
              src={getSafeImageUrl(post.user?.photo)}
              alt={post.user?.name || "User"}
            />
            <AvatarFallback>
              {post.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">
                {post.user?.name || "Unknown User"}
              </p>
              {isOwner && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                  Yours
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {isOwner && (
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                setEditingPostId(editingPostId === post.id ? null : post.id)
              }
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {editingPostId === post.id && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => setEditingPostId(post.id)}
                >
                  <Edit className="h-4 w-4" /> Edit
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {editingPostId === post.id ? (
        <Formik
          initialValues={{ body: post.body }}
          validationSchema={Yup.object({
            body: Yup.string().required().min(2),
          })}
          onSubmit={async (values) => {
            try {
              await updatePostMutation.mutateAsync({
                postId: post.id,
                values,
              });
              toast.success("Post updated successfully");
              onUpdated?.();
              setEditingPostId(null);
            } catch (error: unknown) {
              const err = error as { response?: { data?: { message?: string } } };
              toast.error(err.response?.data?.message || "Failed to edit post");
            }
          }}
        >
          {({ handleChange, values, errors, isSubmitting }) => (
            <Form
              className="space-y-3"
              onClick={(e: MouseEvent) => e.stopPropagation()}
            >
              <Textarea
                name="body"
                value={values.body}
                onChange={handleChange}
                autoFocus
                className="w-full min-h-[100px] text-base"
              />
              {errors.body && (
                <p className="text-red-500 text-xs">{String(errors.body)}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingPostId(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  Save
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      ) : (
        <Link href={`/post/${post.id}`} className="flex flex-col flex-grow">
          <div className="mb-3 flex-grow">
            <h2 className="text-gray-800 dark:text-white/80 break-words text-sm whitespace-pre-wrap">
              {post.body}
            </h2>
          </div>
          {post.image && (
            <div className="mb-3 relative w-full h-48">
              <Image
                src={getSafeImageUrl(post.image)}
                alt="Post"
                fill
                className="object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </Link>
      )}
      <div className="border-t pt-2 mt-auto">
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" asChild>
            <Link href={`/post/${post.id}`}>
              <MessageCircle className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Comment ({post.commentsCount || 0})
            </Link>
          </Button>
          <Button
            variant="ghost"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                await likePostMutation.mutateAsync(post.id);
                setIsLiked((prev) => !prev);
                onUpdated?.();
              } catch {
                // mutate handles toast on error
              }
            }}
          >
            <Heart className={`h-5 w-5 mr-2 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            Like
          </Button>
        </div>
      </div>
    </Card>
  );
}
