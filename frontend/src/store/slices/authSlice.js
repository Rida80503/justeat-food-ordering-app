import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../utils/api";

// ============================
// Initial State
// ============================

const initialToken = localStorage.getItem("access_token");

let initialUser = null;

try {
  const storedUser = localStorage.getItem("user");
  initialUser = storedUser ? JSON.parse(storedUser) : null;
} catch (error) {
  initialUser = null;
}

// ============================
// Login
// ============================

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload, { rejectWithValue }) => {
    try {
      const formData = new URLSearchParams();

      formData.append("username", payload.email);
      formData.append("password", payload.password);
      formData.append("scope", "");
      formData.append("client_id", "");
      formData.append("client_secret", "");
      formData.append("grant_type", "");

      console.log("Sending:", formData.toString());

      const response = await api.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
  },
});

console.log("Full Response:", JSON.stringify(response.data, null, 2));

return response.data;
    } catch (error) {
      console.log("Error Response:", error.response);
      console.log("Error Data:", error.response?.data);

      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Login failed"
      );
    }
  }
);

// ============================
// Forgot Password
// ============================

export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/password-reset-request", {
        email,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.detail ||
          "Failed to send reset token"
      );
    }
  }
);

export const completePasswordReset = createAsyncThunk(
  "auth/completePasswordReset",
  async ({ reset_token, new_password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/password-reset-complete", {
        reset_token,
        new_password,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Password reset failed"
      );
    }
  }
);

// ============================
// Slice
// ============================

const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: initialUser,
    accessToken: initialToken,
    loading: false,
    error: null,
    isAuthenticated: !!initialToken,
  },

  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;

      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    },
  },

  extraReducers: (builder) => {
    builder

      // ===========================
      // Login
      // ===========================

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        state.user = action.payload.data.user;
        state.accessToken = action.payload.data.access_token;
        state.isAuthenticated = true;

        localStorage.setItem(
          "access_token",
          action.payload.data.access_token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(action.payload.data.user)
        );
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===========================
      // Forgot Password
      // ===========================

      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
      })

      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(completePasswordReset.pending, (state) => {
        state.loading = true;
      })

      .addCase(completePasswordReset.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(completePasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;