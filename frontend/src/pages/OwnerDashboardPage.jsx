import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { toast } from "react-toastify";

const STATUS_META = {
  PENDING: { label: "Pending", bg: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "Confirmed", bg: "bg-blue-100 text-blue-700" },
  PREPARING: { label: "Preparing", bg: "bg-indigo-100 text-indigo-700" },
  READY: { label: "Ready", bg: "bg-green-100 text-green-700" },
  DELIVERED: { label: "Delivered", bg: "bg-green-200 text-green-800" },
  CANCELLED: { label: "Cancelled", bg: "bg-red-100 text-red-600" },
};

const NEXT_STATUS = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "DELIVERED",
};

const NEXT_LABEL = {
  PENDING: "Accept",
  CONFIRMED: "Preparing",
  PREPARING: "Ready",
  READY: "Delivered",
};

const STATUS_TABS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "DELIVERED",
  "CANCELLED",
];

function SummaryCard({ icon, label, value, sub, accent }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm flex items-start gap-4">
      <span
        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl ${accent}`}
      >
        {icon}
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-64 rounded-xl bg-gray-200" />
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-gray-200" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-gray-200" />
    </div>
  );
}

export default function OwnerDashboardPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [statusTab, setStatusTab] = useState("ALL");
  const [actionLoading, setActionLoading] = useState({});

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/restaurants/my/restaurants");
      const list = res.data.data || [];
      setRestaurants(list);
      if (list.length > 0) setSelected(list[0].id);
    } catch {
      toast.error("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async (id) => {
    if (!id) return;
    setOrdersLoading(true);
    try {
      const res = await api.get(`/orders/restaurant/${id}`, {
        params: { limit: 100 },
      });
      setOrders(res.data.data || []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);
  useEffect(() => {
    if (selected) fetchOrders(selected);
  }, [selected, fetchOrders]);

  const advance = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setActionLoading((p) => ({ ...p, [order.id]: true }));
    try {
      await api.put(`/orders/${order.id}/status`, { status: next });
      toast.success(`Order #${order.id} → ${next}`);
      fetchOrders(selected);
    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed");
    } finally {
      setActionLoading((p) => ({ ...p, [order.id]: false }));
    }
  };

  const reject = async (order) => {
    setActionLoading((p) => ({ ...p, [`r${order.id}`]: true }));
    try {
      await api.post(`/orders/${order.id}/reject`);
      toast.success(`Order #${order.id} rejected`);
      fetchOrders(selected);
    } catch (e) {
      toast.error(e.response?.data?.message || "Reject failed");
    } finally {
      setActionLoading((p) => ({ ...p, [`r${order.id}`]: false }));
    }
  };

  const summary = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "PENDING").length;
    const active = orders.filter((o) =>
      ["CONFIRMED", "PREPARING", "READY"].includes(o.status),
    ).length;
    const delivered = orders.filter((o) => o.status === "DELIVERED").length;
    const revenue = orders
      .filter((o) => o.status === "DELIVERED")
      .reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
    return { total, pending, active, delivered, revenue };
  }, [orders]);

  const filtered = useMemo(
    () =>
      statusTab === "ALL"
        ? orders
        : orders.filter((o) => o.status === statusTab),
    [orders, statusTab],
  );

  const selectedName = restaurants.find((r) => r.id === selected)?.name || "";

  if (loading) return <DashboardSkeleton />;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            👨‍💼 Owner Dashboard
          </h1>
          <p className="mt-1 text-gray-500">
            Manage restaurants, menus, and incoming orders.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/create-restaurant"
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
          >
            + Restaurant
          </Link>
          <Link
            to="/menu-management"
            className="rounded-lg border border-orange-400 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition"
          >
            Manage Menu
          </Link>
        </div>
      </div>

      {restaurants.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="text-5xl">🏪</p>
          <p className="mt-4 text-xl font-semibold text-gray-700">
            No restaurants yet
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Create your first restaurant to start receiving orders.
          </p>
          <Link
            to="/create-restaurant"
            className="mt-6 inline-block rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white hover:bg-orange-600"
          >
            Create Restaurant
          </Link>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <SummaryCard
              icon="🏪"
              label="Restaurants"
              value={restaurants.length}
              sub="Total locations"
              accent="bg-blue-50"
            />
            <SummaryCard
              icon="📦"
              label="Total Orders"
              value={summary.total}
              sub={selectedName}
              accent="bg-purple-50"
            />
            <SummaryCard
              icon="⏳"
              label="Pending"
              value={summary.pending}
              sub="Awaiting action"
              accent="bg-yellow-50"
            />
            <SummaryCard
              icon="🔥"
              label="Active"
              value={summary.active}
              sub="In progress"
              accent="bg-orange-50"
            />
            <SummaryCard
              icon="✅"
              label="Delivered"
              value={summary.delivered}
              sub="Completed"
              accent="bg-green-50"
            />
          </div>

          {/* Restaurant selector */}
          <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
            <span className="text-sm font-semibold text-gray-600">
              Restaurant:
            </span>
            {restaurants.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  selected === r.id
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-gray-200 text-gray-600 hover:border-orange-300"
                }`}
              >
                {r.name}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              <Link
                to={`/edit-restaurant/${selected}`}
                className="text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                Edit ✏️
              </Link>
              <Link
                to="/create-menu"
                className="text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                + Menu item
              </Link>
            </div>
          </div>

          {/* Orders panel */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Orders — {selectedName}
              </h2>
              {ordersLoading && (
                <span className="text-sm text-gray-400 animate-pulse">
                  Refreshing…
                </span>
              )}
            </div>

            {/* Status tabs */}
            <div className="mb-4 flex flex-wrap gap-2">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusTab(tab)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    statusTab === tab
                      ? "border-gray-800 bg-gray-800 text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {tab === "ALL"
                    ? `All (${orders.length})`
                    : `${tab} (${orders.filter((o) => o.status === tab).length})`}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                No orders
                {statusTab !== "ALL" ? ` with status "${statusTab}"` : ""} for
                this restaurant yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-2 px-3 text-left font-semibold text-gray-600">
                        Order
                      </th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-600">
                        Customer
                      </th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-600">
                        Items
                      </th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-600">
                        Total
                      </th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-600">
                        Date
                      </th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-600">
                        Status
                      </th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order) => {
                      const meta = STATUS_META[order.status] || {};
                      const next = NEXT_STATUS[order.status];
                      const adv = actionLoading[order.id];
                      const rej = actionLoading[`r${order.id}`];
                      return (
                        <tr
                          key={order.id}
                          className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                        >
                          <td className="py-3 px-3 font-medium text-gray-800">
                            #{order.id}
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-medium text-gray-800">
                              {order.customer_name || "-"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.customer_phone || "-"}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="space-y-1">
                              {order.items?.map((item) => (
                                <div key={item.id} className="text-xs">
                                  {item.item_name} × {item.quantity}
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="py-3 px-3 font-semibold text-orange-600">
                            ${parseFloat(order.total_amount).toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.bg}`}
                            >
                              {meta.label || order.status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1.5">
                              {next && (
                                <button
                                  onClick={() => advance(order)}
                                  disabled={adv}
                                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                                    order.status === "PENDING"
                                      ? "bg-green-500 text-white hover:bg-green-600"
                                      : "bg-orange-500 text-white hover:bg-orange-600"
                                  }`}
                                >
                                  {adv ? "…" : NEXT_LABEL[order.status]}
                                </button>
                              )}
                              {order.status === "PENDING" && (
                                <button
                                  onClick={() => reject(order)}
                                  disabled={rej}
                                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                                >
                                  {rej ? "…" : "Reject"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
