'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Bookmark as BookmarkIcon, 
  Share2, 
  Check, 
  ArrowRight,
  Sparkles,
  Clock
} from 'lucide-react';
import { Event } from '@/lib/types';
import { formatDate, getCategoryBadgeStyle } from '@/lib/utils';
import { useEvents } from '@/context/EventContext';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

export function EventCard({ event, featured = false }: EventCardProps) {
  const { isRegistered, isBookmarked, registerForEvent, toggleBookmark } = useEvents();
  const toast = useToast();
  const [isRegistering, setIsRegistering] = useState(false);

  const registered = isRegistered(event.id);
  const bookmarked = isBookmarked(event.id);
  const badgeStyle = getCategoryBadgeStyle(event.category);
  const isFull = event.current_participants >= event.max_participants;

  const handleRegister = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (registered) {
      toast.info('Already Registered', 'You are already confirmed for this event.');
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
      toast.success('🎉 You are Registered!', `We've saved your spot for "${event.title}".`);
    } else {
      toast.error('Registration Failed', res.message || 'Could not complete registration.');
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isNowSaved = await toggleBookmark(event.id);
    if (isNowSaved) {
      toast.success('Event Saved', 'Added to your bookmarked events.');
    } else {
      toast.info('Bookmark Removed', 'Removed from your saved events.');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description.substring(0, 100),
        url: window.location.origin + `/events/${event.id}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + `/events/${event.id}`);
      toast.success('Link Copied', 'Event link copied to clipboard.');
    }
  };

  return (
    <div
      className={`group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-subtle hover:shadow-card-hover hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden ${
        featured ? 'ring-2 ring-brand-500/20' : ''
      }`}
    >
      {/* Event Banner */}
      <Link href={`/events/${event.id}`} className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 block">
        <img
          src={event.banner_image}
          alt={event.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span
            className={`text-xs px-2.5 py-1 rounded-lg font-bold border backdrop-blur-md ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
          >
            {event.category}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg bg-black/40 text-white/80 hover:text-white backdrop-blur-md transition-colors"
              title="Share event"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg backdrop-blur-md transition-all ${
                bookmarked
                  ? 'bg-amber-500 text-white'
                  : 'bg-black/40 text-white/80 hover:text-white'
              }`}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark event'}
            >
              <BookmarkIcon className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom banner info (Date overlay & Free/Paid) */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="flex items-center gap-1 font-medium drop-shadow-sm text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-brand-300" />
            <span>{formatDate(event.event_date)}</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold">
            {event.is_free ? 'FREE' : `₹${event.price}`}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{event.start_time}</span>
            <span>•</span>
            <span className="capitalize">{event.event_type}</span>
          </div>

          <Link href={`/events/${event.id}`}>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
              {event.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Location & Community */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 truncate max-w-[170px]" title={event.location}>
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{event.location}</span>
            </span>

            <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300 shrink-0">
              <Users className="w-3 h-3 text-slate-400" />
              <span>{event.current_participants} registered</span>
            </span>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1 gap-2">
            <Link
              href={`/events/${event.id}`}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 inline-flex items-center gap-1"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {registered ? (
              <Badge variant="success" size="sm" className="py-1">
                <Check className="w-3 h-3" />
                <span>Registered</span>
              </Badge>
            ) : isFull ? (
              <Badge variant="neutral" size="sm" className="py-1 text-slate-400">
                Event Full
              </Badge>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleRegister}
                isLoading={isRegistering}
                className="py-1 text-xs"
              >
                Register
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
