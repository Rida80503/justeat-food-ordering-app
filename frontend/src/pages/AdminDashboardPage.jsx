import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { api } from "../utils/api";

function ProfileField({ label, value, muted = false }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
        {label}
      </p>
      <p className={`mt-2 text-base font-medium ${muted ? "text-gray-500" : "text-gray-800"}`}>
        {value || "—"}
      </p>
    </div>
  );
}

function StatCard({ label, value, accent, helper }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800">{value}</p>
          {helper && <p className="mt-1 text-xs text-gray-400">{helper}</p>}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${accent}`}>
          {label.charAt(0)}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_customers: 0,
    total_owners: 0,
    total_admins: 0,
    pending_owners: 0,
    approved_owners: 0,
    rejected_owners: 0,
    total_restaurants: 0,
    total_orders: 0,
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/admin/stats");
        setStats(response.data.data || stats);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile");
        setProfile(response.data.data || null);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load admin profile");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchStats();
    fetchProfile();
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              Admin Overview
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-800">Platform Dashboard</h1>
          </div>

          <Link
            to="/admin/owners"
            className="inline-flex items-center rounded-lg bg-orange-500 px-4 py-2.5 font-semibold text-white transition hover:bg-orange-600"
          >
            Review Owner Applications
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total Users" value={stats.total_users} accent="bg-blue-50 text-blue-600" helper="All platform members" />
          <StatCard label="Customers" value={stats.total_customers} accent="bg-green-50 text-green-600" helper="Active shoppers" />
          <StatCard label="Owners" value={stats.total_owners} accent="bg-purple-50 text-purple-600" helper="Restaurant operators" />
          <StatCard label="Admins" value={stats.total_admins ?? 0} accent="bg-slate-50 text-slate-600" helper="Platform admins" />
          <StatCard label="Pending" value={stats.pending_owners} accent="bg-yellow-50 text-yellow-600" helper="Awaiting review" />
          <StatCard label="Approved" value={stats.approved_owners} accent="bg-emerald-50 text-emerald-600" helper="Approved accounts" />
          <StatCard label="Rejected" value={stats.rejected_owners} accent="bg-red-50 text-red-600" helper="Denied applications" />
          <StatCard label="Restaurants" value={stats.total_restaurants} accent="bg-orange-50 text-orange-600" helper="Active listings" />
          <StatCard label="Orders" value={stats.total_orders} accent="bg-cyan-50 text-cyan-600" helper="Placed orders" />
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              Profile
            </p>
            <h2 className="mt-1 text-xl font-bold text-gray-800">Administrator Account</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/edit-profile"
              className="rounded-lg bg-orange-500 px-4 py-2.5 font-semibold text-white transition hover:bg-orange-600"
            >
              Edit Profile
            </Link>
            <Link
              to="/change-password"
              className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 font-semibold text-orange-600 transition hover:bg-orange-100"
            >
              Change Password
            </Link>
          </div>
        </div>

        {profileLoading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        ) : profile ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ProfileField label="First Name" value={profile.first_name} />
            <ProfileField label="Last Name" value={profile.last_name} />
            <ProfileField label="Email" value={profile.email} />
            <ProfileField label="Phone Number" value={profile.phone} muted={!profile.phone} />
            <ProfileField label="Role" value={profile.role} />
            <ProfileField label="Account Status" value={profile.is_active ? "Active" : "Inactive"} />
          </div>
        ) : (
          <p className="mt-6 text-sm text-red-600">Unable to load admin profile.</p>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/admin/owners"
            className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 font-semibold text-orange-600 hover:bg-orange-100"
          >
            Approve / Reject Owners
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100"
          >
            Frontend Home
          </Link>
        </div>
      </div>
    </section>
  );
}
