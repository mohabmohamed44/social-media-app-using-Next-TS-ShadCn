import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import {Post} from "@/interfaces/ICreatePost";
// Base API URL
const API_BASE_URL = 'https://linked-posts.routemisr.com';



// Helper function to get token from cookies (matching your existing implementation)
const getTokenFromCookies = () => {
  if (typeof window === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => 
    cookie.trim().startsWith('token=') || cookie.trim().startsWith('authToken=')
  );
  return tokenCookie ? tokenCookie.split('=')[1] : null;
};

// Async thunk for fetching user posts (specific user)
export const fetchUserPosts = createAsyncThunk(
  'userPosts/fetchUserPosts',
  async ({ userId, limit = 2 }: { userId: string, limit?: number}, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token'); 
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/posts?limit=${limit}`,
        {
          method: 'GET',
          headers: {
            token,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        posts: data.data?.posts || data.posts || [],
        userId,
        pagination: data.pagination || null,
        totalCount: data.results || data.total || 0,
        totalPages: data.pagination?.totalPages || 1
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user posts');
    }
  }
);

// Type for fetchMyPosts arguments
interface FetchMyPostsArgs {
  limit?: number;
  page?: number;
}

// Async thunk for fetching current user's posts (logged in user)
export const fetchMyPosts = createAsyncThunk(
  'userPosts/fetchMyPosts',
  async ({ limit = 10, page = 1 }: FetchMyPostsArgs = {}, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login.');
      }

      // Using the same endpoint pattern as your existing code suggests
      const response = await fetch(
        `${API_BASE_URL}/posts/my-posts?limit=${limit}&page=${page}`,
        {
          method: 'GET',
          headers: {
            token: token,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        posts: data.data?.posts || data.posts || [],
        pagination: data.pagination || null,
        totalCount: data.results || data.total || 0,
        currentPage: data.pagination?.currentPage || page,
        totalPages: data.pagination?.totalPages || 1
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch my posts');
    }
  }
);

// Async thunk for creating a new post
export const createPost = createAsyncThunk(
  'userPosts/createPost',
  async (postData: FormData | any, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login.');
      }

      const headers: Record<string, string> = {
        token: token,
      };

      // Don't set Content-Type for FormData, let browser set it
      if (!(postData instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers,
        body: postData instanceof FormData ? postData : JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.post || data.post || data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create post');
    }
  }
);

// Initial state matching your existing structure
interface UserPostsState {
  // Posts by user ID for caching multiple users' posts
  userPosts: Record<string, {
    posts: Post[];
    loading: boolean;
    error: string | null;
    pagination: any;
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }>;
  
  // Current user's posts
  myPosts: {
    posts: Post[];
    loading: boolean;
    error: string | null;
    pagination: any;
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
  
  // Creating post state
  createPost: {
    loading: boolean;
    error: string | null;
    success: boolean;
  };
  
  // For backward compatibility with your existing code
  posts: Post[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
}

const initialState: UserPostsState = {
  userPosts: {},
  
  myPosts: {
    posts: [],
    loading: false,
    error: null,
    pagination: null,
    totalCount: 0,
    currentPage: 1,
    totalPages: 1
  },
  
  createPost: {
    loading: false,
    error: null,
    success: false
  },
  
  // Backward compatibility
  posts: [],
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  totalPages: 1
};

// Create the slice
const userPostsSlice = createSlice({
  name: 'userPosts',
  initialState,
  reducers: {
    // Clear specific user's posts
    clearUserPosts: (state, action) => {
      const userId = action.payload;
      if (userId && state.userPosts[userId]) {
        delete state.userPosts[userId];
      } else {
        // Clear all posts for backward compatibility
        state.posts = [];
        state.loading = false;
        state.error = null;
        state.total = 0;
        state.currentPage = 1;
        state.totalPages = 1;
      }
    },
    
    // Clear current user's posts
    clearMyPosts: (state) => {
      state.myPosts = {
        posts: [],
        loading: false,
        error: null,
        pagination: null,
        totalCount: 0,
        currentPage: 1,
        totalPages: 1
      };
    },
    
    // Clear create post state
    clearCreatePostState: (state) => {
      state.createPost = {
        loading: false,
        error: null,
        success: false
      };
    },
    
    // Add a new post to my posts (for optimistic updates)
    addPostToMyPosts: (state, action) => {
      state.myPosts.posts.unshift(action.payload);
      state.myPosts.totalCount += 1;
    },
    
    // Remove a post from my posts
    removePostFromMyPosts: (state, action) => {
      const postId = action.payload;
      state.myPosts.posts = state.myPosts.posts.filter(post => post._id !== postId);
      state.myPosts.totalCount = Math.max(0, state.myPosts.totalCount - 1);
    }
  },
  extraReducers: (builder) => {
    // Fetch User Posts
    builder
      .addCase(fetchUserPosts.pending, (state, action) => {
        const { userId } = action.meta.arg;
        if (!state.userPosts[userId]) {
          state.userPosts[userId] = { 
            posts: [], 
            loading: false, 
            error: null, 
            pagination: null, 
            totalCount: 0,
            currentPage: 1,
            totalPages: 1
          };
        }
        state.userPosts[userId].loading = true;
        state.userPosts[userId].error = null;
        
        // Update backward compatibility state
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        const { posts, userId, pagination, totalCount, totalPages } = action.payload;
        
        if (!state.userPosts[userId]) {
          state.userPosts[userId] = { 
            posts: [], 
            loading: false, 
            error: null, 
            pagination: null, 
            totalCount: 0,
            currentPage: 1,
            totalPages: 1
          };
        }
        
        // Set the posts for this user
        state.userPosts[userId].posts = posts;
        state.userPosts[userId].loading = false;
        state.userPosts[userId].pagination = pagination;
        state.userPosts[userId].totalCount = totalCount;
        state.userPosts[userId].totalPages = totalPages;
        
        // Update backward compatibility state
        state.posts = posts;
        state.loading = false;
        state.total = totalCount;
        state.totalPages = totalPages;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        const { userId } = action.meta.arg;
        if (!state.userPosts[userId]) {
          state.userPosts[userId] = { 
            posts: [], 
            loading: false, 
            error: null, 
            pagination: null, 
            totalCount: 0,
            currentPage: 1,
            totalPages: 1
          };
        }
        state.userPosts[userId].loading = false;
        state.userPosts[userId].error = action.payload as string;
        
        // Update backward compatibility state
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch My Posts
    builder
      .addCase(fetchMyPosts.pending, (state) => {
        state.myPosts.loading = true;
        state.myPosts.error = null;
      })
      .addCase(fetchMyPosts.fulfilled, (state, action) => {
        const { posts, pagination, totalCount, currentPage, totalPages } = action.payload;
        const { page } = action.meta.arg || {};
        
        // If it's the first page, replace posts; otherwise, append
        if (page === 1 || !page) {
          state.myPosts.posts = posts;
        } else {
          state.myPosts.posts = [...state.myPosts.posts, ...posts];
        }
        
        state.myPosts.loading = false;
        state.myPosts.pagination = pagination;
        state.myPosts.totalCount = totalCount;
        state.myPosts.currentPage = currentPage;
        state.myPosts.totalPages = totalPages;
      })
      .addCase(fetchMyPosts.rejected, (state, action) => {
        state.myPosts.loading = false;
        state.myPosts.error = action.payload as string;
      });

    // Create Post
    builder
      .addCase(createPost.pending, (state) => {
        state.createPost.loading = true;
        state.createPost.error = null;
        state.createPost.success = false;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.createPost.loading = false;
        state.createPost.success = true;
        
        // Add the new post to my posts at the beginning
        state.myPosts.posts.unshift(action.payload);
        state.myPosts.totalCount += 1;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.createPost.loading = false;
        state.createPost.error = action.payload as string;
        state.createPost.success = false;
      });
  },
});

// Export actions
export const {
  clearUserPosts,
  clearMyPosts,
  clearCreatePostState,
  addPostToMyPosts,
  removePostFromMyPosts
} = userPostsSlice.actions;

// Selectors
export const selectUserPosts = (state: any, userId: string) => state.userPosts.userPosts[userId] || {
  posts: [],
  loading: false,
  error: null,
  pagination: null,
  totalCount: 0,
  currentPage: 1,
  totalPages: 1
};

export const selectMyPosts = (state: any) => state.userPosts.myPosts;
export const selectCreatePostState = (state: any) => state.userPosts.createPost;

// Backward compatibility selectors
export const selectPosts = (state: any) => state.userPosts.posts;
export const selectPostsLoading = (state: any) => state.userPosts.loading;
export const selectPostsError = (state: any) => state.userPosts.error;

// Export reducer (matching your existing export pattern)
export const userPosts = userPostsSlice.reducer;
export default userPostsSlice.reducer;