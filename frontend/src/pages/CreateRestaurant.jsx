import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../utils/api";

/**
 * Initial form state for creating a new restaurant.
 * Contains default values for all restaurant fields.
 */
const initialState = {
  name: "",
  description: "",
  address: "",
  city: "",
  cuisine_type: "",
  delivery_time_minutes: 30,
  delivery_fee: 0,
};

/**
 * CreateRestaurant Component
 *
 * This component allows restaurant owners to create a new restaurant.
 *
 * Features:
 * - Collects restaurant information.
 * - Validates required fields using HTML validation.
 * - Converts numeric fields before sending them to the backend.
 * - Sends a POST request to create the restaurant.
 * - Redirects the owner to the dashboard after successful creation.
 * - Displays backend errors if the request fails.
 *
 * @returns {JSX.Element} Create Restaurant page.
 */
export default function CreateRestaurant() {
  // Hook for navigation between pages
  const navigate = useNavigate();

  // Stores all form field values
  const [form, setForm] = useState(initialState);

  // Stores error message
  const [error, setError] = useState("");

  // Indicates whether form submission is in progress
  const [submitting, setSubmitting] = useState(false);

  /**
   * Updates the corresponding form field whenever
   * the user types into an input.
   *
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} event
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    // Update only the changed field
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /**
   * Handles restaurant creation.
   *
   * Steps:
   * 1. Prevent page refresh.
   * 2. Enable loading state.
   * 3. Convert numeric values.
   * 4. Send POST request.
   * 5. Redirect on success.
   * 6. Show error if request fails.
   *
   * @param {React.FormEvent<HTMLFormElement>} event
   */
  const handleSubmit = async (event) => {
    // Prevent browser refresh
    event.preventDefault();

    // Enable loading state
    setSubmitting(true);

    // Clear previous errors
    setError("");

    try {
      /**
       * Create a new restaurant.
       */
      await api.post("/restaurants", {
        ...form,

        // Convert string values into numbers
        delivery_time_minutes: Number(form.delivery_time_minutes),
        delivery_fee: Number(form.delivery_fee),
      });

      // Redirect to Owner Dashboard
      navigate("/owner");
    } catch (err) {
      // Display backend error message
      setError(
        err.response?.data?.detail || "Could not create restaurant"
      );
    } finally {
      // Disable loading state
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">

      {/* ==========================
          Page Header
      ========================== */}
      <h1 className="text-3xl font-bold text-gray-800">
        Create a Restaurant
      </h1>

      <p className="mt-2 text-gray-600">
        Add your restaurant so customers can browse it and place orders.
      </p>

      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-600">
          {error}
        </div>
      )}

      {/* ==========================
          Restaurant Creation Form
      ========================== */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
      >

        {/* Restaurant Name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Name
          </label>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
          />
        </div>

        {/* Restaurant Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
          />
        </div>

        {/* Restaurant Address */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Address
          </label>

          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
          />
        </div>

        {/* City & Cuisine */}
        <div className="grid gap-4 md:grid-cols-2">

          {/* City */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              City
            </label>

            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>

          {/* Cuisine Type */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Cuisine
            </label>

            <input
              name="cuisine_type"
              value={form.cuisine_type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>
        </div>

        {/* Delivery Information */}
        <div className="grid gap-4 md:grid-cols-2">

          {/* Delivery Time */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Delivery Time (Minutes)
            </label>

            <input
              type="number"
              name="delivery_time_minutes"
              value={form.delivery_time_minutes}
              onChange={handleChange}
              min="1"
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>

          {/* Delivery Fee */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Delivery Fee
            </label>

            <input
              type="number"
              name="delivery_fee"
              value={form.delivery_fee}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-orange-500 px-5 py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create Restaurant"}
        </button>

      </form>
    </section>
  );
}