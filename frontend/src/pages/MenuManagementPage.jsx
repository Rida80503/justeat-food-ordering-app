import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { toast } from "react-toastify";

const FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Available", value: "available" },
  { label: "Today's Special", value: "special" },
  { label: "Deal of Day", value: "deal" },
];

function MenuSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1,2,3,4].map(i => (
        <div key={i} className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="h-5 w-1/3 rounded bg-gray-200" />
          <div className="h-5 w-16 rounded bg-gray-200" />
          <div className="ml-auto flex gap-2">
            <div className="h-7 w-16 rounded-lg bg-gray-200" />
            <div className="h-7 w-16 rounded-lg bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MenuManagementPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState({});

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/restaurants/my/restaurants");
      const list = res.data.data || [];
      setRestaurants(list);
      if (list.length > 0) setSelected(list[0].id);
    } catch { toast.error("Failed to load restaurants"); }
    finally { setLoading(false); }
  }, []);

  const fetchItems = useCallback(async (id) => {
    if (!id) return;
    setItemsLoading(true);
    try {
      // Fetch all items including unavailable by calling the route directly
      const res = await api.get(`/menus/restaurant/${id}`, { params: { limit: 100 } });
      setItems(res.data.data || []);
    } catch { toast.error("Failed to load menu items"); }
    finally { setItemsLoading(false); }
  }, []);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);
  useEffect(() => { if (selected) fetchItems(selected); }, [selected, fetchItems]);

  const busy = (key, val) => setActionBusy(p => ({...p, [key]: val}));

  const toggleAvailability = async (item) => {
    busy(item.id, true);
    try {
      await api.put(`/menus/${item.id}`, { is_available: !item.is_available });
      toast.success(`"${item.name}" ${!item.is_available ? "enabled" : "disabled"}`);
      fetchItems(selected);
    } catch (e) { toast.error(e.response?.data?.message || "Update failed"); }
    finally { busy(item.id, false); }
  };

const markSpecial = async (item) => {
  console.log("Special clicked", item);

  busy(`s${item.id}`, true);

  try {
    console.log("Calling API...");
    await api.patch(`/menus/${item.id}/mark-special`);
    console.log("API completed");

    toast.success("Success");
    fetchItems(selected);
  } catch (e) {
    console.error(e);
    toast.error(e.response?.data?.message || "Failed");
  } finally {
    busy(`s${item.id}`, false);
  }
};
  const markDeal = async (item) => {
    busy(`d${item.id}`, true);
    try {
      await api.patch(`/menus/${item.id}/mark-deal`);
      toast.success(`"${item.name}" marked as Deal of Day`);
      fetchItems(selected);
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { busy(`d${item.id}`, false); }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Remove "${item.name}" from the menu?`)) return;
    busy(`del${item.id}`, true);
    try {
      await api.delete(`/menus/${item.id}`);
      toast.success(`"${item.name}" removed`);
      fetchItems(selected);
    } catch (e) { toast.error(e.response?.data?.message || "Delete failed"); }
    finally { busy(`del${item.id}`, false); }
  };

  const filtered = items.filter(item => {
    if (filter === "available") return item.is_available;
    if (filter === "special") return item.is_todays_special;
    if (filter === "deal") return item.is_deal_of_day;
    return true;
  });

  const selectedName = restaurants.find(r => r.id === selected)?.name || "";

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">🍽️ Menu Management</h1>
          <p className="mt-1 text-gray-500">Toggle availability, mark specials, and manage all your menu items.</p>
        </div>
        <Link to="/create-menu" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition">
          + Add Item
        </Link>
      </div>

      {loading ? (
        <div className="h-12 animate-pulse rounded-xl bg-gray-200" />
      ) : restaurants.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">No restaurants found. <Link to="/create-restaurant" className="text-orange-600 font-semibold">Create one first.</Link></p>
        </div>
      ) : (
        <>
          {/* Restaurant tabs */}
          <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-4 shadow-sm">
            {restaurants.map(r => (
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
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {FILTER_TABS.map(t => (
                <button
                  key={t.value}
                  onClick={() => setFilter(t.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    filter === t.value
                      ? "border-gray-800 bg-gray-800 text-white"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {t.label} ({
                    t.value === "all" ? items.length
                    : t.value === "available" ? items.filter(i=>i.is_available).length
                    : t.value === "special" ? items.filter(i=>i.is_todays_special).length
                    : items.filter(i=>i.is_deal_of_day).length
                  })
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-500">{selectedName}</span>
          </div>

          {/* Items list */}
          {itemsLoading ? <MenuSkeleton /> : (
            <>
              {filtered.length === 0 && (
                <div className="rounded-2xl bg-white py-12 text-center shadow-sm">
                  <p className="text-5xl">🍽️</p>
                  <p className="mt-3 font-semibold text-gray-700">No items found</p>
                  <Link to="/create-menu" className="mt-4 inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
                    Add First Item
                  </Link>
                </div>
              )}

              <div className="space-y-3">
                {filtered.map(item => (
                  <div key={item.id} className={`rounded-xl bg-white p-4 shadow-sm border transition ${item.is_available ? "border-transparent" : "border-gray-200 opacity-75"}`}>
                    <div className="flex flex-wrap items-start gap-3">
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-gray-800 truncate">{item.name}</h3>
                          {item.is_todays_special && (
                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">⭐ Special</span>
                          )}
                          {item.is_deal_of_day && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">🔥 Deal</span>
                          )}
                          {!item.is_available && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">Unavailable</span>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500 truncate">{item.description || "No description"}</p>
                        <p className="mt-1 text-sm font-bold text-orange-600">${parseFloat(item.price).toFixed(2)}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {/* Available toggle */}
                        <button
                          onClick={() => toggleAvailability(item)}
                          disabled={actionBusy[item.id]}
                          title={item.is_available ? "Disable" : "Enable"}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                            item.is_available
                              ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                              : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          {item.is_available ? "✓ On" : "Off"}
                        </button>

                        {/* Mark Special */}
                        <button
                          onClick={() => markSpecial(item)}
                          // disabled={actionBusy[`s${item.id}`] || item.is_todays_special}
                          disabled={actionBusy[`s${item.id}`]}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                            item.is_todays_special
                              ? "border-orange-200 bg-orange-50 text-orange-600 cursor-default"
                              : "border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-300 hover:text-orange-600"
                          }`}
                        >
                          ⭐ Special
                        </button>

                        {/* Mark Deal */}
                        <button
                          onClick={() => markDeal(item)}
                          // disabled={actionBusy[`d${item.id}`] || item.is_deal_of_day}
                          disabled={actionBusy[`d${item.id}`]}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                            item.is_deal_of_day
                              ? "border-green-200 bg-green-50 text-green-600 cursor-default"
                              : "border-gray-200 bg-gray-50 text-gray-600 hover:border-green-300 hover:text-green-600"
                          }`}
                        >
                          🔥 Deal
                        </button>

                        {/* Edit */}
                        <Link
                          to={`/edit-menu/${item.id}`}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition"
                        >
                          Edit
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => deleteItem(item)}
                          disabled={actionBusy[`del${item.id}`]}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                        >
                          {actionBusy[`del${item.id}`] ? "…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
