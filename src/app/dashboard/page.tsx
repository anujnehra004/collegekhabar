'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Compass, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  PlusCircle,
  Ticket
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/context/EventContext';
import { EventCard } from '@/components/events/EventCard';
import { CommunityCard } from '@/components/communities/CommunityCard';
import { Button } from '@/components/ui/Button';
import { getTimeOfDayGreeting, formatDate } from '@/lib/utils';
import { dataService } from '@/lib/data/storage';
import { Community, Registration } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const { events, registeredEventIds } = useEvents();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<(Registration & { event: any })[]>([]);

  useEffect(() => {
    async function loadData() {
      const allComms = await dataService.getCommunities();
      setCommunities(allComms.slice(0, 4));

      if (user) {
        const regs = await dataService.getUserRegistrations(user.id);
        setUserRegistrations(regs);
      }
    }
    loadData();
  }, [user, registeredEventIds]);

  const userName = user?.full_name || 'Student';
  const greeting = getTimeOfDayGreeting(userName);

  // Filter Upcoming Events (next chronological events)
  const upcomingEvents = [...events]
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 3);

  // Recommended For You (matching student interests or department)
  const userInterests = user?.interests || ['Hackathons'];
  const recommendedEvents = events.filter((e) => {
    const matchesCategory = userInterests.some((i) =>
      e.category.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(e.category.toLowerCase())
    );
    const matchesDept = user?.department
      ? e.description.toLowerCase().includes(user.department.toLowerCase().split(' ')[0])
      : false;
    return matchesCategory || matchesDept;
  }).slice(0, 3);

  const fallbackRecommended = recommendedEvents.length > 0 ? recommendedEvents : events.slice(3, 6);

  // Trending on Campus (high registration velocity/numbers)
  const trendingEvents = [...events]
    .sort((a, b) => b.current_participants - a.current_participants)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-800 text-white p-6 sm:p-10 shadow-xl overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-200" />
            <span>{user?.university || 'State Technological University'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {greeting}
          </h1>

          <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
            There are <strong>{events.length} active events</strong> and workshops scheduled across campus this month. Here is your personalized campus overview.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link href="/explore">
              <Button size="sm" className="bg-white text-brand-700 hover:bg-brand-50 shadow-md font-bold text-xs">
                Explore All Events
              </Button>
            </Link>
            <Link href="/events/create">
              <Button size="sm" variant="outline" className="text-white border-white/40 hover:bg-white/10 text-xs">
                + Host an Event
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Registrations (if any) */}
      {userRegistrations.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Your Upcoming Registrations
              </h2>
            </div>
            <Link href="/my-events" className="text-xs font-semibold text-brand-600 hover:underline">
              View All ({userRegistrations.length}) &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userRegistrations.slice(0, 3).map((reg) => (
              <div
                key={reg.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                      {reg.ticket_code}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatDate(reg.event?.event_date)}
                    </span>
                  </div>

                  <Link href={`/events/${reg.event_id}`}>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-brand-600 truncate">
                      {reg.event?.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{reg.event?.location}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirmed Seat</span>
                  </span>
                  <Link
                    href={`/events/${reg.event_id}`}
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    View Ticket &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommended For You Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Recommended For You
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Curated based on your interests ({userInterests.slice(0, 3).join(', ')}) &amp; {user?.department || 'Department'}
            </p>
          </div>
          <Link href="/explore" className="text-xs font-semibold text-brand-600 hover:underline">
            Explore More &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {fallbackRecommended.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* Trending on Campus Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Trending on Campus
            </h2>
          </div>
          <Link href="/explore?sort=popularity" className="text-xs font-semibold text-brand-600 hover:underline">
            View Leaderboard &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* Your Communities Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Active Communities &amp; Clubs
            </h2>
          </div>
          <Link href="/communities" className="text-xs font-semibold text-brand-600 hover:underline">
            All Clubs ({communities.length}) &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {communities.map((comm) => (
            <CommunityCard key={comm.id} community={comm} />
          ))}
        </div>
      </section>

      {/* Upcoming Campus Schedule (Chronological) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Upcoming on the Calendar
            </h2>
          </div>
          <Link href="/explore" className="text-xs font-semibold text-brand-600 hover:underline">
            See Calendar View &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}
