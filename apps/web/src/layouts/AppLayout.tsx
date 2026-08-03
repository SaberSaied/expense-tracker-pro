import React, { Suspense, useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Receipt,
  FolderOpen,
  Target,
  BarChart3,
  PiggyBank,
  User,
  Settings,
  Search,
  Plus,
  Menu,
  X,
  TrendingUp,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { RouteFallback } from "@/components/ui/RouteFallback";
import { useAuth } from "@/hooks/useAuth";

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
  { path: "/savings-goals", label: "Savings Goals", icon: PiggyBank },
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
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches,
  );
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Focus management: when navigating between routes, move focus to the main
  // content region so keyboard & screen-reader users land on the new page
  // (instead of being stranded at the last focused element).
  const mainRef = useRef<HTMLElement | null>(null);
  const prevPathname = useRef(location.pathname);
  const userMenuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const sidebarCloseRef = useRef<HTMLButtonElement | null>(null);
  const sidebarTriggerRef = useRef<HTMLButtonElement | null>(null);
  const prevSidebarOpen = useRef(sidebarOpen);

  // ── Mobile drawer focus management (WCAG 2.4.3 Focus Order) ──
  // When the drawer opens on mobile, move focus to the Close button so
  // keyboard & screen-reader users land inside the drawer. When it closes,
  // restore focus to the hamburger trigger that opened it.
  useEffect(() => {
    if (sidebarOpen) {
      prevSidebarOpen.current = true;
      sidebarCloseRef.current?.focus();
      return;
    }
    if (prevSidebarOpen.current) {
      prevSidebarOpen.current = false;
      sidebarTriggerRef.current?.focus();
    }
  }, [sidebarOpen]);

  // Escape closes the mobile drawer (WCAG 2.1.1 Keyboard).
  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [sidebarOpen]);

  // Menu keyboard navigation (WCAG 2.1.1 / APG menu pattern):
  // focus the first item on open, and Arrow/Home/End keys move between items.
  useEffect(() => {
    if (!userMenuOpen) return;
    userMenuRef.current?.querySelector<HTMLElement>("[role='menuitem']")?.focus();
  }, [userMenuOpen]);

  const handleUserMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const menu = userMenuRef.current;
    if (!menu) return;
    const items = Array.from(menu.querySelectorAll<HTMLElement>("[role='menuitem']"));
    if (items.length === 0) return;
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    let nextIndex: number;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % items.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex =
        currentIndex === -1 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = items.length - 1;
    } else if (e.key === "Tab") {
      // APG menu pattern: Tab closes the menu and focus moves to the next
      // focusable element after the trigger (Shift+Tab goes before it).
      // Exclude the closing menu's own items — they match `button`/`[href]`
      // selectors despite tabIndex={-1}, so focusing them would lose focus
      // to <body> the instant the menu unmounts.
      e.preventDefault();
      setUserMenuOpen(false);
      const trigger = userMenuTriggerRef.current;
      const menu = userMenuRef.current;
      if (trigger) {
        const focusables = Array.from(
          document.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !menu?.contains(el));
        const idx = focusables.indexOf(trigger);
        const target = e.shiftKey ? focusables[idx - 1] : focusables[idx + 1];
        // Fall back to the trigger so focus is never stranded (e.g. when the
        // trigger is the first/last focusable on the page).
        (target ?? trigger).focus();
      }
      return;
    } else {
      return;
    }
    items[nextIndex]?.focus();
  };

  useEffect(() => {
    if (prevPathname.current === location.pathname) return;
    prevPathname.current = location.pathname;
    mainRef.current?.focus();
  }, [location.pathname]);

  // Close the user menu on Escape and restore focus to its trigger.
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        userMenuTriggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [userMenuOpen]);

  // Track whether we're on a desktop viewport so the mobile drawer can be
  // hidden from the accessibility tree when closed (it stays visible on lg+).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const currentPageTitle =
    [...navItems, ...bottomNavItems].find((item) => location.pathname.startsWith(item.path))
      ?.label ?? "Dashboard";

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    toast.success("Signed out successfully");
    navigate("/login", { replace: true });
  };

  const userInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  return (
    <div className="flex min-h-dvh bg-bg-app">
      {/* Skip link — first focusable element for keyboard users (WCAG 2.4.1) */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {/* ── Desktop Sidebar ── */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-64 bg-bg-card/95 backdrop-blur-xl border-r border-border-card",
          "flex flex-col transition-transform duration-250 ease-standard",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        // Hidden from the accessibility tree & tab order on mobile when closed
        // (the drawer is translated off-canvas but must not receive focus).
        aria-hidden={!sidebarOpen && !isDesktop ? true : undefined}
        inert={!sidebarOpen && !isDesktop ? true : undefined}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-border-card">
          <div className="size-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <TrendingUp className="size-5 text-primary" />
          </div>
          <span className="font-bold text-text-primary">
            Expense<span className="text-primary">Pro</span>
          </span>
          <button
            ref={sidebarCloseRef}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-overlay/5"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Primary">
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
                    : "text-text-secondary hover:text-text-primary hover:bg-overlay/5",
                )
              }
            >
              <item.icon className="size-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom nav links */}
        <div
          className="px-3 pb-4 space-y-1 border-t border-border-card pt-4"
          role="navigation"
          aria-label="Account"
        >
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
                    : "text-text-secondary hover:text-text-primary hover:bg-overlay/5",
                )
              }
            >
              <item.icon className="size-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error/80 hover:text-error hover:bg-error/5 transition-all duration-150 w-full"
          >
            <LogOut className="size-5 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden animate-[fade-in_0.2s_ease-out]"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 h-16 bg-bg-app/80 backdrop-blur-lg border-b border-border-card flex items-center gap-4 px-4 lg:px-6">
          <button
            ref={sidebarTriggerRef}
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-overlay/5"
            aria-label="Open sidebar"
          >
            <Menu className="size-5" />
          </button>

          <h1 className="text-lg font-semibold text-text-primary hidden sm:block">
            {currentPageTitle}
          </h1>

          <div className="flex-1 min-w-0 max-w-md ml-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted pointer-events-none" />
            <input
              type="search"
              placeholder="Search transactions..."
              aria-label="Search transactions"
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-bg-input border border-border-input text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-border-focus transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <NavLink
              to="/expenses?action=add"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-text-inverse text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              <Plus className="size-4" />
              <span className="hidden md:inline">Add Expense</span>
            </NavLink>

            <NotificationsDropdown />

            {/* User dropdown */}
            <div className="relative">
              <button
                ref={userMenuTriggerRef}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-overlay/5 transition-colors"
                aria-label="User menu"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                aria-controls="user-menu"
              >
                <Avatar initials={userInitials} size="sm" />
                <span className="hidden sm:block text-sm text-text-primary font-medium max-w-[100px] truncate">
                  {user?.name ?? "User"}
                </span>
                <ChevronDown
                  className="size-3.5 text-text-muted hidden sm:block"
                  aria-hidden="true"
                />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    ref={userMenuRef}
                    id="user-menu"
                    role="menu"
                    aria-label="User menu"
                    onKeyDown={handleUserMenuKeyDown}
                    className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-bg-card border border-border-card shadow-dropdown z-50 py-1.5 origin-top-right animate-[pop-in_0.15s_ease-out]"
                  >
                    {/* User info header */}
                    <div className="px-4 py-2 border-b border-border-card mb-1.5">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {user?.name ?? "User"}
                      </p>
                      <p className="text-xs text-text-muted truncate">{user?.email ?? ""}</p>
                    </div>

                    <NavLink
                      to="/profile"
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-overlay/5"
                    >
                      <User className="size-4" aria-hidden="true" />
                      Profile
                    </NavLink>
                    <NavLink
                      to="/settings"
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-overlay/5"
                    >
                      <Settings className="size-4" aria-hidden="true" />
                      Settings
                    </NavLink>
                    <hr className="my-1.5 border-border-card" />
                    <button
                      role="menuitem"
                      tabIndex={-1}
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-error/80 hover:text-error hover:bg-error/5 w-full"
                    >
                      <LogOut className="size-4" aria-hidden="true" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content — keyed by route so each navigation re-triggers the enter animation */}
        <main
          ref={mainRef}
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-4 lg:p-6 overflow-y-auto focus:outline-none"
        >
          <div
            key={location.pathname}
            className="mx-auto w-full max-w-[1600px] animate-[fade-in_0.3s_ease-out]"
          >
            {/* Suspense keeps the sidebar/header mounted while a lazy
                route chunk loads — only the page area shows the spinner. */}
            <Suspense fallback={<RouteFallback />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav
        aria-label="Primary (mobile)"
        className="fixed bottom-0 inset-x-0 z-20 bg-bg-card/95 backdrop-blur-xl border-t border-border-card lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around h-16 px-1">
          {/* Primary nav items — 4 most-used + FAB keeps the bar compact on 320px screens.
              Reports & Settings remain reachable via the hamburger drawer. */}
          {navItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "flex flex-col items-center justify-center gap-0.5 px-1 py-2 rounded-lg text-[10px] sm:text-[11px] font-medium transition-colors min-w-0 flex-1 max-w-[64px] sm:max-w-20",
                  isActive ? "text-primary" : "text-text-muted hover:text-text-secondary",
                )
              }
            >
              <item.icon className="size-5 shrink-0" />
              <span className="truncate w-full text-center leading-tight">{item.label}</span>
            </NavLink>
          ))}
          <NavLink
            to="/expenses?action=add"
            className="flex items-center justify-center size-12 rounded-full bg-primary text-text-inverse shadow-lg -mt-6 shrink-0"
            aria-label="Add expense"
          >
            <Plus className="size-6" />
          </NavLink>
        </div>
      </nav>
    </div>
  );
};
