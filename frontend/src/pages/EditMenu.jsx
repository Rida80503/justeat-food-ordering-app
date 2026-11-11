import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../utils/api";
import { toast } from "react-toastify";

/**
 * Predefined cuisine suggestions displayed
 * in the cuisine input field.
 */
const CUISINE_SUGGESTIONS = [
  "Italian",
  "Chinese",
  "Indian",
  "American",
  "Japanese",
  "Mexican",
  "Thai",
  "Mediterranean",
];

/**
 * EditMenu Component
 *
 * This component allows restaurant owners to edit an
 * existing menu item.
 *
 * Features:
 * - Fetches menu details using the menu ID.
 * - Pre-fills the edit form.
 * - Allows updating menu information.
 * - Supports toggling availability, today's special,
 *   and deal of the day.
 * - Sends updated data to the backend.
 * - Redirects to Menu Management after successful update.
 *
 * @returns {JSX.Element} Edit Menu page.
 */
export default function EditMenu() {
  // Hook used for navigation
  const navigate = useNavigate();

  // Get menu ID from the URL
  const { menuId } = useParams();

  // Stores menu item details
  const [form, setForm] = useState(null);

  // Stores error message
  const [error, setError] = useState("");

  // Indicates update request is running
  const [submitting, setSubmitting] = useState(false);

  // Indicates initial menu loading
  const [loading, setLoading] = useState(true);

  /**
   * Fetch the selected menu item
   * when the component loads.
   */
  useEffect(() => {
    api
      .get(`/menus/${menuId}`)
      .then((res) => {
        const m = res.data.data;

        // Populate form with existing menu details
        setForm({
          name: m.name || "",
          description: m.description || "",
          price: m.price || "",
          cuisine: m.cuisine || "",
          image_url: m.image_url || "",
          is_available: m.is_available ?? true,
          is_todays_special: m.is_todays_special ?? false,
          is_deal_of_day: m.is_deal_of_day ?? false,
        });
      })
      .catch((err) =>
        setError(
          err.response?.data?.detail || "Could not load menu item"
        )
      )
      .finally(() => {
        // Stop loading animation
        setLoading(false);
      });
  }, [menuId]);

  /**
   * Updates a single form field.
   *
   * @param {string} field - Field name.
   * @param {*} value - Updated value.
   */
  const set = (field, value) =>
    setForm((f) => ({
      ...f,
      [field]: value,
    }));

  /**
   * Handles menu update.
   *
   * Steps:
   * 1. Prevent page refresh.
   * 2. Enable loading state.
   * 3. Convert price into number.
   * 4. Send PUT request.
   * 5. Show success notification.
   * 6. Redirect to Menu Management.
   *
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleSubmit = async (e) => {
    // Prevent browser refresh
    e.preventDefault();

    // Enable submit loading
    setSubmitting(true);

    // Clear previous errors
    setError("");

    try {
      /**
       * Update menu item.
       */
      await api.put(`/menus/${menuId}`, {
        ...form,

        // Convert price to numeric value
        price: Number(form.price),
      });

      // Display success notification
      toast.success("Menu item updated!");

      // Redirect to menu management page
      navigate("/menu-management");
    } catch (err) {
      // Display backend error
      setError(
        err.response?.data?.detail || "Could not update menu item"
      );
    } finally {
      // Disable loading state
      setSubmitting(false);
    }
  };

  /**
   * Display loading skeleton while
   * menu details are being fetched.
   */
  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 animate-pulse">

        {/* Header Placeholder */}
        <div className="h-10 rounded-2xl bg-gray-200" />

        {/* Form Placeholder */}
        <div className="h-96 rounded-2xl bg-gray-200" />

      </div>
    );
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">

      {/* ==========================
          Page Header
      ========================== */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">
          Edit Menu Item
        </h1>

        <p className="mt-1 text-gray-500">
          Update this dish's details, pricing, and labels.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* ==========================
          Edit Menu Form
      ========================== */}
      {form && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow-sm space-y-5"
        >

          {/* Item Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Item Name *
            </label>

            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
          </div>

          {/* Price & Cuisine */}
          <div className="grid gap-4 sm:grid-cols-2">

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Price *
              </label>

              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  $
                </span>

                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full rounded-lg border border-gray-200 py-2 pl-7 pr-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            </div>

            {/* Cuisine */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Cuisine
              </label>

              <input
                list="cuisine-suggestions"
                value={form.cuisine}
                onChange={(e) => set("cuisine", e.target.value)}
                placeholder="e.g. Italian"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />

              {/* Cuisine Suggestions */}
              <datalist id="cuisine-suggestions">
                {CUISINE_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Image URL
            </label>

            <input
              value={form.image_url}
              onChange={(e) => set("image_url", e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* ==========================
              Toggle Options
          ========================== */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                field: "is_available",
                label: "Available",
                desc: "Show to customers",
                icon: "✅",
              },
              {
                field: "is_todays_special",
                label: "Today's Special",
                desc: "Featured highlight",
                icon: "⭐",
              },
              {
                field: "is_deal_of_day",
                label: "Deal of Day",
                desc: "Discounted item",
                icon: "🔥",
              },
            ].map(({ field, label, desc, icon }) => (
              <button
                key={field}
                type="button"

                // Toggle boolean value
                onClick={() => set(field, !form[field])}

                className={`flex items-center gap-2 rounded-xl border p-3 text-left transition ${
                  form[field]
                    ? "border-orange-300 bg-orange-50 text-orange-700"
                    : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                }`}
              >
                <span className="text-xl">{icon}</span>

                <div>
                  <p className="text-xs font-bold">{label}</p>
                  <p className="text-xs opacity-70">{desc}</p>
                </div>

                {/* Toggle Indicator */}
                <span
                  className={`ml-auto h-5 w-5 rounded-full border-2 flex-shrink-0 ${
                    form[field]
                      ? "border-orange-500 bg-orange-500"
                      : "border-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">

            {/* Save Button */}
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-orange-500 py-3 font-bold text-white hover:bg-orange-600 transition disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save Changes"}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>

          </div>
        </form>
      )}
    </section>
  );
}