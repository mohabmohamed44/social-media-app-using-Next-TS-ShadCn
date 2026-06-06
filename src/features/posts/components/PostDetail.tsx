"use client";

import { useState } from "react";
import Image from "next/image";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Edit, Heart, MessageCircle, MoreHorizontal, Trash2 } from "lucide-react";
import { Poppins } from "next/font/google";
import { toast } from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePost } from "../hooks/usePost";
import { useDeletePost } from "../hooks/useDeletePost";
import { useUpdatePost } from "../hooks/useUpdatePost";
import { getSafeImageUrl } from "../lib/imageUtils";
import { CommentSection } from "./CommentSection";
import { SinglePostSkeleton } from "./PostCardSkeleton";
import { useRouter } from "next/navigation";
import { useLikePosts } from "../hooks/useLikePosts";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

interface PostDetailProps {
  postId: string;
}

export function PostDetail({ postId }: PostDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: post, isLoading, error, refetch } = usePost(postId);
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();
  const likePostMutation = useLikePosts();
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async (postId: string) => {
    try {
      await likePostMutation.mutateAsync(postId);
      setIsLiked(true);
    } catch (error: any) {
      console.error("error: ", error);
    }
  };

  if (isLoading) {
    return (
      <div className={`max-w-3xl mx-auto p-4 ${poppins.className}`}>
        <SinglePostSkeleton />
      </div>
    );
  }

  if (error || !post) {
    return (
      <Card className="p-6 text-center text-red-500">
        <p>Failed to load post</p>
        <Button onClick={() => refetch()} className="mt-4">
          Try Again
        </Button>
      </Card>
    );
  }

  const isOwner = user?.id === post.user?.id;

  const handleDelete = async () => {
    try {
      await deletePostMutation.mutateAsync(post.id);
      toast.success("Post deleted successfully");
      router.push("/post");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to delete post");
    }
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${poppins.className}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-3xl mx-auto">
        {post.image && (
          <Image
            src={getSafeImageUrl(post.image)}
            alt="Post"
            width={800}
            height={600}
            className="w-full h-auto max-h-[70vh] object-contain bg-gray-100"
          />
        )}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage
                  src={getSafeImageUrl(post.user?.photo)}
                  alt={post.user?.name}
                />
                <AvatarFallback>
                  {post.user?.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{post.user?.name}</p>
                  {isOwner && <Badge variant="secondary">Yours</Badge>}
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleString()}
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
                    setEditingPostId(
                      editingPostId === post.id ? null : post.id,
                    )
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
          <div className="mb-6">
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
                    refetch();
                    setEditingPostId(null);
                  } catch (err: unknown) {
                    const error = err as {
                      response?: { data?: { message?: string } };
                    };
                    toast.error(
                      error.response?.data?.message || "Failed to edit post",
                    );
                  }
                }}
              >
                {({ handleChange, values, errors, isSubmitting }) => (
                  <Form className="space-y-3">
                    <Input
                      name="body"
                      value={values.body}
                      onChange={handleChange}
                      autoFocus
                      className="w-full min-h-[120px] text-lg"
                    />
                    {errors.body && (
                      <p className="text-red-500 text-sm">{String(errors.body)}</p>
                    )}
                    <div className="flex justify-end space-x-2">
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
              <p className="text-gray-800 whitespace-pre-wrap text-lg">
                {post.body}
              </p>
            )}
          </div>
          <div className="flex justify-between items-center py-3 border-t border-b">
            <Button variant="ghost" className="w-full" onClick={() => handleLike(post.id)}>
              <Heart className={`h-5 w-5 mr-2 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              Like
            </Button>
            <Button variant="ghost" className="w-full">
              <MessageCircle className="h-5 w-5 mr-2" />
              Comment
            </Button>
          </div>
          <CommentSection
            postId={post.id}
            currentUserId={user?.id}
            currentUserPhoto={user?.photo}
            currentUserName={user?.name}
          />
        </div>
      </div>
    </div>
  );
}
