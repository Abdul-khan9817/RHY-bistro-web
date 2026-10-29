import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { Link } from "wouter";
import {
  CalendarDays,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Utensils,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

export default function Dashboard() {
  const { authHeader } = useAdminAuth();
  const queryClient = useQueryClient();

  // Fetch KPI stats
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/stats", { headers: authHeader });
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 30000,
  });

  // Fetch 14-day trends
  const { data: trendsData, isLoading: loadingTrends } = useQuery({
    queryKey: ["admin", "dashboard", "trends"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard/trends", { headers: authHeader });
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 60000,
  });

  // Quick status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success("Reservation status updated");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Confirmed</span>;
      case "seated":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Seated</span>;
      case "completed":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">Completed</span>;
      case "cancelled":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Welcome & Subtitle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#0f2419]">Executive Overview</h2>
          <p className="text-xs text-stone-500 mt-1">Live restaurant performance, bookings, and floor activity.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f2419] text-white rounded-lg text-xs font-semibold hover:bg-[#183a29] transition-all shadow-sm"
          >
            <span>Manage All Bookings</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Today's Bookings */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs hover:border-[#c9a84c]/50 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Bookings</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <CalendarDays size={18} />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-stone-900">
            {loadingStats ? "..." : statsData?.todayBookings ?? 0}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Reservations scheduled for today</p>
        </div>

        {/* Expected Guests */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs hover:border-[#c9a84c]/50 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Guests Expected</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Users size={18} />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-stone-900">
            {loadingStats ? "..." : statsData?.totalGuestsToday ?? 0}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Covers booked for lunch & dinner</p>
        </div>

        {/* Pending Requests */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs hover:border-[#c9a84c]/50 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Action</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-amber-600">
            {loadingStats ? "..." : statsData?.pendingBookings ?? 0}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Unconfirmed customer requests</p>
        </div>

        {/* Active Tables */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs hover:border-[#c9a84c]/50 transition-colors">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Tables Active</span>
            <div className="p-2 rounded-lg bg-[#c9a84c]/10 text-[#0f2419]">
              <Utensils size={18} />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-stone-900">
            {loadingStats ? "..." : `${statsData?.activeTables ?? 0} / ${statsData?.totalTables ?? 0}`}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Ready for seating on floor</p>
        </div>

      </div>

      {/* Chart & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 14-day trend chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#c9a84c]" />
              <h3 className="font-serif font-bold text-stone-900">14-Day Reservation Volume</h3>
            </div>
            <span className="text-[11px] text-stone-400">Total Bookings vs Guests</span>
          </div>

          <div className="h-64 w-full">
            {loadingTrends ? (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">Loading metrics...</div>
            ) : trendsData && trendsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="guestsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#c9a84c" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f2419" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0f2419" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#a8a29e" fontSize={11} tickLine={false} />
                  <YAxis stroke="#a8a29e" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f2419",
                      borderColor: "#c9a84c",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="guests"
                    name="Guests"
                    stroke="#c9a84c"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#guestsGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    name="Bookings"
                    stroke="#0f2419"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#bookingsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-stone-400">No booking history yet</div>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-stone-900 mb-1">Reservation Statuses</h3>
            <p className="text-xs text-stone-500 mb-4">Current state across all bookings.</p>

            <div className="space-y-3">
              {[
                { label: "Confirmed", count: statsData?.statusBreakdown?.confirmed || 0, color: "bg-emerald-500" },
                { label: "Seated", count: statsData?.statusBreakdown?.seated || 0, color: "bg-blue-500" },
                { label: "Pending", count: statsData?.statusBreakdown?.pending || 0, color: "bg-amber-500" },
                { label: "Completed", count: statsData?.statusBreakdown?.completed || 0, color: "bg-purple-500" },
                { label: "Cancelled", count: statsData?.statusBreakdown?.cancelled || 0, color: "bg-red-500" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                    <span className="font-medium text-stone-700">{s.label}</span>
                  </div>
                  <span className="font-bold text-stone-900">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100">
            <Link
              href="/admin/bookings"
              className="w-full block text-center py-2 text-xs font-semibold text-[#0f2419] bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              Filter & Search All Bookings
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Reservations Quick-Action Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-stone-900">Recent Table Bookings</h3>
            <p className="text-xs text-stone-500 mt-0.5">Latest customer submissions received by the restaurant.</p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-semibold text-[#c9a84c] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/75 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Guests</th>
                <th className="py-3 px-4">Table</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loadingStats ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">Loading reservations...</td>
                </tr>
              ) : !statsData?.recentBookings || statsData.recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">No reservations placed yet.</td>
                </tr>
              ) : (
                statsData.recentBookings.map((b: any) => (
                  <tr key={b._id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#0f2419]">{b.ref}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900">{b.name}</div>
                      <div className="text-stone-400 text-[11px]">{b.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-stone-800">{b.date}</div>
                      <div className="text-stone-500">{b.time}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-800">{b.guests} {b.guests === 1 ? "pers" : "pers"}</td>
                    <td className="py-3 px-4 text-stone-600">
                      {b.tableId?.name || <span className="text-stone-400 italic">Unassigned</span>}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(b.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {b.status !== "seated" && b.status !== "completed" && b.status !== "cancelled" && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: b._id, status: "seated" })}
                            className="p-1 px-2 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-semibold transition-colors"
                            title="Mark as Seated"
                          >
                            Seat
                          </button>
                        )}
                        {b.status === "seated" && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: b._id, status: "completed" })}
                            className="p-1 px-2 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 text-[11px] font-semibold transition-colors"
                            title="Mark Completed"
                          >
                            Complete
                          </button>
                        )}
                        {b.status !== "cancelled" && b.status !== "completed" && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: b._id, status: "cancelled" })}
                            className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors"
                            title="Cancel Booking"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
