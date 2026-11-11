import { Link } from "react-router-dom";

/**
 * ForbiddenPage Component
 *
 * This page is displayed when a user attempts
 * to access a route they are not authorized to view.
 *
 * Features:
 * - Displays a 403 Unauthorized message.
 * - Explains that access is restricted.
 * - Provides navigation back to the Home page
 *   or the user's Profile page.
 *
 * @returns {JSX.Element} 403 Forbidden page.
 */
export default function ForbiddenPage() {
  return (
    <section className="mx-auto max-w-2xl rounded-2xl bg-white p-10 text-center shadow-sm">

      {/* ==========================
          Error Code
      ========================== */}
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
        403 Unauthorized
      </p>

      {/* ==========================
          Page Heading
      ========================== */}
      <h1 className="mt-4 text-3xl font-bold text-gray-800">
        You do not have access to this area.
      </h1>

      {/* Error Description */}
      <p className="mt-3 text-gray-600">
        This page is restricted to the appropriate role.
        Use your assigned workspace to continue.
      </p>

      {/* ==========================
          Navigation Buttons
      ========================== */}
      <div className="mt-6 flex justify-center gap-3">

        {/* Navigate to Home Page */}
        <Link
          to="/"
          className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600"
        >
          Go Home
        </Link>

        {/* Navigate to Profile Page */}
        <Link
          to="/profile"
          className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
        >
          View Profile
        </Link>

      </div>
    </section>
  );
}