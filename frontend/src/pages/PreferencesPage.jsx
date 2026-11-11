import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchPreferences,
  addDietaryRestriction,
  removeDietaryRestriction,
  addFavoriteCuisine,
  removeFavoriteCuisine,
} from "../store/slices/preferenceSlice";
import { fetchFavorites, toggleFavorite } from "../store/slices/favoriteSlice";

const QUICK_DIETARY = ["Vegetarian", "Vegan", "Gluten-Free", "Halal", "Kosher", "Dairy-Free", "Nut-Free"];
const QUICK_CUISINES = ["Italian", "Chinese", "Indian", "Mexican", "Japanese", "Thai", "American", "Mediterranean"];

export default function PreferencesPage() {
  const dispatch = useDispatch();
  const { dietaryRestrictions, favoriteCuisines, loading, saving, error } = useSelector(
    (state) => state.preferences
  );
  const { favorites, loading: favLoading } = useSelector((state) => state.favorites);
  const [dietaryInput, setDietaryInput] = useState("");
  const [cuisineInput, setCuisineInput] = useState("");

  useEffect(() => {
    dispatch(fetchPreferences());
    dispatch(fetchFavorites());
  }, [dispatch]);

  const handleAddDietary = async (value) => {
    const v = (value || dietaryInput).trim();
    if (!v) return;
    if (savedDietaryValues.has(v.toLowerCase())) return;
    const result = await dispatch(addDietaryRestriction({ dietary_restriction: v }));
    if (addDietaryRestriction.fulfilled.match(result)) {
      toast.success(`"${v}" added to dietary restrictions`);
      setDietaryInput("");
    } else toast.error(result.payload || "Failed to add");
  };

  const handleRemoveDietary = async (id) => {
    const result = await dispatch(removeDietaryRestriction(id));
    if (removeDietaryRestriction.fulfilled.match(result)) toast.success("Dietary restriction removed");
    else toast.error(result.payload || "Failed to remove");
  };

  const handleAddCuisine = async (value) => {
    const v = (value || cuisineInput).trim();
    if (!v) return;
    if (savedCuisineValues.has(v.toLowerCase())) return;
    const result = await dispatch(addFavoriteCuisine({ favorite_cuisine: v }));
    if (addFavoriteCuisine.fulfilled.match(result)) {
      toast.success(`"${v}" added to favourite cuisines`);
      setCuisineInput("");
    } else toast.error(result.payload || "Failed to add");
  };

  const handleRemoveCuisine = async (id) => {
    const result = await dispatch(removeFavoriteCuisine(id));
    if (removeFavoriteCuisine.fulfilled.match(result)) toast.success("Cuisine removed");
    else toast.error(result.payload || "Failed to remove");
  };

  const handleRemoveFavorite = async (restaurantId, name) => {
    const result = await dispatch(toggleFavorite({ restaurant_id: restaurantId, isFavorite: true }));
    if (toggleFavorite.fulfilled.match(result)) toast.success(`${name} removed from favorites`);
    else toast.error(result.payload || "Failed to remove");
  };

  const savedDietaryValues = new Set(dietaryRestrictions.map((r) => r.value?.toLowerCase()));
  const savedCuisineValues = new Set(favoriteCuisines.map((c) => c.value?.toLowerCase()));

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">⚙️ Preferences</h1>
        <p className="mt-2 text-gray-500">
          Personalize your experience. Your preferences shape the recommendations you receive.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>
      )}

      {/* Favourite Restaurants */}
      <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-gray-800">❤️ Favourite Restaurants</h2>
        {favLoading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : favorites.length === 0 ? (
          <p className="text-sm text-gray-400">
            No favourite restaurants yet.{" "}
            <Link to="/" className="text-orange-600 hover:underline">Browse restaurants</Link>{" "}
            and tap the heart to save your favourites.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {favorites.map((fav) => (
              <span
                key={fav.id}
                className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700"
              >
                ♥ {fav.restaurant_name}
                <button
                  onClick={() => handleRemoveFavorite(fav.restaurant_id, fav.restaurant_name)}
                  className="text-red-400 hover:text-red-600 transition"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Dietary Restrictions */}
        <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Dietary Restrictions</h2>

          {/* Quick-add chips */}
          <div className="flex flex-wrap gap-2">
            {QUICK_DIETARY.map((tag) => {
              const already = savedDietaryValues.has(tag.toLowerCase());
              return (
                <button
                  key={tag}
                  onClick={() => !already && handleAddDietary(tag)}
                  disabled={already || saving}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    already
                      ? "border-green-300 bg-green-50 text-green-700 cursor-default"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-300 hover:text-orange-600"
                  }`}
                >
                  {already ? "✓ " : "+ "}{tag}
                </button>
              );
            })}
          </div>

          {/* Manual input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleAddDietary(); }}
            className="flex gap-2"
          >
            <input
              value={dietaryInput}
              onChange={(e) => setDietaryInput(e.target.value)}
              placeholder="Add custom restriction…"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              type="submit"
              disabled={saving || !dietaryInput.trim()}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-60"
            >
              Add
            </button>
          </form>

          {/* Saved list */}
          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {dietaryRestrictions.length === 0 ? (
                <p className="text-sm text-gray-400">None saved yet.</p>
              ) : (
                dietaryRestrictions.map((item) => (
                  <span
                    key={`${item.value}-${item.id}`}
                    className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700"
                  >
                    {item.value}
                    {item.id && (
                      <button
                        onClick={() => handleRemoveDietary(item.id)}
                        className="text-green-500 hover:text-red-500 transition"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          )}
        </div>

        {/* Favorite Cuisines */}
        <div className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Favorite Cuisines</h2>

          {/* Quick-add chips */}
          <div className="flex flex-wrap gap-2">
            {QUICK_CUISINES.map((tag) => {
              const already = savedCuisineValues.has(tag.toLowerCase());
              return (
                <button
                  key={tag}
                  onClick={() => !already && handleAddCuisine(tag)}
                  disabled={already || saving}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    already
                      ? "border-orange-300 bg-orange-50 text-orange-700 cursor-default"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-300 hover:text-orange-600"
                  }`}
                >
                  {already ? "✓ " : "+ "}{tag}
                </button>
              );
            })}
          </div>

          {/* Manual input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleAddCuisine(); }}
            className="flex gap-2"
          >
            <input
              value={cuisineInput}
              onChange={(e) => setCuisineInput(e.target.value)}
              placeholder="Add custom cuisine…"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              type="submit"
              disabled={saving || !cuisineInput.trim()}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-60"
            >
              Add
            </button>
          </form>

          {/* Saved list */}
          {loading ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {favoriteCuisines.length === 0 ? (
                <p className="text-sm text-gray-400">None saved yet.</p>
              ) : (
                favoriteCuisines.map((item) => (
                  <span
                    key={`${item.value}-${item.id}`}
                    className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700"
                  >
                    {item.value}
                    {item.id && (
                      <button
                        onClick={() => handleRemoveCuisine(item.id)}
                        className="text-orange-400 hover:text-red-500 transition"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
