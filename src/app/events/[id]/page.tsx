'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Bookmark as BookmarkIcon, 
  Share2, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowLeft,
  Mail,
  User,
  Sparkles,
  Ticket,
  AlertTriangle
} from 'lucide-react';
import { Event, Profile, Registration } from '@/lib/types';
import { dataService } from '@/lib/data/storage';
import { formatDate, getCategoryBadgeStyle } from '@/lib/utils';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { EventRegistrationModal } from '@/components/events/EventRegistrationModal';
import { EventCard } from '@/components/events/EventCard';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;

  const { user } = useAuth();
  const { registerForEvent, cancelRegistration, toggleBookmark, isRegistered, isBookmarked, events } = useEvents();
  const toast = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [organizer, setOrganizer] = useState<Profile | null>(null);
  const [attendees, setAttendees] = useState<(Registration & { user: Profile })[]>([]);
  const [activeTab, setActiveTab] = useState('about');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [lastRegistration, setLastRegistration] = useState<Registration | undefined>();

  useEffect(() => {
    async function loadEventData() {
      if (!eventId) return;
      const data = await dataService.getEventById(eventId);
      if (data) {
        setEvent(data);
        const orgProfile = await dataService.getProfile(data.organizer_id);
        setOrganizer(orgProfile);
        const attList = await dataService.getEventAttendees(eventId);
        setAttendees(attList);
      }
    }
    loadEventData();
  }, [eventId, events]);

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Loading Event Details...</h2>
        <Button variant="outline" size="sm" onClick={() => router.back()} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
      </div>
    );
  }

  const registered = isRegistered(event.id);
  const bookmarked = isBookmarked(event.id);
  const badgeStyle = getCategoryBadgeStyle(event.category);
  const isFull = event.current_participants >= event.max_participants;
  const capacityPct = Math.min(100, Math.round((event.current_participants / event.max_participants) * 100));

  const relatedEvents = events.filter((e) => e.id !== event.id && e.category === event.category).slice(0, 3);

  const handleRegister = async () => {
    if (!user) {
      toast.info('Sign In Required', 'Please log in to register for campus events.');
      router.push('/login');
      return;
    }

    if (registered) {
      toast.info('Already Registered', 'You have already secured a ticket for this event.');
      return;
    }

    if (isFull) {
      toast.error('Event Full', 'This event has reached maximum capacity.');
      return;
    }

    setIsRegistering(true);
    const res = await registerForEvent(event.id);
    setIsRegistering(false);

    if (res.success) {
      setLastRegistration(res.registration);
      setIsConfirmationOpen(true);
    } else {
      toast.error('Registration Failed', res.message || 'Could not complete registration.');
    }
  };

  const handleCancelRegistration = async () => {
    if (confirm('Are you sure you want to cancel your registration?')) {
      await cancelRegistration(event.id);
      toast.info('Registration Cancelled', 'Your spot has been released.');
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user) {
      toast.info('Sign In Required', 'Please log in to save events.');
      return;
    }
    const isNowSaved = await toggleBookmark(event.id);
    if (isNowSaved) {
      toast.success('Event Saved', 'Added to your bookmarked events.');
    } else {
      toast.info('Bookmark Removed', 'Removed from your saved events.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description.substring(0, 100),
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link Copied', 'Event link copied to clipboard.');
    }
  };

  const detailTabs = [
    { id: 'about', label: 'About Event' },
    { id: 'schedule', label: `Schedule (${event.schedule?.length || 0})` },
    { id: 'speakers', label: `Speakers (${event.speakers?.length || 0})` },
    { id: 'attendees', label: `Attendees (${attendees.length})` },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back link */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to events</span>
      </button>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-900">
        <div className="h-64 sm:h-96 w-full relative">
          <img
            src={event.banner_image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Top category & share buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span
              className={`text-xs px-3 py-1.5 rounded-xl font-bold border backdrop-blur-md ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
            >
              {event.category}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all"
                title="Share event"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleBookmarkToggle}
                className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                  bookmarked ? 'bg-amber-500 text-white' : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
                title={bookmarked ? 'Remove bookmark' : 'Save event'}
              >
                <BookmarkIcon className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Title and metadata on banner */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-200">
              <span className="capitalize px-2.5 py-0.5 rounded-md bg-white/10 backdrop-blur-md">
                {event.event_type}
              </span>
              <span>•</span>
              <span>{event.is_free ? 'Free Event' : `Ticket: ₹${event.price}`}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Registration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Tabs & Event Info */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs
            tabs={detailTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="underline"
          />

          {/* Tab 1: About */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  About the Event
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {event.eligibility && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Eligibility &amp; Prerequisites
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {event.eligibility}
                  </p>
                </div>
              )}

              {event.rules && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Rules &amp; Guidelines
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {event.rules}
                  </p>
                </div>
              )}

              {/* Organizer Info */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Organized By
                </h4>
                <div className="flex items-center gap-3">
                  <img
                    src={event.organizer_avatar || organizer?.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                    alt="Organizer"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-500/20"
                  />
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {event.organizer_name || organizer?.full_name || 'Campus Student Organization'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {event.community_name || organizer?.department || 'Organizer Council'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Schedule */}
          {activeTab === 'schedule' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                Event Schedule &amp; Agenda
              </h3>
              {event.schedule && event.schedule.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {event.schedule.map((item, idx) => (
                    <div key={idx} className="relative space-y-1">
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-brand-600 bg-white dark:bg-slate-900" />
                      <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                        {item.time}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {item.title}
                      </h4>
                      {item.speaker && (
                        <p className="text-xs text-slate-500">Speaker: {item.speaker}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6">No specific schedule published yet.</p>
              )}
            </div>
          )}

          {/* Tab 3: Speakers */}
          {activeTab === 'speakers' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                Speakers &amp; Industry Guests
              </h3>
              {event.speakers && event.speakers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.speakers.map((spk, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3 shadow-subtle"
                    >
                      <img
                        src={spk.avatar}
                        alt={spk.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {spk.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{spk.role}</p>
                        <span className="text-[11px] font-semibold text-brand-600">{spk.company}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6">Speakers will be announced soon.</p>
              )}
            </div>
          )}

          {/* Tab 4: Attendees */}
          {activeTab === 'attendees' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Registered Students ({attendees.length})
                </h3>
                <span className="text-xs text-slate-500">{event.max_participants - event.current_participants} spots left</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {attendees.slice(0, 12).map((item) => (
                  <Link
                    key={item.id}
                    href={`/profile/${item.user.id}`}
                    className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <img
                      src={item.user.profile_image}
                      alt={item.user.full_name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {item.user.full_name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{item.user.year}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Registration & Quick Facts Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 sticky top-24">
            {/* Price / Free */}
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {event.is_free ? 'Free' : `₹${event.price}`}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {event.is_free ? 'Zero Registration Fee' : 'Per Participant'}
              </span>
            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Registration Status</span>
                <span>{event.current_participants} / {event.max_participants} ({capacityPct}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    capacityPct > 90 ? 'bg-rose-500' : capacityPct > 70 ? 'bg-amber-500' : 'bg-brand-600'
                  }`}
                  style={{ width: `${capacityPct}%` }}
                />
              </div>
              {isFull && (
                <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Maximum capacity reached</span>
                </p>
              )}
            </div>

            {/* Main Action Button */}
            {registered ? (
              <div className="space-y-2">
                <div className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You Are Confirmed</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelRegistration}
                  className="w-full text-rose-600 hover:text-rose-700 text-xs py-1.5"
                >
                  Cancel Registration
                </Button>
              </div>
            ) : isFull ? (
              <Button disabled variant="secondary" className="w-full text-slate-400">
                Event Full
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full shadow-lg shadow-brand-500/20"
                isLoading={isRegistering}
                onClick={handleRegister}
              >
                Register Now
              </Button>
            )}

            {/* Quick Details List */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Date &amp; Time</p>
                  <p className="text-slate-500">{formatDate(event.event_date)} • {event.start_time} - {event.end_time}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Location / Venue</p>
                  <p className="text-slate-500">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Users className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">Registered</p>
                  <p className="text-slate-500">{event.current_participants} students confirmed</p>
                </div>
              </div>

              {event.contact_email && (
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Contact</p>
                    <p className="text-slate-500">{event.contact_email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Events Section */}
      {relatedEvents.length > 0 && (
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            More {event.category} Events on Campus
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      )}

      {/* Registration Confirmation Modal */}
      <EventRegistrationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        event={event}
        registration={lastRegistration}
      />
    </div>
  );
}
