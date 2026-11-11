import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../utils/api";

/**
 * Fetch the current user's cart from the backend.
 *
 * API:
 * GET /cart
 *
 * Returns:
 * - Cart items
 * - Restaurant ID
 * - Total cart price
 */
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/cart");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to fetch cart"
      );
    }
  }
);

/**
 * Add a menu item to the cart.
 *
 * API:
 * POST /cart/items
 *
 * Payload:
 * {
 *   menu_id,
 *   restaurant_id,
 *   quantity
 * }
 */
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ menu_id, restaurant_id, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.post("/cart/items", {
        menu_id,
        restaurant_id,
        quantity,
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to add item"
      );
    }
  }
);

/**
 * Update the quantity of an existing cart item.
 *
 * API:
 * PUT /cart/items/:menu_id
 *
 * Payload:
 * {
 *   menu_id,
 *   quantity
 * }
 */
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ menu_id, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/cart/items/${menu_id}`,
        { quantity }
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to update cart"
      );
    }
  }
);

/**
 * Remove a menu item from the cart.
 *
 * API:
 * DELETE /cart/items/:menu_id
 */
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (menu_id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/cart/items/${menu_id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to remove item"
      );
    }
  }
);

/**
 * Remove all items from the cart.
 *
 * API:
 * DELETE /cart
 */
export const clearCartAPI = createAsyncThunk(
  "cart/clearCartAPI",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete("/cart");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to clear cart"
      );
    }
  }
);

/**
 * Checkout the current cart and create an order.
 *
 * API:
 * POST /cart/checkout
 *
 * Query Parameters:
 * - restaurant_id
 * - special_instructions (optional)
 */
export const checkoutCart = createAsyncThunk(
  "cart/checkoutCart",
  async ({ restaurant_id, special_instructions }, { rejectWithValue }) => {
    try {
      // Create URL query parameters
      const params = new URLSearchParams({
        restaurant_id,
      });

      // Add optional special instructions
      if (special_instructions) {
        params.append(
          "special_instructions",
          special_instructions
        );
      }

      const response = await api.post(
        `/cart/checkout?${params.toString()}`
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to checkout cart"
      );
    }
  }
);

/**
 * Represents an empty cart.
 */
const emptyCart = {
  items: [],
  restaurant_id: null,
  total_price: 0,
};

/**
 * Redux slice responsible for managing
 * all shopping cart related state.
 */
const cartSlice = createSlice({
  name: "cart",

  /**
   * Initial Redux State
   */
  initialState: {
    ...emptyCart,
    loading: false,
    checkoutLoading: false,
    error: null,
    lastOrder: null,
  },

  reducers: {
    /**
     * Clear the last successful order.
     */
    clearLastOrder: (state) => {
      state.lastOrder = null;
    },

    /**
     * Clear cart only from Redux state.
     * Does NOT call backend.
     */
    clearCartLocal: (state) => {
      state.items = [];
      state.restaurant_id = null;
      state.total_price = 0;
    },
  },

  extraReducers: (builder) => {
    builder

      /**
       * Fetch Cart
       */

      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchCart.fulfilled, (state, { payload }) => {
        state.loading = false;

        state.items = payload.items || [];
        state.restaurant_id = payload.restaurant_id;
        state.total_price = payload.total_price || 0;
      })

      .addCase(fetchCart.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      /**
       * Checkout Cart
       */

      .addCase(checkoutCart.pending, (state) => {
        state.checkoutLoading = true;
        state.error = null;
      })

      .addCase(checkoutCart.fulfilled, (state, { payload }) => {
        state.checkoutLoading = false;

        state.lastOrder = payload;

        // Empty the cart after successful checkout
        state.items = [];
        state.restaurant_id = null;
        state.total_price = 0;
      })

      .addCase(checkoutCart.rejected, (state, { payload }) => {
        state.checkoutLoading = false;
        state.error = payload;
      })

      /**
       * Shared Success Handler
       *
       * Whenever add, update, remove or clear
       * operations succeed, update the Redux
       * cart with the latest backend response.
       */
      .addMatcher(
        (action) =>
          [
            addToCart.fulfilled.type,
            updateCartItem.fulfilled.type,
            removeFromCart.fulfilled.type,
            clearCartAPI.fulfilled.type,
          ].includes(action.type),

        (state, { payload }) => {
          state.items = payload.items || [];
          state.restaurant_id = payload.restaurant_id;
          state.total_price = payload.total_price || 0;
        }
      );
  },
});

/**
 * Export Redux Actions
 */
export const {
  clearLastOrder,
  clearCartLocal,
} = cartSlice.actions;

/**
 * Export Reducer
 */
export default cartSlice.reducer;