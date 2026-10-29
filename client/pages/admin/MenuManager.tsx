import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { Plus, Edit2, Trash2, UtensilsCrossed, CheckCircle, XCircle, X, Upload, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PRESET_DISH_IMAGES = [
  { label: "Fondue", url: "/assets/image_1785084917216.png" },
  { label: "Raclette", url: "/assets/image_1785084864495.png" },
  { label: "Charcuterie", url: "/assets/image_1785084872921.png" },
  { label: "Flammkuchen", url: "/assets/image_1785084845728.png" },
  { label: "Steak / Meat", url: "/assets/image_1785084930701.png" },
  { label: "Drinks / Bar", url: "/assets/image_1785084947299.png" },
];

export default function MenuManager() {
  const { authHeader } = useAdminAuth();
  const queryClient = useQueryClient();

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const addFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const [newItem, setNewItem] = useState({
    nameEn: "",
    nameFr: "",
    descEn: "",
    descFr: "",
    price: 25,
    category: "mains",
    dietary: [] as string[],
    isAvailable: true,
    sortOrder: 0,
    image: "",
  });

  // Fetch Menu
  const { data: menuItems, isLoading } = useQuery({
    queryKey: ["admin", "menu", categoryFilter],
    queryFn: async () => {
      const catParam = categoryFilter !== "all" ? `?category=${categoryFilter}` : "";
      const res = await fetch(`/api/admin/menu${catParam}`, { headers: authHeader });
      const json = await res.json();
      return json.data || [];
    },
  });

  // Upload image helper
  const handleImageUpload = (file: File, callback: (url: string) => void) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { ...authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl: reader.result, filename: file.name }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "Upload failed");
        callback(json.url);
        toast.success("Dish image uploaded!");
      } catch (err: any) {
        toast.error(err.message || "Failed to upload image");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create dish");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Dish added to menu");
      setIsAddOpen(false);
      setNewItem({
        nameEn: "",
        nameFr: "",
        descEn: "",
        descFr: "",
        price: 25,
        category: "mains",
        dietary: [],
        isAvailable: true,
        sortOrder: 0,
        image: "",
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "menu"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: "PATCH",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update dish");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Dish updated");
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "menu"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: "DELETE",
        headers: authHeader,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete dish");
      return json;
    },
    onSuccess: () => {
      toast.success("Dish removed from menu");
      queryClient.invalidateQueries({ queryKey: ["admin", "menu"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleDietaryToggle = (
    tag: string,
    current: string[],
    setter: (val: string[]) => void,
  ) => {
    if (current.includes(tag)) {
      setter(current.filter((t) => t !== tag));
    } else {
      setter([...current, tag]);
    }
  };

  const categories = [
    { id: "all", label: "All Items" },
    { id: "starters", label: "Starters" },
    { id: "mains", label: "Mains" },
    { id: "desserts", label: "Desserts" },
    { id: "drinks", label: "Drinks" },
    { id: "wine", label: "Wine" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#0f2419]">Menu & Dish Catalog</h2>
          <p className="text-xs text-stone-500 mt-1">
            Manage your food items, dish photos, descriptions, and kitchen 86 availability.
          </p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-[#0f2419] hover:bg-[#183a29] text-white flex items-center gap-2 text-xs font-semibold px-4 py-2"
        >
          <Plus size={16} />
          <span>Add New Dish</span>
        </Button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryFilter(c.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              categoryFilter === c.id
                ? "bg-[#0f2419] text-white shadow-xs"
                : "bg-white text-stone-600 border border-stone-200 hover:border-stone-400"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Dishes Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/75 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Dish</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price (CHF)</th>
                <th className="py-3 px-4">Dietary</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">Loading menu catalog...</td>
                </tr>
              ) : !menuItems || menuItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    No dishes found in this category. Click "Add New Dish" to create one.
                  </td>
                </tr>
              ) : (
                menuItems.map((item: any) => (
                  <tr key={item._id} className="hover:bg-stone-50/60 transition-colors">
                    
                    {/* Image & Names & Description */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200 shadow-2xs">
                          <img
                            src={item.image || "/assets/image_1785084864495.png"}
                            alt={item.nameEn}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/assets/image_1785084864495.png";
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-serif font-bold text-stone-900 text-sm truncate">{item.nameEn}</div>
                          <div className="text-stone-500 text-xs italic truncate">{item.nameFr}</div>
                          <p className="text-stone-400 text-[11px] mt-0.5 line-clamp-1">{item.descEn || item.descFr}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {item.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-bold text-stone-900 font-mono text-sm">
                      CHF {item.price}
                    </td>

                    {/* Dietary Tags */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {item.dietary?.map((tag: string) => (
                          <span key={tag} className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Availability toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() =>
                          updateMutation.mutate({
                            id: item._id,
                            data: { isAvailable: !item.isAvailable },
                          })
                        }
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                          item.isAvailable
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        }`}
                      >
                        {item.isAvailable ? "Available" : "Sold Out (86)"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setEditItem(item)}
                          className="p-1.5 text-stone-500 hover:text-[#0f2419] hover:bg-stone-100 rounded transition-colors"
                          title="Edit Dish"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete dish "${item.nameEn}"?`)) {
                              deleteMutation.mutate(item._id);
                            }
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Delete Dish"
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

      {/* Add Dish Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-stone-900">Add New Dish</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  ...newItem,
                  price: Number(newItem.price),
                });
              }}
              className="space-y-4 pt-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700">English Name *</label>
                  <Input
                    required
                    value={newItem.nameEn}
                    onChange={(e) => setNewItem({ ...newItem, nameEn: e.target.value })}
                    placeholder="Beef Entrecôte"
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700">French Name *</label>
                  <Input
                    required
                    value={newItem.nameFr}
                    onChange={(e) => setNewItem({ ...newItem, nameFr: e.target.value })}
                    placeholder="Entrecôte de Bœuf"
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              {/* Dish Image Section */}
              <div className="p-3 border border-stone-200 rounded-lg bg-stone-50/75 space-y-2.5">
                <label className="font-semibold text-stone-700 block">Dish Photograph</label>
                
                {/* Upload or URL */}
                <div className="flex gap-2">
                  <Input
                    value={newItem.image}
                    onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                    placeholder="Image URL or upload a file..."
                    className="h-9 text-xs bg-white"
                  />
                  <input
                    type="file"
                    ref={addFileRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, (url) => setNewItem({ ...newItem, image: url }));
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addFileRef.current?.click()}
                    disabled={uploading}
                    className="h-9 px-3 text-xs shrink-0 flex items-center gap-1.5"
                  >
                    <Upload size={14} />
                    <span>Upload</span>
                  </Button>
                </div>

                {/* Preset Chips */}
                <div>
                  <span className="text-[10px] text-stone-400 block mb-1">Or choose a preset photo:</span>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_DISH_IMAGES.map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => setNewItem({ ...newItem, image: p.url })}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                          newItem.image === p.url
                            ? "bg-[#0f2419] text-white border-[#0f2419]"
                            : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                {newItem.image && (
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={newItem.image}
                      alt="Preview"
                      className="w-16 h-12 object-cover rounded-md border border-stone-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/image_1785084864495.png";
                      }}
                    />
                    <span className="text-[11px] text-emerald-700 font-medium">Image attached</span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold text-stone-700">English Description</label>
                <textarea
                  value={newItem.descEn}
                  onChange={(e) => setNewItem({ ...newItem, descEn: e.target.value })}
                  rows={2}
                  placeholder="Café de Paris butter, potato gratin..."
                  className="mt-1 w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700">French Description</label>
                <textarea
                  value={newItem.descFr}
                  onChange={(e) => setNewItem({ ...newItem, descFr: e.target.value })}
                  rows={2}
                  placeholder="Beurre Café de Paris, gratin dauphinois..."
                  className="mt-1 w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700">Category *</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="mt-1 w-full h-9 px-2 bg-stone-50 border border-stone-200 rounded text-xs outline-none"
                  >
                    <option value="starters">Starters (Entrées)</option>
                    <option value="mains">Main Courses (Plats)</option>
                    <option value="desserts">Desserts</option>
                    <option value="drinks">Beverages</option>
                    <option value="wine">Wine</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-700">Price (CHF) *</label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              {/* Dietary Tags */}
              <div>
                <label className="font-semibold text-stone-700 block mb-1.5">Dietary Labels</label>
                <div className="flex gap-2">
                  {[
                    { id: "veg", label: "Vegetarian" },
                    { id: "vegan", label: "Vegan" },
                    { id: "gf", label: "Gluten-Free" },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() =>
                        handleDietaryToggle(d.id, newItem.dietary, (val) =>
                          setNewItem({ ...newItem, dietary: val }),
                        )
                      }
                      className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${
                        newItem.dietary.includes(d.id)
                          ? "bg-[#c9a84c] text-black border-[#c9a84c]"
                          : "bg-stone-50 text-stone-600 border-stone-200"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || uploading} className="bg-[#0f2419] text-white text-xs">
                  {createMutation.isPending ? "Adding..." : "Add to Menu"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dish Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-stone-900">Edit Dish</h3>
              <button onClick={() => setEditItem(null)} className="text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate({
                  id: editItem._id,
                  data: {
                    nameEn: editItem.nameEn,
                    nameFr: editItem.nameFr,
                    descEn: editItem.descEn,
                    descFr: editItem.descFr,
                    price: Number(editItem.price),
                    category: editItem.category,
                    dietary: editItem.dietary,
                    isAvailable: editItem.isAvailable,
                    image: editItem.image,
                  },
                });
              }}
              className="space-y-4 pt-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700">English Name</label>
                  <Input
                    required
                    value={editItem.nameEn}
                    onChange={(e) => setEditItem({ ...editItem, nameEn: e.target.value })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700">French Name</label>
                  <Input
                    required
                    value={editItem.nameFr}
                    onChange={(e) => setEditItem({ ...editItem, nameFr: e.target.value })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              {/* Edit Image Section */}
              <div className="p-3 border border-stone-200 rounded-lg bg-stone-50/75 space-y-2.5">
                <label className="font-semibold text-stone-700 block">Dish Photograph</label>
                <div className="flex gap-2">
                  <Input
                    value={editItem.image || ""}
                    onChange={(e) => setEditItem({ ...editItem, image: e.target.value })}
                    placeholder="Image URL or upload a file..."
                    className="h-9 text-xs bg-white"
                  />
                  <input
                    type="file"
                    ref={editFileRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, (url) => setEditItem({ ...editItem, image: url }));
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => editFileRef.current?.click()}
                    disabled={uploading}
                    className="h-9 px-3 text-xs shrink-0 flex items-center gap-1.5"
                  >
                    <Upload size={14} />
                    <span>Upload</span>
                  </Button>
                </div>

                {/* Preset Chips */}
                <div>
                  <span className="text-[10px] text-stone-400 block mb-1">Preset photos:</span>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_DISH_IMAGES.map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => setEditItem({ ...editItem, image: p.url })}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                          editItem.image === p.url
                            ? "bg-[#0f2419] text-white border-[#0f2419]"
                            : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {editItem.image && (
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={editItem.image}
                      alt="Preview"
                      className="w-16 h-12 object-cover rounded-md border border-stone-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/image_1785084864495.png";
                      }}
                    />
                    <span className="text-[11px] text-emerald-700 font-medium">Image attached</span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold text-stone-700">English Description</label>
                <textarea
                  value={editItem.descEn || ""}
                  onChange={(e) => setEditItem({ ...editItem, descEn: e.target.value })}
                  rows={2}
                  className="mt-1 w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700">French Description</label>
                <textarea
                  value={editItem.descFr || ""}
                  onChange={(e) => setEditItem({ ...editItem, descFr: e.target.value })}
                  rows={2}
                  className="mt-1 w-full p-2 bg-stone-50 border border-stone-200 rounded text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700">Category</label>
                  <select
                    value={editItem.category}
                    onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                    className="mt-1 w-full h-9 px-2 bg-stone-50 border border-stone-200 rounded text-xs outline-none"
                  >
                    <option value="starters">Starters</option>
                    <option value="mains">Mains</option>
                    <option value="desserts">Desserts</option>
                    <option value="drinks">Drinks</option>
                    <option value="wine">Wine</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-700">Price (CHF)</label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={editItem.price}
                    onChange={(e) => setEditItem({ ...editItem, price: Number(e.target.value) })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="dishAvailableCheck"
                  checked={editItem.isAvailable}
                  onChange={(e) => setEditItem({ ...editItem, isAvailable: e.target.checked })}
                  className="rounded text-[#c9a84c]"
                />
                <label htmlFor="dishAvailableCheck" className="text-xs font-semibold text-stone-700 cursor-pointer">
                  Available in kitchen (uncheck to 86 / mark sold out)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <Button type="button" variant="outline" onClick={() => setEditItem(null)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending || uploading} className="bg-[#0f2419] text-white text-xs">
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
