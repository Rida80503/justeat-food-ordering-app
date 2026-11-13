
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
// Registration
// ============================

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", {
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        password: payload.password,
        confirm_password: payload.confirm_password,
        role: payload.role,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Registration failed"
      );
    }
  }
);

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

      const response = await api.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return response.data;
    } catch (error) {
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
        error.response?.data?.detail ||
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
    registrationLoading: false,
    registrationError: null,
    registrationMessage: null,
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

    clearRegistrationState: (state) => {
      state.registrationError = null;
      state.registrationMessage = null;
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ===========================
      // Registration
      // ===========================

      .addCase(registerUser.pending, (state) => {
        state.registrationLoading = true;
        state.registrationError = null;
        state.registrationMessage = null;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.registrationLoading = false;
        state.registrationError = null;
        state.registrationMessage = action.payload.message;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.registrationLoading = false;
        state.registrationError = action.payload;
      })

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
        state.error = null;
      })

      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===========================
      // Complete Password Reset
      // ===========================

      .addCase(completePasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
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

export const {
  logout,
  clearRegistrationState,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
