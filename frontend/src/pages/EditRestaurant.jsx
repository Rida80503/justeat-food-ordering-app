import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../utils/api";

const initialState = {
  name: "",
  description: "",
  address: "",
  city: "",
  cuisine_type: "",
  delivery_time_minutes: 30,
  delivery_fee: 0,
};

export default function EditRestaurant() {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const response = await api.get(`/restaurants/${restaurantId}`);
        const restaurant = response.data.data;
        setForm({
          name: restaurant.name || "",
          description: restaurant.description || "",
          address: restaurant.address || "",
          city: restaurant.city || "",
          cuisine_type: restaurant.cuisine_type || "",
          delivery_time_minutes: restaurant.delivery_time_minutes || 30,
          delivery_fee: restaurant.delivery_fee || 0,
        });
      } catch (err) {
        setError(err.response?.data?.detail || "Could not load restaurant");
      } finally {
        setLoading(false);
      }
    };

    loadRestaurant();
  }, [restaurantId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.put(`/restaurants/${restaurantId}`, {
        ...form,
        delivery_time_minutes: Number(form.delivery_time_minutes),
        delivery_fee: Number(form.delivery_fee),
      });
      navigate("/owner");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not update restaurant");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading restaurant...</div>;
  }

  return (
    <section className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-gray-800">Edit restaurant</h1>
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Cuisine</label>
            <input
              name="cuisine_type"
              value={form.cuisine_type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Delivery time (min)</label>
            <input
              type="number"
              name="delivery_time_minutes"
              value={form.delivery_time_minutes}
              onChange={handleChange}
              min="1"
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Delivery fee</label>
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

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-orange-500 px-5 py-2 font-semibold text-white hover:bg-orange-600"
        >
          {submitting ? "Saving..." : "Save changes"}
        </button>
      </form>
    </section>
  );
}
