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
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
      
      {/* Search Bar & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event title, venue, coordinator, or keywords..."
            className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-normal focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium text-slate-700 shadow-2xs">
            <SlidersHorizontal className="w-4 h-4 text-brand-600" />
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-semibold text-brand-700 focus:outline-none cursor-pointer text-xs sm:text-sm"
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
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-heading transition-all duration-150 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-600/30 ring-2 ring-brand-500/25 font-bold scale-[1.02]'
                    : 'bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 font-medium active:scale-95'
                }`}
              >
                {cat === 'All' && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs sm:text-sm font-medium text-slate-500">
          Showing <span className="font-bold text-slate-800">{totalCount}</span> {totalCount === 1 ? 'event' : 'events'}
        </div>

      </div>

    </div>
  );
}
