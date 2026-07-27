import React, { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Receipt,
  FolderOpen,
  Target,
  BarChart3,
  User,
  Settings,
  Search,
  Plus,
  Menu,
  X,
  TrendingUp,
  LogOut,
  Bell,
  ChevronDown,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

interface NavItem {
  path: string;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const navItems: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/expenses", label: "Transactions", icon: Receipt },
  { path: "/categories", label: "Categories", icon: FolderOpen },
  { path: "/budgets", label: "Budgets", icon: Target },
  { path: "/reports", label: "Reports", icon: BarChart3 },
];

const bottomNavItems: NavItem[] = [
  { path: "/profile", label: "Profile", icon: User },
  { path: "/settings", label: "Settings", icon: Settings },
];

/**
 * Main application shell with collapsible sidebar (desktop) and bottom tab bar (mobile).
 * Includes top header with search, notifications, and user dropdown.
 */
export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  const currentPageTitle =
    [...navItems, ...bottomNavItems].find((item) =>
      location.pathname.startsWith(item.path),
    )?.label ?? "Dashboard";

  return (
    <div className="flex min-h-dvh bg-bg-app">
      {/* ── Desktop Sidebar ── */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-64 bg-bg-card/95 backdrop-blur-xl border-r border-border-card",
          "flex flex-col transition-transform duration-250 ease-standard",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-border-card">
          <div className="size-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <TrendingUp className="size-5 text-primary" />
          </div>
          <span className="font-bold text-text-primary">
            Expense<span className="text-primary">Pro</span>
          </span>
          {/* Mobile close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5",
                )
              }
            >
              <item.icon className="size-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom nav links */}
        <div className="px-3 pb-4 space-y-1 border-t border-border-card pt-4">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/5",
                )
              }
            >
              <item.icon className="size-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error/80 hover:text-error hover:bg-error/5 transition-all duration-150 w-full">
            <LogOut className="size-5 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 h-16 bg-bg-app/80 backdrop-blur-lg border-b border-border-card flex items-center gap-4 px-4 lg:px-6">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5"
            aria-label="Open sidebar"
          >
            <Menu className="size-5" />
          </button>

          {/* Page title */}
          <h1 className="text-lg font-semibold text-text-primary hidden sm:block">
            {currentPageTitle}
          </h1>

          {/* Search */}
          <div className="flex-1 max-w-md ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
            <input
              type="search"
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-bg-input border border-border-input text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-border-focus transition-all"
            />
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-2">
            {/* Quick add */}
            <NavLink
              to="/expenses?action=add"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-text-inverse text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              <Plus className="size-4" />
              <span className="hidden md:inline">Add Expense</span>
            </NavLink>

            {/* Notifications */}
            <button
              className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-error" />
            </button>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="User menu"
              >
                <Avatar initials="AR" size="sm" />
                <ChevronDown className="size-3.5 text-text-muted hidden sm:block" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-bg-card border border-border-card shadow-dropdown z-50 py-1.5">
                    <NavLink
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5"
                    >
                      <User className="size-4" />
                      Profile
                    </NavLink>
                    <NavLink
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5"
                    >
                      <Settings className="size-4" />
                      Settings
                    </NavLink>
                    <hr className="my-1.5 border-border-card" />
                    <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-error/80 hover:text-error hover:bg-error/5 w-full">
                      <LogOut className="size-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="fixed bottom-0 inset-x-0 z-20 bg-bg-card/95 backdrop-blur-xl border-t border-border-card lg:hidden">
        <div className="flex items-center justify-around h-16">
          {navItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors min-w-[56px]",
                  isActive
                    ? "text-primary"
                    : "text-text-muted hover:text-text-secondary",
                )
              }
            >
              <item.icon className="size-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          {/* Mobile FAB for quick add */}
          <NavLink
            to="/expenses?action=add"
            className="flex items-center justify-center size-12 rounded-full bg-primary text-text-inverse shadow-lg -mt-6"
            aria-label="Add expense"
          >
            <Plus className="size-6" />
          </NavLink>
        </div>
      </nav>
    </div>
  );
};
