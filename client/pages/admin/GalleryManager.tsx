import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { Plus, Trash2, Edit2, Upload, Link as LinkIcon, Image as ImageIcon, X, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface GalleryItemType {
  _id: string;
  title?: string;
  imageUrl: string;
  category: "food" | "ambiance" | "events";
  alt?: string;
  sortOrder?: number;
  createdAt: string;
}

const PRESET_IMAGES = [
  { label: "Raclette", url: "/assets/image_1785084864495.png" },
  { label: "Charcuterie Board", url: "/assets/image_1785084872921.png" },
  { label: "Cheese Fondue", url: "/assets/image_1785084917216.png" },
  { label: "Flammkuchen", url: "/assets/image_1785084845728.png" },
  { label: "Bistro Ambiance", url: "/assets/image_1785084930701.png" },
  { label: "Bar & Events", url: "/assets/image_1785084947299.png" },
];

export default function GalleryManager() {
  const { authHeader } = useAdminAuth();
  const queryClient = useQueryClient();

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<GalleryItemType | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form state
  const [uploadMethod, setUploadMethod] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"food" | "ambiance" | "events">("food");
  const [alt, setAlt] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Gallery Items
  const { data: galleryItems = [], isLoading } = useQuery<GalleryItemType[]>({
    queryKey: ["admin", "gallery", categoryFilter],
    queryFn: async () => {
      const catParam = categoryFilter !== "all" ? `?category=${categoryFilter}` : "";
      const res = await fetch(`/api/admin/gallery${catParam}`, { headers: authHeader });
      const json = await res.json();
      return json.data || [];
    },
  });

  // Handle local file selection & upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP)");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dataUrl: base64,
            filename: file.name,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Upload failed");
        }
        setImageUrl(json.url);
        toast.success("Image uploaded successfully!");
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
    mutationFn: async (payload: Partial<GalleryItemType>) => {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add image");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Image added to gallery!");
      setIsAddOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GalleryItemType> }) => {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PATCH",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update image");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Gallery item updated");
      setEditItem(null);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
        headers: authHeader,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete item");
      return json;
    },
    onSuccess: () => {
      toast.success("Image deleted from gallery");
      queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resetForm = () => {
    setImageUrl("");
    setTitle("");
    setCategory("food");
    setAlt("");
    setSortOrder(0);
    setUploadMethod("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openEdit = (item: GalleryItemType) => {
    setEditItem(item);
    setImageUrl(item.imageUrl);
    setTitle(item.title || "");
    setCategory(item.category);
    setAlt(item.alt || "");
    setSortOrder(item.sortOrder || 0);
    setUploadMethod("url");
  };

  const categories = [
    { id: "all", label: "All Photos" },
    { id: "food", label: "Food & Specialties" },
    { id: "ambiance", label: "Ambiance & Dining" },
    { id: "events", label: "Events & Gatherings" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#0f2419]">Gallery Management</h2>
          <p className="text-xs text-stone-500 mt-1">
            Upload and organize restaurant photos displayed on the public gallery.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="bg-[#0f2419] hover:bg-[#183a29] text-white flex items-center gap-2 text-xs font-semibold px-4 py-2"
        >
          <Plus size={16} />
          <span>Add Photo</span>
        </Button>
      </div>

      {/* Filter Tabs */}
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

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-stone-400 bg-white rounded-xl border border-stone-200">
          Loading gallery photos...
        </div>
      ) : galleryItems.length === 0 ? (
        <div className="py-20 text-center text-stone-400 bg-white rounded-xl border border-stone-200 p-8">
          <ImageIcon size={40} className="mx-auto mb-3 text-stone-300" />
          <p className="text-sm font-semibold text-stone-600">No photos in this category</p>
          <p className="text-xs text-stone-400 mt-1">Click "Add Photo" to upload an image to this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {galleryItems.map((item) => (
            <div
              key={item._id}
              className="group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md hover:border-[#c9a84c]/50 transition-all flex flex-col"
            >
              {/* Image Preview */}
              <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.alt || item.title || "Gallery photo"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/assets/image_1785084864495.png";
                  }}
                />
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs p-1 rounded-lg">
                  <button
                    onClick={() => setPreviewImage(item.imageUrl)}
                    className="p-1 text-white hover:text-[#c9a84c] transition-colors"
                    title="View Full Size"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1 text-white hover:text-[#c9a84c] transition-colors"
                    title="Edit Photo Info"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete photo "${item.title || "Untitled"}"?`)) {
                        deleteMutation.mutate(item._id);
                      }
                    }}
                    className="p-1 text-red-300 hover:text-red-400 transition-colors"
                    title="Delete Photo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur-xs">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif font-bold text-stone-900 text-sm truncate">
                    {item.title || "Untitled Photograph"}
                  </h4>
                  <p className="text-stone-400 text-xs mt-0.5 truncate">{item.alt || "No description provided"}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Order: {item.sortOrder || 0}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-stone-600 hover:text-[#0f2419] font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Delete this photo?")) deleteMutation.mutate(item._id);
                      }}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Photo */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-stone-900">Add Image to Gallery</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!imageUrl) {
                  toast.error("Please provide or upload an image");
                  return;
                }
                createMutation.mutate({
                  title,
                  imageUrl,
                  category,
                  alt: alt || title,
                  sortOrder: Number(sortOrder) || 0,
                });
              }}
              className="space-y-4 pt-4 text-xs"
            >
              {/* Method Tabs */}
              <div className="flex rounded-lg bg-stone-100 p-1">
                <button
                  type="button"
                  onClick={() => setUploadMethod("upload")}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    uploadMethod === "upload" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500"
                  }`}
                >
                  <Upload size={14} />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod("url")}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    uploadMethod === "url" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500"
                  }`}
                >
                  <LinkIcon size={14} />
                  <span>Image URL / Presets</span>
                </button>
              </div>

              {/* Upload Input */}
              {uploadMethod === "upload" ? (
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Select Image File</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0f2419] file:text-white hover:file:bg-[#183a29] cursor-pointer"
                  />
                  {uploading && <p className="text-[11px] text-[#c9a84c] mt-1 font-medium">Uploading image...</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="font-semibold text-stone-700 block">Image URL</label>
                  <Input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... or /assets/..."
                    required
                    className="h-9 text-xs"
                  />
                  {/* Presets */}
                  <div>
                    <span className="text-[11px] text-stone-400 block mb-1">Or choose a bistro photo preset:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => {
                            setImageUrl(preset.url);
                            if (!title) setTitle(preset.label);
                          }}
                          className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                            imageUrl === preset.url
                              ? "bg-[#0f2419] text-white border-[#0f2419]"
                              : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Live Preview */}
              {imageUrl && (
                <div className="p-2 border border-stone-200 rounded-lg bg-stone-50">
                  <span className="text-[11px] font-semibold text-stone-500 block mb-1">Preview</span>
                  <div className="relative aspect-16/9 w-full rounded overflow-hidden bg-black/10">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Photo Title / Caption *</label>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Autumn Cheese Tasting"
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full h-9 rounded-md border border-stone-200 bg-white px-3 text-xs focus:ring-[#c9a84c] focus:border-[#c9a84c]"
                    >
                      <option value="food">Food & Specialties</option>
                      <option value="ambiance">Ambiance & Dining</option>
                      <option value="events">Events & Gatherings</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Sort Order</label>
                    <Input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(Number(e.target.value))}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Alt Description</label>
                  <Input
                    type="text"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    placeholder="Accessibility description for screen readers"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || uploading || !imageUrl}
                  className="bg-[#c9a84c] hover:bg-[#b5953e] text-black font-semibold h-9 text-xs"
                >
                  {createMutation.isPending ? "Adding Photo..." : "Add to Gallery"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Photo */}
      {editItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-stone-900">Edit Gallery Photo</h3>
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
                    title,
                    imageUrl,
                    category,
                    alt,
                    sortOrder: Number(sortOrder) || 0,
                  },
                });
              }}
              className="space-y-4 pt-4 text-xs"
            >
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Image URL / Path *</label>
                <Input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>

              {imageUrl && (
                <div className="relative aspect-16/9 w-full rounded overflow-hidden bg-black/10 border border-stone-200">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Title / Caption *</label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full h-9 rounded-md border border-stone-200 bg-white px-3 text-xs focus:ring-[#c9a84c] focus:border-[#c9a84c]"
                  >
                    <option value="food">Food & Specialties</option>
                    <option value="ambiance">Ambiance & Dining</option>
                    <option value="events">Events & Gatherings</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Sort Order</label>
                  <Input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Alt Description</label>
                <Input
                  type="text"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditItem(null)}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending || !imageUrl}
                  className="bg-[#c9a84c] hover:bg-[#b5953e] text-black font-semibold h-9 text-xs"
                >
                  {updateMutation.isPending ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Preview */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
          >
            <X size={24} />
          </button>
          <img
            src={previewImage}
            alt="Enlarged preview"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
