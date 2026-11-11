import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../utils/api";

const toList = (values = []) =>
  values.map((v) =>
    typeof v === "string"
      ? { id: null, value: v }
      : { id: v.id, value: v.value ?? v.dietary_restriction ?? v.favorite_cuisine }
  );

export const fetchPreferences = createAsyncThunk(
  "preferences/fetchPreferences",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/preferences");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Could not load preferences");
    }
  }
);

export const savePreferences = createAsyncThunk(
  "preferences/savePreferences",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/preferences", payload);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Could not save preferences");
    }
  }
);

export const addDietaryRestriction = createAsyncThunk(
  "preferences/addDietaryRestriction",
  async ({ dietary_restriction }, { dispatch, rejectWithValue }) => {
    try {
      await api.post("/preferences/dietary", { dietary_restriction });
      // Re-fetch to get correct generated IDs
      const response = await api.get("/preferences");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Could not add dietary restriction");
    }
  }
);

export const removeDietaryRestriction = createAsyncThunk(
  "preferences/removeDietaryRestriction",
  async (preference_id, { rejectWithValue }) => {
    try {
      await api.delete(`/preferences/dietary/${preference_id}`);
      // Re-fetch to get updated IDs
      const response = await api.get("/preferences");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Could not remove dietary restriction");
    }
  }
);

export const addFavoriteCuisine = createAsyncThunk(
  "preferences/addFavoriteCuisine",
  async ({ favorite_cuisine }, { rejectWithValue }) => {
    try {
      await api.post("/preferences/cuisine", { favorite_cuisine });
      // Re-fetch to get correct generated IDs
      const response = await api.get("/preferences");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Could not add favorite cuisine");
    }
  }
);

export const removeFavoriteCuisine = createAsyncThunk(
  "preferences/removeFavoriteCuisine",
  async (preference_id, { rejectWithValue }) => {
    try {
      await api.delete(`/preferences/cuisine/${preference_id}`);
      // Re-fetch to get updated IDs
      const response = await api.get("/preferences");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Could not remove favorite cuisine");
    }
  }
);

const preferenceSlice = createSlice({
  name: "preferences",
  initialState: {
    dietaryRestrictions: [],
    favoriteCuisines: [],
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPreferences.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPreferences.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.dietaryRestrictions = toList(payload.dietary_restrictions || []);
        state.favoriteCuisines = toList(payload.favorite_cuisines || []);
      })
      .addCase(fetchPreferences.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      // add/remove dietary & cuisine all return full preferences payload now
      .addCase(addDietaryRestriction.pending, (state) => { state.saving = true; })
      .addCase(addDietaryRestriction.fulfilled, (state, { payload }) => {
        state.saving = false;
        state.dietaryRestrictions = toList(payload.dietary_restrictions || []);
        state.favoriteCuisines = toList(payload.favorite_cuisines || []);
      })
      .addCase(addDietaryRestriction.rejected, (state, { payload }) => { state.saving = false; state.error = payload; })
      .addCase(removeDietaryRestriction.pending, (state) => { state.saving = true; })
      .addCase(removeDietaryRestriction.fulfilled, (state, { payload }) => {
        state.saving = false;
        state.dietaryRestrictions = toList(payload.dietary_restrictions || []);
        state.favoriteCuisines = toList(payload.favorite_cuisines || []);
      })
      .addCase(removeDietaryRestriction.rejected, (state, { payload }) => { state.saving = false; state.error = payload; })
      .addCase(addFavoriteCuisine.pending, (state) => { state.saving = true; })
      .addCase(addFavoriteCuisine.fulfilled, (state, { payload }) => {
        state.saving = false;
        state.dietaryRestrictions = toList(payload.dietary_restrictions || []);
        state.favoriteCuisines = toList(payload.favorite_cuisines || []);
      })
      .addCase(addFavoriteCuisine.rejected, (state, { payload }) => { state.saving = false; state.error = payload; })
      .addCase(removeFavoriteCuisine.pending, (state) => { state.saving = true; })
      .addCase(removeFavoriteCuisine.fulfilled, (state, { payload }) => {
        state.saving = false;
        state.dietaryRestrictions = toList(payload.dietary_restrictions || []);
        state.favoriteCuisines = toList(payload.favorite_cuisines || []);
      })
      .addCase(removeFavoriteCuisine.rejected, (state, { payload }) => { state.saving = false; state.error = payload; });
  },
});

export default preferenceSlice.reducer;
