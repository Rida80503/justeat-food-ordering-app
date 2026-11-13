
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  registerUser,
  clearRegistrationState,
} from "../store/slices/authSlice";

// ============================
// Validation Schema
// ============================

const registerSchema = z
  .object({
    first_name: z
      .string()
      .trim()
      .min(2, "First name must contain at least 2 characters")
      .max(100, "First name is too long")
      .regex(/^[A-Za-z\s]+$/, "Only alphabets are allowed"),

    last_name: z
      .string()
      .trim()
      .min(2, "Last name must contain at least 2 characters")
      .max(100, "Last name is too long")
      .regex(/^[A-Za-z\s]+$/, "Only alphabets are allowed"),

    email: z
      .string()
      .trim()
      .email("Please enter a valid email"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password cannot exceed 72 characters"),

    confirm_password: z
      .string()
      .min(8, "Please confirm your password")
      .max(72, "Password cannot exceed 72 characters"),

    role: z.enum(["CUSTOMER", "OWNER"], {
      required_error: "Please select your account type",
    }),
  })
  .refine(
    (data) => data.password === data.confirm_password,
    {
      message: "Passwords do not match",
      path: ["confirm_password"],
    }
  );

// ============================
// Register Page
// ============================

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { registrationLoading } = useSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
      role: "CUSTOMER",
    },
  });

  // ============================
  // Registration Handler
  // ============================

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(registerUser(data)).unwrap();

      toast.success(
        result.message || "Registration successful!"
      );

      dispatch(clearRegistrationState());

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Registration Error:", error);

      toast.error(
        typeof error === "string"
          ? error
          : error?.message || "Registration failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4 py-8">

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">

        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-orange-600">
          JustEat
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Create Your Account
        </p>

        <p className="text-center text-gray-500 text-sm mt-1">
          Join JustEat today!
        </p>

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-5"
        >

          {/* Account Type */}
          <div>
            <label className="block mb-2 font-medium">
              Register As
            </label>

            <div className="grid grid-cols-2 gap-3">

              <label className="cursor-pointer">
                <input
                  type="radio"
                  value="CUSTOMER"
                  {...register("role")}
                  className="peer sr-only"
                />

                <div className="border rounded-lg p-3 text-center transition peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:text-orange-600">
                  <span className="block font-semibold">
                    Customer
                  </span>
                  <span className="text-xs text-gray-500">
                    Order food
                  </span>
                </div>
              </label>

              <label className="cursor-pointer">
                <input
                  type="radio"
                  value="OWNER"
                  {...register("role")}
                  className="peer sr-only"
                />

                <div className="border rounded-lg p-3 text-center transition peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:text-orange-600">
                  <span className="block font-semibold">
                    Restaurant Owner
                  </span>
                  <span className="text-xs text-gray-500">
                    Manage restaurant
                  </span>
                </div>
              </label>

            </div>

            {errors.role && (
              <p className="text-red-500 text-sm mt-1">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* First Name */}
          <div>
            <label className="block mb-2 font-medium">
              First Name
            </label>

            <input
              type="text"
              {...register("first_name")}
              placeholder="Enter first name"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />

            {errors.first_name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.first_name.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block mb-2 font-medium">
              Last Name
            </label>

            <input
              type="text"
              {...register("last_name")}
              placeholder="Enter last name"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />

            {errors.last_name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.last_name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 font-medium">
              Email Address
            </label>

            <input
              type="email"
              {...register("email")}
              placeholder="Enter your email"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
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
                placeholder="Create password"
                className="w-full border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                aria-label="Toggle password visibility"
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

          {/* Confirm Password */}
          <div>
            <label className="block mb-2 font-medium">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirm_password")}
                placeholder="Confirm your password"
                className="w-full border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {errors.confirm_password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={registrationLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg disabled:opacity-60 transition"
          >
            {registrationLoading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-orange-600 font-semibold hover:underline"
          >
            Sign In
          </button>
        </p>

      </div>
    </div>
  );
}
