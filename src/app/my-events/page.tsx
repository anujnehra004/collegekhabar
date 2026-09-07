'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Bookmark as BookmarkIcon, 
  PlusCircle, 
  Ticket, 
  Trash2, 
  Edit3, 
  Users, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { EventCard } from '@/components/events/EventCard';
import { AttendeeListModal } from '@/components/events/AttendeeListModal';
import { dataService } from '@/lib/data/storage';
import { Event, Registration } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function MyEventsPage() {
  const { user } = useAuth();
  const { events, cancelRegistration, deleteEvent, registeredEventIds, bookmarkedEventIds } = useEvents();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('registered');
  const [userRegistrations, setUserRegistrations] = useState<(Registration & { event: Event })[]>([]);
  const [userBookmarks, setUserBookmarks] = useState<Event[]>([]);
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState<Event | null>(null);

  const currentUserId = user?.id || 'd0000000-0000-0000-0000-000000000001';

  const loadData = async () => {
    const regs = await dataService.getUserRegistrations(currentUserId);
    setUserRegistrations(regs);

    const bms = await dataService.getUserBookmarks(currentUserId);
    setUserBookmarks(bms);
  };

  useEffect(() => {
    loadData();
  }, [currentUserId, registeredEventIds, bookmarkedEventIds, events]);

  const userCreatedEvents = events.filter((e) => e.organizer_id === currentUserId);
  const userAttendedEvents = userRegistrations.filter(
    (r) => new Date(r.event.event_date) < new Date()
  );

  const handleCancelRegistration = async (eventId: string, title: string) => {
    if (confirm(`Are you sure you want to cancel your registration for "${title}"?`)) {
      await cancelRegistration(eventId);
      toast.info('Registration Cancelled', `You have cancelled your registration for ${title}`);
      await loadData();
    }
  };

  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      await deleteEvent(eventId);
      toast.success('Event Deleted', `Deleted "${title}"`);
    }
  };

  const tabs = [
    { id: 'registered', label: `Registered (${userRegistrations.length})` },
    { id: 'saved', label: `Saved (${userBookmarks.length})` },
    { id: 'created', label: `Created by You (${userCreatedEvents.length})` },
    { id: 'attended', label: `History & Attended (${userAttendedEvents.length})` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600">
            <Calendar className="w-4 h-4" />
            <span>Personal Campus Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            My Events
          </h1>
          <p className="text-xs text-slate-500">
            Manage your registered sessions, bookmarks, and events you are organizing.
          </p>
        </div>

        <Link href="/events/create">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Host an Event
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: Registered Events */}
      {activeTab === 'registered' && (
        <div className="space-y-4">
          {userRegistrations.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 space-y-3">
              <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No active event registrations</p>
              <p>Explore events happening around campus and register with 1-click!</p>
              <Link href="/explore">
                <Button size="sm" variant="outline">Explore Events</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Pass: {reg.ticket_code}</span>
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {formatDate(reg.event.event_date)}
                      </span>
                    </div>

                    <Link href={`/events/${reg.event.id}`}>
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 hover:text-brand-600 truncate">
                        {reg.event.title}
                      </h3>
                    </Link>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{reg.event.start_time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{reg.event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <Link
                      href={`/events/${reg.event.id}`}
                      className="text-xs font-semibold text-brand-600 hover:underline"
                    >
                      View Event Page &rarr;
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 py-1"
                      onClick={() => handleCancelRegistration(reg.event.id, reg.event.title)}
                    >
                      Cancel Registration
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Bookmarked / Saved Events */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {userBookmarks.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 space-y-2">
              <BookmarkIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Nothing saved yet</p>
              <p>Explore events and bookmark the ones you don&apos;t want to miss.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBookmarks.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Created Events */}
      {activeTab === 'created' && (
        <div className="space-y-4">
          {userCreatedEvents.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 space-y-3">
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">You haven&apos;t hosted any events yet.</p>
              <p>Host workshops, club meetings, or competitions easily on Campus Connect.</p>
              <Link href="/events/create">
                <Button size="sm" variant="primary">Host Your First Event</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {userCreatedEvents.map((e) => (
                <div
                  key={e.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={e.banner_image}
                      alt={e.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/events/${e.id}`}>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-brand-600 truncate">
                            {e.title}
                          </h4>
                        </Link>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950 text-brand-600 capitalize">
                          {e.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {formatDate(e.event_date)} • {e.location}
                      </p>
                      <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{e.current_participants} / {e.max_participants} registered</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEventForAttendees(e)}
                      leftIcon={<Users className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Manage Attendees
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEvent(e.id, e.title)}
                      className="text-xs text-rose-500 hover:text-rose-600 p-2"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Attended */}
      {activeTab === 'attended' && (
        <div className="space-y-4">
          {userAttendedEvents.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
              No completed events in your history yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {userAttendedEvents.map((reg) => (
                <EventCard key={reg.id} event={reg.event} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Attendee List Modal for Created Events */}
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
