'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  TrendingUp, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Download, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  PieChart
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { AttendeeListModal } from '@/components/events/AttendeeListModal';
import { Event } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function OrganizerDashboardPage() {
  const { user, isLoading } = useAuth();
  const { events, deleteEvent } = useEvents();
  const toast = useToast();

  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState<Event | null>(null);

  // Fallback to demo organizer profile during hydration or if viewing demo
  const currentOrganizerId = user?.id || 'd0000000-0000-0000-0000-000000000001';
  const userCreatedEvents = events.filter((e) => e.organizer_id === currentOrganizerId);
  // If user has not created any events yet, fallback to show platform sample events so the dashboard is demonstrably rich!
  const managedEvents = userCreatedEvents.length > 0 ? userCreatedEvents : events.slice(0, 6);

  const totalEvents = managedEvents.length;
  const totalRegistrations = managedEvents.reduce((acc, e) => acc + (e.current_participants || 0), 0);
  const totalCapacity = managedEvents.reduce((acc, e) => acc + (e.max_participants || 100), 0);
  const avgAttendanceRate = totalCapacity > 0 ? Math.round((totalRegistrations / totalCapacity) * 100) : 0;
  const upcomingCount = managedEvents.filter((e) => new Date(e.event_date) >= new Date()).length;

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  managedEvents.forEach((e) => {
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + e.current_participants;
  });

  const handleDelete = async (e: Event) => {
    if (confirm(`Permanently delete "${e.title}"?`)) {
      await deleteEvent(e.id);
      toast.success('Event Deleted', `Removed "${e.title}".`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            <BarChart3 className="w-4 h-4" />
            <span>Campus Event Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Organizer Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Monitor real-time student registrations, attendance velocity, and manage attendee rosters.
          </p>
        </div>

        <Link href="/events/create">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Create New Event
          </Button>
        </Link>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Hosted Events</span>
            <Calendar className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {totalEvents}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Active on Campus</span>
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Registrations</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {totalRegistrations}
          </p>
          <p className="text-[11px] text-slate-500">
            Across your managed events
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Fill Capacity</span>
            <BarChart3 className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {avgAttendanceRate}%
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">
            High attendance interest
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Upcoming Events</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {upcomingCount}
          </p>
          <p className="text-[11px] text-slate-500">
            Scheduled this month
          </p>
        </div>
      </div>

      {/* Analytics Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Attendance Distribution */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-600" />
              <span>Student Turnout by Category</span>
            </h3>
            <span className="text-[11px] text-slate-400">Registrations volume</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = totalRegistrations > 0 ? Math.round((count / totalRegistrations) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{cat}</span>
                    <span className="text-slate-500">{count} attendees ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 to-indigo-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Organizer Quick Tips / Best Practices */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-50 to-indigo-50 dark:from-slate-900 dark:to-brand-950/40 border border-brand-100 dark:border-brand-900/50 space-y-4">
          <h3 className="text-sm font-bold text-brand-950 dark:text-brand-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Organizer Guidelines</span>
          </h3>

          <div className="space-y-2.5 text-xs text-brand-900 dark:text-brand-300 leading-relaxed">
            <p>• <strong>Download Attendee CSVs:</strong> Use the roster manager to take attendance at entry desks.</p>
            <p>• <strong>Capacity Controls:</strong> When an event reaches maximum participants, Campus Connect automatically marks it full.</p>
            <p>• <strong>Automated Alerts:</strong> Whenever you publish or update event schedules, notifications are dispatched to registered students.</p>
          </div>

          <div className="pt-2">
            <Link href="/events/create">
              <Button size="sm" variant="primary" className="w-full text-xs">
                + Launch New Event
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Events Management Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Managed Events Roster
            </h3>
            <p className="text-xs text-slate-500">
              Manage status, edit details, view registered students, or export CSV records.
            </p>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Event Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Date &amp; Venue</th>
                <th className="p-3.5">Registrations</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {managedEvents.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100 max-w-[200px] truncate">
                    <Link href={`/events/${event.id}`} className="hover:text-brand-600 transition-colors">
                      {event.title}
                    </Link>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">
                    {event.category}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">
                    <p>{formatDate(event.event_date)}</p>
                    <span className="text-[10px] text-slate-400">{event.location}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-semibold text-emerald-600">
                      {event.current_participants} / {event.max_participants}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 dark:bg-brand-950 text-brand-600 capitalize border border-brand-200">
                      {event.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedEventForAttendees(event)}
                      className="text-xs py-1"
                    >
                      Attendees
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(event)}
                      className="text-xs text-rose-500 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendee List Modal */}
      {selectedEventForAttendees && (
        <AttendeeListModal
          isOpen={Boolean(selectedEventForAttendees)}
          onClose={() => setSelectedEventForAttendees(null)}
          event={selectedEventForAttendees}
        />
      )}
    </div>
  );
}
