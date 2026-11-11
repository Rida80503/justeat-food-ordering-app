import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  requestPasswordReset,
  completePasswordReset,
} from "../store/slices/authSlice";
import { toast } from "react-toastify";

/**
 * Forgot Password Modal
 *
 * This component provides a two-step password reset process.
 *
 * Step 1:
 * - User enters their email.
 * - Sends a password reset request to the backend.
 *
 * Step 2:
 * - User enters a new password.
 * - Confirms the password.
 * - Completes the password reset.
 *
 * Props:
 * @param {boolean} open - Controls whether the modal is visible.
 * @param {Function} onClose - Function used to close the modal.
 */
export default function ForgotPasswordModal({ open, onClose }) {

  /**
   * Redux dispatch function
   * used to dispatch async thunk actions.
   */
  const dispatch = useDispatch();

  /**
   * Controls the current step of the modal.
   * Step 1 -> Enter Email
   * Step 2 -> Enter New Password
   */
  const [step, setStep] = useState(1);

  /** User email */
  const [email, setEmail] = useState("");

  /** Reset token returned by backend */
  const [resetToken, setResetToken] = useState("");

  /** New password */
  const [newPassword, setNewPassword] = useState("");

  /** Confirm password */
  const [confirmPassword, setConfirmPassword] = useState("");

  /**
   * If modal is closed,
   * render nothing.
   */
  if (!open) return null;

  /**
   * Sends a password reset request.
   *
   * Dispatches requestPasswordReset thunk.
   * On success:
   * - Stores reset token.
   * - Moves to Step 2.
   *
   * On failure:
   * - Shows error message.
   */
  const sendResetLink = async () => {

    const result = await dispatch(
      requestPasswordReset(email)
    );

    if (requestPasswordReset.fulfilled.match(result)) {

      setResetToken(result.payload.data.reset_token);

      toast.success("Reset link generated.");

      setStep(2);

    } else {

      toast.error(result.payload);
    }
  };

  /**
   * Completes password reset.
   *
   * Validates password confirmation.
   * Dispatches completePasswordReset thunk.
   *
   * On success:
   * - Shows success message.
   * - Clears all form fields.
   * - Resets modal state.
   * - Closes modal.
   *
   * On failure:
   * - Displays error message.
   */
  const handleReset = async () => {

    // Validate passwords
    if (newPassword !== confirmPassword) {

      toast.error("Passwords do not match");
      return;
    }

    const result = await dispatch(
      completePasswordReset({
        reset_token: resetToken,
        new_password: newPassword,
      })
    );

    if (completePasswordReset.fulfilled.match(result)) {

      toast.success("Password reset successfully");

      // Reset component state
      setStep(1);
      setEmail("");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");

      // Close modal
      onClose();

    } else {

      toast.error(result.payload);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">

        {/* Modal Title */}
        <h2 className="text-3xl font-bold mb-6">
          Forgot Password
        </h2>

        {/* Step 1 : Enter Email */}
        {step === 1 ? (
          <>
            <input
              className="border w-full rounded-lg p-3 mb-4"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              onClick={sendResetLink}
              className="w-full bg-orange-500 text-white rounded-lg py-3"
            >
              Send Reset Link
            </button>
          </>
        ) : (

          /* Step 2 : Enter New Password */

          <>
            <input
              type="password"
              className="border w-full rounded-lg p-3 mb-4"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
            />

            <input
              type="password"
              className="border w-full rounded-lg p-3 mb-4"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
            />

            <button
              onClick={handleReset}
              className="w-full bg-green-600 text-white rounded-lg py-3"
            >
              Reset Password
            </button>
          </>
        )}

        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 text-red-500"
        >
          Close
        </button>

      </div>
    </div>
  );
}