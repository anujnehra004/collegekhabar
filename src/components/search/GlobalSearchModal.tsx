'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, Users, User, ArrowRight, X } from 'lucide-react';
import { Event, Community, Profile } from '@/lib/types';
import { dataService } from '@/lib/data/storage';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    async function doSearch() {
      if (!query.trim()) {
        setEvents([]);
        setCommunities([]);
        setProfiles([]);
        return;
      }

      setIsLoading(true);
      const q = query.toLowerCase();

      const [allEvents, allComms, allProfs] = await Promise.all([
        dataService.getEvents(),
        dataService.getCommunities(),
        dataService.getProfiles(),
      ]);

      setEvents(
        allEvents
          .filter(
            (e) =>
              e.title.toLowerCase().includes(q) ||
              e.category.toLowerCase().includes(q) ||
              e.location.toLowerCase().includes(q)
          )
          .slice(0, 4)
      );

      setCommunities(
        allComms
          .filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.category.toLowerCase().includes(q) ||
              c.description.toLowerCase().includes(q)
          )
          .slice(0, 3)
      );

      setProfiles(
        allProfs
          .filter(
            (p) =>
              p.full_name.toLowerCase().includes(q) ||
              p.department.toLowerCase().includes(q) ||
              p.skills.some((s) => s.toLowerCase().includes(q))
          )
          .slice(0, 3)
      );

      setIsLoading(false);
    }

    const timer = setTimeout(doSearch, 150);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  const hasResults = events.length > 0 || communities.length > 0 || profiles.length > 0;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search events, clubs, hackathons, students..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="p-3 max-h-[60vh] overflow-y-auto space-y-4">
          {!query.trim() && (
            <div className="py-10 text-center text-slate-400 text-sm">
              Type to search events, clubs, student innovators, or workshops...
            </div>
          )}

          {query.trim() && !hasResults && !isLoading && (
            <div className="py-10 text-center text-slate-400 text-sm">
              No results found for &ldquo;{query}&rdquo;. Try another campus keyword.
            </div>
          )}

          {/* Events Section */}
          {events.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                <span>Events</span>
              </p>
              {events.map((e) => (
                <button
                  key={e.id}
                  onClick={() => handleSelect(`/events/${e.id}`)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={e.banner_image}
                      alt={e.title}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-600">
                        {e.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {formatDate(e.event_date)} • {e.location}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}

          {/* Communities Section */}
          {communities.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>Communities & Clubs</span>
              </p>
              {communities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(`/communities/${c.id}`)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={c.logo}
                      alt={c.name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-600">
                        {c.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {c.category} • {c.member_count} members
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}

          {/* Students Section */}
          {profiles.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-500" />
                <span>Students</span>
              </p>
              {profiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelect(`/profile/${p.id}`)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.profile_image}
                      alt={p.full_name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-600">
                        {p.full_name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {p.department} • {p.year}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with mouse or touch</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
