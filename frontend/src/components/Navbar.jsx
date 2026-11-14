
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const { accessToken, user } = useSelector(
    (state) => state.auth
  );

  const handleLogout = () => {
    dispatch(logout());
    setMenuOpen(false);
    navigate("/login");
  };

  const navBaseClass = "rounded-lg px-3 py-2 text-sm font-medium transition hover:text-yellow-200";

  const renderCustomerLinks = () => (
    <>
      <Link to="/" className={navBaseClass}>Home</Link>
      <Link to="/cart" className={navBaseClass}>Cart</Link>
      <Link to="/orders" className={navBaseClass}>Orders</Link>
      <Link to="/favorites" className={navBaseClass}>Favorites</Link>
      <Link to="/recommendations" className={navBaseClass}>Recommendations</Link>
      <Link to="/preferences" className={navBaseClass}>Preferences</Link>
    </>
  );

  const renderOwnerLinks = () => (
    <>
      <Link to="/owner" className={navBaseClass}>Dashboard</Link>
      <Link to="/my-restaurants" className={navBaseClass}>My Restaurants</Link>
      <Link to="/menu-management" className={navBaseClass}>Menu</Link>
      <Link to="/orders" className={navBaseClass}>Orders</Link>
    </>
  );

  const renderAdminLinks = () => (
    <>
      <Link to="/admin" className={navBaseClass}>Dashboard</Link>
      <Link to="/admin/owners" className={navBaseClass}>Owner Applications</Link>
    </>
  );

  return (
    <header className="bg-orange-500 shadow-md">
      <div className="mx-auto w-full max-w-[1600px] px-3 py-3 sm:px-4 md:px-5 lg:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="truncate text-2xl font-bold tracking-wide text-white sm:text-3xl"
          >
            🍔 JustEat
          </Link>

          {!accessToken && (
            <div className="hidden items-center gap-2 sm:flex sm:gap-3">
              <NavLink
                to="/login"
                end
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold transition sm:px-4 sm:text-base ${
                    isActive
                      ? "bg-white text-orange-500"
                      : "border border-white/80 bg-orange-500 text-white hover:bg-white hover:text-orange-500"
                  }`
                }
              >
                Login
              </NavLink>

              <NavLink
                to="/admin/login"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold transition sm:px-4 sm:text-base ${
                    isActive
                      ? "border border-white bg-white text-orange-500"
                      : "border border-white/80 bg-orange-500 text-white hover:bg-white hover:text-orange-500"
                  }`
                }
              >
                Admin
              </NavLink>

              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold transition sm:px-4 sm:text-base ${
                    isActive
                      ? "border border-white bg-white text-orange-500"
                      : "border-2 border-white bg-orange-500 text-white hover:bg-white hover:text-orange-500"
                  }`
                }
              >
                Register
              </NavLink>
            </div>
          )}

          {accessToken && (
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex rounded-lg border border-white/80 px-3 py-2 text-sm font-semibold text-white md:hidden"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          )}
        </div>

        {accessToken && (
          <div className={`${menuOpen ? "mt-3 flex" : "hidden md:flex"} flex-col gap-2 pb-1 md:mt-0 md:flex-row md:items-center md:justify-end md:gap-3`}>
            <nav className="flex flex-col gap-2 text-white md:flex-row md:flex-wrap md:items-center md:justify-end md:gap-3 lg:gap-5">
              {user?.role === "CUSTOMER" && renderCustomerLinks()}
              {user?.role === "OWNER" && renderOwnerLinks()}
              {user?.role === "ADMIN" && renderAdminLinks()}
              {user?.role !== "ADMIN" && (
                <Link to="/profile" className={navBaseClass}>Profile</Link>
              )}
            </nav>

            <div className="flex items-center justify-between gap-2 border-t border-white/20 pt-2 text-white md:border-0 md:pt-0">
              <span className="whitespace-nowrap text-sm font-semibold sm:text-base">
                👤 {user?.first_name}
              </span>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-100 sm:px-4"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {!accessToken && (
          <div className="mt-3 flex flex-wrap items-center justify-end gap-2 sm:hidden">
            <NavLink
              to="/login"
              end
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-white text-orange-500"
                    : "border border-white/80 bg-orange-500 text-white"
                }`
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/admin/login"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border border-white bg-white text-orange-500"
                    : "border border-white/80 bg-orange-500 text-white"
                }`
              }
            >
              Admin
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border border-white bg-white text-orange-500"
                    : "border-2 border-white bg-orange-500 text-white"
                }`
              }
            >
              Register
            </NavLink>
          </div>
        )}
      </div>
    </header>
  );
}
