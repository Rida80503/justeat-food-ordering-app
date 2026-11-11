import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { toast } from "react-toastify";

/**
 * Initial state of the Create Menu form.
 * All form fields are initialized with default values.
 */
const INITIAL = {
  restaurant_id: "",
  name: "",
  description: "",
  price: "",
  cuisine: "",
  image_url: "",
  is_available: true,
  is_todays_special: false,
  is_deal_of_day: false,
};

/**
 * Predefined cuisine suggestions displayed in the datalist.
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
 * CreateMenu Component
 *
 * This page allows restaurant owners to create a new menu item.
 *
 * Features:
 * - Loads all restaurants owned by the logged-in user.
 * - Allows entering menu details such as name, description,
 *   price, cuisine, and image URL.
 * - Lets the owner mark an item as available,
 *   today's special, or deal of the day.
 * - Sends menu data to the backend API.
 * - Redirects to Menu Management after successful creation.
 *
 * @returns {JSX.Element} Create Menu page.
 */
export default function CreateMenu() {
  // Used for page navigation
  const navigate = useNavigate();

  // Stores restaurants owned by the current user
  const [restaurants, setRestaurants] = useState([]);

  // Stores form values
  const [form, setForm] = useState(INITIAL);

  // Stores error message
  const [error, setError] = useState("");

  // Indicates whether form submission is in progress
  const [submitting, setSubmitting] = useState(false);

  /**
   * Fetch restaurants owned by the current user
   * when the component is first rendered.
   */
  useEffect(() => {
    api
      .get("/restaurants/my/restaurants")
      .then((res) => {
        const list = res.data.data || [];

        // Save restaurant list
        setRestaurants(list);

        // Automatically select the first restaurant
        if (list.length > 0) {
          setForm((f) => ({
            ...f,
            restaurant_id: String(list[0].id),
          }));
        }
      })
      .catch(() => {
        setError("Could not load your restaurants");
      });
  }, []);

  /**
   * Updates a single form field.
   *
   * @param {string} field - Name of the field.
   * @param {*} value - Updated value.
   */
  const set = (field, value) =>
    setForm((f) => ({
      ...f,
      [field]: value,
    }));

  /**
   * Handles Create Menu form submission.
   *
   * Steps:
   * 1. Prevent page refresh.
   * 2. Enable loading state.
   * 3. Convert restaurant ID and price into numbers.
   * 4. Send POST request to backend.
   * 5. Show success/error notification.
   * 6. Redirect to Menu Management page.
   *
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleSubmit = async (e) => {
    // Prevent browser refresh
    e.preventDefault();

    // Enable loading state
    setSubmitting(true);

    // Clear previous errors
    setError("");

    try {
      /**
       * Create a new menu item.
       */
      await api.post("/menus", {
        ...form,
        restaurant_id: Number(form.restaurant_id),
        price: Number(form.price),
      });

      // Display success notification
      toast.success("Menu item created!");

      // Redirect user
      navigate("/menu-management");
    } catch (err) {
      // Display backend error
      setError(err.response?.data?.detail || "Could not create menu item");
    } finally {
      // Disable loading state
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6">

      {/* ==========================
          Page Header
      ========================== */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">
          Create Menu Item
        </h1>

        <p className="mt-1 text-gray-500">
          Add a new dish to your restaurant menu.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* ==========================
          Create Menu Form
      ========================== */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white p-6 shadow-sm space-y-5"
      >

        {/* Restaurant Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Restaurant *
          </label>

          <select
            value={form.restaurant_id}
            onChange={(e) => set("restaurant_id", e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <option value="">Select restaurant…</option>

            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Menu Item Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Item Name *
          </label>

          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            placeholder="e.g. Margherita Pizza"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {/* Menu Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Description
          </label>

          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="Describe the dish…"
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
                placeholder="0.00"
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

            {/* Suggestion List */}
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

        {/* Toggle Options */}
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

        {/* Form Buttons */}
        <div className="flex gap-3 pt-2">

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-xl bg-orange-500 py-3 font-bold text-white hover:bg-orange-600 transition disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create Menu Item"}
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}