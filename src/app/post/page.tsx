"use client";

import { useState, useEffect, MouseEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Heart,
  MessageCircle,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { Poppins } from "next/font/google";
import { Comment, postInterface } from "@/interfaces/ICreatePost";
import { UserDataInterface } from "@/interfaces/IRegisterData";
import { AppDispatch, RootState } from "@/lib/redux/store";
import {
  getAllPosts,
  getLatestPosts,
  clearError,
  setCurrentPage,
  getSinglePost,
} from "@/lib/redux/slices/getAllPosts";
import { deletePost, updatePost } from "@/lib/api/postService";

import Cookies from "js-cookie";
import { Card } from "@/Components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/button";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
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

const PostCardSkeleton = () => (
  <Card className="p-4 w-full mx-auto">
    <div className="flex items-center space-x-3 mb-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-40 w-full mt-3 rounded-lg" />
  </Card>
);

const SinglePostSkeleton = () => (
  <div className={`max-w-3xl mx-auto p-4 ${poppins.className}`}>
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-6 w-full mb-4" />
      <Skeleton className="h-6 w-5/6 mb-6" />
      <Skeleton className="w-full h-80 rounded-lg mb-6" />
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
    </Card>
  </div>
);

export default function PostDetailsCard() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const {
    posts,
    singlePost,
    isLoading,
    totalPages,
    currentPage,
    error: reduxError,
  } = useSelector((state: RootState) => state.posts);

  const [makeComment, setMakeComment] = useState(false);
  const [makeEditComment, setMakeEditComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [theComments, setTheComments] = useState<Comment[]>([]);
  const [userId, setUserId] = useState<UserDataInterface | null>(null);
  const [totalComments, setTotalComments] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  useEffect(() => {
    const userDataString = Cookies.get("userData");
    if (userDataString) {
      try {
        setUserId(JSON.parse(userDataString));
      } catch (error) {
        console.error("Failed to parse user data from cookies:", error);
      }
    }
  }, []);

  useEffect(() => {
    dispatch(clearError());
    if (postId) {
      dispatch(getSinglePost(postId));
    } else {
      dispatch(getAllPosts({ page: currentPage, limit: 10 }));
    }
  }, [dispatch, postId, currentPage]);

  useEffect(() => {
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
        { headers: { token } }
      );
      setTheComments(data?.comments || []);
      setTotalComments(data?.total || 0);
    } catch (error) {
      toast.error("Failed to load comments");
    } finally {
      setCommentsLoading(false);
    }
  }

  async function deleteComment(commentId: string) {
    try {
      await axios.delete(`${API_BASE_URL}/comments/${commentId}`, {
        headers: { token: Cookies.get("token") },
      });
      await getAllComments(postId);
      toast.success("Comment deleted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete comment");
    }
  }

  async function createComment(values: { content: string; post: string }) {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/comments`, values, {
        headers: { token: Cookies.get("token") },
      });
      await getAllComments(postId);
      setMakeComment(false);
      toast.success("Comment posted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to post comment");
    } finally {
      setLoading(false);
    }
  }

  async function editComment(values: { content: string }, commentId: string) {
    setCommentsLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/comments/${commentId}`, values, {
        headers: { token: Cookies.get("token") },
      });
      await getAllComments(postId);
      setMakeEditComment(false);
      setEditingCommentId(null);
      toast.success("Comment updated");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to edit comment");
    } finally {
      setCommentsLoading(false);
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setCurrentPage(newPage));
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

    return (
      <div
        className={`flex justify-center items-center space-x-2 mt-6 ${poppins.className}`}
      >
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

  const renderSinglePost = (post: postInterface) => (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${poppins.className}`}
    >
      {post.image && (
        <img
          src={getSafeImageUrl(post.image)}
          alt="Post"
          className="w-full h-auto max-h-[70vh] object-contain bg-gray-100"
          onError={(e) =>
            ((e.target as HTMLImageElement).src = "/placeholder.png")
          }
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
              <p className="font-semibold">{post.user?.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          {userId?._id === post.user?._id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
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
                    dispatch(getAllPosts({ page: 1 }));
                    dispatch(getLatestPosts());
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
                body: Yup.string().required().min(2),
              })}
              onSubmit={async (values) => {
                await updatePost(post._id, values);
                dispatch(getSinglePost(post._id));
                setEditingPostId(null);
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
                    <p className="text-red-500 text-sm">{errors.body}</p>
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
          <Button variant="ghost" className="w-full">
            <Heart className="h-5 w-5 mr-2" />
            Like
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setMakeComment(!makeComment)}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Comment
          </Button>
        </div>
        <div className="mt-6">
          <h3 className="font-bold text-lg mb-4">Comments ({totalComments})</h3>
          <Formik
            initialValues={{ content: "", post: post._id }}
            validationSchema={Yup.object({
              content: Yup.string().required().min(2),
            })}
            onSubmit={(v, { resetForm }) => {
              createComment(v);
              resetForm();
            }}
          >
            {({ handleChange, values, errors, isSubmitting }) => (
              <Form className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src={getSafeImageUrl(userId?.photo)} />
                  <AvatarFallback>{userId?.name?.charAt(0)}</AvatarFallback>
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => (values.content = "")}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" disabled={isSubmitting}>
                        Post
                      </Button>
                    </div>
                  )}
                </div>
              </Form>
            )}
          </Formik>
          {commentsLoading ? (
            <p>Loading comments...</p>
          ) : (
            theComments.map((c) => (
              <div key={c._id} className="flex items-start space-x-3 mt-4">
                <Avatar>
                  <AvatarImage
                    src={getSafeImageUrl(
                      typeof c.commentCreator === "object"
                        ? c.commentCreator.photo
                        : undefined
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
                      {userId?._id ===
                        (typeof c.commentCreator === "object" &&
                          c.commentCreator._id) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setMakeEditComment(true);
                                setEditingCommentId(c._id);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteComment(c._id);
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    {makeEditComment && editingCommentId === c._id ? (
                      <Formik
                        initialValues={{ content: c.content }}
                        validationSchema={Yup.object({
                          content: Yup.string().required().min(2),
                        })}
                        onSubmit={(v) => editComment(v, c._id)}
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
                              <p className="text-red-500 text-sm">
                                {errors.content}
                              </p>
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
                              <Button
                                type="submit"
                                size="sm"
                                disabled={isSubmitting}
                              >
                                Update
                              </Button>
                            </div>
                          </Form>
                        )}
                      </Formik>
                    ) : (
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {c.content}
                      </p>
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
      </div>
    </div>
  );

  const renderAllPosts = () => (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <div key={post._id} className="flex flex-col">
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
                    <p className="font-semibold text-sm">
                      {post.user?.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {userId?._id === post.user?._id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
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
                          dispatch(getAllPosts({ page: 1 }));
                          dispatch(getLatestPosts());
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
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
                    dispatch(getAllPosts({ page: currentPage }));
                    dispatch(getLatestPosts());
                    setEditingPostId(null);
                    setLoading(false);
                  }}
                >
                  {({ handleChange, values, errors, isSubmitting }) => (
                    <Form
                      className="space-y-3"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Textarea
                        name="body"
                        value={values.body}
                        onChange={handleChange}
                        autoFocus
                        className="w-full min-h-[100px] text-base"
                      />
                      {errors.body && (
                        <p className="text-red-500 text-xs">
                          {String(errors.body)}
                        </p>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPostId(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {loading ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              ) : (
                <Link
                  href={`/post/${post._id}`}
                  className="flex flex-col flex-grow"
                >
                  <div className="mb-3 flex-grow">
                    <h2 className="text-gray-800 break-words text-sm whitespace-pre-wrap">
                      {post.body}
                    </h2>
                  </div>
                  {post.image && (
                    <div className="mb-3">
                      <img
                        src={getSafeImageUrl(post.image)}
                        alt="Post"
                        className="w-full h-auto object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </Link>
              )}
              <div className="border-t pt-2 mt-auto">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/post/${post._id}`);
                  }}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Comment ({post.commentsCount || 0})
                </Button>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading && !singlePost && posts.length === 0) {
    return (
      <div className={`max-w-2xl mx-auto ${poppins.className}`}>
        <div className="grid grid-cols-1 gap-4">
          {[...Array(5)].map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (reduxError) {
    return (
      <Card className="p-6 text-center text-red-500">
        <p>Error: {reduxError}</p>
        <Button
          onClick={() =>
            postId
              ? dispatch(getSinglePost(postId))
              : dispatch(getAllPosts({ page: currentPage }))
          }
          className="mt-4"
        >
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${poppins.className}`}>
      {postId ? (
        singlePost ? (
          renderSinglePost(singlePost)
        ) : (
          <SinglePostSkeleton />
        )
      ) : (
        <>
          {renderAllPosts()}
          {renderPagination()}
        </>
      )}
    </div>
  );
}