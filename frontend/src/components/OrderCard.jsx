import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchOrderDetails, cancelOrder } from "../store/slices/ordersSlice";

const STATUS_STEPS = ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED"];

const STATUS_META = {
  PENDING:   { label: "Pending",   color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-700 border-blue-300" },
  PREPARING: { label: "Preparing", color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
  READY:     { label: "Ready",     color: "bg-green-100 text-green-700 border-green-300" },
  DELIVERED: { label: "Delivered", color: "bg-green-200 text-green-800 border-green-400" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-300" },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${meta.color}`}>
      {meta.label}
    </span>
  );
}

function StatusTracker({ status }) {
  if (status === "CANCELLED") {
    return (
      <div className="mt-4 flex items-center gap-2 text-sm text-red-500">
        <span className="text-base">✕</span> Order was cancelled
      </div>
    );
  }
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-1">
        {STATUS_STEPS.map((step, idx) => (
          <div key={step} className="flex flex-1 flex-col items-center">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold border-2 transition-colors ${
                idx <= currentIdx
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-gray-300 bg-white text-gray-400"
              }`}
            >
              {idx < currentIdx ? "✓" : idx + 1}
            </div>
            <span className={`mt-1 hidden text-[10px] font-medium sm:block ${idx <= currentIdx ? "text-orange-600" : "text-gray-400"}`}>
              {step.charAt(0) + step.slice(1).toLowerCase()}
            </span>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`absolute hidden`} />
            )}
          </div>
        ))}
      </div>
      {/* connector line */}
      <div className="relative -mt-[18px] flex items-center px-3.5">
        <div className="h-0.5 w-full bg-gray-200">
          <div
            className="h-full bg-orange-500 transition-all"
            style={{ width: `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function OrderCard({ order }) {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const details = useSelector((state) => state.orders.details[order.id]);
  const detailsLoading = useSelector((state) => state.orders.detailsLoading[order.id]);

  const handleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && !details) {
      dispatch(fetchOrderDetails(order.id));
    }
  };

  const handleCancel = async (e) => {
    e.stopPropagation();
    const result = await dispatch(cancelOrder(order.id));
    if (cancelOrder.fulfilled.match(result)) {
      toast.success("Order cancelled successfully");
    } else {
      toast.error(result.payload || "Could not cancel order");
    }
  };

  const date = new Date(order.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
  const time = new Date(order.created_at).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden transition-shadow hover:shadow-md">
      {/* Header - always visible */}
      <button
        onClick={handleExpand}
        className="w-full p-5 text-left"
        aria-expanded={expanded}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-gray-800">Order #{order.id}</h3>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {order.restaurant_name || "Restaurant"} · {date} at {time}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-orange-600">
              ${parseFloat(order.total_amount).toFixed(2)}
            </span>
            {order.status === "PENDING" && (
              <button
                onClick={handleCancel}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
              >
                Cancel
              </button>
            )}
            <span className={`text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span>
          </div>
        </div>

        {/* Status tracker */}
        <StatusTracker status={order.status} />
      </button>

      {/* Expandable details */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
          {detailsLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex animate-pulse justify-between">
                  <div className="h-4 w-2/5 rounded bg-gray-200" />
                  <div className="h-4 w-1/5 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          )}

          {details && !detailsLoading && (
            <>
              <h4 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Items
              </h4>
              <ul className="space-y-2">
                {details.items?.map((item) => (
                  <li key={item.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-700">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                        {item.quantity}
                      </span>
                      {item.item_name}
                    </span>
                    <span className="font-medium text-gray-800">
                      ${(parseFloat(item.price_at_order) * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              {order.special_instructions && (
                <p className="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
                  📝 {order.special_instructions}
                </p>
              )}
              <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-sm font-bold text-gray-800">
                <span>Total</span>
                <span>${parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
