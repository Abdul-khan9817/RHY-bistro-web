import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { Save, Lock, Clock, Store, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Settings() {
  const { authHeader } = useAdminAuth();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState<any>(null);

  // Password change state
  const [passwordState, setPasswordState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch Settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings", { headers: authHeader });
      const json = await res.json();
      return json.data;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormState(settings);
    }
  }, [settings]);

  // Save Settings Mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (updated: any) => {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updated),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update settings");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Restaurant settings saved successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (passwordState.newPassword !== passwordState.confirmPassword) {
        throw new Error("New passwords do not match");
      }
      if (passwordState.newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const res = await fetch("/api/admin/me/password", {
        method: "PATCH",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordState.currentPassword,
          newPassword: passwordState.newPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to change password");
      return json;
    },
    onSuccess: () => {
      toast.success("Admin password updated successfully");
      setPasswordState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading || !formState) {
    return <div className="py-16 text-center text-stone-400 text-xs">Loading settings...</div>;
  }

  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  const handleHoursChange = (day: string, field: string, val: any) => {
    setFormState({
      ...formState,
      openingHours: {
        ...formState.openingHours,
        [day]: {
          ...formState.openingHours[day],
          [field]: val,
        },
      },
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-[#0f2419]">Restaurant Settings</h2>
        <p className="text-xs text-stone-500 mt-1">Configure business profile, booking slot limits, opening hours, and admin credentials.</p>
      </div>

      {/* Main Settings Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveSettingsMutation.mutate(formState);
        }}
        className="space-y-6"
      >
        {/* Business Profile */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Store size={18} className="text-[#c9a84c]" />
            <h3 className="font-serif font-bold text-stone-900">Bistro Information & Contact</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700">Restaurant Name</label>
              <Input
                value={formState.restaurantName || ""}
                onChange={(e) => setFormState({ ...formState, restaurantName: e.target.value })}
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700">Subtitle / Tagline</label>
              <Input
                value={formState.tagline || ""}
                onChange={(e) => setFormState({ ...formState, tagline: e.target.value })}
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700">Contact Telephone</label>
              <Input
                value={formState.phone || ""}
                onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700">Contact Email</label>
              <Input
                value={formState.email || ""}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700">Street Address</label>
              <Input
                value={formState.address || ""}
                onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700">Postal Code & City</label>
              <Input
                value={formState.city || ""}
                onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                className="mt-1 h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Booking Capacity Policies */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <ShieldCheck size={18} className="text-[#c9a84c]" />
            <h3 className="font-serif font-bold text-stone-900">Capacity & Booking Policies</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700">Max Guests Per Time Slot</label>
              <Input
                type="number"
                min="5"
                max="200"
                value={formState.maxGuestsPerSlot || 30}
                onChange={(e) => setFormState({ ...formState, maxGuestsPerSlot: Number(e.target.value) })}
                className="mt-1 h-9 text-xs"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">Prevents overbooking at peak times</span>
            </div>
            <div>
              <label className="font-semibold text-stone-700">Max Days in Advance</label>
              <Input
                type="number"
                min="1"
                max="365"
                value={formState.maxAdvanceBookingDays || 60}
                onChange={(e) => setFormState({ ...formState, maxAdvanceBookingDays: Number(e.target.value) })}
                className="mt-1 h-9 text-xs"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">Allowed booking window (days)</span>
            </div>
            <div>
              <label className="font-semibold text-stone-700">Default Slot Duration (min)</label>
              <Input
                type="number"
                min="30"
                step="15"
                value={formState.bookingSlotDuration || 90}
                onChange={(e) => setFormState({ ...formState, bookingSlotDuration: Number(e.target.value) })}
                className="mt-1 h-9 text-xs"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">Expected table turnaround</span>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Clock size={18} className="text-[#c9a84c]" />
            <h3 className="font-serif font-bold text-stone-900">Weekly Operating Schedule</h3>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {daysOfWeek.map((day) => {
              const current = formState.openingHours?.[day] || { open: "11:00", close: "20:00", closed: false };
              return (
                <div key={day} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="w-32 font-semibold capitalize text-stone-800">{day}</div>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={current.closed}
                        onChange={(e) => handleHoursChange(day, "closed", e.target.checked)}
                        className="rounded text-[#c9a84c]"
                      />
                      <span className="text-stone-600 font-medium">Closed</span>
                    </label>

                    {!current.closed && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={current.open}
                          onChange={(e) => handleHoursChange(day, "open", e.target.value)}
                          className="h-8 w-28 text-xs"
                        />
                        <span className="text-stone-400">to</span>
                        <Input
                          type="time"
                          value={current.close}
                          onChange={(e) => handleHoursChange(day, "close", e.target.value)}
                          className="h-8 w-28 text-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saveSettingsMutation.isPending}
            className="bg-[#0f2419] hover:bg-[#183a29] text-white flex items-center gap-2 text-xs font-semibold px-6 h-10 shadow-sm"
          >
            <Save size={16} />
            <span>{saveSettingsMutation.isPending ? "Saving..." : "Save Restaurant Settings"}</span>
          </Button>
        </div>
      </form>

      {/* Admin Security & Password Change */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <Lock size={18} className="text-[#c9a84c]" />
          <h3 className="font-serif font-bold text-stone-900">Change Admin Password</h3>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            changePasswordMutation.mutate();
          }}
          className="space-y-4 max-w-md text-xs"
        >
          <div>
            <label className="font-semibold text-stone-700">Current Password</label>
            <Input
              type="password"
              required
              value={passwordState.currentPassword}
              onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
              className="mt-1 h-9 text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700">New Password (min 8 characters)</label>
            <Input
              type="password"
              required
              minLength={8}
              value={passwordState.newPassword}
              onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
              className="mt-1 h-9 text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700">Confirm New Password</label>
            <Input
              type="password"
              required
              minLength={8}
              value={passwordState.confirmPassword}
              onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
              className="mt-1 h-9 text-xs"
            />
          </div>

          <Button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="bg-[#c9a84c] hover:bg-[#b5953e] text-black text-xs font-semibold"
          >
            {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>

    </div>
  );
}
