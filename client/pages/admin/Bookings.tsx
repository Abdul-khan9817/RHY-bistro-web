import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  FileText,
  X,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Bookings() {
  const { authHeader } = useAdminAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<any>(null);

  // New Booking Form state
  const [newBooking, setNewBooking] = useState({
    name: "",
    email: "",
    phone: "",
    guests: 2,
    date: new Date().toISOString().slice(0, 10),
    time: "19:00",
    requests: "",
    tableId: "",
    source: "phone",
    status: "confirmed",
  });

  // Fetch Tables for assignment dropdown
  const { data: tablesData } = useQuery({
    queryKey: ["admin", "tables"],
    queryFn: async () => {
      const res = await fetch("/api/admin/tables", { headers: authHeader });
      const json = await res.json();
      return json.data || [];
    },
  });

  // Fetch Bookings
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ["admin", "bookings", search, statusFilter, dateFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (dateFilter) params.set("date", dateFilter);
      params.set("limit", "100");

      const res = await fetch(`/api/admin/bookings?${params.toString()}`, {
        headers: authHeader,
      });
      const json = await res.json();
      return json.data || [];
    },
  });

  // Create Booking Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create booking");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Reservation added successfully");
      setIsAddOpen(false);
      setNewBooking({
        name: "",
        email: "",
        phone: "",
        guests: 2,
        date: new Date().toISOString().slice(0, 10),
        time: "19:00",
        requests: "",
        tableId: "",
        source: "phone",
        status: "confirmed",
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  // Update Booking Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update booking");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Booking updated");
      setEditBooking(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  // Delete Booking Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "DELETE",
        headers: authHeader,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete booking");
      return json;
    },
    onSuccess: () => {
      toast.success("Booking removed");
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "seated":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      case "no-show":
        return "bg-stone-200 text-stone-700 border-stone-300";
      default:
        return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & New Booking CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#0f2419]">Reservations Management</h2>
          <p className="text-xs text-stone-500 mt-1">Search, confirm, reassign tables, or create manual phone/walk-in bookings.</p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-[#0f2419] hover:bg-[#183a29] text-white flex items-center gap-2 text-xs font-semibold shadow-sm"
        >
          <Plus size={16} />
          <span>New Reservation</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ref, phone..."
            className="pl-9 h-10 text-xs border-stone-200 focus-visible:ring-[#c9a84c]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Date Picker Filter */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
            <Calendar size={14} className="text-stone-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-xs text-stone-800 outline-none"
            />
            {dateFilter && (
              <button onClick={() => setDateFilter("")} className="text-stone-400 hover:text-stone-600 ml-1">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-700 outline-none focus:ring-1 focus:ring-[#c9a84c]"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="seated">Seated</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No-Show</option>
          </select>

        </div>
      </div>

      {/* Bookings Data Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/75 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Ref</th>
                <th className="py-3.5 px-4">Guest Details</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Party Size</th>
                <th className="py-3.5 px-4">Table</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">Loading reservations...</td>
                </tr>
              ) : !bookingsData || bookingsData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    No reservations matching current filters.
                  </td>
                </tr>
              ) : (
                bookingsData.map((b: any) => (
                  <tr key={b._id} className="hover:bg-stone-50/60 transition-colors">
                    
                    {/* Ref */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0f2419]">
                      {b.ref}
                    </td>

                    {/* Guest details */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{b.name}</div>
                      <div className="flex items-center gap-2 text-stone-500 text-[11px] mt-0.5">
                        <span className="flex items-center gap-1"><Phone size={10} />{b.phone}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Mail size={10} />{b.email}</span>
                      </div>
                      {b.requests && (
                        <div className="mt-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block max-w-xs truncate">
                          "{b.requests}"
                        </div>
                      )}
                      {Array.isArray(b.preOrderedItems) && b.preOrderedItems.length > 0 && (
                        <div className="mt-1.5 text-[11px] text-[#0f2419] bg-[#f7f3ea] px-2 py-1.5 rounded border border-[#e8dfc8] max-w-xs">
                          <div className="font-semibold mb-0.5">
                            Pre-order · CHF {(b.preOrderTotal ?? 0).toFixed(2)}
                          </div>
                          <ul className="space-y-0.5 text-stone-600">
                            {b.preOrderedItems.map((item: any, idx: number) => (
                              <li key={`${item.menuItemId}-${idx}`}>
                                {item.quantity}× {item.nameEn} (CHF {(item.price * item.quantity).toFixed(2)})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </td>

                    {/* Date & Time */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-800">{b.date}</div>
                      <div className="text-stone-500 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {b.time}
                      </div>
                    </td>

                    {/* Guests */}
                    <td className="py-3.5 px-4 font-bold text-stone-800">
                      {b.guests} {b.guests === 1 ? "guest" : "guests"}
                    </td>

                    {/* Table Assignment */}
                    <td className="py-3.5 px-4">
                      <select
                        value={b.tableId?._id || b.tableId || ""}
                        onChange={(e) =>
                          updateMutation.mutate({
                            id: b._id,
                            data: { tableId: e.target.value || null },
                          })
                        }
                        className="bg-stone-50 border border-stone-200 text-xs rounded px-2 py-1 outline-none text-stone-700 focus:ring-1 focus:ring-[#c9a84c]"
                      >
                        <option value="">Unassigned</option>
                        {tablesData?.map((t: any) => (
                          <option key={t._id} value={t._id}>
                            {t.name} (cap: {t.capacity})
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={b.status}
                        onChange={(e) =>
                          updateMutation.mutate({
                            id: b._id,
                            data: { status: e.target.value },
                          })
                        }
                        className={`text-xs font-semibold rounded-full px-2.5 py-1 border outline-none ${getStatusColor(
                          b.status,
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="seated">Seated</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No-Show</option>
                      </select>
                    </td>

                    {/* Source */}
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                        {b.source || "online"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setEditBooking(b)}
                          className="p-1.5 text-stone-500 hover:text-[#0f2419] hover:bg-stone-100 rounded transition-colors"
                          title="View / Edit details"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete reservation ${b.ref} (${b.name})?`)) {
                              deleteMutation.mutate(b._id);
                            }
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Delete reservation"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Reservation Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-stone-900">Add Walk-In / Phone Booking</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  ...newBooking,
                  guests: Number(newBooking.guests),
                  tableId: newBooking.tableId || undefined,
                });
              }}
              className="space-y-4 pt-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700">Guest Name *</label>
                  <Input
                    required
                    value={newBooking.name}
                    onChange={(e) => setNewBooking({ ...newBooking, name: e.target.value })}
                    placeholder="Sophie Martin"
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700">Phone Number *</label>
                  <Input
                    required
                    value={newBooking.phone}
                    onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                    placeholder="+41 79 123 45 67"
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700">Email Address *</label>
                <Input
                  required
                  type="email"
                  value={newBooking.email}
                  onChange={(e) => setNewBooking({ ...newBooking, email: e.target.value })}
                  placeholder="sophie@example.com"
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-stone-700">Date *</label>
                  <Input
                    type="date"
                    required
                    value={newBooking.date}
                    onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700">Time *</label>
                  <select
                    value={newBooking.time}
                    onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                    className="mt-1 w-full h-9 px-2 bg-stone-50 border border-stone-200 rounded text-xs outline-none"
                  >
                    {["11:30", "12:00", "12:30", "13:00", "13:30", "18:30", "19:00", "19:30", "20:00", "20:30"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-700">Guests *</label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={newBooking.guests}
                    onChange={(e) => setNewBooking({ ...newBooking, guests: Number(e.target.value) })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700">Assign Table</label>
                  <select
                    value={newBooking.tableId}
                    onChange={(e) => setNewBooking({ ...newBooking, tableId: e.target.value })}
                    className="mt-1 w-full h-9 px-2 bg-stone-50 border border-stone-200 rounded text-xs outline-none"
                  >
                    <option value="">Auto / Assign Later</option>
                    {tablesData?.map((t: any) => (
                      <option key={t._id} value={t._id}>
                        {t.name} (Cap: {t.capacity})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-700">Booking Channel</label>
                  <select
                    value={newBooking.source}
                    onChange={(e) => setNewBooking({ ...newBooking, source: e.target.value })}
                    className="mt-1 w-full h-9 px-2 bg-stone-50 border border-stone-200 rounded text-xs outline-none"
                  >
                    <option value="phone">Phone Call</option>
                    <option value="walkin">Walk-In</option>
                    <option value="admin">Admin Portal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700">Customer Requests & Allergies</label>
                <textarea
                  value={newBooking.requests}
                  onChange={(e) => setNewBooking({ ...newBooking, requests: e.target.value })}
                  rows={2}
                  placeholder="e.g. Birthday celebration, High chair requested..."
                  className="mt-1 w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="bg-[#0f2419] text-white text-xs">
                  {createMutation.isPending ? "Saving..." : "Save Reservation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Details Modal */}
      {editBooking && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-stone-200">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">Edit Reservation</h3>
                <p className="text-xs font-mono text-[#c9a84c] mt-0.5">{editBooking.ref}</p>
              </div>
              <button onClick={() => setEditBooking(null)} className="text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate({
                  id: editBooking._id,
                  data: {
                    name: editBooking.name,
                    phone: editBooking.phone,
                    email: editBooking.email,
                    date: editBooking.date,
                    time: editBooking.time,
                    guests: Number(editBooking.guests),
                    status: editBooking.status,
                    tableId: editBooking.tableId?._id || editBooking.tableId || null,
                    notes: editBooking.notes || "",
                    requests: editBooking.requests || "",
                  },
                });
              }}
              className="space-y-4 pt-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700">Customer Name</label>
                  <Input
                    value={editBooking.name}
                    onChange={(e) => setEditBooking({ ...editBooking, name: e.target.value })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700">Phone</label>
                  <Input
                    value={editBooking.phone}
                    onChange={(e) => setEditBooking({ ...editBooking, phone: e.target.value })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-stone-700">Date</label>
                  <Input
                    type="date"
                    value={editBooking.date}
                    onChange={(e) => setEditBooking({ ...editBooking, date: e.target.value })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700">Time</label>
                  <Input
                    value={editBooking.time}
                    onChange={(e) => setEditBooking({ ...editBooking, time: e.target.value })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700">Guests</label>
                  <Input
                    type="number"
                    value={editBooking.guests}
                    onChange={(e) => setEditBooking({ ...editBooking, guests: Number(e.target.value) })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700">Internal Staff Notes</label>
                <textarea
                  value={editBooking.notes || ""}
                  onChange={(e) => setEditBooking({ ...editBooking, notes: e.target.value })}
                  rows={2}
                  placeholder="Notes for kitchen / host team..."
                  className="mt-1 w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <Button type="button" variant="outline" onClick={() => setEditBooking(null)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending} className="bg-[#0f2419] text-white text-xs">
                  {updateMutation.isPending ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
