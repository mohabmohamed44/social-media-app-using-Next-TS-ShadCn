import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

// Types/Interfaces
export interface IProfilePhotoState {
  uploadingPhoto: boolean;
  uploadError: string | null;
  previewUrl: string | null;
  selectedFile: File | null;
}

const initialState: IProfilePhotoState = {
  uploadingPhoto: false,
  uploadError: null,
  previewUrl: null,
  selectedFile: null,
};

// Update profile photo
export const uploadProfilePhoto = createAsyncThunk(
  "profilePhoto/uploadProfilePhoto",
  async (file: File, { rejectWithValue, dispatch }) => {
    const token = Cookies.get("token");
    if (!token) {
      toast.error("No authentication token found");
      return rejectWithValue("No Auth token found");
    }

    if (!file) {
      toast.error("Please select a photo first");
      return rejectWithValue("No file selected");
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return rejectWithValue("Invalid file type");
    }

    // Validate file size (4MB limit)
    if (file.size > 4 * 1024 * 1024) {
      toast.error("File size must be less than 4MB");
      return rejectWithValue("File too large");
    }

    try {
      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      formData.append("photo", file);

      const response = await axios.put(
        "https://linked-posts.routemisr.com/users/upload-photo",
        formData,
        {
          headers: {
            token,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("Profile photo updated successfully");

      // Update the profile photo in the main profile slice
      const { updateProfilePhoto } = await import("./LoggedInUserData");
      dispatch(updateProfilePhoto({ photo: response.data.user?.photo }));

      return response.data;
    } catch (error: any) {
      console.error("Upload error details:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update photo";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  },
);

// Delete profile photo
export const deleteProfilePhoto = createAsyncThunk(
  "profilePhoto/deleteProfilePhoto",
  async (_, { rejectWithValue, dispatch }) => {
    const token = Cookies.get("token");
    if (!token) {
      toast.error("No authentication token found");
      return rejectWithValue("No Auth token found");
    }

    try {
      const response = await axios.delete(
        "https://linked-posts.routemisr.com/users/profile-photo",
        {
          headers: {
            token,
          },
        },
      );

      toast.success("Profile photo removed successfully");

      // Update the profile photo in the main profile slice
      const { updateProfilePhoto } = await import("./LoggedInUserData");
      dispatch(updateProfilePhoto({ photo: null }));

      return response.data;
    } catch (error: any) {
      console.error("Delete error details:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to remove photo";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  },
);

const profilePhotoSlice = createSlice({
  name: "profilePhoto",
  initialState,
  reducers: {
    setSelectedFile: (state, action) => {
      state.selectedFile = action.payload.file;
      state.previewUrl = action.payload.previewUrl;
    },
    clearSelectedFile: (state) => {
      state.selectedFile = null;
      state.previewUrl = null;
    },
    clearUploadError: (state) => {
      state.uploadError = null;
    },
    setPreviewUrl: (state, action) => {
      state.previewUrl = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload Profile Photo Cases
      .addCase(uploadProfilePhoto.pending, (state) => {
        state.uploadingPhoto = true;
        state.uploadError = null;
      })
      .addCase(uploadProfilePhoto.fulfilled, (state, action) => {
        state.uploadingPhoto = false;
        state.uploadError = null;
        // Clear selected file and preview after successful upload
        state.selectedFile = null;
        state.previewUrl = null;
      })
      .addCase(uploadProfilePhoto.rejected, (state, action) => {
        state.uploadingPhoto = false;
        state.uploadError = action.payload as string;
      })

      // Delete Profile Photo Cases
      .addCase(deleteProfilePhoto.pending, (state) => {
        state.uploadingPhoto = true;
        state.uploadError = null;
      })
      .addCase(deleteProfilePhoto.fulfilled, (state) => {
        state.uploadingPhoto = false;
        state.uploadError = null;
      })
      .addCase(deleteProfilePhoto.rejected, (state, action) => {
        state.uploadingPhoto = false;
        state.uploadError = action.payload as string;
      });
  },
});

export const {
  setSelectedFile,
  clearSelectedFile,
  clearUploadError,
  setPreviewUrl,
} = profilePhotoSlice.actions;

export const profilePhotoReducer = profilePhotoSlice.reducer;
