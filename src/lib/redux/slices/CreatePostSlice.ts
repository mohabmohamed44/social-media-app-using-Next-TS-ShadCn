import axios from "axios";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { ICreatePost } from "@/interfaces/ICreatePost";

// Configure axios defaults
axios.defaults.headers.common["Content-Type"] = "application/json";

interface CreatePostState {
  loading: boolean;
  error: string | null;
  success: boolean;
  post: any | null;
}

const initialState: CreatePostState = {
  loading: false,
  error: null,
  success: false,
  post: null,
};

export const createPost = createAsyncThunk(
  'createPost/createPost',
  async (postData: FormData, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.post(
        'https://linked-posts.routemisr.com/posts',
        postData,
        {
          headers: {
            token: token,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create post'
      );
    }
  }
);

const createPostSlice = createSlice({
  name: 'createPost',
  initialState,
  reducers: {
    resetPostState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.post = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createPost.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.success = true;
        state.post = action.payload;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const { resetPostState } = createPostSlice.actions;
// Export the reducer with proper typing
export const createPostReducer = createPostSlice.reducer as (
  state: CreatePostState | undefined,
  action: any
) => CreatePostState;
