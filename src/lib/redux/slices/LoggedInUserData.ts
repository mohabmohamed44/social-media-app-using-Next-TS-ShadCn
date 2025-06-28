import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

// Types/Interfaces
export interface IUserProfile {
  _id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  photo?: string;
  posts?: number;
  followers?: number;
  following?: number;
}

export interface IProfileState {
  userProfile: IUserProfile | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
}

export interface IUpdateProfileData {
  name?: string;
  dateOfBirth?: string;
  gender?: string;
}

const initialState: IProfileState = {
  userProfile: null,
  loading: false,
  error: null,
  updating: false,
};

// Get user profile
export const getUserProfile = createAsyncThunk(
  "profile/getUserProfile",
  async (_, { rejectWithValue }) => {
    const token = Cookies.get("token");
    if (!token) {
      toast.error("No authentication token found");
      return rejectWithValue("No Auth token found");
    }

    try {
      const response = await axios.get(
        "https://linked-posts.routemisr.com/users/profile-data",
        {
          headers: {
            token,
          },
        },
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch profile data";
      toast.error("Unable to fetch profile data");
      return rejectWithValue(errorMessage);
    }
  },
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  "profile/updateUserProfile",
  async (profileData: IUpdateProfileData, { rejectWithValue }) => {
    const token = Cookies.get("token");
    if (!token) {
      toast.error("No authentication token found");
      return rejectWithValue("No Auth token found");
    }

    try {
      const response = await axios.patch(
        "https://linked-posts.routemisr.com/users/profile-data",
        profileData,
        {
          headers: {
            token,
            "Content-Type": "application/json",
          },
        },
      );
      toast.success("Profile updated successfully");
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  },
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.userProfile = null;
      state.loading = false;
      state.error = null;
      state.updating = false;
      // Clear username from localStorage
      localStorage.removeItem("username");
    },
    clearError: (state) => {
      state.error = null;
    },
    setProfileData: (state, action) => {
      state.userProfile = action.payload;
      // Store username in localStorage
      if (action.payload?.name) {
        localStorage.setItem("username", action.payload.name);
      }
    },
    updateProfilePhoto: (state, action) => {
      if (state.userProfile) {
        state.userProfile.photo = action.payload.photo;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Profile Cases
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userProfile = action.payload.user;
        state.error = null;
        if (action.payload.user.username) {
          Cookies.set("username", action.payload.user.username);
        }
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Profile Cases
      .addCase(updateUserProfile.pending, (state, action) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.userProfile = action.payload.user;
        state.error = null;
        if (action.payload.user.username) {
          Cookies.set("username", action.payload.user.username);
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfile, clearError, setProfileData, updateProfilePhoto } =
  profileSlice.actions;
export const profileReducer = profileSlice.reducer;
