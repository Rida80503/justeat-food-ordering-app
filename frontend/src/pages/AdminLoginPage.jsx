
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
        toast.error("This portal is restricted to platform administrators.");
        return;
      }

      toast.success("Admin login successful");
      navigate("/admin", { replace: true });
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error?.message || error?.detail || "Invalid admin credentials";

      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-orange-600">JustEat Admin</h1>
          <p className="mt-2 text-gray-500">Platform access</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
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
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-300"
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
            className="w-full rounded-lg bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Sign In as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
