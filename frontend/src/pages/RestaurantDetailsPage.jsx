import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { fetchRestaurantDetails } from "../store/slices/menuSlice";

import {
  addToCart,
  fetchCart,
  updateCartItem,
  removeFromCart,
  clearCartAPI,
} from "../store/slices/cartSlice";

import {
  fetchFavorites,
  toggleFavorite,
} from "../store/slices/favoriteSlice";

import Swal from "sweetalert2";
import { toast } from "react-toastify";
import MenuCard from "../components/MenuCard";

export default function RestaurantDetailsPage() {
  const { restaurantId } = useParams();
  const dispatch = useDispatch();

  const { restaurant, menu, loading, error } = useSelector(
    (state) => state.menu
  );

  const { items } = useSelector((state) => state.cart);
  const { favorites, saving } = useSelector((state) => state.favorites);

  useEffect(() => {
    dispatch(fetchRestaurantDetails(restaurantId));
    dispatch(fetchCart());
    dispatch(fetchFavorites());
  }, [dispatch, restaurantId]);

  const handleAddToCart = async (item) => {
  const result = await dispatch(
    addToCart({
      menu_id: item.id,
      restaurant_id: restaurant.id,
      quantity: 1,
    })
  );

  if (addToCart.fulfilled.match(result)) {
    dispatch(fetchCart());
    toast.success(`${item.name} added to cart`);
    return;
  }

  const message = result.payload || "Failed to add item";

  if (message.toLowerCase().includes("clear")) {
    const popup = await Swal.fire({
      title: "Cart already contains items",
      text: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Clear Cart & Add",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
    });

    if (popup.isConfirmed) {
      const clearResult = await dispatch(clearCartAPI());

      if (clearCartAPI.fulfilled.match(clearResult)) {
        toast.success("Cart cleared successfully");

        const retry = await dispatch(
          addToCart({
            menu_id: item.id,
            restaurant_id: restaurant.id,
            quantity: 1,
          })
        );

        if (addToCart.fulfilled.match(retry)) {
          dispatch(fetchCart());
          toast.success(`${item.name} added to cart`);
        } else {
          toast.error(retry.payload || "Failed to add item");
        }
      } else {
        toast.error(clearResult.payload || "Failed to clear cart");
      }
    }
  } else {
    toast.error(message);
  }
};

  const increaseQuantity = async (item, cartItem) => {
    const result = await dispatch(
      updateCartItem({
        menu_id: item.id,
        quantity: cartItem.quantity + 1,
      })
    );

    if (updateCartItem.fulfilled.match(result)) {
      dispatch(fetchCart());
    }
  };

  const decreaseQuantity = async (item, cartItem) => {
    if (cartItem.quantity === 1) {
      const result = await dispatch(removeFromCart(item.id));

      if (removeFromCart.fulfilled.match(result)) {
        dispatch(fetchCart());
      }
    } else {
      const result = await dispatch(
        updateCartItem({
          menu_id: item.id,
          quantity: cartItem.quantity - 1,
        })
      );

      if (updateCartItem.fulfilled.match(result)) {
        dispatch(fetchCart());
      }
    }
  };

  const isFavorite = favorites.some(
    (favorite) => favorite.restaurant_id === Number(restaurantId)
  );

  const handleFavoriteToggle = async () => {
    await dispatch(
      toggleFavorite({
        restaurant_id: Number(restaurantId),
        isFavorite,
      })
    );
    dispatch(fetchFavorites());
  };

  if (loading) {
    return (
      <section className="space-y-8 animate-pulse">
        {/* Header skeleton */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-72 bg-gray-200" />
          <div className="p-6 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-4/5" />
            <div className="flex gap-6 mt-2">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-28" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
            <div className="h-9 bg-gray-200 rounded-full w-36 mt-3" />
          </div>
        </div>
        {/* Menu grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="flex justify-between mt-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-9 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-5xl">⚠️</p>
        <p className="mt-4 text-lg font-semibold text-red-700">Failed to load restaurant</p>
        <p className="mt-1 text-sm text-red-500">{error}</p>
        <button
          onClick={() => dispatch(fetchRestaurantDetails(restaurantId))}
          className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-5xl">🍽️</p>
        <p className="mt-4 text-xl font-semibold text-gray-700">Restaurant not found</p>
        <p className="mt-2 text-sm text-gray-500">This restaurant may have been removed or is unavailable.</p>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* Restaurant Header */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200"
          alt={restaurant.name}
          className="w-full h-72 object-cover"
        />

        <div className="p-6">
          <h1 className="text-4xl font-bold text-gray-800">
            {restaurant.name}
          </h1>

          <p className="mt-3 text-gray-600">
            {restaurant.description}
          </p>

          <div className="flex flex-wrap gap-8 mt-6 text-gray-500">
            <span>📍 {restaurant.city}</span>
            <span>🍽️ {restaurant.cuisine_type}</span>
          </div>

          <button
            onClick={handleFavoriteToggle}
            disabled={saving}
            className={`mt-6 inline-flex items-center rounded-full px-4 py-2 font-medium transition ${
              isFavorite
                ? "bg-red-100 text-red-700"
                : "bg-orange-100 text-orange-700"
            } ${saving ? "opacity-70" : "hover:opacity-90"}`}
          >
            {isFavorite ? "♥ Favorited" : "♡ Save to favorites"}
          </button>
        </div>
      </div>

      {/* Menu Heading */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">
          Menu
        </h2>

        <span className="text-gray-500">
          {menu.length} Items
        </span>
      </div>

      {/* Today's Special Section */}
      {menu.some(item => item.is_todays_special) && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-orange-600 flex items-center gap-2">⭐ Today's Special</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menu.filter(item => item.is_todays_special).map((item) => {
              const cartItem = items.find((cart) => cart.menu_id === item.id);
              return (
                <MenuCard
                  key={item.id}
                  item={item}
                  cartItem={cartItem}
                  onAdd={handleAddToCart}
                  onIncrease={increaseQuantity}
                  onDecrease={decreaseQuantity}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Deal of the Day Section */}
      {menu.some(item => item.is_deal_of_day) && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-red-600 flex items-center gap-2">🔥 Deal of the Day</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menu.filter(item => item.is_deal_of_day).map((item) => {
              const cartItem = items.find((cart) => cart.menu_id === item.id);
              return (
                <MenuCard
                  key={item.id}
                  item={item}
                  cartItem={cartItem}
                  onAdd={handleAddToCart}
                  onIncrease={increaseQuantity}
                  onDecrease={decreaseQuantity}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* All Menu Heading */}
      <div className="flex justify-between items-center pt-4 border-t">
        <h2 className="text-2xl font-bold">
          All Items
        </h2>
      </div>

      {/* Menu Grid */}
      {menu.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No menu items found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menu.map((item) => {
            const cartItem = items.find(
              (cart) => cart.menu_id === item.id
            );

            return (
              <MenuCard
                key={item.id}
                item={item}
                cartItem={cartItem}
                onAdd={handleAddToCart}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}