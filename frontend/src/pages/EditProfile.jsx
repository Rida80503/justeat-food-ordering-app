import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { toast } from "react-toastify";

/**
 * EditProfile Component
 *
 * This component allows the logged-in user to update
 * their personal profile information.
 *
 * Features:
 * - Fetches the current user's profile.
 * - Pre-fills the edit form.
 * - Allows updating first name, last name, and phone number.
 * - Validates required fields.
 * - Sends updated profile data to the backend.
 * - Redirects to the Profile page after a successful update.
 *
 * @returns {JSX.Element} Edit Profile page.
 */
export default function EditProfile() {
  // Hook used for navigation
  const navigate = useNavigate();

  /**
   * Stores editable user profile data.
   */
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });

  // Indicates whether the update request is running
  const [loading, setLoading] = useState(false);

  // Indicates whether profile data is loading
  const [pageLoading, setPageLoading] = useState(true);

  /**
   * Load the user's profile
   * when the component is mounted.
   */
  useEffect(() => {
    loadProfile();
  }, []);

  /**
   * Fetches the logged-in user's profile
   * from the backend API.
   */
  const loadProfile = async () => {
    // Enable page loading animation
    setPageLoading(true);

    try {
      /**
       * Fetch profile information.
       */
      const response = await api.get("/users/profile");

      // Populate form with fetched data
      setFormData({
        first_name: response.data.data.first_name || "",
        last_name: response.data.data.last_name || "",
        phone: response.data.data.phone || "",
      });
    } catch (err) {
      // Display error notification
      toast.error("Failed to load profile");
    } finally {
      // Disable page loading animation
      setPageLoading(false);
    }
  };

  /**
   * Updates a form field whenever
   * the user types into an input.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,

      // Update only the modified field
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Handles profile update.
   *
   * Steps:
   * 1. Prevent page refresh.
   * 2. Validate required fields.
   * 3. Enable loading state.
   * 4. Send PUT request.
   * 5. Display success/error message.
   * 6. Redirect to Profile page.
   *
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleSubmit = async (e) => {
    // Prevent browser refresh
    e.preventDefault();

    // Validate required fields
    if (
      !formData.first_name.trim() ||
      !formData.last_name.trim()
    ) {
      toast.error("First name and last name are required");
      return;
    }

    // Enable submit loading
    setLoading(true);

    try {
      /**
       * Update profile information.
       */
      await api.put("/users/profile", formData);

      // Display success notification
      toast.success("Profile updated successfully");

      // Redirect to Profile page
      navigate("/profile");
    } catch (err) {
      // Display backend error
      toast.error(
        err.response?.data?.message || "Profile update failed"
      );
    } finally {
      // Disable loading state
      setLoading(false);
    }
  };

  /**
   * Display loading skeleton while
   * profile data is being fetched.
   */
  if (pageLoading) {
    return (
      <section className="space-y-6 animate-pulse">

        {/* Header Placeholder */}
        <div className="h-10 w-64 rounded-xl bg-gray-200" />

        {/* Form Placeholder */}
        <div className="rounded-2xl bg-white p-8 space-y-4 shadow-sm">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 rounded"
            />
          ))}
        </div>

      </section>
    );
  }

  return (
    <section className="space-y-6 max-w-2xl">

      {/* ==========================
          Page Header
      ========================== */}
      <div>
        <h1 className="text-4xl font-bold text-gray-800">
          ✏️ Edit Profile
        </h1>

        <p className="mt-1 text-gray-600">
          Update your personal information
        </p>
      </div>

      {/* ==========================
          Edit Profile Form
      ========================== */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6"
        >

          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              First Name *
            </label>

            <input
              type="text"
              name="first_name"
              placeholder="Enter your first name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Last Name *
            </label>

            <input
              type="text"
              name="last_name"
              placeholder="Enter your last name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone (Optional)
            </label>

            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* ==========================
              Action Buttons
          ========================== */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 font-semibold transition"
            >
              {loading ? "Saving..." : "💾 Save Changes"}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => navigate("/profile")}
              disabled={loading}
              className="rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3 font-semibold transition"
            >
              Cancel
            </button>

          </div>
        </form>
      </div>
    </section>
  );
}