/**
 * MenuCard Component
 *
 * Displays a single food item with:
 * - Food Image
 * - Name
 * - Description
 * - Price
 * - Today's Special Badge
 * - Deal of the Day Badge
 * - Add to Cart / Quantity Controls
 *
 * Props:
 * @param {Object} item - Menu item details.
 * @param {Object|null} cartItem - Existing cart item if already added.
 * @param {Function} onAdd - Called when user adds an item to the cart.
 * @param {Function} onIncrease - Called when user increases item quantity.
 * @param {Function} onDecrease - Called when user decreases item quantity.
 */
export default function MenuCard({
  item,
  cartItem,
  onAdd,
  onIncrease,
  onDecrease,
}) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden relative">

      {/* =======================================================
           Badges
           Shows Today's Special and Deal of the Day badges.
         ======================================================= */}
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        {item.is_todays_special && (
          <span className="bg-yellow-400 text-gray-800 px-2 py-1 rounded-full text-xs font-bold">
            ⭐ Special
          </span>
        )}

        {item.is_deal_of_day && (
          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            🔥 Deal
          </span>
        )}
      </div>

      {/* =======================================================
           Food Image
         ======================================================= */}
      <img
        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"
        alt={item.name}
        className="w-full h-48 object-cover"
      />

      <div className="p-5">

        {/* =======================================================
             Menu Item Information
             Displays Name, Description and Price.
           ======================================================= */}
        <div className="flex justify-between items-start">

          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {item.name}
            </h3>

            <p className="text-gray-500 text-sm mt-1">
              {item.description || "No description available"}
            </p>
          </div>

          <span className="text-lg font-bold text-orange-600">
            ₹{item.price}
          </span>

        </div>

        {/* =======================================================
             Cart Controls
             If item is not in cart -> Show ADD button.
             If item exists -> Show Increase/Decrease buttons.
           ======================================================= */}
        <div className="mt-6 flex justify-between items-center">

          <span className="text-sm text-gray-500">
            Freshly Prepared 🍽️
          </span>

          {!cartItem ? (

            /**
             * Item not present in cart.
             * Show ADD button.
             */
            <button
              onClick={() => onAdd(item)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-semibold transition"
            >
              ADD
            </button>

          ) : (

            /**
             * Item already exists in cart.
             * Show quantity controls.
             */
            <div className="flex items-center gap-3">

              {/* Decrease Quantity */}
              <button
                onClick={() => onDecrease(item, cartItem)}
                className="w-8 h-8 rounded-full bg-red-500 text-white font-bold"
              >
                −
              </button>

              {/* Current Quantity */}
              <span className="font-bold">
                {cartItem.quantity}
              </span>

              {/* Increase Quantity */}
              <button
                onClick={() => onIncrease(item, cartItem)}
                className="w-8 h-8 rounded-full bg-green-500 text-white font-bold"
              >
                +
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}