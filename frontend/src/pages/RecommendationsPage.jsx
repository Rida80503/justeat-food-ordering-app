import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchRecommendations,
  fetchCuisineRecommendations,
} from "../store/slices/recommendationSlice";

function RecommendationSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-5 w-40 rounded bg-gray-200" />
              <div className="h-4 w-56 rounded bg-gray-200" />
            </div>
            <div className="h-8 w-16 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CuisineSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-white p-5 shadow-sm">
          <div className="h-5 w-24 rounded bg-gray-200 mb-3" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-7 w-24 rounded-full bg-gray-200" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const REASON_ICONS = {
  "Matches your": "⭐",
  "Popular": "🔥",
  "Based on": "📊",
};

function getReasonIcon(reason = "") {
  const entry = Object.entries(REASON_ICONS).find(([k]) => reason.startsWith(k));
  return entry ? entry[1] : "✨";
}

export default function RecommendationsPage() {
  const dispatch = useDispatch();
  const {
    recommendations,
    cuisineRecommendations,
    loading,
    cuisineLoading,
    error,
    cuisineError,
  } = useSelector((state) => state.recommendations);

  const { favorites } = useSelector((state) => state.favorites);
  const { dietaryRestrictions, favoriteCuisines } = useSelector((state) => state.preferences);

  // Refresh when preferences or favorites change
  useEffect(() => {
    dispatch(fetchRecommendations());
    dispatch(fetchCuisineRecommendations());
  }, [dispatch, favorites.length, favoriteCuisines.length, dietaryRestrictions.length]);

  const handleRefresh = () => {
    dispatch(fetchRecommendations());
    dispatch(fetchCuisineRecommendations());
  };

  return (
    <section className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">✨ Recommended for You</h1>
            <p className="mt-2 text-orange-100">
              Personalized picks based on your order history, preferences, and favourite cuisines.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex-shrink-0 rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30 transition"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Top Picks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Top Picks</h2>
          {!loading && recommendations.length > 0 && (
            <span className="text-sm text-gray-500">{recommendations.length} suggestions</span>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>
        )}

        {loading && <RecommendationSkeleton />}

        {!loading && recommendations.length === 0 && !error && (
          <div className="rounded-2xl bg-white py-10 text-center shadow-sm">
            <p className="text-4xl">🍽️</p>
            <p className="mt-3 font-semibold text-gray-700">No recommendations yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Add favorite cuisines in your{" "}
              <Link to="/preferences" className="text-orange-600 hover:underline">
                preferences
              </Link>{" "}
              to get personalised suggestions.
            </p>
          </div>
        )}

        {!loading && recommendations.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map((rec, idx) => (
              <div
                key={rec.restaurant_id || idx}
                className="flex items-start justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm border border-transparent hover:border-orange-100 transition"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-2xl">{getReasonIcon(rec.reason)}</span>
                  <div>
                    <h3 className="font-bold text-gray-800">{rec.restaurant_name}</h3>
                    <p className="mt-0.5 text-sm text-gray-500">{rec.reason}</p>
                  </div>
                </div>
                <Link
                  to={`/restaurants/${rec.restaurant_id}`}
                  className="flex-shrink-0 rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-600 hover:bg-orange-100 transition"
                >
                  Order →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* By Cuisine */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">By Cuisine</h2>

        {cuisineError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">{cuisineError}</div>
        )}

        {cuisineLoading && <CuisineSkeleton />}

        {!cuisineLoading && cuisineRecommendations.length === 0 && !cuisineError && (
          <div className="rounded-2xl bg-white py-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Add{" "}
              <Link to="/preferences" className="text-orange-600 hover:underline">
                favourite cuisines
              </Link>{" "}
              to see grouped recommendations.
            </p>
          </div>
        )}

        {!cuisineLoading && cuisineRecommendations.length > 0 && (
          <div className="space-y-4">
            {cuisineRecommendations.map((group) => (
              <div key={group.cuisine} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🍴</span>
                  <h3 className="text-lg font-bold text-gray-800">{group.cuisine}</h3>
                  <span className="text-sm text-gray-400">{group.restaurants.length} restaurant{group.restaurants.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.restaurants.map((restaurant) => (
                    <Link
                      key={restaurant.id}
                      to={`/restaurants/${restaurant.id}`}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 transition"
                    >
                      {restaurant.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
