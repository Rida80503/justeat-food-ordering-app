import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../utils/api";

export const fetchRecommendations = createAsyncThunk(
  "recommendations/fetchRecommendations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/recommendations");
      return response.data.data.recommendations || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Could not load recommendations"
      );
    }
  }
);

export const fetchCuisineRecommendations = createAsyncThunk(
  "recommendations/fetchCuisineRecommendations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/recommendations/cuisines");
      return response.data.data.recommendations || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Could not load cuisine recommendations"
      );
    }
  }
);

const recommendationSlice = createSlice({
  name: "recommendations",
  initialState: {
    recommendations: [],
    cuisineRecommendations: [],
    loading: false,
    cuisineLoading: false,
    error: null,
    cuisineError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCuisineRecommendations.pending, (state) => {
        state.cuisineLoading = true;
        state.cuisineError = null;
      })
      .addCase(fetchCuisineRecommendations.fulfilled, (state, action) => {
        state.cuisineLoading = false;
        state.cuisineRecommendations = action.payload;
      })
      .addCase(fetchCuisineRecommendations.rejected, (state, action) => {
        state.cuisineLoading = false;
        state.cuisineError = action.payload;
      });
  },
});

export default recommendationSlice.reducer;