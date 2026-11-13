
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
    try {
      const response = await dispatch(loginUser(data)).unwrap();

      const loggedInUser = response.data.user;

      toast.success("Login successful!");

      navigate(
        loggedInUser.role === "OWNER" ? "/owner" : "/",
        { replace: true }
      );
    } catch (error) {
      console.error("Login Error:", error);

      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Invalid email or password"
      );
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

          {/* Header */}
          <h1 className="text-3xl font-bold text-center text-orange-600">
            JustEat
          </h1>

          <p className="text-center text-gray-500 mt-2">
            Welcome Back 👋
          </p>

          <p className="text-center text-gray-500 text-sm mt-1">
            Sign in to continue
          </p>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-5"
          >

            {/* Email */}
            <div>
              <label className="block mb-2 font-medium">
                Email
              </label>

              <input
                type="email"
                {...register("email")}
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
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
              <label className="block mb-2 font-medium">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-300"
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
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg disabled:opacity-60 transition"
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
