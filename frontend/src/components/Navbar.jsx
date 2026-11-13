
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { accessToken, user } = useSelector(
    (state) => state.auth
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="bg-orange-500 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Application Logo */}
        <Link
          to="/"
          className="text-3xl font-bold text-white tracking-wide"
        >
          🍔 JustEat
        </Link>

        {/* Authenticated Navigation */}
        {accessToken && (
          <nav className="flex items-center gap-6 text-white font-medium">

            {/* Customer Navigation */}
            {user?.role === "CUSTOMER" && (
              <>
                <Link to="/" className="hover:text-yellow-200 transition">
                  Home
                </Link>

                <Link to="/cart" className="hover:text-yellow-200 transition">
                  Cart
                </Link>

                <Link to="/orders" className="hover:text-yellow-200 transition">
                  Orders
                </Link>

                <Link to="/favorites" className="hover:text-yellow-200 transition">
                  Favorites
                </Link>

                <Link to="/recommendations" className="hover:text-yellow-200 transition">
                  Recommendations
                </Link>

                <Link to="/preferences" className="hover:text-yellow-200 transition">
                  Preferences
                </Link>
              </>
            )}

            {/* Owner Navigation */}
            {user?.role === "OWNER" && (
              <>
                <Link to="/owner" className="hover:text-yellow-200 transition">
                  Dashboard
                </Link>

                <Link to="/my-restaurants" className="hover:text-yellow-200 transition">
                  My Restaurants
                </Link>

                <Link to="/menu-management" className="hover:text-yellow-200 transition">
                  Menu
                </Link>

                <Link to="/orders" className="hover:text-yellow-200 transition">
                  Orders
                </Link>
              </>
            )}

            {/* Common Navigation */}
            <Link to="/profile" className="hover:text-yellow-200 transition">
              Profile
            </Link>

            <span className="font-semibold">
              👤 {user?.first_name}
            </span>

            <button
              onClick={handleLogout}
              className="bg-white text-orange-500 px-4 py-2 rounded-lg font-semibold hover:bg-orange-100 transition"
            >
              Logout
            </button>
          </nav>
        )}

        {/* Login and Register Buttons */}
        {!accessToken && (
          <div className="flex items-center gap-3">

            <Link
              to="/login"
              className="bg-white text-orange-500 px-5 py-2 rounded-lg font-semibold hover:bg-orange-100 transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="border-2 border-white text-white px-5 py-2 rounded-lg font-semibold hover:bg-white hover:text-orange-500 transition"
            >
              Register
            </Link>

          </div>
        )}

      </div>
    </header>
  );
}
