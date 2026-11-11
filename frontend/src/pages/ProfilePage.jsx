import { useEffect, useState } from "react";
import { api } from "../utils/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

/**
 * ProfilePage Component
 *
 * Displays the logged-in user's
 * profile information.
 *
 * Features:
 * - Fetches user profile.
 * - Displays account details.
 * - Shows loading skeleton.
 * - Displays error state.
 * - Navigate to Edit Profile.
 * - Navigate to Change Password.
 *
 * @returns {JSX.Element} Profile page.
 */
export default function ProfilePage() {

  // Stores logged-in user information
  const [user, setUser] = useState(null);

  // Indicates profile loading state
  const [loading, setLoading] = useState(true);

  // Hook used for navigation
  const navigate = useNavigate();

  /**
   * Fetch profile when the
   * component is mounted.
   */
  useEffect(() => {
    fetchProfile();
  }, []);

  /**
   * Fetches the logged-in
   * user's profile.
   */
  const fetchProfile = async () => {
    try {

      // Request profile details
      const response = await api.get("/users/profile");

      // Save profile data
      setUser(response.data.data);

    } catch (error) {

      // Display error notification
      toast.error("Failed to load profile");

    } finally {

      // Disable loading state
      setLoading(false);
    }
  };

  /**
   * Loading Skeleton
   */
  if (loading) {
    return (
      <section className="space-y-6 animate-pulse">

        <div className="h-10 w-64 rounded-xl bg-gray-200" />

        <div className="rounded-2xl bg-white p-8 space-y-4 shadow-sm">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-6 bg-gray-200 rounded w-3/4"
            />
          ))}
        </div>

      </section>
    );
  }

  /**
   * Error State
   */
  if (!user) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

        <p className="text-5xl">⚠️</p>

        <p className="mt-4 text-lg font-semibold text-red-700">
          Unable to load profile
        </p>

        <p className="mt-2 text-sm text-red-500">
          Please try again later
        </p>

        {/* Retry Button */}
        <button
          onClick={() => fetchProfile()}
          className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
        >
          Retry
        </button>

      </div>
    );
  }

  return (
    <section className="space-y-6 max-w-2xl">

      {/* ==========================
          Page Header
      ========================== */}
      <div>

        <h1 className="text-4xl font-bold text-gray-800">
          👤 My Profile
        </h1>

        <p className="mt-1 text-gray-600">
          View and manage your account information
        </p>

      </div>

      {/* ==========================
          Profile Card
      ========================== */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">

        <div className="p-8 space-y-6">

          {/* First Name */}
          <div className="border-b border-gray-200 pb-4">

            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              First Name
            </label>

            <p className="mt-2 text-lg text-gray-800 font-medium">
              {user.first_name}
            </p>

          </div>

          {/* Last Name */}
          <div className="border-b border-gray-200 pb-4">

            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Last Name
            </label>

            <p className="mt-2 text-lg text-gray-800 font-medium">
              {user.last_name}
            </p>

          </div>

          {/* Email */}
          <div className="border-b border-gray-200 pb-4">

            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Email
            </label>

            <p className="mt-2 text-lg text-gray-800 font-medium">
              {user.email}
            </p>

          </div>

          {/* Phone Number */}
          <div className="border-b border-gray-200 pb-4">

            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Phone
            </label>

            <p className="mt-2 text-lg text-gray-800 font-medium">
              {user.phone || "—"}
            </p>

          </div>

          {/* User Role */}
          <div className="border-b border-gray-200 pb-4">

            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Role
            </label>

            <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              {user.role}
            </span>

          </div>

          {/* Account Status */}
          <div className="border-b border-gray-200 pb-4">

            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Account Status
            </label>

            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                user.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {user.is_active
                ? "✓ Active"
                : "× Inactive"}
            </span>

          </div>

          {/* Account Creation Date */}
          <div className="pb-4">

            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Member Since
            </label>

            <p className="mt-2 text-sm text-gray-600">
              {new Date(user.created_at).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>

          </div>

        </div>

        {/* ==========================
            Action Buttons
        ========================== */}
        <div className="border-t border-gray-200 bg-gray-50 px-8 py-6 flex flex-wrap gap-3">

          {/* Navigate to Edit Profile */}
          <button
            onClick={() =>
              navigate("/edit-profile")
            }
            className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-semibold transition"
          >
            ✏️ Edit Profile
          </button>

          {/* Navigate to Change Password */}
          <button
            onClick={() =>
              navigate("/change-password")
            }
            className="rounded-lg border border-orange-400 text-orange-600 hover:bg-orange-50 px-6 py-3 font-semibold transition"
          >
            🔐 Change Password
          </button>

        </div>

      </div>

    </section>
  );
}