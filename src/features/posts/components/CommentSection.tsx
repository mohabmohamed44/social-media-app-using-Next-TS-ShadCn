"use client";

import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { Comment } from "../types";
import { getSafeImageUrl } from "../lib/imageUtils";
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from "../hooks/useComments";

interface CommentSectionProps {
  postId: string;
  currentUserId?: string;
  currentUserPhoto?: string;
  currentUserName?: string;
}

export function CommentSection({
  postId,
  currentUserId,
  currentUserPhoto,
  currentUserName,
}: CommentSectionProps) {
  const { data, isLoading } = useComments(postId);
  const createCommentMutation = useCreateComment(postId);
  const updateCommentMutation = useUpdateComment(postId);
  const deleteCommentMutation = useDeleteComment(postId);

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [makeEditComment, setMakeEditComment] = useState(false);

  const comments = data?.comments ?? [];
  const totalComments = data?.total ?? 0;

  const handleDelete = async (commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync(commentId);
      toast.success("Comment deleted");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete comment");
    }
  };

  return (
    <div className="mt-6">
      <h3 className="font-bold text-lg mb-4">Comments ({totalComments})</h3>
      <Formik
        initialValues={{ content: "", post: postId }}
        validationSchema={Yup.object({
          content: Yup.string().required().min(2),
        })}
        onSubmit={async (values, { resetForm }) => {
          try {
            await createCommentMutation.mutateAsync(values);
            resetForm();
            toast.success("Comment posted");
          } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to post comment");
          }
        }}
      >
        {({ handleChange, values, errors, isSubmitting }) => (
          <Form className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={getSafeImageUrl(currentUserPhoto)} />
              <AvatarFallback>{currentUserName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Input
                placeholder="Write a comment..."
                name="content"
                value={values.content}
                onChange={handleChange}
              />
              {errors.content && (
                <p className="text-red-500 text-sm">{errors.content}</p>
              )}
              {values.content && (
                <div className="flex justify-end gap-2 mt-2">
                  <Button type="submit" size="sm" disabled={isSubmitting}>
                    Post
                  </Button>
                </div>
              )}
            </div>
          </Form>
        )}
      </Formik>
      {isLoading ? (
        <p className="mt-4">Loading comments...</p>
      ) : (
        comments.map((c: Comment) => (
          <div key={c.id} className="flex items-start space-x-3 mt-4">
            <Avatar>
              <AvatarImage
                src={getSafeImageUrl(
                  typeof c.commentCreator === "object"
                    ? c.commentCreator.photo
                    : undefined,
                )}
              />
              <AvatarFallback>
                {typeof c.commentCreator === "object" &&
                  c.commentCreator.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex justify-between">
                  <p className="font-semibold">
                    {typeof c.commentCreator === "object"
                      ? c.commentCreator.name
                      : "User"}
                  </p>
                  {currentUserId ===
                    (typeof c.commentCreator === "object" &&
                      c.commentCreator.id) && (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          if (editingCommentId === c.id) {
                            setEditingCommentId(null);
                            setMakeEditComment(false);
                          } else {
                            setEditingCommentId(c.id);
                            setMakeEditComment(true);
                          }
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {editingCommentId === c.id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                          <button
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                            onClick={() => {
                              setMakeEditComment(true);
                              setEditingCommentId(c.id);
                            }}
                          >
                            <Edit className="h-4 w-4" /> Edit
                          </button>
                          <button
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                            onClick={() => handleDelete(c.id)}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {makeEditComment && editingCommentId === c.id ? (
                  <Formik
                    initialValues={{ content: c.content }}
                    validationSchema={Yup.object({
                      content: Yup.string().required().min(2),
                    })}
                    onSubmit={async (values) => {
                      try {
                        await updateCommentMutation.mutateAsync({
                          commentId: c.id,
                          values,
                        });
                        setMakeEditComment(false);
                        setEditingCommentId(null);
                        toast.success("Comment updated");
                      } catch (error: unknown) {
                        const err = error as {
                          response?: { data?: { message?: string } };
                        };
                        toast.error(
                          err.response?.data?.message ||
                            "Failed to edit comment",
                        );
                      }
                    }}
                  >
                    {({ handleChange, values, errors, isSubmitting }) => (
                      <Form className="space-y-2">
                        <Input
                          name="content"
                          value={values.content}
                          onChange={handleChange}
                          autoFocus
                        />
                        {errors.content && (
                          <p className="text-red-500 text-sm">{errors.content}</p>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setMakeEditComment(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" size="sm" disabled={isSubmitting}>
                            Update
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">{c.content}</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(c.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
