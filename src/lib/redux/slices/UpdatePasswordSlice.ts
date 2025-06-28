import Cookies from "js-cookie";
import {
  createSlice,
  createAsyncThunk,
  configureStore,
} from "@reduxjs/toolkit";
import { IUpdatePassword } from "@/interfaces/IUpdatePassword";

interface RootState {
  updatePassword: IUpdatePassword & {
    loading?: boolean;
    error?: string;
  };
}

// Mock async thunk (replace with your actual implementation)
export const updatePassword = createAsyncThunk(
  "updatePassword",
  async ({ password, newPassword }: IUpdatePassword) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock validation
    if (password === newPassword) {
      throw new Error("New password must be different from current password");
    }

    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters");
    }

    return { message: "Password updated successfully" };
  },
);

// Mock slice (replace with your actual slice)
const initialState: IUpdatePassword & {
  loading: boolean;
  error: string | null;
} = {
  password: "",
  newPassword: "",
  loading: false,
  error: null,
};

const UpdatePasswordSlice = createSlice({
  name: "updatePassword",
  initialState,
  reducers: {
    setPassword: (state, action) => {
      state.password = action.payload;
      state.error = null;
    },
    setNewPassword: (state, action) => {
      state.newPassword = action.payload;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.password = "";
        state.newPassword = "";
        state.loading = false;
        state.error = null;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update password";
      });
  },
});
export const updatePasswordReducer = UpdatePasswordSlice.reducer;
export const { setPassword, setNewPassword, clearError } =
  UpdatePasswordSlice.actions;
