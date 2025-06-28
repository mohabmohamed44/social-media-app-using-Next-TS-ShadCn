import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { ILoginData } from "@/interfaces/ILoginData";
import { IRegisterData } from "@/interfaces/IRegisterData";
import Cookies from "js-cookie";

// Configure axios defaults
axios.defaults.headers.common["Content-Type"] = "application/json";

export const handleLogin = createAsyncThunk(
  "auth/login",
  async function (formData: ILoginData, { rejectWithValue }) {
    try {
      const response = await axios.post(
        "https://linked-posts.routemisr.com/users/signin",
        formData,
      );
      Cookies.set("token", response.data.token);
      return response.data;
    } catch (error: any) {
      // Return the error response data for proper error handling
      if (error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: error.message || "Login failed" });
    }
  },
);

export const handleRegister = createAsyncThunk(
  "auth/register",
  async function (formData: IRegisterData, { rejectWithValue }) {
    try {
      console.log("Sending registration data:", formData);

      const response = await axios.post(
        "https://linked-posts.routemisr.com/users/signup",
        formData,
      );
      console.log("Registration response:", response.data);

      return response.data;
    } catch (error: any) {
      console.error(
        "Registration error:",
        error.response?.data || error.message,
      );

      // Return the error response data for proper error handling
      if (error.response?.data) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({
        message: error.message || "Registration failed",
      });
    }
  },
);

interface AuthState {
  token: string | null | undefined;
  userData: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: typeof window !== "undefined" ? Cookies.get("token") : null,
  userData: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    clearData: function (state) {
      state.token = null;
      state.userData = null;
      state.isLoading = false;
      state.error = null;
      if (typeof window !== "undefined") {
        Cookies.remove("token");
      }
    },
    clearError: function (state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder.addCase(handleLogin.pending, function (state) {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(handleLogin.fulfilled, function (state, action) {
      console.log("Login successful:", action.payload);
      state.isLoading = false;
      state.error = null;

      if (action.payload.message === "success" && action.payload.token) {
        state.token = action.payload.token;
        state.userData = action.payload.user;
        if (typeof window !== "undefined") {
          localStorage.setItem("token", action.payload.token);
        }
      } else {
        state.error = action.payload.message || "Login failed";
      }
    });

    builder.addCase(handleLogin.rejected, function (state, action) {
      console.error("Login failed:", action.payload);
      state.isLoading = false;
      state.token = null;
      state.userData = null;
      state.error = (action.payload as any)?.message || "Login failed";
    });

    // Register cases
    builder.addCase(handleRegister.pending, function (state) {
      console.log("Registration starting...");
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(handleRegister.fulfilled, function (state, action) {
      console.log("Registration response:", action.payload);
      state.isLoading = false;
      state.error = null;

      // Check if registration was successful
      if (action.payload.message === "success") {
        // Don't automatically log in after registration
        // Let the user go to login page
        console.log("Registration successful");
      } else {
        state.error = action.payload.message || "Registration failed";
      }
    });

    builder.addCase(handleRegister.rejected, function (state, action) {
      console.error("Registration failed:", action.payload);
      state.isLoading = false;
      state.token = null;
      state.userData = null;
      state.error = (action.payload as any)?.message || "Registration failed";
    });
  },
});

export const { clearData, clearError } = authSlice.actions;
export const authReducer = authSlice.reducer;
