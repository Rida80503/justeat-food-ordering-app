import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchFavorites,
  toggleFavorite,
} from "../store/slices/favoriteSlice";

/**
 * FavoritesSkeleton Component
 *
 * Displays placeholder cards while the
 * favorite restaurants are being loaded.
 *
 * @returns {JSX.Element} Loading skeleton UI.
 */
function FavoritesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl bg-white p-5 shadow-sm"
        >
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-5 w-36 rounded bg-gray-200" />
              <div className="h-4 w-24 rounded bg-gray-200" />
            </div>

            <div className="h-8 w-16 rounded bg-gray-200" />
          </div>

          <div className="mt-4 flex justify-between">
            <div className="h-6 w-24 rounded-full bg-gray-200" />
            <div className="h-6 w-28 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * FavoritesPage Component
 *
 * Displays all restaurants saved by the user.
 *
 * Features:
 * - Fetches favorite restaurants from Redux.
 * - Shows loading skeleton while fetching.
 * - Displays an empty state if no favorites exist.
 * - Allows removing restaurants from favorites.
 * - Provides navigation to restaurant details.
 *
 * @returns {JSX.Element} Favorites page.
 */
export default function FavoritesPage() {
  // Redux dispatch function
  const dispatch = useDispatch();

  /**
   * Extract favorites state from Redux store.
   *
   * favorites -> Saved restaurants list
   * loading -> Loading indicator
   * error -> API error message
   * saving -> Remove favorite request status
   */
  const {
    favorites,
    loading,
    error,
    saving,
  } = useSelector((state) => state.favorites);

  /**
   * Fetch favorite restaurants
   * when the component loads.
   */
  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  /**
   * Removes a restaurant from favorites.
   *
   * Steps:
   * 1. Dispatch Redux async action.
   * 2. Show success notification.
   * 3. Show error if removal fails.
   *
   * @param {number} restaurantId - Restaurant ID.
   * @param {string} name - Restaurant name.
   */
  const handleRemove = async (restaurantId, name) => {
    const result = await dispatch(
      toggleFavorite({
        restaurant_id: restaurantId,
        isFavorite: true,
      })
    );

    if (toggleFavorite.fulfilled.match(result)) {
      toast.success(`${name} removed from favorites`);
    } else {
      toast.error("Failed to remove favorite");
    }
  };

  return (
    <section className="space-y-6">

      {/* ==========================
          Page Header
      ========================== */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">
          ❤️ Your Favorites
        </h1>

        <p className="mt-2 text-gray-500">
          {loading
            ? "Loading…"
            : `${favorites.length} saved restaurant${
                favorites.length !== 1 ? "s" : ""
              }`}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && <FavoritesSkeleton />}

      {/* ==========================
          Empty Favorites State
      ========================== */}
      {!loading && favorites.length === 0 && !error && (
        <div className="rounded-2xl bg-white py-16 text-center shadow-sm">

          <p className="text-5xl">💔</p>

          <p className="mt-4 text-xl font-semibold text-gray-700">
            No favorites yet
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Browse restaurants and tap the heart
            to save your favourites.
          </p>

          {/* Navigate to Home Page */}
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white hover:bg-orange-600 transition"
          >
            Browse Restaurants
          </Link>
        </div>
      )}

      {/* ==========================
          Favorite Restaurant Cards
      ========================== */}
      <div className="grid gap-4 md:grid-cols-2">

        {favorites.map((fav) => (
          <div
            key={fav.restaurant_id}
            className="rounded-2xl bg-white p-5 shadow-sm border border-transparent hover:border-orange-100 transition"
          >

            {/* Restaurant Information */}
            <div className="flex items-start justify-between gap-3">

              <div className="flex items-center gap-3">

                {/* Restaurant Icon */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50 text-2xl">
                  🍽️
                </div>

                <div>
                  <h2 className="font-bold text-gray-800">
                    {fav.restaurant_name}
                  </h2>

                  {/* Cuisine Badge */}
                  {fav.cuisine_type && (
                    <span className="mt-0.5 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {fav.cuisine_type}
                    </span>
                  )}
                </div>
              </div>

              {/* Remove Favorite Button */}
              <button
                onClick={() =>
                  handleRemove(
                    fav.restaurant_id,
                    fav.restaurant_name
                  )
                }
                disabled={saving}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-50"
              >
                Remove
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 flex items-center justify-between">

              {/* Favorite Status */}
              <span className="flex items-center gap-1 text-sm text-orange-600">
                ♥ Saved
              </span>

              {/* View Restaurant */}
              <Link
                to={`/restaurants/${fav.restaurant_id}`}
                className="rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-600 hover:bg-orange-100 transition"
              >
                Order Now →
              </Link>

            </div>
          </div>
        ))}

      </div>
    </section>
  );
}