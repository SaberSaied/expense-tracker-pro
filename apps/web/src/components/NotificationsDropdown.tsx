import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { toast } from "sonner";
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  AlertTriangle,
  AlertOctagon,
  FileDown,
  BarChart3,
  Clock,
  CalendarDays,
  CalendarX,
} from "lucide-react";
import { Skeleton } from "./ui/Skeleton";
import { EmptyState } from "./ui/EmptyState";
import { notificationsApi } from "@/services/notifications";
import type { ApiNotification, NotificationType } from "@/services/notifications";

/** Icon + color mapping per notification type. */
const TYPE_META: Record<
  NotificationType,
  { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; bg: string; color: string }
> = {
  BUDGET_WARNING: { icon: AlertTriangle, bg: "bg-warning/15", color: "text-warning" },
  BUDGET_CRITICAL: { icon: AlertOctagon, bg: "bg-error/15", color: "text-error" },
  EXPORT_COMPLETE: { icon: FileDown, bg: "bg-primary/15", color: "text-primary" },
  WEEKLY_DIGEST: { icon: BarChart3, bg: "bg-secondary/15", color: "text-secondary" },
  REMINDER: { icon: Clock, bg: "bg-accent/15", color: "text-accent" },
  MONTHLY_SUMMARY: { icon: CalendarDays, bg: "bg-secondary/15", color: "text-secondary" },
  BILL_DUE_SOON: { icon: Clock, bg: "bg-warning/15", color: "text-warning" },
  BILL_OVERDUE: { icon: CalendarX, bg: "bg-error/15", color: "text-error" },
};

/** Human-friendly relative time. */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Header bell with dropdown notification panel.
 * Shows the unread badge, a recent-notifications list (with loading skeleton),
 * an empty state when there are no notifications, and mark-read/delete actions.
 */
export const NotificationsDropdown: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [markAllLoading, setMarkAllLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const prevOpen = useRef(open);

  // Move focus into the panel when it opens (non-modal dialog pattern).
  useEffect(() => {
    if (open) {
      dialogRef.current?.focus();
    }
  }, [open]);

  // Return focus to the trigger button when the panel closes (WCAG 2.4.3).
  useEffect(() => {
    if (prevOpen.current && !open) {
      triggerRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const refresh = useCallback(async () => {
    try {
      const [listResult, count] = await Promise.all([
        notificationsApi.findAll({ limit: 10 }),
        notificationsApi.getUnreadCount(),
      ]);
      setNotifications(listResult.notifications);
      setUnread(count);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial unread badge count (silent, no spinner)
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const count = await notificationsApi.getUnreadCount();
        if (!ignore) setUnread(count);
      } catch {
        // Silent — the badge simply stays empty
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  // Fetch the list when the panel opens
  useEffect(() => {
    if (!open) return;
    let ignore = false;
    const load = async () => {
      try {
        const [listResult, count] = await Promise.all([
          notificationsApi.findAll({ limit: 10 }),
          notificationsApi.getUnreadCount(),
        ]);
        if (ignore) return;
        setNotifications(listResult.notifications);
        setUnread(count);
      } catch {
        if (!ignore) toast.error("Failed to load notifications");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [open]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      void refresh();
    }
  };

  const handleMarkAsRead = async (id: string) => {
    setActionLoadingId(id);
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
    } catch {
      toast.error("Failed to update notification");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (markAllLoading) return;
    setMarkAllLoading(true);
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    } finally {
      setMarkAllLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoadingId(id);
    try {
      await notificationsApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete notification");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className={clsx(
          "relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-overlay/5 transition-colors",
          open && "text-text-primary bg-overlay/5",
        )}
        aria-label={open ? "Close notifications" : "Open notifications"}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="notifications-panel"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-2 h-2 px-0.5 rounded-full bg-error flex items-center justify-center">
            <span className="sr-only">{unread} unread</span>
          </span>
        )}
      </button>

      {open && (
        <div
          ref={dialogRef}
          id="notifications-panel"
          role="dialog"
          aria-label="Notifications"
          tabIndex={-1}
          className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-sm rounded-2xl bg-bg-card border border-border-card shadow-dropdown z-50 overflow-hidden origin-top-right animate-[pop-in_0.15s_ease-out] focus:outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-card">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-text-muted" />
              <span className="text-sm font-semibold text-text-primary">Notifications</span>
              {unread > 0 && (
                <span className="text-[11px] font-medium text-text-inverse bg-error rounded-full px-1.5 py-0.5">
                  {unread} new
                </span>
              )}
            </div>
            {notifications.length > 0 && unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markAllLoading}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors disabled:opacity-50"
              >
                <CheckCheck className="size-3.5" />
                {markAllLoading ? "Marking…" : "Mark all read"}
              </button>
            )}
          </div>

          {/* Body */}
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="size-9 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              compact
              icon={BellOff}
              title="No notifications yet"
              description="Budget alerts, bill reminders, and monthly summaries will show up here."
              actionLabel="Set Up Budgets"
              onAction={() => {
                setOpen(false);
                navigate("/budgets");
              }}
              iconColor="text-text-muted"
            />
          ) : (
            <div className="max-h-[50vh] overflow-y-auto divide-y divide-border-card/50">
              {notifications.map((n) => {
                const meta = TYPE_META[n.type] ?? { icon: Bell, bg: "bg-primary/10", color: "text-primary" };
                const Icon = meta.icon;
                const isBusy = actionLoadingId === n.id;
                return (
                  <div
                    key={n.id}
                    className={clsx(
                      "flex items-start gap-3 px-4 py-3 transition-colors",
                      n.read ? "opacity-60" : "hover:bg-overlay/[0.03]",
                    )}
                  >
                    <div
                      className={clsx(
                        "size-9 rounded-xl flex items-center justify-center shrink-0",
                        meta.bg,
                      )}
                    >
                      <Icon className={clsx("size-4", meta.color)} />
                    </div>
                    <button
                      onClick={() => !n.read && handleMarkAsRead(n.id)}
                      disabled={!n.read || isBusy}
                      className="flex-1 min-w-0 text-left group"
                      title={n.read ? "Read" : "Mark as read"}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary truncate">
                          {n.title}
                        </span>
                        {!n.read && (
                          <span className="size-1.5 rounded-full bg-error shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <span className="text-[11px] text-text-muted mt-1 inline-block">
                        {timeAgo(n.createdAt)}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      disabled={isBusy}
                      className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors shrink-0 disabled:opacity-50"
                      aria-label={`Delete ${n.title}`}
                    >
                      {isBusy ? (
                        <span className="size-3.5 block rounded-full border-2 border-text-muted/30 border-t-text-muted animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
