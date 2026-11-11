import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";

import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
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

function PrivateRoute({ children }) {
  const token = useSelector((state) => state.auth.accessToken);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RoleRoute({ children, allowedRoles, redirectTo = "/forbidden" }) {
  const token = useSelector((state) => state.auth.accessToken);
  const user = useSelector((state) => state.auth.user);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default function App() {
  const token = useSelector((state) => state.auth.accessToken);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]} redirectTo="/forbidden">
                  <HomePage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/restaurants"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]} redirectTo="/forbidden">
                  <HomePage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />

          <Route
            path="/cart"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]} redirectTo="/forbidden">
                  <CartPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/restaurants/:restaurantId"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]} redirectTo="/forbidden">
                  <RestaurantDetailsPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER", "OWNER"]} redirectTo="/forbidden">
                  <OrdersPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/owner"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["OWNER"]} redirectTo="/forbidden">
                  <OwnerDashboardPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER", "OWNER"]} redirectTo="/forbidden">
                  <ProfilePage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/edit-profile"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER", "OWNER"]} redirectTo="/forbidden">
                  <EditProfile />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/change-password"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER", "OWNER"]} redirectTo="/forbidden">
                  <ChangePassword />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/favorites"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]} redirectTo="/forbidden">
                  <FavoritesPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/recommendations"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]} redirectTo="/forbidden">
                  <RecommendationsPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/preferences"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["CUSTOMER"]} redirectTo="/forbidden">
                  <PreferencesPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/menu-management"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["OWNER"]} redirectTo="/forbidden">
                  <MenuManagementPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/my-restaurants"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["OWNER"]} redirectTo="/forbidden">
                  <MyRestaurantsPage />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/create-restaurant"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["OWNER"]} redirectTo="/forbidden">
                  <CreateRestaurant />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/edit-restaurant/:restaurantId"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["OWNER"]} redirectTo="/forbidden">
                  <EditRestaurant />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/create-menu"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["OWNER"]} redirectTo="/forbidden">
                  <CreateMenu />
                </RoleRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/edit-menu/:menuId"
            element={
              <PrivateRoute>
                <RoleRoute allowedRoles={["OWNER"]} redirectTo="/forbidden">
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