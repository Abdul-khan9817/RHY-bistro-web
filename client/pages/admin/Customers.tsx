import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { Search, Users, Mail, Phone, Calendar, Award } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Customers() {
  const { authHeader } = useAdminAuth();
  const [search, setSearch] = useState("");

  const { data: customers, isLoading } = useQuery({
    queryKey: ["admin", "customers", search],
    queryFn: async () => {
      const q = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/admin/customers${q}`, { headers: authHeader });
      const json = await res.json();
      return json.data || [];
    },
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-[#0f2419]">Customer Directory</h2>
        <p className="text-xs text-stone-500 mt-1">Aggregated guest profiles, visit frequency, contact information, and guest loyalty history.</p>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, or phone..."
            className="pl-9 h-10 text-xs border-stone-200 focus-visible:ring-[#c9a84c]"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/75 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4 text-center">Total Bookings</th>
                <th className="py-3.5 px-4 text-center">Completed Visits</th>
                <th className="py-3.5 px-4 text-center">Total Covers</th>
                <th className="py-3.5 px-4">Last Visit</th>
                <th className="py-3.5 px-4">First Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">Loading customer history...</td>
                </tr>
              ) : !customers || customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    No customers found matching current search.
                  </td>
                </tr>
              ) : (
                customers.map((c: any) => (
                  <tr key={c.email} className="hover:bg-stone-50/60 transition-colors">
                    
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900 text-sm flex items-center gap-1.5">
                        <span>{c.name}</span>
                        {c.totalBookings >= 3 && (
                          <span className="p-1 rounded bg-amber-100 text-amber-800" title="Frequent / VIP Guest">
                            <Award size={13} />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <a href={`mailto:${c.email}`} className="text-stone-600 hover:text-[#c9a84c] flex items-center gap-1.5">
                          <Mail size={12} className="text-stone-400" />
                          <span>{c.email}</span>
                        </a>
                        {c.phone && (
                          <a href={`tel:${c.phone}`} className="text-stone-500 hover:text-[#c9a84c] flex items-center gap-1.5">
                            <Phone size={12} className="text-stone-400" />
                            <span>{c.phone}</span>
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Total Bookings */}
                    <td className="py-3.5 px-4 text-center font-bold text-stone-800">
                      {c.totalBookings}
                    </td>

                    {/* Completed */}
                    <td className="py-3.5 px-4 text-center font-semibold text-emerald-700">
                      {c.completedBookings}
                    </td>

                    {/* Total Guests Brought */}
                    <td className="py-3.5 px-4 text-center font-medium text-stone-700">
                      {c.totalGuestsServed}
                    </td>

                    {/* Last Visit */}
                    <td className="py-3.5 px-4 text-stone-700 font-mono text-[11px]">
                      {c.lastVisit || "N/A"}
                    </td>

                    {/* First Visit */}
                    <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                      {c.firstVisit || "N/A"}
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
