import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { useSSEBookings } from "../../hooks/useSSEBookings";
import {
  LayoutDashboard,
  CalendarCheck,
  Grid3X3,
  UtensilsCrossed,
  Users,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  ExternalLink,
  Menu as MenuIcon,
  X,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import logoImg from "@assets/bacchus-logo.png";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Reservations", icon: CalendarCheck },
  { href: "/admin/tables", label: "Tables & Layout", icon: Grid3X3 },
  { href: "/admin/menu", label: "Menu Manager", icon: UtensilsCrossed },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location] = useLocation();
  const { admin, logout } = useAdminAuth();
  const { isConnected, notifications, clearNotifications } = useSSEBookings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="h-screen w-full bg-[#f7f5f0] text-slate-800 flex flex-col md:flex-row overflow-hidden">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#0f2419] text-white px-4 py-3 flex items-center justify-between border-b border-white/10 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="BACCHUS" className="h-10 w-auto rounded-lg object-contain" />
          <span className="font-serif font-bold text-sm tracking-wider">BACCHUS ADMIN</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-white/80 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>

      {/* Sidebar Navigation - Fixed Viewport Height */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 h-full bg-[#0f2419] text-white flex flex-col border-r border-[#c9a84c]/20 transition-transform duration-300 md:static md:translate-x-0 shrink-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3 shrink-0">
          <img
            src={logoImg}
            alt="BACCHUS"
            className="h-14 w-auto rounded-lg ring-1 ring-[#c9a84c]/40 object-contain shadow-md"
          />
          <div>
            <h2 className="font-serif font-bold text-base tracking-widest text-white leading-none">
              BACCHUS
            </h2>
            <p className="text-[10px] text-[#c9a84c] tracking-[0.2em] uppercase font-semibold mt-1">
              Admin Console
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-[#c9a84c] text-black font-semibold shadow-md shadow-[#c9a84c]/20"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} className={active ? "text-black" : "text-[#c9a84c]"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Actions */}
        <div className="p-4 border-t border-white/10 bg-black/20 space-y-3 shrink-0">
          <div className="flex items-center justify-between px-2">
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{admin?.username || "Admin"}</p>
              <p className="text-[10px] text-[#c9a84c] uppercase font-mono tracking-wider">{admin?.role || "Manager"}</p>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Open public website in new tab"
            >
              <ExternalLink size={16} />
            </a>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 h-full flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top bar on Desktop */}
        <header className="hidden md:flex h-16 bg-white border-b border-stone-200 px-8 items-center justify-between sticky top-0 z-30 shadow-xs shrink-0">
          <div>
            <h1 className="text-lg font-serif font-bold text-[#0f2419]">
              {navItems.find((n) => n.href === location)?.label || "Admin Portal"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg text-stone-600 hover:text-[#0f2419] hover:bg-stone-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">Live Alerts</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-[11px] text-[#c9a84c] hover:underline font-medium"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-stone-400 text-xs">
                        <CheckCircle2 size={24} className="mx-auto mb-2 text-stone-300" />
                        No new booking alerts yet
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-3 hover:bg-stone-50 transition-colors text-xs">
                          <div className="flex justify-between font-semibold text-stone-900">
                            <span>{n.name}</span>
                            <span className="font-mono text-[#c9a84c]">{n.ref}</span>
                          </div>
                          <p className="text-stone-500 mt-0.5">
                            {n.guests} guests · {n.date} at {n.time}
                          </p>
                          <span className="text-[10px] text-stone-400">
                            Just now
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Visit site link */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:border-[#c9a84c] hover:text-[#0f2419] flex items-center gap-1.5 transition-colors"
            >
              <span>View Site</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}
    </div>
  );
};
