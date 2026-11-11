import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { toast } from "react-toastify";

/**
 * ChangePassword Component
 *
 * This component allows the logged-in user to change their password.
 *
 * Features:
 * - Validates all input fields.
 * - Ensures the new password is at least 6 characters long.
 * - Confirms that both new password fields match.
 * - Prevents using the current password as the new password.
 * - Sends the password update request to the backend.
 * - Displays success or error notifications.
 * - Redirects the user to the profile page after a successful password change.
 *
 * @returns {JSX.Element} Change Password page.
 */
export default function ChangePassword() {
  // Hook used for programmatic navigation
  const navigate = useNavigate();

  // State variables for form inputs
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State used to disable the form while the API request is in progress
  const [loading, setLoading] = useState(false);

  /**
   * Handles the password change form submission.
   *
   * Validation Steps:
   * 1. Ensure all fields are filled.
   * 2. Ensure the new password has at least 6 characters.
   * 3. Ensure the confirmation password matches.
   * 4. Ensure the new password differs from the current password.
   *
   * If validation passes:
   * - Sends a POST request to the backend.
   * - Displays success or error messages.
   * - Redirects the user to the profile page on success.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - Form submit event.
   */
  const handleSubmit = async (e) => {
    // Prevent page refresh
    e.preventDefault();

    // Check whether all required fields are filled
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast.error("All fields are required");
      return;
    }

    // Validate minimum password length
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    // Ensure confirmation password matches
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    // Prevent using the same password again
    if (oldPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    // Enable loading state while API request is in progress
    setLoading(true);

    try {
      /**
       * Send password change request to backend.
       *
       * Payload:
       * {
       *   old_password: string,
       *   new_password: string
       * }
       */
      await api.post("/users/password-change", {
        old_password: oldPassword,
        new_password: newPassword,
      });

      // Notify user of successful password update
      toast.success("Password changed successfully");

      // Redirect back to profile page
      navigate("/profile");
    } catch (err) {
      // Show backend error if available
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      // Disable loading state
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6 max-w-2xl">
      {/* ===========================
          Page Header
      ============================ */}
      <div>
        <h1 className="text-4xl font-bold text-gray-800">
          🔐 Change Password
        </h1>
        <p className="mt-1 text-gray-600">
          Update your account password to keep it secure
        </p>
      </div>

      {/* ===========================
          Password Change Form Card
      ============================ */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          {/* Current Password Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Password *
            </label>

            <input
              type="password"
              placeholder="Enter your current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* New Password Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password *
            </label>

            <input
              type="password"
              placeholder="Enter a new password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="6"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm New Password *
            </label>

            <input
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {/* Security Tip */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm text-blue-700">
              💡 Make sure your new password is strong and different from your
              current one.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 font-semibold transition"
            >
              {loading ? "Updating..." : "🔒 Change Password"}
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