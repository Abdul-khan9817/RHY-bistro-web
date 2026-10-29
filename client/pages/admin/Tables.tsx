import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Grid3X3, Users, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Tables() {
  const { authHeader } = useAdminAuth();
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTable, setEditTable] = useState<any>(null);

  const [newTable, setNewTable] = useState({
    name: "",
    capacity: 4,
    minCapacity: 1,
    location: "Main Hall",
    description: "",
    isActive: true,
  });

  // Fetch Tables
  const { data: tables, isLoading } = useQuery({
    queryKey: ["admin", "tables"],
    queryFn: async () => {
      const res = await fetch("/api/admin/tables", { headers: authHeader });
      const json = await res.json();
      return json.data || [];
    },
  });

  // Create Table Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/admin/tables", {
        method: "POST",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create table");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Table created successfully");
      setIsAddOpen(false);
      setNewTable({
        name: "",
        capacity: 4,
        minCapacity: 1,
        location: "Main Hall",
        description: "",
        isActive: true,
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "tables"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Update Table Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/admin/tables/${id}`, {
        method: "PATCH",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update table");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Table updated");
      setEditTable(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "tables"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Delete Table Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/tables/${id}`, {
        method: "DELETE",
        headers: authHeader,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete table");
      return json;
    },
    onSuccess: () => {
      toast.success("Table deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "tables"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#0f2419]">Dining Tables & Floor Plan</h2>
          <p className="text-xs text-stone-500 mt-1">Configure physical seating, capacities, zones, and availability.</p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-[#0f2419] hover:bg-[#183a29] text-white flex items-center gap-2 text-xs font-semibold shadow-sm"
        >
          <Plus size={16} />
          <span>Add New Table</span>
        </Button>
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-stone-400 text-xs">Loading floor plan...</div>
        ) : !tables || tables.length === 0 ? (
          <div className="col-span-full py-16 text-center text-stone-400 text-xs">
            No tables registered yet. Click "Add New Table" to start.
          </div>
        ) : (
          tables.map((table: any) => (
            <div
              key={table._id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all relative flex flex-col justify-between ${
                table.isActive ? "border-stone-200 hover:border-[#c9a84c]/60" : "border-stone-200/60 bg-stone-50/50 opacity-75"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">{table.name}</h3>
                    <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-0.5">
                      <MapPin size={11} className="text-[#c9a84c]" />
                      <span>{table.location || "Indoor"}</span>
                    </div>
                  </div>
                  
                  {/* Status toggle pill */}
                  <button
                    onClick={() => updateMutation.mutate({ id: table._id, data: { isActive: !table.isActive } })}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                      table.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"
                    }`}
                  >
                    {table.isActive ? "Active" : "Closed"}
                  </button>
                </div>

                {table.description && (
                  <p className="text-xs text-stone-500 italic mb-4 line-clamp-2">{table.description}</p>
                )}

                {/* Capacity badge */}
                <div className="bg-stone-50 rounded-lg p-3 border border-stone-100 flex items-center justify-between text-xs mb-4">
                  <span className="text-stone-500 flex items-center gap-1.5 font-medium">
                    <Users size={14} className="text-stone-400" />
                    Capacity
                  </span>
                  <span className="font-bold text-stone-900 text-sm">
                    {table.capacity} {table.capacity === 1 ? "seat" : "seats"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  onClick={() => setEditTable(table)}
                  className="p-1.5 text-stone-500 hover:text-[#0f2419] hover:bg-stone-100 rounded text-xs flex items-center gap-1 transition-colors"
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete table "${table.name}"?`)) {
                      deleteMutation.mutate(table._id);
                    }
                  }}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded text-xs flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Add Table Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-stone-200">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-stone-900">Add Dining Table</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  ...newTable,
                  capacity: Number(newTable.capacity),
                  minCapacity: Number(newTable.minCapacity),
                });
              }}
              className="space-y-4 pt-4 text-xs"
            >
              <div>
                <label className="font-semibold text-stone-700">Table Name / Label *</label>
                <Input
                  required
                  value={newTable.name}
                  onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                  placeholder="e.g. Table 12 (Terrace)"
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700">Max Capacity *</label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={newTable.capacity}
                    onChange={(e) => setNewTable({ ...newTable, capacity: Number(e.target.value) })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700">Min Capacity</label>
                  <Input
                    type="number"
                    min="1"
                    value={newTable.minCapacity}
                    onChange={(e) => setNewTable({ ...newTable, minCapacity: Number(e.target.value) })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700">Dining Area / Location</label>
                <select
                  value={newTable.location}
                  onChange={(e) => setNewTable({ ...newTable, location: e.target.value })}
                  className="mt-1 w-full h-9 px-2 bg-stone-50 border border-stone-200 rounded text-xs outline-none"
                >
                  <option value="Main Hall">Main Hall</option>
                  <option value="Window">Window Front</option>
                  <option value="Terrace">Terrace / Garden</option>
                  <option value="Private Alcove">Private Room / Alcove</option>
                  <option value="Bar Area">Bar Seating</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700">Description / Characteristics</label>
                <Input
                  value={newTable.description}
                  onChange={(e) => setNewTable({ ...newTable, description: e.target.value })}
                  placeholder="e.g. Near the fireplace, scenic river view"
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="bg-[#0f2419] text-white text-xs">
                  {createMutation.isPending ? "Creating..." : "Create Table"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Table Modal */}
      {editTable && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-stone-200">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-stone-900">Edit Table</h3>
              <button onClick={() => setEditTable(null)} className="text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate({
                  id: editTable._id,
                  data: {
                    name: editTable.name,
                    capacity: Number(editTable.capacity),
                    minCapacity: Number(editTable.minCapacity),
                    location: editTable.location,
                    description: editTable.description,
                    isActive: editTable.isActive,
                  },
                });
              }}
              className="space-y-4 pt-4 text-xs"
            >
              <div>
                <label className="font-semibold text-stone-700">Table Name</label>
                <Input
                  required
                  value={editTable.name}
                  onChange={(e) => setEditTable({ ...editTable, name: e.target.value })}
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700">Capacity</label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={editTable.capacity}
                    onChange={(e) => setEditTable({ ...editTable, capacity: Number(e.target.value) })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700">Location</label>
                  <Input
                    value={editTable.location}
                    onChange={(e) => setEditTable({ ...editTable, location: e.target.value })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700">Description</label>
                <Input
                  value={editTable.description || ""}
                  onChange={(e) => setEditTable({ ...editTable, description: e.target.value })}
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="tableActiveCheck"
                  checked={editTable.isActive}
                  onChange={(e) => setEditTable({ ...editTable, isActive: e.target.checked })}
                  className="rounded text-[#c9a84c]"
                />
                <label htmlFor="tableActiveCheck" className="text-xs font-semibold text-stone-700 cursor-pointer">
                  Available for booking
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <Button type="button" variant="outline" onClick={() => setEditTable(null)} className="text-xs">
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
