'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Compass, Sparkles, AlertCircle } from 'lucide-react';
import { useEvents } from '@/context/EventContext';
import { EventFilters } from '@/components/events/EventFilters';
import { EventCard } from '@/components/events/EventCard';
import { EventFiltersState } from '@/lib/types';
import { Button } from '@/components/ui/Button';

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const { events, isLoading } = useEvents();

  const [filters, setFilters] = useState<EventFiltersState>({
    searchQuery: '',
    category: initialCategory,
    eventType: 'all',
    dateFilter: 'all',
    priceFilter: 'all',
    sortBy: 'date-asc',
  });

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setFilters((prev) => ({ ...prev, category: cat }));
    }
  }, [searchParams]);

  const handleReset = () => {
    setFilters({
      searchQuery: '',
      category: 'all',
      eventType: 'all',
      dateFilter: 'all',
      priceFilter: 'all',
      sortBy: 'date-asc',
    });
  };

  // Memoized Filter Pipeline
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.community_name && e.community_name.toLowerCase().includes(q))
      );
    }

    // Category
    if (filters.category !== 'all') {
      result = result.filter(
        (e) => e.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Event Format (offline, online, hybrid)
    if (filters.eventType !== 'all') {
      result = result.filter((e) => e.event_type === filters.eventType);
    }

    // Pricing
    if (filters.priceFilter === 'free') {
      result = result.filter((e) => e.is_free);
    } else if (filters.priceFilter === 'paid') {
      result = result.filter((e) => !e.is_free);
    }

    // Date
    if (filters.dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      result = result.filter((e) => e.event_date === today);
    } else if (filters.dateFilter === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      result = result.filter((e) => e.event_date >= today);
    }

    // Sorting
    if (filters.sortBy === 'popularity') {
      result.sort((a, b) => b.current_participants - a.current_participants);
    } else if (filters.sortBy === 'date-desc') {
      result.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
    } else if (filters.sortBy === 'recently-added') {
      result.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    } else {
      // Default: date-asc
      result.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
    }

    return result;
  }, [events, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          <Compass className="w-4 h-4" />
          <span>Discover Campus Activities</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Event Explorer
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Browse upcoming hackathons, tech bootcamps, cultural fests, sports tournaments, and student seminars.
        </p>
      </div>

      {/* Filter Controls */}
      <EventFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleReset}
        totalResults={filteredEvents.length}
      />

      {/* Results Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading campus events...
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-16 text-center space-y-4 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 p-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              No matching events found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn&apos;t find any events matching your selected search or filters. Try adjusting your query or resetting filters.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400 text-sm">Loading Event Explorer...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
