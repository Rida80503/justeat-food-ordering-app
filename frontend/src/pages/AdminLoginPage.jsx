
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { loginUser } from "../store/slices/authSlice";

export default function AdminLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, accessToken, user } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!accessToken || !user) return;

    if (user.role === "ADMIN") {
      navigate("/admin", { replace: true });
      return;
    }

    if (user.role === "OWNER") {
      navigate("/owner", { replace: true });
      return;
    }

    navigate("/", { replace: true });
  }, [accessToken, user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    try {
      const response = await dispatch(
        loginUser({
          email: email.trim().toLowerCase(),
          password,
          role: "ADMIN",
        })
      ).unwrap();

      const loggedInUser = response?.data?.user;

      if (!loggedInUser || loggedInUser.role !== "ADMIN") {
        toast.dismiss();
        toast.error("This portal is restricted to platform administrators.");
        return;
      }

      toast.dismiss();
      toast.success("Admin login successful");
      navigate("/admin", { replace: true });
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error?.message || error?.detail || "Invalid admin credentials";

      toast.dismiss();
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center bg-slate-100 px-2 py-4 sm:px-4 sm:py-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-6 md:p-7">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-orange-600">JustEat Admin</h1>
          <p className="mt-2 text-gray-500">Platform access</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:mt-7">
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300 sm:px-4 sm:py-3"
              placeholder="admin@justeat.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-11 focus:outline-none focus:ring-2 focus:ring-orange-300 sm:px-4 sm:py-3 sm:pr-12"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-500 py-2.5 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60 sm:py-3"
          >
            {loading ? "Signing In..." : "Sign In as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
