'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  Users, 
  ShieldCheck, 
  Compass, 
  Zap, 
  Bell, 
  Trophy, 
  CheckCircle2, 
  Flame,
  Layers,
  Search
} from 'lucide-react';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { EventCard } from '@/components/events/EventCard';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  const { events } = useEvents();
  const { user } = useAuth();

  const featuredEvents = events.slice(0, 3);
  const totalRegistrations = events.reduce((acc, e) => acc + (e.current_participants || 0), 0);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-brand-50/40 via-white to-white dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950">
        {/* Glow backdrop shapes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-500/15 to-indigo-500/15 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Banner */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold shadow-subtle animate-in fade-in slide-in-from-top-3 duration-500">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
              <span>The Next-Gen Digital University Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
              Your Campus. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600">
                Your Community.
              </span>{' '}
              Your Events.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Discover what&apos;s happening around your university, connect with students, join communities, and never miss an opportunity.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/explore" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full sm:w-auto shadow-md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Events
                </Button>
              </Link>
              <Link href={user ? '/dashboard' : '/signup'} className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  {user ? 'Open Student Dashboard' : 'Join Campus Connect'}
                </Button>
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Verified Student Network
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Instant 1-Click Registration
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Powered by Supabase
              </span>
            </div>
          </div>

          {/* Platform Showcase Mockup */}
          <div className="mt-14 relative max-w-5xl mx-auto">
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-2xl overflow-hidden p-3 sm:p-5 backdrop-blur-md">
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 space-y-5">
                {/* Mock dashboard header bar */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-slate-400 ml-2">campus-connect.edu/dashboard</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 font-bold border border-brand-200">
                    Live Campus Feed
                  </span>
                </div>

                {/* Mock Cards Showcase */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {featuredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Statistics Section */}
      <section className="py-12 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <p className="text-3xl sm:text-4xl font-black text-brand-600 dark:text-brand-400">
                {events.length}+
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                Events Happening
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <p className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">
                2,400+
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                Active Students
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <p className="text-3xl sm:text-4xl font-black text-violet-600 dark:text-violet-400">
                28+
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                University Clubs
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
                {totalRegistrations > 0 ? `${totalRegistrations}+` : '3,200+'}
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                Event Registrations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars (Discover, Connect, Communities, Opportunities, Never Miss) */}
      <section className="py-20 bg-slate-50/50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Everything Your Campus Has to Offer
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Engineered to replace fragmented WhatsApp groups and noticeboards with one centralized digital campus hub.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 1. Discover */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-card transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Discover Campus Life
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Find fests, seminars, hackathons, guest lectures, and workshops happening today or this semester with rich filtering.
              </p>
              <Link href="/explore" className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 pt-2">
                <span>Browse all events</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2. Connect */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-card transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Connect with Students
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Meet peers across departments sharing your exact skills and interests. Send connection requests and collaborate on projects.
              </p>
              <Link href="/connections" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 pt-2">
                <span>Start networking</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3. Communities */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-card transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Clubs & Communities
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Join GDSC, Robotics Club, E-Cell, Shutterbugs, and cultural guilds. Get direct announcements whenever new activities drop.
              </p>
              <Link href="/communities" className="text-xs font-semibold text-violet-600 hover:text-violet-700 inline-flex items-center gap-1 pt-2">
                <span>Explore clubs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4. Opportunities */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-card transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Competitions & Placements
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Accelerate your career with mock interview days, competitive coding battles, pitch challenges, and exclusive student internships.
              </p>
              <Link href="/explore?category=Placement" className="text-xs font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 pt-2">
                <span>View career activities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 5. Never Miss An Event */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-subtle hover:shadow-card transition-all space-y-4 md:col-span-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Never Miss What Matters
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Bookmark events for later, export 1-click calendar invites, and receive real-time notifications for upcoming sessions, registrations, and club announcements.
              </p>
              <Link href="/my-events" className="text-xs font-semibold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 pt-2">
                <span>Manage your schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 bg-gradient-to-br from-brand-600 via-indigo-700 to-indigo-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to experience your university like never before?
          </h2>
          <p className="text-sm sm:text-base text-brand-100 max-w-xl mx-auto">
            Join thousands of students on Campus Connect. Discover events, make connections, and build unforgettable campus memories.
          </p>
          <div className="pt-2">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-brand-700 hover:bg-brand-50 shadow-xl font-bold">
                Get Started — It&apos;s Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
