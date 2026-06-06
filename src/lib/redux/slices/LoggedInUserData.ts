import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
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
  username: string | null;
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
  username: null,
  userProfile: null,
  loading: false,
  error: null,
  updating: false,
};

// Get user profile
export const getUserProfile = createAsyncThunk(
  "profile/getUserProfile",
  async (_: any, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
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
  async (profileData: IUpdateProfileData, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
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
    clearProfile: (state: IProfileState) => {
      state.userProfile = null;
      state.loading = false;
      state.error = null;
      state.updating = false;
      if (typeof window !== "undefined") {
        // Clear username from Cookies
        Cookies.remove("username");
      }
    },
    clearError: (state: IProfileState) => {
      state.error = null;
    },
    setProfileData: (state: IProfileState, action: PayloadAction<{ user: IUserProfile }>) => {
      state.userProfile = action.payload.user;
      // Store username in Cookies
      if (typeof window !== "undefined" && action.payload?.user?.name && typeof Cookies !== "undefined") {
        Cookies.set("username", action.payload.user.name);
      }
    },
    updateProfilePhoto: (state: IProfileState, action: PayloadAction<{ photo: string }>) => {
      if (state.userProfile) {
        state.userProfile.photo = action.payload.photo;
      }
    },
  },
  extraReducers: (builder: any) => {
    builder
      // Get Profile Cases
      .addCase(getUserProfile.pending, (state: IProfileState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state: IProfileState, action: PayloadAction<{ user: IUserProfile }>) => {
        state.loading = false;
        state.userProfile = action.payload.user;
        state.error = null;
        if (typeof window !== "undefined" && action.payload.user?.name) {
          Cookies.set("username", action.payload.user.name);
        }
      })
      .addCase(getUserProfile.rejected, (state: IProfileState, action: PayloadAction<string>) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Profile Cases
      .addCase(updateUserProfile.pending, (state: IProfileState) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state: IProfileState, action: PayloadAction<{ user: IUserProfile }>) => {
        state.updating = false;
        state.userProfile = action.payload.user;
        state.error = null;
        if (action.payload.user?.name) {
          Cookies.set("username", action.payload.user.name);
        }
      })
      .addCase(updateUserProfile.rejected, (state: IProfileState, action: PayloadAction<string>) => {
        state.updating = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfile, clearError, setProfileData, updateProfilePhoto } =
  profileSlice.actions;
export const profileReducer = profileSlice.reducer;
