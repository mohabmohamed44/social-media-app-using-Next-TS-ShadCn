'use server';
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const API_BASE_URL = "https://linked-posts.routemisr.com";

const getToken = () => {
  const token = Cookies.get("token");
  if (!token) {
    toast.error("Authentication required");
    return null;
  }
  return token;
};

/**
 * Deletes a post by its ID.
 * @param postId The ID of the post to delete.
 * @returns A promise that resolves if the post is deleted successfully.
 */
export const deletePost = async (postId: string) => {
  const token = getToken();
  if (!token) return;

  try {
    const { data } = await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
      headers: { token },
    });
    if (data?.message === "success") {
      toast.success("Post deleted successfully");
      return data;
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete post";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Updates a post by its ID.
 * @param postId The ID of the post to update.
 * @param values The new post data.
 * @returns A promise that resolves with the updated post data.
 */
export const updatePost = async (postId: string, values: { body: string }) => {
  const token = getToken();
  if (!token) return;

  try {
    const { data } = await axios.put(`${API_BASE_URL}/posts/${postId}`, values, {
      headers: { token },
    });
    if (data?.message === "success") {
      toast.success("Post updated successfully");
      return data;
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to edit post";
    toast.error(errorMessage);
    throw error;
  }
};
