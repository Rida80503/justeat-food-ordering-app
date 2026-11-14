/**
 * CartPage
 *
 * Responsibility:
 * ----------------
 * This page manages the customer's shopping cart.
 *
 * Features:
 * - Fetches the current cart from the backend.
 * - Displays all cart items.
 * - Allows increasing/decreasing quantity.
 * - Removes individual items.
 * - Clears the entire cart.
 * - Accepts special delivery instructions.
 * - Performs checkout.
 * - Displays an order success screen after checkout.
 *
 * This page does NOT directly communicate with the backend.
 * It communicates through Redux (cartSlice), which calls the backend APIs.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  fetchCart,
  removeFromCart,
  clearCartAPI,
  checkoutCart,
  updateCartItem,
  clearLastOrder,
} from "../store/slices/cartSlice";

function CartSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="h-16 w-16 rounded-lg bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 rounded bg-gray-200" />
            <div className="h-3 w-1/4 rounded bg-gray-200" />
          </div>
          <div className="h-8 w-20 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

function OrderSuccess({ order, onDismiss }) {
  const navigate = useNavigate();
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm text-center space-y-4">
      <div className="text-6xl">🎉</div>
      <h2 className="text-2xl font-bold text-gray-800">Order Placed!</h2>
      <p className="text-gray-600">
        Your order <span className="font-semibold text-orange-600">#{order.order_id}</span> has been
        placed successfully.
      </p>
      <p className="text-lg font-bold text-gray-800">
        Total: ${parseFloat(order.total_amount).toFixed(2)}
      </p>
      <div className="flex justify-center gap-3 pt-2">
        <button
          onClick={() => navigate("/orders")}
          className="rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white hover:bg-orange-600 transition"
        >
          Track Order
        </button>
        <button
          onClick={onDismiss}
          className="rounded-lg border border-gray-200 px-5 py-2.5 font-semibold text-gray-600 hover:bg-gray-50 transition"
        >
          Order More
        </button>
      </div>
    </div>
  );
}

export default function CartPage() {
  const dispatch = useDispatch();
  const { items, total_price, restaurant_id, loading, checkoutLoading, lastOrder } = useSelector(
    (state) => state.cart
  );
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // If we just completed an order, show success
  if (lastOrder) {
    return (
      <div className="mx-auto mt-10 w-full max-w-lg px-3">
        <OrderSuccess order={lastOrder} onDismiss={() => dispatch(clearLastOrder())} />
      </div>
    );
  }

  const handleIncrease = async (item) => {
    const result = await dispatch(updateCartItem({ menu_id: item.menu_id, quantity: item.quantity + 1 }));
    if (!updateCartItem.fulfilled.match(result)) toast.error(result.payload || "Failed to update");
  };

  const handleDecrease = async (item) => {
    if (item.quantity === 1) {
      const result = await dispatch(removeFromCart(item.menu_id));
      if (removeFromCart.fulfilled.match(result)) toast.success("Item removed");
      else toast.error(result.payload || "Failed to remove");
    } else {
      const result = await dispatch(updateCartItem({ menu_id: item.menu_id, quantity: item.quantity - 1 }));
      if (!updateCartItem.fulfilled.match(result)) toast.error(result.payload || "Failed to update");
    }
  };

  const handleRemove = async (item) => {
    const result = await dispatch(removeFromCart(item.menu_id));
    if (removeFromCart.fulfilled.match(result)) toast.success(`${item.item_name} removed`);
    else toast.error(result.payload || "Failed to remove");
  };

  const handleClearCart = async () => {
    const result = await dispatch(clearCartAPI());
    if (clearCartAPI.fulfilled.match(result)) toast.success("Cart cleared");
    else toast.error(result.payload || "Failed to clear cart");
  };

  const handleCheckout = async () => {
    if (!items.length) { toast.error("Your cart is empty"); return; }
    const result = await dispatch(checkoutCart({ restaurant_id, special_instructions: instructions }));
    if (checkoutCart.fulfilled.match(result)) {
      toast.success("Order placed successfully!");
      setInstructions("");
    } else {
      toast.error(result.payload || "Checkout failed");
    }
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
        </div>
        <CartSkeleton />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">🛒 Your Cart</h1>
          <p className="mt-1 text-sm text-gray-500">{items.length} item{items.length !== 1 ? "s" : ""} in cart</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClearCart}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            Clear Cart
          </button>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
          <p className="text-5xl">🛒</p>
          <p className="mt-4 text-xl font-semibold text-gray-700">Your cart is empty</p>
          <p className="mt-2 text-sm text-gray-500">Browse restaurants to add items.</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white hover:bg-orange-600 transition"
          >
            Browse Restaurants
          </Link>
        </div>
      )}

      {/* Cart content */}
      {items.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Items list */}
          <div className="space-y-3 lg:col-span-2">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4">
                {/* Icon placeholder */}
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50 text-2xl">
                  🍽️
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-800">{item.item_name}</p>
                  <p className="text-sm font-medium text-orange-600">${parseFloat(item.price).toFixed(2)} each</p>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  {/* Qty controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecrease(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-600 transition hover:bg-red-100 hover:text-red-600"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-bold text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => handleIncrease(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-600 transition hover:bg-green-100 hover:text-green-600"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span className="w-16 text-right font-bold text-gray-800">
                    ${parseFloat(item.subtotal).toFixed(2)}
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(item)}
                    className="ml-1 rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-gray-800">Order Summary</h2>

              <div className="space-y-2 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-600">
                    <span className="truncate mr-2">{item.item_name} ×{item.quantity}</span>
                    <span>${parseFloat(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-1">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>${parseFloat(total_price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery fee</span>
                  <span className="text-green-600">Calculated at checkout</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 text-base pt-1">
                  <span>Total</span>
                  <span>${parseFloat(total_price).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Special instructions */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Allergies, preferences, delivery notes…"
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              />
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full rounded-xl bg-orange-500 py-3.5 font-bold text-white text-base hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? "Placing Order…" : "Place Order →"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
