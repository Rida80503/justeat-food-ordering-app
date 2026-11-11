import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { toast } from "react-toastify";

/**
 * RestaurantSkeleton Component
 *
 * Displays loading placeholder cards while
 * restaurant data is being fetched.
 *
 * @returns {JSX.Element} Loading skeleton.
 */
function RestaurantSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-48 rounded-2xl bg-gray-200"
        />
      ))}
    </div>
  );
}

/**
 * MyRestaurantsPage Component
 *
 * Displays all restaurants owned by
 * the logged-in restaurant owner.
 *
 * Features:
 * - Fetches owner's restaurants.
 * - Displays restaurant details.
 * - Shows loading skeleton.
 * - Displays empty state.
 * - Navigate to Create Restaurant page.
 * - Navigate to Edit Restaurant page.
 * - Navigate to Menu Management page.
 *
 * @returns {JSX.Element} My Restaurants page.
 */
export default function MyRestaurantsPage() {
  // Stores owner's restaurants
  const [restaurants, setRestaurants] = useState([]);

  // Indicates restaurant loading state
  const [loading, setLoading] = useState(false);

  /**
   * Fetch all restaurants when
   * the component is mounted.
   */
  useEffect(() => {
    // Enable loading state
    setLoading(true);

    /**
     * Fetch restaurants owned by
     * the logged-in user.
     */
    api
      .get("/restaurants/my/restaurants")

      // Save restaurant data
      .then((res) =>
        setRestaurants(res.data.data || [])
      )

      // Display error notification
      .catch(() =>
        toast.error("Failed to load your restaurants")
      )

      // Disable loading state
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-6">

      {/* ==========================
          Page Header
      ========================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-6 shadow-sm">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            🏪 My Restaurants
          </h1>

          <p className="mt-1 text-gray-500">
            {loading
              ? "Loading…"
              : `${restaurants.length} restaurant${
                  restaurants.length !== 1 ? "s" : ""
                } registered`}
          </p>
        </div>

        {/* Create Restaurant */}
        <Link
          to="/create-restaurant"
          className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600 transition"
        >
          + Add Restaurant
        </Link>

      </div>

      {/* Loading Skeleton */}
      {loading && <RestaurantSkeleton />}

      {/* ==========================
          Empty State
      ========================== */}
      {!loading && restaurants.length === 0 && (
        <div className="rounded-2xl bg-white py-16 text-center shadow-sm">

          <p className="text-5xl">🏪</p>

          <p className="mt-4 text-xl font-semibold text-gray-700">
            No restaurants yet
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Create your first restaurant to start
            receiving orders.
          </p>

          {/* Navigate to Create Restaurant */}
          <Link
            to="/create-restaurant"
            className="mt-6 inline-block rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white hover:bg-orange-600 transition"
          >
            Create Restaurant
          </Link>

        </div>
      )}

      {/* ==========================
          Restaurant Cards
      ========================== */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {restaurants.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl bg-white p-5 shadow-sm flex flex-col gap-3 border border-transparent hover:border-orange-100 transition"
          >

            {/* Restaurant Information */}
            <div>

              <div className="flex items-start justify-between gap-2">

                {/* Restaurant Name */}
                <h2 className="text-lg font-bold text-gray-800 leading-tight">
                  {r.name}
                </h2>

                {/* Restaurant Status */}
                <span
                  className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    r.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {r.is_active
                    ? "Active"
                    : "Inactive"}
                </span>

              </div>

              {/* Cuisine Type */}
              {r.cuisine_type && (
                <p className="mt-1 text-sm text-gray-500">
                  {r.cuisine_type}
                </p>
              )}

              {/* Restaurant Address */}
              {r.address && (
                <p className="mt-0.5 text-xs text-gray-400 truncate">
                  {r.address}, {r.city}
                </p>
              )}

            </div>

            {/* Restaurant Details */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">

              {/* Average Rating */}
              {r.average_rating > 0 && (
                <span className="flex items-center gap-1 text-yellow-600">
                  ⭐{" "}
                  {parseFloat(r.average_rating).toFixed(1)}
                </span>
              )}

              {/* Delivery Time */}
              <span>
                🕐 {r.delivery_time_minutes} min
              </span>

              {/* Delivery Fee */}
              <span>
                {parseFloat(r.delivery_fee) === 0
                  ? "Free delivery"
                  : `$${parseFloat(
                      r.delivery_fee
                    ).toFixed(2)} fee`}
              </span>

            </div>

            {/* ==========================
                Action Buttons
            ========================== */}
            <div className="mt-auto grid grid-cols-2 gap-2">

              {/* Edit Restaurant */}
              <Link
                to={`/edit-restaurant/${r.id}`}
                className="rounded-lg border border-orange-400 px-3 py-2 text-center text-sm font-semibold text-orange-600 hover:bg-orange-50 transition"
              >
                Edit
              </Link>

              {/* Manage Menu */}
              <Link
                to="/menu-management"
                className="rounded-lg bg-orange-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-orange-600 transition"
              >
                Menu
              </Link>

            </div>

          </div>
        ))}

      </div>
    </section>
  );
}