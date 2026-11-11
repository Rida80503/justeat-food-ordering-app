import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginUser } from "../store/slices/authSlice";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

/**
 * Zod validation schema for the login form.
 *
 * Validation Rules:
 * - Email must be in a valid format.
 * - Password must contain at least 8 characters.
 */
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

/**
 * LoginPage Component
 *
 * This component allows registered users
 * to sign in to the application.
 *
 * Features:
 * - Form validation using React Hook Form & Zod.
 * - User authentication using Redux.
 * - Password visibility toggle.
 * - Forgot Password modal.
 * - Displays validation and login errors.
 * - Redirects to Home page after successful login.
 *
 * @returns {JSX.Element} Login page.
 */
export default function LoginPage() {
  // Redux dispatch function
  const dispatch = useDispatch();

  // Hook used for page navigation
  const navigate = useNavigate();

  // Controls password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Controls Forgot Password modal visibility
  const [openForgot, setOpenForgot] = useState(false);

  /**
   * Authentication state from Redux.
   *
   * loading -> Login request status
   * error -> Authentication error
   * accessToken -> Logged-in user token
   */
  const { loading, error, accessToken } = useSelector(
    (state) => state.auth
  );

  /**
   * React Hook Form setup.
   *
   * register -> Connects inputs
   * handleSubmit -> Handles form submission
   * errors -> Validation errors
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  /**
   * Redirect authenticated users
   * to the Home page.
   */
  useEffect(() => {
    if (accessToken) {
      toast.success("Login successful");
      navigate("/");
    }
  }, [accessToken, navigate]);

  // useEffect(() => {
  //   if (error) toast.error(String(error));
  // }, [error]);

  /**
   * Handles user login.
   *
   * Steps:
   * 1. Validate form.
   * 2. Dispatch login action.
   * 3. Show success message.
   * 4. Navigate to Home page.
   * 5. Display backend errors if login fails.
   *
   * @param {{email:string,password:string}} data
   */
  const onSubmit = async (data) => {
    try {
      /**
       * Authenticate user.
       */
      await dispatch(loginUser(data)).unwrap();

      // Display success notification
      toast.success("Login successful");

      // Navigate to Home page
      navigate("/");
    } catch (error) {
      console.log("Login Error:", error);

      // Display backend error
      toast.error(
        error?.message ||
          error ||
          "Invalid email or password"
      );
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">

        {/* ==========================
            Login Card
        ========================== */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

          {/* Page Header */}
          <h1 className="text-3xl font-bold text-center text-orange-600">
            JustEat
          </h1>

          <p className="text-center text-gray-500 mt-2">
            Welcome Back 👋
          </p>

          {/* ==========================
              Login Form
          ========================== */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-5"
          >

            {/* Email Address */}
            <div>
              <label className="block mb-2 font-medium">
                Email
              </label>

              <input
                type="email"
                {...register("email")}
                className="w-full border rounded-lg px-4 py-3"
                placeholder="Enter your email"
              />

              {/* Email Validation Error */}
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 font-medium">
                Password
              </label>

              <div className="relative">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  {...register("password")}
                  className="w-full border rounded-lg px-4 py-3 pr-12"
                  placeholder="Enter your password"
                />

                {/* Show/Hide Password Button */}
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>

              {/* Password Validation Error */}
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setOpenForgot(true)}
                className="text-orange-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg disabled:opacity-60"
            >
              {loading
                ? "Signing In..."
                : "Sign In"}
            </button>

          </form>
        </div>
      </div>

      {/* ==========================
          Forgot Password Modal
      ========================== */}
      <ForgotPasswordModal
        open={openForgot}
        onClose={() => setOpenForgot(false)}
      />
    </>
  );
}