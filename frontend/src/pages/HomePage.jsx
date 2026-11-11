/**
 * HomePage Component
 *
 * This component serves as the application's landing page.
 *
 * Features:
 * - Displays all available restaurants.
 * - Supports searching by restaurant name.
 * - Supports searching by location.
 * - Filters restaurants by cuisine.
 * - Filters restaurants by price range.
 * - Filters restaurants having today's special.
 * - Supports pagination.
 * - Displays loading skeletons while fetching data.
 * - Displays error and empty states.
 *
 * returns Home page.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchRestaurants } from "../store/slices/restaurantSlice";
import RestaurantCard, { RestaurantCardSkeleton } from "../components/RestaurantCard";

const PRICE_OPTIONS = [
  { label: "$ Low", value: "low" },
  { label: "$$ Mid", value: "medium" },
  { label: "$$$ High", value: "high" },
];



const PAGE_SIZE = 9;

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, total, loading, error, cuisines } = useSelector(
    (state) => state.restaurants
  );

  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [todaysSpecial, setTodaysSpecial] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const searchRef = useRef(null);
  const locationRef = useRef(null);

  const buildParams = useCallback(
    (overrides = {}) => {
      const p = { page_size: PAGE_SIZE, page: currentPage };
      if (search) p.search = search;
      if (cuisine) p.cuisine = cuisine;
      if (location) p.location = location;
      if (priceRange) p.price_range = priceRange;
      if (todaysSpecial) p.has_todays_special = true;
      return { ...p, ...overrides };
    },
    [search, cuisine, location, priceRange, todaysSpecial, currentPage]
  );

  // Initial load (unfiltered, populates cuisine list)
  useEffect(() => {
    dispatch(fetchRestaurants({ page_size: PAGE_SIZE, page: 1 }));
  }, [dispatch]);

  // Re-fetch on filter/sort changes (reset to page 1)
  useEffect(() => {
    setCurrentPage(1);
    dispatch(fetchRestaurants(buildParams({ page: 1 })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuisine, priceRange, todaysSpecial]);

  // Re-fetch on page change
  useEffect(() => {
    dispatch(fetchRestaurants(buildParams()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Debounced search by name / cuisine keyword
  const handleSearchChange = (value) => {
    setSearch(value);
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setCurrentPage(1);
      dispatch(fetchRestaurants(buildParams({ search: value, page: 1 })));
    }, 400);
  };

  // Debounced search by city / location
  const handleLocationChange = (value) => {
    setLocation(value);
    clearTimeout(locationRef.current);
    locationRef.current = setTimeout(() => {
      setCurrentPage(1);
      dispatch(fetchRestaurants(buildParams({ location: value, page: 1 })));
    }, 400);
  };

  const clearAll = () => {
    setSearch("");
    setLocation("");
    setCuisine("");
    setPriceRange("");
    setTodaysSpecial(false);
  
    setCurrentPage(1);
    dispatch(fetchRestaurants({ page_size: PAGE_SIZE, page: 1 }));
  };

  const activeCount = [search, cuisine, location, priceRange, todaysSpecial].filter(Boolean).length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <section className="space-y-6">
      {/* ── Hero ── */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold">
          Local favorites, delivered with confidence 🍔
        </h1>
        <p className="mt-3 text-lg text-orange-100">
          Discover nearby restaurants and enjoy a faster path to your next meal.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Restaurant name or cuisine…"
              className="w-full rounded-lg border border-white/40 bg-white/95 py-3 pl-9 pr-4 text-gray-800 outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">📍</span>
            <input
              value={location}
              onChange={(e) => handleLocationChange(e.target.value)}
              placeholder="City or area…"
              className="w-full rounded-lg border border-white/40 bg-white/95 py-3 pl-9 pr-4 text-gray-800 outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link to="/preferences" className="rounded-full bg-white/15 px-3 py-1 hover:bg-white/25 transition">
            Update preferences
          </Link>
          <Link to="/favorites" className="rounded-full bg-white/15 px-3 py-1 hover:bg-white/25 transition">
            View favorites
          </Link>
          <Link to="/recommendations" className="rounded-full bg-white/15 px-3 py-1 hover:bg-white/25 transition">
            Explore recommendations
          </Link>
        </div>
      </div>

      {/* ── Filter + Sort Bar ── */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Cuisine */}
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <option value="">All Cuisines</option>
            {cuisines.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Price range */}
          <div className="flex overflow-hidden rounded-lg border border-gray-200 text-sm">
            {PRICE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPriceRange(opt.value === priceRange ? "" : opt.value)}
                className={`px-3 py-2 font-medium transition ${
                  priceRange === opt.value
                    ? "bg-orange-500 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-orange-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Today's Special */}
          <button
            onClick={() => setTodaysSpecial((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              todaysSpecial
                ? "border-orange-400 bg-orange-50 text-orange-700"
                : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-orange-50"
            }`}
          >
            ⭐ Today's Special
          </button>

          {/* Sort */}
          {/* <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="ml-auto rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select> */}

          {/* Clear filters */}
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition"
            >
              Clear ({activeCount})
            </button>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      <div>
        {!loading && !error && (
          <p className="mb-4 text-sm text-gray-500">
            {total === 0
              ? "No restaurants found"
              : `Showing ${items.length} of ${total} restaurant${total !== 1 ? "s" : ""}`}
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
            <p className="text-lg font-semibold">Something went wrong</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              onClick={() => dispatch(fetchRestaurants(buildParams()))}
              className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
            >
              Try again
            </button>
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <p className="text-5xl">🍽️</p>
            <p className="mt-4 text-xl font-semibold text-gray-700">No restaurants found</p>
            <p className="mt-2 text-sm text-gray-500">Try adjusting your search or clearing the filters.</p>
            <button
              onClick={clearAll}
              className="mt-5 rounded-lg bg-orange-500 px-5 py-2 font-semibold text-white hover:bg-orange-600 transition"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onClick={() => navigate(`/restaurants/${restaurant.id}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>

            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p =
                totalPages <= 7
                  ? i + 1
                  : currentPage <= 4
                  ? i + 1
                  : currentPage >= totalPages - 3
                  ? totalPages - 6 + i
                  : currentPage - 3 + i;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    p === currentPage
                      ? "border-orange-400 bg-orange-500 text-white"
                      : "border-gray-200 text-gray-600 hover:bg-orange-50"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
