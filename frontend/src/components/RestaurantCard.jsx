/**
 * Cuisine Images
 *
 * Maps cuisine types to their
 * corresponding display images.
 *
 * If a cuisine type is not found,
 * the default image is used.
 */
const CUISINE_IMAGES = {
  italian: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
  chinese: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
  indian: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  mexican: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
  japanese: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800",
  thai: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800",
  american: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=800",
  mediterranean: "https://images.unsplash.com/photo-1544025162-d76594e8bb5c?w=800",
  french: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
  default: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
};

/**
 * Returns the appropriate cuisine image.
 *
 * Parameters:
 * @param {string} cuisineType
 *
 * Returns:
 * - Matching cuisine image
 * - Default image if no match is found
 */
function getCuisineImage(cuisineType) {

  // No cuisine available
  if (!cuisineType) {
    return CUISINE_IMAGES.default;
  }

  const key = cuisineType.toLowerCase();

  // Find matching cuisine image
  return (
    Object.entries(CUISINE_IMAGES)
      .find(([k]) => key.includes(k))?.[1]
      || CUISINE_IMAGES.default
  );
}

/**
 * RatingStars Component
 *
 * Displays restaurant rating.
 *
 * If no rating exists,
 * displays "New".
 *
 * Props:
 * @param {number|string} rating
 */
function RatingStars({ rating }) {

  const r = parseFloat(rating) || 0;

  return (
    <span className="flex items-center gap-1 text-sm font-semibold">

      {/* Star Icon */}
      <span className="text-yellow-400">
        ★
      </span>

      {/* Rating Value */}
      <span
        className={
          r >= 4
            ? "text-green-600"
            : r >= 3
            ? "text-yellow-600"
            : "text-gray-500"
        }
      >
        {r > 0 ? r.toFixed(1) : "New"}
      </span>

    </span>
  );
}

/**
 * RestaurantCardSkeleton Component
 *
 * Displays loading placeholders
 * while restaurant data is being fetched.
 */
export function RestaurantCardSkeleton() {

  return (
    <div className="animate-pulse bg-white rounded-xl shadow-md overflow-hidden">

      <div className="h-48 bg-gray-200" />

      <div className="p-5 space-y-3">

        <div className="flex justify-between">
          <div className="h-5 bg-gray-200 rounded w-3/5" />
          <div className="h-5 bg-gray-200 rounded w-10" />
        </div>

        <div className="h-4 bg-gray-200 rounded w-full" />

        <div className="h-4 bg-gray-200 rounded w-4/5" />

        <div className="flex justify-between mt-4">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>

      </div>

    </div>
  );
}

/**
 * RestaurantCard Component
 *
 * Displays a restaurant card.
 *
 * Features:
 * - Restaurant Image
 * - Name
 * - Rating
 * - Description
 * - City
 * - Delivery Time
 * - Delivery Fee
 * - Open/Closed Badge
 * - Today's Special Badge
 *
 * Props:
 * @param {Object} restaurant
 * @param {Function} onClick
 */
export default function RestaurantCard({
  restaurant,
  onClick,
}) {

  /**
   * Convert rating to number.
   */
  const rating =
    parseFloat(restaurant.average_rating) || 0;

  /**
   * Convert delivery fee to number.
   */
  const fee =
    parseFloat(restaurant.delivery_fee) || 0;

  return (

    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group"
    >

      {/* ==========================================
           Restaurant Image Section
         ========================================== */}

      <div className="relative h-48 overflow-hidden">

        <img
          src={getCuisineImage(
            restaurant.cuisine_type
          )}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Open / Closed Badge */}
        <div className="absolute top-3 left-3 flex gap-2">

          {restaurant.is_active ? (

            <span className="bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
              Open
            </span>

          ) : (

            <span className="bg-gray-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
              Closed
            </span>

          )}

          {/* Today's Special */}
          {restaurant.has_todays_special && (

            <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
              ⭐ Special
            </span>

          )}

        </div>

        {/* Cuisine Badge */}
        {restaurant.cuisine_type && (

          <span className="absolute top-3 right-3 bg-white/90 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full shadow">
            {restaurant.cuisine_type}
          </span>

        )}

      </div>

      {/* ==========================================
           Restaurant Information
         ========================================== */}

      <div className="p-5">

        <div className="flex justify-between items-start gap-2">

          <h2 className="text-lg font-bold text-gray-800 leading-tight line-clamp-1">
            {restaurant.name}
          </h2>

          <RatingStars rating={rating} />

        </div>

        {/* Description */}
        <p className="text-gray-500 text-sm mt-2 line-clamp-2 min-h-[2.5rem]">
          {restaurant.description || "No description available"}
        </p>

        {/* Restaurant Footer */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-500 border-t border-gray-100 pt-3">

          {/* City */}
          <span className="flex items-center gap-1">
            📍
            <span className="truncate max-w-[100px]">
              {restaurant.city}
            </span>
          </span>

          {/* Delivery Time */}
          <span className="flex items-center gap-1">
            🕐 {restaurant.delivery_time_minutes} min
          </span>

          {/* Delivery Fee */}
          <span className="flex items-center gap-1 font-medium text-orange-600">

            {fee === 0
              ? "Free delivery"
              : `$${fee.toFixed(2)} fee`}

          </span>

        </div>

      </div>

    </div>
  );
}