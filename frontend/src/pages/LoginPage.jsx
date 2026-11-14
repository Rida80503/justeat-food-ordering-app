
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

// ============================
// Validation Schema
// ============================

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  role: z.enum(["CUSTOMER", "OWNER"], {
    required_error: "Please select a role",
  }),
});

// ============================
// Login Page
// ============================

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [openForgot, setOpenForgot] = useState(false);

  const { loading, accessToken, user } = useSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "CUSTOMER",
    },
  });

  // Redirect already authenticated users.
  useEffect(() => {
    if (accessToken && user) {
      navigate(
        user.role === "OWNER" ? "/owner" : "/",
        { replace: true }
      );
    }
  }, [accessToken, user, navigate]);

  // ============================
  // Login Handler
  // ============================

  const onSubmit = async (data) => {
    if (loading) return;

    try {
      const response = await dispatch(loginUser(data)).unwrap();

      const loggedInUser = response.data.user;

      toast.dismiss();
      toast.success("Login successful!");

      navigate(
        loggedInUser.role === "OWNER" ? "/owner" : "/",
        { replace: true }
      );
    } catch (error) {
      console.error("Login Error:", error);

      toast.dismiss();
      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Invalid email or password"
      );
    }
  };

  return (
    <>
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-orange-50 px-2 py-4 sm:px-4 sm:py-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-6 md:p-7">

          {/* Header */}
          <h1 className="text-3xl font-bold text-center text-orange-600">
            JustEat
          </h1>

          <p className="mt-2 text-center text-gray-500">
            Welcome Back 👋
          </p>

          <p className="mt-1 text-center text-sm text-gray-500">
            Sign in to continue
          </p>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 space-y-3 sm:mt-5 sm:space-y-4"
          >

            {/* Email */}
            <div>
              <label className="mb-1.5 block font-medium sm:mb-2">
                Email
              </label>

              <input
                type="email"
                {...register("email")}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300 sm:px-4 sm:py-3"
                placeholder="Enter your email"
              />

              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block font-medium sm:mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-11 focus:outline-none focus:ring-2 focus:ring-orange-300 sm:px-4 sm:py-3 sm:pr-12"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="mb-1.5 block font-medium sm:mb-2">
                Sign in as
              </label>

              <select
                {...register("role")}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300 sm:px-4 sm:py-3"
                defaultValue="CUSTOMER"
              >
                <option value="CUSTOMER">Customer</option>
                <option value="OWNER">Restaurant Owner</option>
              </select>

              {errors.role && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.role.message}
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-orange-500 py-2.5 text-white transition hover:bg-orange-600 disabled:opacity-60 sm:py-3"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-orange-600 font-semibold hover:underline"
            >
              Create Account
            </button>
          </p>

        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={openForgot}
        onClose={() => setOpenForgot(false)}
      />
    </>
  );
}
