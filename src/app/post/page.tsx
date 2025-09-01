"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import toast from "react-hot-toast";
import { Heart, MessageCircle, Edit, Trash2, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Poppins } from "next/font/google";
import { Comment, postInterface } from "@/interfaces/ICreatePost";
import { UserDataInterface } from "@/interfaces/IRegisterData";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { getAllPosts, getSinglePost, setCurrentPage, clearError } from "@/lib/redux/slices/getAllPosts";

import Cookies from "js-cookie";
import { Card } from "@/Components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/button";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
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
  weight: ["400", "600", "700"],
});

export default function PostDetailsCard() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  // Redux state
  const { 
    posts, 
    singlePost, 
    isLoading, 
    totalPages, 
    currentPage, 
    error: reduxError,
    totalPosts 
  } = useSelector((state: RootState) => state.posts);
  
  // Local state
  const [makeComment, setMakeComment] = useState(false);
  const [makeEditComment, setMakeEditComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [theComments, setTheComments] = useState<Comment[]>([]);
  const [userId, setUserId] = useState<UserDataInterface | null>(null);
  const [totalComments, setTotalComments] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Get current post data
  const currentPost = postId ? singlePost : null;

  useEffect(() => {
    const userDataString = Cookies.get("userData");
    const userIdFromStorage: UserDataInterface | null = userDataString
      ? JSON.parse(userDataString)
      : null;
    setUserId(userIdFromStorage);
  }, []);

  useEffect(() => {
    // Clear any previous errors
    dispatch(clearError());
    
    // If we have a postId, fetch single post, otherwise fetch all posts
    if (postId) {
      dispatch(getSinglePost(postId));
    } else {
      dispatch(getAllPosts({ page: currentPage, limit: 10 }));
    }
  }, [dispatch, postId, currentPage]);

  useEffect(() => {
    // Fetch comments when we have a post
    if (postId) {
      getAllComments(postId);
    }
  }, [postId]);

  async function getAllComments(postId: string) {
    if (!postId) return;
    
    setCommentsLoading(true);
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const { data } = await axios.get(
        `${API_BASE_URL}/posts/${postId}/comments`,
        {
          headers: {
            token: token,
          },
        }
      );
      setTheComments(data?.comments || []);
      setTotalComments(data?.total || 0);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setCommentsLoading(false);
    }
  }

  async function deletePost(postId: string) {
    if (!postId) return;
    
    try {
      const token = Cookies.get("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const { data } = await axios.delete(
        `${API_BASE_URL}/posts/${postId}`,
        {
          headers: {
            token: token,
          },
        }
      );
      
      if (data?.message === "success") {
        toast.success("Post deleted successfully");
        // Refresh posts after deletion
        if (postId) {
          router.push("/");
        } else {
          dispatch(getAllPosts({ page: currentPage, limit: 10 }));
        }
      }
    } catch (error: any) {
      console.error("Error deleting post:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete post";
      toast.error(errorMessage);
    }
  }

  async function deleteComment(commentId: string) {
    if (!commentId) return;
    
    try {
      const token = Cookies.get("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const { data } = await axios.delete(
        `${API_BASE_URL}/comments/${commentId}`,
        {
          headers: {
            token: token,
          },
        }
      );
      
      if (data?.message === "success") {
        await getAllComments(postId);
        toast.success("Comment deleted successfully");
      }
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete comment";
      toast.error(errorMessage);
    }
  }

  async function createComment(values: { content: string; post: string }) {
    if (!values.content.trim()) return;
    
    setLoading(true);
    try {
      const token = Cookies.get("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const { data } = await axios.post(
        `${API_BASE_URL}/comments`,
        values,
        {
          headers: {
            token: token,
          },
        }
      );
      
      if (data?.message === "success") {
        await getAllComments(postId);
        setMakeComment(false);
        toast.success("Comment posted successfully");
      }
    } catch (error: any) {
      console.error("Error creating comment:", error);
      const errorMessage = error.response?.data?.message || "Failed to post comment";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function editPost(values: { body: string }, postId: string) {
    if (!values.body.trim() || !postId) return;

    setLoading(true);
    try {
      const token = Cookies.get("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const { data } = await axios.put(
        `${API_BASE_URL}/posts/${postId}`,
        values,
        {
          headers: {
            token: token,
          },
        }
      );

      if (data?.message === "success") {
        toast.success("Post updated successfully");
        if (postId) {
          dispatch(getSinglePost(postId));
        }
        setEditingPostId(null);
      }
    } catch (error: any) {
      console.error("Error editing post:", error);
      const errorMessage = error.response?.data?.message || "Failed to edit post";
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
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const { data } = await axios.put(
        `${API_BASE_URL}/comments/${commentId}`,
        values,
        {
          headers: {
            token: token,
          },
        }
      );
      
      if (data?.message === "success") {
        await getAllComments(postId);
        setMakeEditComment(false);
        setEditingCommentId(null);
        toast.success("Comment updated successfully");
      }
    } catch (error: any) {
      console.error("Error editing comment:", error);
      const errorMessage = error.response?.data?.message || "Failed to edit comment";
      toast.error(errorMessage);
    } finally {
      setCommentsLoading(false);
    }
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setCurrentPage(newPage));
      dispatch(getAllPosts({ page: newPage, limit: 10 }));
    }
  };

  // Render pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className= {`flex justify-center items-center space-x-2 mt-6 ${poppins.className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {startPage > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={isLoading}
            >
              1
            </Button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}

        {pageNumbers.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page)}
            disabled={isLoading}
          >
            {page}
          </Button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={isLoading}
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Render single post
  const renderSinglePost = (post: postInterface) => (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${poppins.className}`}>
      {post.image && (
        <div>
          <img
            src={getSafeImageUrl(post.image)}
            alt="Post image"
            className="w-full h-auto max-h-[70vh] object-contain bg-gray-100"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://via.placeholder.com/800x600?text=Image+Not+Found";
            }}
          />
        </div>
      )}
      <div className="p-6">
        {/* User Info */}
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
              <p className="font-semibold">{post.user?.name || "Unknown User"}</p>
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
                <DropdownMenuItem onClick={(e: any) => {
                  e.stopPropagation();
                  setEditingPostId(post._id);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500"
                  onClick={(e:any) => {
                    e.stopPropagation();
                    deletePost(post._id);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Post Body */}
        <div className="mb-6">
          {editingPostId === post._id ? (
            <Formik
              initialValues={{ body: post.body }}
              validationSchema={Yup.object({
                body: Yup.string()
                  .required("Post content cannot be empty")
                  .min(2, "Post must be at least 2 characters long"),
              })}
              onSubmit={async (values, { setSubmitting }) => {
                setSubmitting(true);
                await editPost(values, post._id);
                setSubmitting(false);
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
                  {errors.body && (
                    <p className="text-red-500 text-sm">{errors.body}</p>
                  )}
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
                      disabled={loading || isSubmitting || !values.body.trim()}
                    >
                      {loading || isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            <p className="text-gray-800 break-words whitespace-pre-wrap text-lg">{post.body}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center py-3 border-t border-b border-gray-200">
          <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-red-500 w-full justify-center">
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

        {/* Comments Section */}
        <div className="mt-6">
          <h3 className="font-bold text-lg mb-4">Comments ({totalComments})</h3>

          {/* Create Comment Form */}
          <div className="mb-6">
            <Formik
              initialValues={{ content: "", post: post._id }}
              validationSchema={Yup.object({
                content: Yup.string()
                  .required("Content is required")
                  .min(2, "Comment must be at least 2 characters long")
                  .max(500, "Comment is too long"),
              })}
              onSubmit={async (values, { resetForm, setSubmitting }) => {
                setSubmitting(true);
                await createComment(values);
                resetForm();
                setSubmitting(false);
              }}
            >
              {({ handleChange, values, errors, isSubmitting }) => (
                <Form className="flex items-start gap-3">
                  <Avatar className="mt-1">
                    <AvatarImage src={getSafeImageUrl(userId?.photo)} alt={userId?.name} />
                    <AvatarFallback>{userId?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Input
                      placeholder="Write a comment..."
                      name="content"
                      type="text"
                      value={values.content}
                      onChange={handleChange}
                      className="mb-1"
                      disabled={loading || isSubmitting}
                    />
                    {errors.content && (
                      <p className="text-red-500 text-sm mb-2">{errors.content}</p>
                    )}
                    {values.content && (
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setMakeComment(false)}
                          disabled={loading || isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={loading || isSubmitting || !values.content.trim()}
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
              {[...Array(3)].map((_, i) => (
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
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            <div className="space-y-4">
              {theComments.map((comment) => (
                <div key={comment._id} className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage 
                      src={getSafeImageUrl(
                        typeof comment.commentCreator === 'object' 
                          ? comment.commentCreator?.photo 
                          : ''
                      )} 
                      alt={
                        typeof comment.commentCreator === 'object' 
                          ? comment.commentCreator?.name || 'User'
                          : 'User'
                      } 
                    />
                    <AvatarFallback>
                      {typeof comment.commentCreator === 'object' 
                        ? comment.commentCreator?.name?.charAt(0)?.toUpperCase() || "U"
                        : "U"
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm">
                          {typeof comment.commentCreator === 'object' 
                            ? comment.commentCreator?.name || "Unknown User"
                            : "Unknown User"
                          }
                        </p>
                        {userId?._id === (typeof comment.commentCreator === 'object' ? comment.commentCreator?._id : comment.commentCreator) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setMakeEditComment(true);
                                setEditingCommentId(comment._id);
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => deleteComment(comment._id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      
                      {makeEditComment && editingCommentId === comment._id ? (
                        <div className="mt-2">
                          <Formik
                            initialValues={{ content: comment.content }}
                            validationSchema={Yup.object({
                              content: Yup.string()
                                .required("Content is required")
                                .min(2, "Comment must be at least 2 characters long")
                                .max(500, "Comment is too long"),
                            })}
                            onSubmit={async (values, { setSubmitting }) => {
                              setSubmitting(true);
                              await editComment(values, comment._id);
                              setSubmitting(false);
                            }}
                          >
                            {({ handleChange, values, errors, isSubmitting }) => (
                              <Form className="space-y-2">
                                <Input
                                  placeholder="Edit your comment"
                                  name="content"
                                  type="text"
                                  value={values.content}
                                  onChange={handleChange}
                                  autoFocus
                                  disabled={commentsLoading || isSubmitting}
                                />
                                {errors.content && (
                                  <p className="text-red-500 text-sm">{errors.content}</p>
                                )}
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
                                    disabled={commentsLoading || isSubmitting || !values.content.trim()}
                                  >
                                    {commentsLoading || isSubmitting ? "Updating..." : "Update"}
                                  </Button>
                                </div>
                              </Form>
                            )}
                          </Formik>
                        </div>
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
  );

  // Render all posts
  const renderAllPosts = () => (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <Link href={`/post/${post._id}`} key={post._id} className="flex">
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
                    <p className="font-semibold text-sm">{post.user?.name || "Unknown User"}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-3 flex-grow">
                <h2 className="text-gray-800 break-words line-clamp-3 text-sm">{post.body}</h2>
              </div>

              {post.image && (
                <div className="mb-3">
                  <img
                    src={getSafeImageUrl(post.image)}
                    alt="Post image"
                    className="w-full h-auto object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
                    }}
                  />
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-auto">
                <div className="flex gap-4">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-red-500">
                    <Heart className="h-4 w-4" />
                    <span className="text-xs">Like</span>
                  </Button>

                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">Comment</span>
                  </Button>
                </div>
                {userId?._id === post.user?._id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e:any) => {
                        e.stopPropagation();
                        // TODO: Add edit functionality
                        toast.loading("Edit functionality not implemented yet.");
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={(e:any) => {
                          e.stopPropagation();
                          deletePost(post._id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );

  const PostCardSkeleton = () => (
    <Card className="p-4 w-80">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-3 w-[100px]" />
          </div>
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
      <Skeleton className="w-full h-40 rounded-lg mb-3" />
      <div className="flex justify-between items-center pt-3 border-t">
        <Skeleton className="h-8 w-[70px]" />
        <Skeleton className="h-8 w-[90px]" />
      </div>
    </Card>
  );

  const SinglePostSkeleton = () => (
    <div>
      <div className="mb-4">
        <Skeleton className="h-10 w-36" />
      </div>
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

  // Loading state
  if (isLoading) {
    if (postId) return <SinglePostSkeleton />;
    if (posts.length === 0) {
      return (
        <div className={`${poppins.className}`}>
          <div className="flex justify-center items-center mb-6">
            <h1 className="text-2xl font-bold">All Posts</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <PostCardSkeleton key={i} />)}
          </div>
        </div>
      );
    }
  }

  // Error state
  if (reduxError) {
    return (
      <Card className="p-6 text-center">
        <div className="text-red-500 mb-4">
          <p className="text-lg font-semibold">Error</p>
          <p>{reduxError}</p>
        </div>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => {
            dispatch(clearError());
            if (postId) {
              dispatch(getSinglePost(postId));
            } else {
              dispatch(getAllPosts({ page: currentPage, limit: 10 }));
            }
          }}>
            Try Again
          </Button>
          <Button variant="outline" onClick={() => router.push("/")}>
            Go Back to Home
          </Button>
        </div>
      </Card>
    );
  }

  // If viewing a single post
  if (postId) {
    if (!currentPost) {
      return (
        <Card className="p-6 text-center">
          <div className="text-gray-500 mb-4">
            <p className="text-lg font-semibold">No Post Found</p>
            <p>The post you're looking for doesn't exist or has been deleted.</p>
          </div>
          <Button onClick={() => router.push("/")}>
            Go Back to Home
          </Button>
        </Card>
      );
    }

    return (
      <div className={`${poppins.className}`}>
        <div className="mb-4">
          <Button variant="outline" onClick={() => router.push("/")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Posts
          </Button>
        </div>
        {renderSinglePost(currentPost)}
      </div>
    );
  }

  // If viewing all posts
  return (
    <div className={`${poppins.className}`}>
      <div className="flex justify-center items-center mb-6">
        <h1 className="text-2xl font-bold mt-3">All Posts</h1>
        {/* <div className="text-sm text-gray-500">
          {totalPosts > 0 && `${totalPosts} total posts`}
        </div> */}
      </div>

      {posts.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-semibold">No Posts Found</p>
            <p>There are no posts to display at the moment.</p>
          </div>
        </Card>
      ) : (
        <>
          {renderAllPosts()}
          {renderPagination()}
        </>
      )}
    </div>
  );
}