/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
const API_BASE_URL = "https://linked-posts.routemisr.com";

// Interface for the posts state
interface PostsState {
  posts: any[];
  singlePost: any | null;
  latestPosts: any[];
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  error: string | null;
  totalPosts: number;
}

// Initial state
const initialState: PostsState = {
  posts: [],
  singlePost: null,
  latestPosts: [],
  isLoading: false,
  totalPages: 1,
  currentPage: 1,
  error: null,
  totalPosts: 0
};

// Get all posts with pagination
export const getAllPosts = createAsyncThunk(
  'posts/getAllPosts',
  async ({ page = 1, limit = 5 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/posts?page=${page}&limit=${limit}`,
        {
          headers: {
            token: Cookies.get("token") || '',
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch posts"
      );
    }
  }
);

// Get latest posts (most recent)
export const getLatestPosts = createAsyncThunk(
  'posts/getLatestPosts',
  async (limit:number = 10, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/posts?sort=-createdAt&limit=${limit}`,
        {
          headers: {
            token: Cookies.get("token") || '',
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch latest posts"
      );
    }
  }
);

// Get single post
export const getSinglePost = createAsyncThunk(
  'posts/getSinglePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/posts/${postId}`,
        {
          headers: {
            token: Cookies.get("token") || '',
          }
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch post"
      );
    }
  }
);

// Create a new post
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: { body: string; image?: File | string; tags?: string[] }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('body', postData.body);
      
      if (postData.image && typeof postData.image !== 'string') {
        formData.append('image', postData.image);
      } else if (postData.image) {
        formData.append('image', postData.image);
      }
      
      if (postData.tags && postData.tags.length > 0) {
        postData.tags.forEach(tag => formData.append('tags', tag));
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/posts`,
        formData,
        {
          headers: {
            token: Cookies.get("token") || '',
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create post"
      );
    }
  }
);

// Create the posts slice
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearPosts: (state) => {
      state.posts = [];
      state.latestPosts = [];
      state.singlePost = null;
      state.totalPages = 1;
      state.currentPage = 1;
      state.totalPosts = 0;
    }
  },
  extraReducers: (builder) => {
    // Handle getAllPosts
    builder.addCase(getAllPosts.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    
    builder.addCase(getAllPosts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.posts = action.payload.posts.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      state.totalPages = action.payload.paginationInfo?.numberOfPages || 1;
      state.totalPosts = action.payload.paginationInfo?.total || 0;
    });
    
    builder.addCase(getAllPosts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string || "Failed to fetch posts";
    });
    
    // Handle getLatestPosts
    builder.addCase(getLatestPosts.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    
    builder.addCase(getLatestPosts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.latestPosts = action.payload.posts.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
    
    builder.addCase(getLatestPosts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string || "Failed to fetch latest posts";
    });
    
    // Handle getSinglePost
    builder.addCase(getSinglePost.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    
    builder.addCase(getSinglePost.fulfilled, (state, action) => {
      state.isLoading = false;
      state.singlePost = action.payload.post;
    });
    
    builder.addCase(getSinglePost.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string || "Failed to fetch post";
    });
    
    // Handle createPost
    builder.addCase(createPost.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    
    builder.addCase(createPost.fulfilled, (state, action) => {
      state.isLoading = false;
      // Add the new post to the beginning of the posts array
      state.posts.unshift(action.payload.post);
      // Also add to latest posts
      state.latestPosts.unshift(action.payload.post);
      state.totalPosts += 1;
    });
    
    builder.addCase(createPost.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string || "Failed to create post";
    });
  }
});

export const { setCurrentPage, clearError, clearPosts } = postsSlice.actions;
export const postsReducer = postsSlice.reducer;