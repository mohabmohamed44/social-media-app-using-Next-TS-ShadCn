"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Heart,
  MessageCircle,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Poppins } from "next/font/google";
import { Comment, postInterface } from "@/interfaces/ICreatePost";
import { UserDataInterface } from "@/interfaces/IRegisterData";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { getSinglePost, clearError } from "@/lib/redux/slices/getAllPosts";
import { deletePost, updatePost } from "@/lib/api/postService";

import Cookies from "js-cookie";
import { Card } from "@/Components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/Components/ui/input";
import { Skeleton } from "@/Components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

// API base URL
const API_BASE_URL = "https://linked-posts.routemisr.com";

// Helper function to get safe image URL
function getSafeImageUrl(photo: string | undefined | null): string {
  if (!photo || photo === "undefined" || photo === "null") return "";
  if (typeof photo !== "string") return "";
  if (/^https?:\/\//i.test(photo)) return photo;
  const trimmed = photo.trim();
  if (!trimmed) return "";
  return `${API_BASE_URL}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export default function PostDetailsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const {
    singlePost,
    isLoading,
    error: reduxError,
  } = useSelector((state: RootState) => state.posts);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [theComments, setTheComments] = useState<Comment[]>([]);
  const [userId, setUserId] = useState<UserDataInterface | null>(null);
  const [totalComments, setTotalComments] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [makeComment, setMakeComment] = useState(false);
  const [makeEditComment, setMakeEditComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  useEffect(() => {
    const userDataString = Cookies.get("userData");
    const userIdFromStorage: UserDataInterface | null = userDataString
      ? JSON.parse(userDataString)
      : null;
    setUserId(userIdFromStorage);
  }, []);

  useEffect(() => {
    dispatch(clearError());
    if (postId) {
      dispatch(getSinglePost(postId));
      getAllComments(postId);
    }
  }, [dispatch, postId]);

  async function getAllComments(postId: string) {
    if (!postId) return;
    setCommentsLoading(true);
    try {
      const token = Cookies.get("token");
      if (!token) return;
      const { data } = await axios.get(
        `${API_BASE_URL}/posts/${postId}/comments`,
        { headers: { token } }
      );
      setTheComments(data?.comments || []);
      setTotalComments(data?.total || 0);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setCommentsLoading(false);
    }
  }

  async function createComment(values: { content: string; post: string }) {
    if (!values.content.trim()) return;
    setLoading(true);
    try {
      const token = Cookies.get("token");
      if (!token) return toast.error("Authentication required");
      const { data } = await axios.post(`${API_BASE_URL}/comments`, values, {
        headers: { token },
      });
      if (data?.message === "success") {
        await getAllComments(postId);
        setMakeComment(false);
        toast.success("Comment posted successfully");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to post comment";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function editComment(values: { content: string }, commentId: string) {
    if (!values.content.trim() || !commentId) return;
    setCommentsLoading(true);
    try {
      const token = Cookies.get("token");
      if (!token) return toast.error("Authentication required");
      const { data } = await axios.put(
        `${API_BASE_URL}/comments/${commentId}`,
        values,
        { headers: { token } }
      );
      if (data?.message === "success") {
        await getAllComments(postId);
        setMakeEditComment(false);
        setEditingCommentId(null);
        toast.success("Comment updated successfully");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to edit comment";
      toast.error(errorMessage);
    } finally {
      setCommentsLoading(false);
    }
  }

  async function deleteComment(commentId: string) {
    if (!commentId) return;
    try {
      const token = Cookies.get("token");
      if (!token) return toast.error("Authentication required");
      const { data } = await axios.delete(
        `${API_BASE_URL}/comments/${commentId}`,
        { headers: { token } }
      );
      if (data?.message === "success") {
        await getAllComments(postId);
        toast.success("Comment deleted successfully");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete comment";
      toast.error(errorMessage);
    }
  }

  if (isLoading) return <SinglePostSkeleton />;
  if (reduxError)
    return <div className="text-center text-red-500 py-10">{reduxError}</div>;
  if (!singlePost)
    return (
      <div className="text-center text-gray-500 py-10">Post not found.</div>
    );

  const post = singlePost;

  return (
    <div className={`max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 ${poppins.className}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {post.image && (
          <div>
            <img
              src={getSafeImageUrl(post.image)}
              alt="Post image"
              className="w-full h-auto max-h-[70vh] object-contain bg-gray-100"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
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
                <p className="font-semibold">
                  {post.user?.name || "Unknown User"}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            {userId?._id === post.user?._id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPostId(post._id);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await deletePost(post._id);
                      router.push("/");
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="mb-6">
            {editingPostId === post._id ? (
              <Formik
                initialValues={{ body: post.body }}
                validationSchema={Yup.object({
                  body: Yup.string()
                    .required("Post content cannot be empty")
                    .min(2, "Post must be at least 2 characters long"),
                })}
                onSubmit={async (values) => {
                  setLoading(true);
                  await updatePost(post._id, values);
                  dispatch(getSinglePost(post._id));
                  setEditingPostId(null);
                  setLoading(false);
                }}
              >
                {({ handleChange, values, errors, isSubmitting }) => (
                  <Form className="space-y-3">
                    <Input
                      name="body"
                      value={values.body}
                      onChange={handleChange}
                      autoFocus
                      className="w-full min-h-[120px] text-lg h-auto resize-y"
                      disabled={loading || isSubmitting}
                    />
                    <ErrorMessage
                      name="body"
                      component="p"
                      className="text-red-500 text-sm"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setEditingPostId(null)}
                        disabled={loading || isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          loading || isSubmitting || !values.body.trim()
                        }
                      >
                        {loading || isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            ) : (
              <h2 className="text-gray-800 break-words font-semibold whitespace-pre-wrap text-lg">
                {post.body}
              </h2>
            )}
          </div>

          <div className="flex justify-between items-center py-3 border-t border-b border-gray-200">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:text-red-500 w-full justify-center"
            >
              <Heart className="h-5 w-5" />
              <span>Like</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 w-full justify-center"
              onClick={() => setMakeComment(!makeComment)}
            >
              <MessageCircle className="h-5 w-5" />
              <span>Comment</span>
            </Button>
          </div>

          <div className="mt-6">
            <h3 className="font-bold text-lg mb-4">
              Comments ({totalComments})
            </h3>
            <div className="mb-6">
              <Formik
                initialValues={{ content: "", post: post._id }}
                validationSchema={Yup.object({
                  content: Yup.string()
                    .required("Content is required")
                    .min(2, "Comment must be at least 2 characters long"),
                })}
                onSubmit={async (values, { resetForm }) => {
                  await createComment(values);
                  resetForm();
                }}
              >
                {({ handleChange, values, errors, isSubmitting }) => (
                  <Form className="flex items-start gap-3">
                    <Avatar className="mt-1">
                      <AvatarImage
                        src={getSafeImageUrl(userId?.photo)}
                        alt={userId?.name}
                      />
                      <AvatarFallback>
                        {userId?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Input
                        placeholder="Write a comment..."
                        name="content"
                        value={values.content}
                        onChange={handleChange}
                        className="mb-1"
                        disabled={loading || isSubmitting}
                      />
                      <ErrorMessage
                        name="content"
                        component="p"
                        className="text-red-500 text-sm mb-2"
                      />
                      {values.content && (
                        <div className="flex justify-end gap-2 mt-2">
                          <Button
                            type="submit"
                            size="sm"
                            disabled={
                              loading || isSubmitting || !values.content.trim()
                            }
                          >
                            {loading || isSubmitting ? "Posting..." : "Post"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Form>
                )}
              </Formik>
            </div>

            {commentsLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : theComments.length === 0 ? (
              <div className="text-center py-6 text-gray-500 italic">
                No comments yet.
              </div>
            ) : (
              <div className="space-y-4">
                {theComments.map((comment) => (
                  <div key={comment._id} className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage
                        src={getSafeImageUrl(comment.commentCreator?.photo)}
                        alt={comment.commentCreator?.name || "User"}
                      />
                      <AvatarFallback>
                        {comment.commentCreator?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm">
                            {comment.commentCreator?.name || "Unknown User"}
                          </p>
                          {userId?._id === comment.commentCreator?._id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMakeEditComment(true);
                                    setEditingCommentId(comment._id);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-500"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteComment(comment._id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        {makeEditComment && editingCommentId === comment._id ? (
                          <Formik
                            initialValues={{ content: comment.content }}
                            validationSchema={Yup.object({
                              content: Yup.string()
                                .required("Content is required")
                                .min(
                                  2,
                                  "Comment must be at least 2 characters long"
                                ),
                            })}
                            onSubmit={async (values) =>
                              await editComment(values, comment._id)
                            }
                          >
                            {({ handleChange, values, isSubmitting }) => (
                              <Form className="space-y-2 mt-2">
                                <Input
                                  name="content"
                                  value={values.content}
                                  onChange={handleChange}
                                  autoFocus
                                  disabled={commentsLoading || isSubmitting}
                                />
                                <ErrorMessage
                                  name="content"
                                  component="p"
                                  className="text-red-500 text-sm"
                                />
                                <div className="flex space-x-2 justify-end">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setMakeEditComment(false);
                                      setEditingCommentId(null);
                                    }}
                                    disabled={commentsLoading || isSubmitting}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="submit"
                                    size="sm"
                                    disabled={
                                      commentsLoading ||
                                      isSubmitting ||
                                      !values.content.trim()
                                    }
                                  >
                                    {commentsLoading || isSubmitting
                                      ? "Updating..."
                                      : "Update"}
                                  </Button>
                                </div>
                              </Form>
                            )}
                          </Formik>
                        ) : (
                          <p className="text-gray-700 break-words whitespace-pre-wrap text-sm">
                            {comment.content}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 pl-1">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const SinglePostSkeleton = () => (
  <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton className="w-full h-96" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
        <div className="space-y-3 mb-6">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
        </div>
        <div className="py-3 border-t border-b flex justify-around">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="mt-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
