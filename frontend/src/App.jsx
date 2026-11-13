
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";

import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminOwnersPage from "./pages/AdminOwnersPage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import OwnerDashboardPage from "./pages/OwnerDashboardPage";
import RestaurantDetailsPage from "./pages/RestaurantDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfile from "./pages/EditProfile";
import ChangePassword from "./pages/ChangePassword";
import FavoritesPage from "./pages/FavoritesPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import PreferencesPage from "./pages/PreferencesPage";
import CreateRestaurant from "./pages/CreateRestaurant";
import EditRestaurant from "./pages/EditRestaurant";
import CreateMenu from "./pages/CreateMenu";
import EditMenu from "./pages/EditMenu";
import ForbiddenPage from "./pages/ForbiddenPage";
import MyRestaurantsPage from "./pages/MyRestaurantsPage";
import MenuManagementPage from "./pages/MenuManagementPage";

// ============================
// Private Route
// ============================

function PrivateRoute({ children }) {
  const token = useSelector((state) => state.auth.accessToken);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ============================
// Role-Based Route
// ============================

function RoleRoute({
  children,
  allowedRoles,
  redirectTo = "/forbidden",
}) {
  const token = useSelector((state) => state.auth.accessToken);
  const user = useSelector((state) => state.auth.user);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

// ============================
// Application Routes
// ============================

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-6">
        <Routes>

          {/* Customer Home */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]}>
                  <HomePage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/restaurants"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]}>
                  <HomePage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["ADMIN"]} redirectTo="/admin/login">
                  <AdminDashboardPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/owners"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["ADMIN"]} redirectTo="/admin/login">
                  <AdminOwnersPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Customer Cart */}
          <Route
            path="/cart"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]}>
                  <CartPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Restaurant Details */}
          <Route
            path="/restaurants/:restaurantId"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]}>
                  <RestaurantDetailsPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Orders */}
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER", "OWNER"]}>
                  <OrdersPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Owner Dashboard */}
          <Route
            path="/owner"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["OWNER"]}>
                  <OwnerDashboardPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER", "OWNER"]}>
                  <ProfilePage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/edit-profile"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER", "OWNER"]}>
                  <EditProfile />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/change-password"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER", "OWNER"]}>
                  <ChangePassword />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Customer Features */}
          <Route
            path="/favorites"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]}>
                  <FavoritesPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/recommendations"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]}>
                  <RecommendationsPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/preferences"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]}>
                  <PreferencesPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Owner Restaurant Management */}
          <Route
            path="/menu-management"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["OWNER"]}>
                  <MenuManagementPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/my-restaurants"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["OWNER"]}>
                  <MyRestaurantsPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/create-restaurant"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["OWNER"]}>
                  <CreateRestaurant />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/edit-restaurant/:restaurantId"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["OWNER"]}>
                  <EditRestaurant />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          {/* Owner Menu Management */}
          <Route
            path="/create-menu"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["OWNER"]}>
                  <CreateMenu />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/edit-menu/:menuId"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["OWNER"]}>
                  <EditMenu />
                </RoleRoute>
              </PrivateRoute>
            }
          />

        </Routes>
      </main>
    </div>
  );
}
