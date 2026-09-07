'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  CheckCheck, 
  Sparkles, 
  Calendar, 
  UserCheck, 
  Users, 
  AlertTriangle,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { NotificationType } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  // Non-blocking for SSR and active student demo
  const activeUser = user || {
    id: 'd0000000-0000-0000-0000-000000000001',
    full_name: 'Anuj Verma',
  };

  const filteredNotifications = filterUnreadOnly
    ? notifications.filter((n) => !n.read)
    : notifications;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'registration_confirmed':
        return <Calendar className="w-5 h-5 text-brand-600" />;
      case 'connection_accepted':
      case 'connection_request':
        return <UserCheck className="w-5 h-5 text-emerald-600" />;
      case 'community_event':
        return <Users className="w-5 h-5 text-indigo-600" />;
      case 'event_reminder':
        return <Sparkles className="w-5 h-5 text-amber-600" />;
      case 'event_cancelled':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Real-time updates regarding registrations, networking requests, and club announcements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterUnreadOnly
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            {filterUnreadOnly ? 'Show All' : 'Unread Only'}
          </button>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications Feed */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading notifications...</div>
      ) : filteredNotifications.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 space-y-2">
          <Bell className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
          <p>You have no {filterUnreadOnly ? 'unread' : ''} notifications at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && markAsRead(n.id)}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                n.read
                  ? 'bg-white/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80'
                  : 'bg-white dark:bg-slate-900 border-brand-200 dark:border-brand-900/50 shadow-subtle ring-1 ring-brand-500/10'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0">
                  {getNotificationIcon(n.type)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {n.title}
                    </h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-slate-400 pt-1">
                    {formatDate(n.created_at)}
                  </p>
                </div>
              </div>

              {n.related_event_id && (
                <Link
                  href={`/events/${n.related_event_id}`}
                  className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand-600 transition-colors"
                  title="View Event"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
