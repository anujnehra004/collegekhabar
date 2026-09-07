'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Sparkles, Filter } from 'lucide-react';
import { Community } from '@/lib/types';
import { dataService } from '@/lib/data/storage';
import { CommunityCard } from '@/components/communities/CommunityCard';

const CATEGORIES = ['All', 'Technology', 'Entrepreneurship', 'Arts & Media', 'Cultural'];

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const data = await dataService.getCommunities();
    setCommunities(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCommunities = communities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || c.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
          <Users className="w-4 h-4" />
          <span>Student Societies</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Campus Communities &amp; Clubs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Join clubs that match your passions. Meet fellow student builders, participate in exclusive workshops, and lead campus initiatives.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clubs & organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Communities */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading clubs...</div>
      ) : filteredCommunities.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-400 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          No clubs found matching &ldquo;{search}&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((comm) => (
            <CommunityCard key={comm.id} community={comm} onJoinChange={loadData} />
          ))}
        </div>
      )}
    </div>
  );
}
