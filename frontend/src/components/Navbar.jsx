import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";

/**
 * Navbar Component
 *
 * Displays the application's navigation bar.
 *
 * Features:
 * - Shows application logo.
 * - Displays different navigation links based on user role.
 * - Displays Login button if user is not authenticated.
 * - Displays Logout button if user is authenticated.
 * - Shows logged-in user's first name.
 *
 * User Roles:
 * - CUSTOMER
 * - OWNER
 */
export default function Navbar() {

  /**
   * Redux dispatch function.
   * Used to dispatch logout action.
   */
  const dispatch = useDispatch();

  /**
   * React Router navigation hook.
   * Used to redirect the user after logout.
   */
  const navigate = useNavigate();

  /**
   * Read authentication state from Redux Store.
   *
   * accessToken -> Determines whether user is logged in.
   * user -> Contains logged-in user information.
   */
  const { accessToken, user } = useSelector(
    (state) => state.auth
  );

  /**
   * Logout Handler
   *
   * 1. Clears authentication state.
   * 2. Removes token from localStorage
   *    (handled inside authSlice).
   * 3. Redirects user to Login page.
   */
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="bg-orange-500 shadow-md">

      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* =====================================================
             Application Logo
             Redirects to Home Page.
           ===================================================== */}
        <Link
          to="/"
          className="text-3xl font-bold text-white tracking-wide"
        >
          🍔 JustEat
        </Link>

        {/* =====================================================
             Navigation Menu
             Display only if user is logged in.
           ===================================================== */}
        {accessToken && (

          <nav className="flex items-center gap-6 text-white font-medium">

            {/* ================================================
                 Customer Navigation
                 Visible only for CUSTOMER role.
               ================================================ */}
            {user?.role !== "OWNER" && (
              <>
                <Link
                  to="/"
                  className="hover:text-yellow-200 transition"
                >
                  Home
                </Link>

                <Link
                  to="/cart"
                  className="hover:text-yellow-200 transition"
                >
                  Cart
                </Link>

                <Link
                  to="/orders"
                  className="hover:text-yellow-200 transition"
                >
                  Orders
                </Link>

                <Link
                  to="/favorites"
                  className="hover:text-yellow-200 transition"
                >
                  Favorites
                </Link>

                <Link
                  to="/recommendations"
                  className="hover:text-yellow-200 transition"
                >
                  Recommendations
                </Link>

                <Link
                  to="/preferences"
                  className="hover:text-yellow-200 transition"
                >
                  Preferences
                </Link>
              </>
            )}

            {/* ================================================
                 Owner Navigation
                 Visible only for OWNER role.
               ================================================ */}
            {user?.role === "OWNER" && (
              <>
                <Link
                  to="/owner"
                  className="hover:text-yellow-200 transition"
                >
                  Dashboard
                </Link>

                <Link
                  to="/my-restaurants"
                  className="hover:text-yellow-200 transition"
                >
                  My Restaurants
                </Link>

                <Link
                  to="/menu-management"
                  className="hover:text-yellow-200 transition"
                >
                  Menu
                </Link>

                <Link
                  to="/orders"
                  className="hover:text-yellow-200 transition"
                >
                  Orders
                </Link>
              </>
            )}

            {/* =================================================
                 Profile Page
                 Visible for every authenticated user.
               ================================================= */}
            <Link
              to="/profile"
              className="hover:text-yellow-200 transition"
            >
              Profile
            </Link>

            {/* Logged-in User Name */}
            <span className="font-semibold">
              👤 {user?.first_name}
            </span>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-white text-orange-500 px-4 py-2 rounded-lg font-semibold hover:bg-orange-100 transition"
            >
              Logout
            </button>

          </nav>
        )}

        {/* =====================================================
             Login Button
             Display only if user is NOT logged in.
           ===================================================== */}
        {!accessToken && (
          <Link
            to="/login"
            className="bg-white text-orange-500 px-4 py-2 rounded-lg font-semibold hover:bg-orange-100 transition"
          >
            Login
          </Link>
        )}

      </div>
    </header>
  );
}