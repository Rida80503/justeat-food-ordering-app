import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../store/slices/ordersSlice";
import OrderCard from "../components/OrderCard";

/**
 * Available order status tabs.
 */
const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Active", value: "ACTIVE" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

/**
 * Collection of statuses that
 * represent active orders.
 */
const ACTIVE_STATUSES = new Set([
  "CONFIRMED",
  "PREPARING",
  "READY",
]);

/**
 * OrdersSkeleton Component
 *
 * Displays loading placeholders while
 * order data is being fetched.
 *
 * @returns {JSX.Element} Loading skeleton.
 */
function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl bg-white p-5 shadow-sm"
        >
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-5 w-32 rounded bg-gray-200" />
              <div className="h-4 w-48 rounded bg-gray-200" />
            </div>

            <div className="h-7 w-20 rounded bg-gray-200" />
          </div>

          <div className="mt-4 flex justify-between">
            {[1, 2, 3, 4, 5].map((j) => (
              <div
                key={j}
                className="flex flex-col items-center gap-1"
              >
                <div className="h-7 w-7 rounded-full bg-gray-200" />
                <div className="h-3 w-12 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * OrdersPage Component
 *
 * Displays all customer orders.
 *
 * Features:
 * - Fetches orders from Redux.
 * - Search by order ID or restaurant.
 * - Filter by order status.
 * - Sort orders by date.
 * - Displays loading skeleton.
 * - Displays empty and error states.
 *
 * @returns {JSX.Element} Orders page.
 */
export default function OrdersPage() {

  // Redux dispatch function
  const dispatch = useDispatch();

  /**
   * Orders state from Redux.
   *
   * list -> Order list
   * loading -> Loading state
   * error -> API error
   */
  const { list, loading, error } = useSelector(
    (state) => state.orders
  );

  // Search keyword
  const [search, setSearch] = useState("");

  // Selected status tab
  const [statusTab, setStatusTab] = useState("");

  // Sorting order
  const [sortOrder, setSortOrder] = useState("newest");

  /**
   * Fetch customer orders when
   * the component is mounted.
   */
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  /**
   * Filters and sorts orders.
   *
   * Uses useMemo to avoid unnecessary
   * recalculations on every render.
   */
  const filtered = useMemo(() => {
    let result = [...list];

    // Filter by status
    if (statusTab === "ACTIVE") {
      result = result.filter((o) =>
        ACTIVE_STATUSES.has(o.status)
      );
    } else if (statusTab) {
      result = result.filter(
        (o) => o.status === statusTab
      );
    }

    // Filter by search keyword
    if (search.trim()) {
      const q = search.trim().toLowerCase();

      result = result.filter(
        (o) =>
          String(o.id).includes(q) ||
          (o.restaurant_name || "")
            .toLowerCase()
            .includes(q)
      );
    }

    // Sort orders by date
    result.sort((a, b) => {
      const diff =
        new Date(b.created_at) -
        new Date(a.created_at);

      return sortOrder === "newest"
        ? diff
        : -diff;
    });

    return result;
  }, [list, statusTab, search, sortOrder]);

  return (
    <section className="space-y-6">

      {/* ==========================
          Page Header
      ========================== */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">

        <h1 className="text-3xl font-bold text-gray-800">
          📦 My Orders
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {list.length} order
          {list.length !== 1 ? "s" : ""} total
        </p>

      </div>

      {/* ==========================
          Search & Sort Controls
      ========================== */}
      <div className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm">

        {/* Search Box */}
        <div className="relative flex-1 min-w-[200px]">

          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            🔍
          </span>

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search by order ID or restaurant…"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />

        </div>

        {/* Sort Dropdown */}
        <select
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(e.target.value)
          }
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <option value="newest">
            Newest First
          </option>

          <option value="oldest">
            Oldest First
          </option>
        </select>

      </div>

      {/* ==========================
          Status Filter Tabs
      ========================== */}
      <div className="flex flex-wrap gap-2">

        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() =>
              setStatusTab(tab.value)
            }
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              statusTab === tab.value
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-600"
            }`}
          >
            {tab.label}

            {/* Total Orders Badge */}
            {tab.value === "" &&
              list.length > 0 && (
                <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-xs">
                  {list.length}
                </span>
              )}
          </button>
        ))}

      </div>

      {/* ==========================
          Error Message
      ========================== */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-red-600">

          <p>{error}</p>

          {/* Reload Orders */}
          <button
            onClick={() =>
              dispatch(fetchOrders())
            }
            className="mt-2 rounded-lg bg-red-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-600 transition"
          >
            Retry
          </button>

        </div>
      )}

      {/* Loading Skeleton */}
      {loading && <OrdersSkeleton />}

      {/* ==========================
          Empty State
      ========================== */}
      {!loading &&
        !error &&
        filtered.length === 0 && (
          <div className="rounded-2xl bg-white py-16 text-center shadow-sm">

            <p className="text-5xl">📦</p>

            <p className="mt-4 text-xl font-semibold text-gray-700">
              {list.length === 0
                ? "No orders yet"
                : "No orders match your filter"}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              {list.length === 0
                ? "Start ordering from your favourite restaurants."
                : "Try a different status or clear your search."}
            </p>

            {/* Clear Filters */}
            {search || statusTab ? (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusTab("");
                }}
                className="mt-5 rounded-lg bg-orange-500 px-5 py-2 font-semibold text-white hover:bg-orange-600 transition"
              >
                Clear Filters
              </button>
            ) : null}

          </div>
        )}

      {/* ==========================
          Orders List
      ========================== */}
      {!loading &&
        filtered.length > 0 && (
          <div className="space-y-4">

            {filtered.map((order) => (
              // Individual Order Card
              <OrderCard
                key={order.id}
                order={order}
              />
            ))}

          </div>
        )}

    </section>
  );
}