import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import restaurantReducer from "./slices/restaurantSlice";
import menuReducer from "./slices/menuSlice";
import cartReducer from "./slices/cartSlice";
import ordersReducer from "./slices/ordersSlice";
import favoriteReducer from "./slices/favoriteSlice";
import preferenceReducer from "./slices/preferenceSlice";
import recommendationReducer from "./slices/recommendationSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    restaurants: restaurantReducer,
    menu: menuReducer,
    cart: cartReducer,
    orders: ordersReducer,
    favorites: favoriteReducer,
    preferences: preferenceReducer,
    recommendations: recommendationReducer,
  },
});

export default store;