import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../utils/api";

/**
 * Fetch all favorite restaurants of the logged-in user.
 *
 * API:
 * GET /favorites
 *
 * Returns:
 * [
 *   { favorite1 },
 *   { favorite2 },
 *   ...
 * ]
 */
export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/favorites");

      // Return favorites array
      return response.data.data.favorites || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ||
        "Could not load favorites"
      );
    }
  }
);

/**
 * Add or Remove a restaurant from favorites.
 *
 * APIs:
 *
 * POST /favorites/:restaurant_id
 *   -> Adds restaurant to favorites.
 *
 * DELETE /favorites/:restaurant_id
 *   -> Removes restaurant from favorites.
 *
 * Payload:
 * {
 *   restaurant_id,
 *   isFavorite
 * }
 */
export const toggleFavorite = createAsyncThunk(
  "favorites/toggleFavorite",
  async ({ restaurant_id, isFavorite }, { rejectWithValue }) => {
    try {

      /**
       * If restaurant is already a favorite,
       * remove it.
       */
      if (isFavorite) {
        await api.delete(`/favorites/${restaurant_id}`);

        return {
          restaurant_id,
          removed: true,
        };
      }

      /**
       * Otherwise add it to favorites.
       */
      const response = await api.post(
        `/favorites/${restaurant_id}`
      );

      return {
        favorite: response.data.data,
        removed: false,
      };

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail ||
        "Could not update favorites"
      );
    }
  }
);

/**
 * Redux Slice for Favorite Restaurants.
 *
 * Stores:
 * - Favorite Restaurants
 * - Loading State
 * - Saving State
 * - Error Messages
 */
const favoriteSlice = createSlice({
  name: "favorites",

  /**
   * Initial Redux State
   */
  initialState: {
    favorites: [],
    loading: false,
    saving: false,
    error: null,
  },

  /**
   * No synchronous reducers.
   * All updates happen through async thunks.
   */
  reducers: {},

  /**
   * Handles lifecycle actions of async thunks.
   */
  extraReducers: (builder) => {
    builder

      /**
       * Fetch Favorites Started
       */
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      /**
       * Favorites Loaded Successfully
       */
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
      })

      /**
       * Failed to Load Favorites
       */
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /**
       * Add/Remove Favorite Started
       */
      .addCase(toggleFavorite.pending, (state) => {
        state.saving = true;
        state.error = null;
      })

      /**
       * Favorite Updated Successfully
       */
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.saving = false;

        /**
         * Remove restaurant from favorites
         */
        if (action.payload.removed) {
          state.favorites = state.favorites.filter(
            (favorite) =>
              favorite.restaurant_id !==
              action.payload.restaurant_id
          );
        }

        /**
         * Add restaurant to favorites
         */
        else if (action.payload.favorite) {
          state.favorites = [
            ...state.favorites,
            action.payload.favorite,
          ];
        }
      })

      /**
       * Failed to Update Favorites
       */
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

/**
 * Export Reducer
 */
export default favoriteSlice.reducer;