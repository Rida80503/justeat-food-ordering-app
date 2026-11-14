import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { api } from "../utils/api";

const FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

const STATUS_STYLES = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function AdminOwnersPage() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOwners = async (filter = statusFilter) => {
    try {
      setLoading(true);
      const params = filter !== "ALL" ? { status: filter } : {};
      const response = await api.get("/admin/owners", { params });
      setOwners(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load owner applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners(statusFilter);
  }, [statusFilter]);

  const filteredCount = useMemo(() => owners.length, [owners]);

  const handleStatusUpdate = async (ownerId, action) => {
    try {
      setUpdatingId(ownerId);
      await api.patch(`/admin/owners/${ownerId}/${action}`);
      toast.success(`Owner application ${action}d successfully`);
      await fetchOwners(statusFilter);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} owner`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              Admin Control
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-800 sm:text-3xl">Owner Applications</h1>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                statusFilter === filter
                  ? "bg-orange-500 text-white"
                  : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <span className="text-sm text-gray-500">
              {filteredCount} application{filteredCount === 1 ? "" : "s"}
            </span>
          </div>

          {owners.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No owner applications match this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {owners.map((owner) => (
                    <tr key={owner.id}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">
                          {owner.first_name} {owner.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{owner.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {owner.phone || "Not provided"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[owner.approval_status] || "bg-gray-100 text-gray-700"}`}
                        >
                          {owner.approval_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {owner.approval_status !== "APPROVED" && (
                            <button
                              type="button"
                              disabled={updatingId === owner.id}
                              onClick={() => handleStatusUpdate(owner.id, "approve")}
                              className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
                            >
                              {updatingId === owner.id ? "Working..." : "Approve"}
                            </button>
                          )}

                          {owner.approval_status !== "REJECTED" && (
                            <button
                              type="button"
                              disabled={updatingId === owner.id}
                              onClick={() => handleStatusUpdate(owner.id, "reject")}
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                            >
                              {updatingId === owner.id ? "Working..." : "Reject"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
