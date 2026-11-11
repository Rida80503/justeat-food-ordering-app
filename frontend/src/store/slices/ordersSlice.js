import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../utils/api";

/**
 * Fetch all orders for the current user.
 *
 * API: GET /orders?limit=100
 *
 * Returns:
 * - Array of order objects.
 *
 * Rejects with:
 * - Error message returned by the API.
 */
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/orders", { params: { limit: 100 } });
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

/**
 * Fetch detailed information for a specific order.
 *
 * API: GET /orders/{order_id}
 *
 * @param {number|string} order_id - Unique identifier of the order.
 *
 * Returns:
 * {
 *   order_id,
 *   data: OrderDetailResponse
 * }
 *
 * Rejects with:
 * - Error message returned by the API.
 */
export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchOrderDetails",
  async (order_id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${order_id}`);
      return {
        order_id,
        data: response.data.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch order details"
      );
    }
  }
);

/**
 * Cancel an existing order.
 *
 * API: POST /orders/{order_id}/cancel
 *
 * @param {number|string} order_id - ID of the order to cancel.
 *
 * Returns:
 * - Updated order object after cancellation.
 *
 * Rejects with:
 * - Error message returned by the API.
 */
export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async (order_id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/orders/${order_id}/cancel`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel order"
      );
    }
  }
);

/**
 * Redux slice responsible for order management.
 *
 * State Structure:
 * {
 *   list: Order[],
 *   details: {
 *     OrderDetailResponse
 *   },
 *   detailsLoading: {
 *     boolean
 *   },
 *   loading: boolean,
 *   error: string | null
 * }
 */
const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    /** List of all orders */
    list: [],

    /** Cached order details keyed by order ID */
    details: {},

    /** Loading state for individual order details */
    detailsLoading: {},

    /** Global loading state for order list */
    loading: false,

    /** Stores API error messages */
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      /**
       * Fetch Orders
       */
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.list = payload;
      })
      .addCase(fetchOrders.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      /**
       * Fetch Order Details
       */
      .addCase(fetchOrderDetails.pending, (state, { meta }) => {
        state.detailsLoading[meta.arg] = true;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, { payload }) => {
        state.detailsLoading[payload.order_id] = false;
        state.details[payload.order_id] = payload.data;
      })
      .addCase(fetchOrderDetails.rejected, (state, { meta }) => {
        state.detailsLoading[meta.arg] = false;
      })

      /**
       * Cancel Order
       * Updates the corresponding order in the list
       * with the latest server response.
       */
      .addCase(cancelOrder.fulfilled, (state, { payload }) => {
        const idx = state.list.findIndex((o) => o.id === payload.id);

        if (idx !== -1) {
          state.list[idx] = payload;
        }
      });
  },
});

export default ordersSlice.reducer;