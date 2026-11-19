import React from 'react';
import { ArrowUpRight, Bell, CheckCircle2, ClipboardList, RotateCw } from 'lucide-react';
import type { PortalNotification } from '../lib/portalApi';

interface PortalActivityPanelProps {
  notifications: PortalNotification[];
  labels: {
    actions: string;
    activity: string;
    emptyActions: string;
    emptyActivity: string;
    needsAttention: string;
    unread: string;
    refresh: string;
    loading: string;
    open: string;
    viewAll: string;
  };
  iconColorClassName?: string;
  showAll?: boolean;
  error?: string;
  loading?: boolean;
  onRefresh: () => void;
  onViewAll?: () => void;
  onOpen: (notification: PortalNotification) => void;
  getEventLabel: (eventType: PortalNotification['event_type']) => string;
  formatDate: (value: string) => string;
}

const PortalActivityPanel: React.FC<PortalActivityPanelProps> = ({
  notifications,
  labels,
  iconColorClassName = 'text-[#8c795e] dark:text-bronze-400',
  showAll = false,
  error = '',
  loading = false,
  onRefresh,
  onViewAll,
  onOpen,
  getEventLabel,
  formatDate,
}) => {
  const orderedNotifications = [...notifications].sort(
    (first, second) => Date.parse(second.created_at) - Date.parse(first.created_at)
  );
  const actions = orderedNotifications
    .filter((notification) =>
      notification.action_required
      && !notification.resolved_at
      && notification.event_type !== 'feedback_received'
      && notification.event_type !== 'feedback_replied'
    );
  const visibleActions = showAll ? actions : actions.slice(0, 2);
  const visibleNotifications = showAll ? orderedNotifications : orderedNotifications.slice(0, 2);
  const unreadCount = notifications.filter((notification) => !notification.read_at).length;

  const renderNotification = (notification: PortalNotification) => (
    <li key={notification.id}>
      <button
        type="button"
        onClick={() => onOpen(notification)}
        className="group flex w-full items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50/70 p-3.5 text-left transition-colors hover:border-bronze-500/40 hover:bg-bronze-500/[0.04] dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-bronze-400/30 dark:hover:bg-white/[0.04] sm:p-4"
      >
        <span className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-white/[0.06] ${iconColorClassName}`}>
          {!notification.read_at ? <span className="h-2 w-2 rounded-full bg-bronze-500" /> : <CheckCircle2 size={15} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{getEventLabel(notification.event_type)}</span>
            {notification.action_required && !notification.resolved_at && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider text-amber-700 dark:text-amber-300">{labels.needsAttention}</span>
            )}
          </span>
          <span className="mt-1 block truncate text-xs leading-5 text-neutral-600 dark:text-neutral-300">{notification.summary}</span>
          <span className="mt-1 block truncate font-mono text-[9px] uppercase tracking-wider text-neutral-400">
            {notification.project_code} · {notification.project_name} · {formatDate(notification.created_at)}
          </span>
        </span>
        <ArrowUpRight size={15} className="mt-1 shrink-0 text-neutral-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-bronze-600" />
        <span className="sr-only">{labels.open}</span>
      </button>
    </li>
  );

  return (
    <div className="mb-5 grid gap-4 xl:grid-cols-2">
      {error && <p role="alert" className="xl:col-span-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs leading-5 text-red-700 dark:text-red-300">{error}</p>}
      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-neutral-100 pb-4 dark:border-white/10">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f5f2ec] dark:bg-white/[0.06] ${iconColorClassName}`}><ClipboardList size={17} /></span>
            <h2 className="truncate font-display text-lg font-medium">{labels.actions}</h2>
          </div>
          <span className="shrink-0 rounded-full bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] tabular-nums text-amber-700 dark:text-amber-300">{actions.length}</span>
        </div>
        {loading && notifications.length === 0 ? (
          <p className="py-3 text-xs text-neutral-500">{labels.loading}</p>
        ) : visibleActions.length === 0 ? (
          <div className="flex items-center gap-2 py-3 text-sm text-neutral-500"><CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />{labels.emptyActions}</div>
        ) : (
          <ul className="space-y-2">{visibleActions.map(renderNotification)}</ul>
        )}
        {!showAll && actions.length > 2 && onViewAll && (
          <div className="mt-3 flex justify-end">
            <button type="button" onClick={onViewAll} className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-[10px] font-medium text-bronze-700 transition-colors hover:bg-bronze-500/10 dark:text-bronze-300">
              {labels.viewAll}<ArrowUpRight size={12} />
            </button>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-neutral-100 pb-4 dark:border-white/10">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f5f2ec] dark:bg-white/[0.06] ${iconColorClassName}`}><Bell size={17} /></span>
            <h2 className="truncate font-display text-lg font-medium">{labels.activity}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {unreadCount > 0 && <span className="rounded-full bg-bronze-500/10 px-2.5 py-1 font-mono text-[10px] tabular-nums text-bronze-700 dark:text-bronze-300">{unreadCount} {labels.unread}</span>}
            <button type="button" onClick={onRefresh} disabled={loading} aria-label={labels.refresh} title={labels.refresh} className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50 dark:hover:bg-white/[0.06] dark:hover:text-white">
              <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
        {loading && notifications.length === 0 ? (
          <p className="py-3 text-xs text-neutral-500">{labels.loading}</p>
        ) : notifications.length === 0 ? (
          <p className="py-3 text-sm text-neutral-500">{labels.emptyActivity}</p>
        ) : (
          <ul className="space-y-2">{visibleNotifications.map(renderNotification)}</ul>
        )}
        {!showAll && notifications.length > 2 && onViewAll && (
          <div className="mt-3 flex justify-end">
            <button type="button" onClick={onViewAll} className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2 py-1 text-[10px] font-medium text-bronze-700 transition-colors hover:bg-bronze-500/10 dark:text-bronze-300">
              {labels.viewAll}<ArrowUpRight size={12} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default PortalActivityPanel;
