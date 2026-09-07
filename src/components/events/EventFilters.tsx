'use client';

import React from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { EventCategory, EventFiltersState } from '@/lib/types';

interface EventFiltersProps {
  filters: EventFiltersState;
  onChange: (filters: EventFiltersState) => void;
  onReset: () => void;
  totalResults: number;
}

const CATEGORIES: ('all' | EventCategory)[] = [
  'all',
  'Hackathon',
  'Workshop',
  'Seminar',
  'Competition',
  'Technical',
  'Cultural',
  'Fest',
  'Sports',
  'Club Activity',
  'Placement',
  'Social',
];

export function EventFilters({ filters, onChange, onReset, totalResults }: EventFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, searchQuery: e.target.value });
  };

  const handleCategoryClick = (cat: string) => {
    onChange({ ...filters, category: cat });
  };

  const isFiltered =
    filters.searchQuery ||
    filters.category !== 'all' ||
    filters.eventType !== 'all' ||
    filters.priceFilter !== 'all' ||
    filters.dateFilter !== 'all' ||
    filters.sortBy !== 'date-asc';

  return (
    <div className="space-y-4 mb-8">
      {/* Prominent Search Bar */}
      <div className="relative rounded-2xl shadow-subtle">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5 text-brand-600" />
        </div>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={handleSearchChange}
          placeholder="Search events, clubs, workshops, hackathons, seminars..."
          className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-sm"
        />
        {filters.searchQuery && (
          <button
            onClick={() => onChange({ ...filters, searchQuery: '' })}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = filters.category === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {cat === 'all' ? '✨ All Events' : cat}
            </button>
          );
        })}
      </div>

      {/* Secondary Filter Dropdowns & Results count */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Event Mode (Online/Offline) */}
          <select
            value={filters.eventType}
            onChange={(e) => onChange({ ...filters, eventType: e.target.value })}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">📍 All Formats</option>
            <option value="offline">In-Person (Offline)</option>
            <option value="online">Online / Stream</option>
            <option value="hybrid">Hybrid</option>
          </select>

          {/* Pricing Filter */}
          <select
            value={filters.priceFilter}
            onChange={(e) => onChange({ ...filters, priceFilter: e.target.value })}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">🎟️ Any Ticket</option>
            <option value="free">Free Only</option>
            <option value="paid">Paid Events</option>
          </select>

          {/* Date Filter */}
          <select
            value={filters.dateFilter}
            onChange={(e) => onChange({ ...filters, dateFilter: e.target.value })}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">📅 Any Date</option>
            <option value="today">Happening Today</option>
            <option value="upcoming">Upcoming</option>
          </select>

          {isFiltered && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-slate-500 hover:text-brand-600 px-2 py-1 rounded-lg transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Sort & Results Count */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500 font-medium">
            Showing <strong>{totalResults}</strong> events
          </span>

          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="date-asc">Date: Soonest First</option>
            <option value="popularity">Most Popular (Attendees)</option>
            <option value="recently-added">Recently Announced</option>
            <option value="date-desc">Date: Latest First</option>
          </select>
        </div>
      </div>
    </div>
  );
}
