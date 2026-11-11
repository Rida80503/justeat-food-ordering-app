import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../utils/api";

export const fetchRestaurants = createAsyncThunk(
  "restaurants/fetchRestaurants",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/restaurants", { params });
      return { data: response.data.data, params };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Could not load restaurants"
      );
    }
  }
);

const restaurantSlice = createSlice({
  name: "restaurants",
  initialState: {
    items: [],
    total: 0,
    page: 1,
    page_size: 9,
    cuisines: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        const { data, params } = action.payload;
        state.loading = false;
        state.items = data.restaurants || [];
        state.total = data.total || 0;
        state.page = data.page || 1;
        state.page_size = data.page_size || 9;

        // Populate cuisine list from an unfiltered fetch
        if (!params.cuisine && !params.search && !params.location) {
          const seen = new Set();
          const extracted = (data.restaurants || [])
            .map((r) => r.cuisine_type)
            .filter((c) => c && !seen.has(c) && seen.add(c));
          if (extracted.length > 0) {
            state.cuisines = extracted;
          }
        }
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default restaurantSlice.reducer;
