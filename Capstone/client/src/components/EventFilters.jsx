import React from 'react';
import { Search, X, Sparkles, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Hackathon',
  'Technical',
  'Cultural',
  'Sports',
  'Workshop',
  'Seminar'
];

export default function EventFilters({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  totalCount
}) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
      
      {/* Search Bar & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event title, venue, coordinator, or keywords..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800 placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-heading font-medium text-slate-700">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-semibold text-brand-600 focus:outline-none cursor-pointer"
            >
              <option value="All">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Happening Now</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

      </div>

      {/* Category Pills & Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-heading font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30 ring-2 ring-brand-600/20'
                    : 'bg-slate-100/80 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'All' && <Sparkles className="w-3 h-3 inline mr-1" />}
                {cat}
              </button>
            );
          })}
        </div>

        <div className="text-xs font-medium text-slate-500">
          Showing <span className="font-semibold text-slate-800">{totalCount}</span> {totalCount === 1 ? 'event' : 'events'}
        </div>

      </div>

    </div>
  );
}
