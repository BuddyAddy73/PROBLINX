import React, { useState, useRef } from 'react';
import { ExternalLink, Star, Swords, CheckCircle2, Hammer, Timer, Search, History, Clock, ArrowUpRight, Shield } from 'lucide-react';
import { Solution } from '../types';
import { calculateSolverRank } from '../utils/rankUtils';

interface AppBattlegroundProps {
  solutions: Solution[];
  onTestAndReview: (solution: Solution) => void;
  onOpenProblemForSolution: (problemId: string) => void;
  isDarkMode: boolean;
  recentSearches: string[];
  onAddRecentSearch: (query: string) => void;
  onClearRecentSearches: () => void;
}

export const AppBattleground: React.FC<AppBattlegroundProps> = ({
  solutions,
  onTestAndReview,
  onOpenProblemForSolution,
  isDarkMode,
  recentSearches,
  onAddRecentSearch,
  onClearRecentSearches,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'existing' | 'would_build'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onAddRecentSearch(searchQuery.trim());
      setIsSearchFocused(false);
    }
  };

  const filteredSolutions = solutions.filter((sol) => {
    const matchesSearch =
      sol.app_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sol.pitch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sol.solver?.display_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      filterType === 'all'
        ? true
        : filterType === 'existing'
        ? sol.is_existing_tool
        : !sol.is_existing_tool;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Hero Banner Section */}
      <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b ${
        isDarkMode ? 'border-white/10' : 'border-stone-200'
      }`}>
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight uppercase">
            APP<br />BATTLEGROUND
          </h1>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <p className="text-[14px] font-normal leading-relaxed text-stone-600 dark:text-zinc-400 max-w-xs sm:text-right uppercase">
            Working tools & verified pitches facing user evaluation.
          </p>
          <div className={`flex items-center gap-2 rounded px-3 py-1.5 border font-mono text-xs ${
            isDarkMode
              ? 'bg-[#141416] border-white/10 text-orange-400'
              : 'bg-orange-50 border-orange-200 text-orange-800'
          }`}>
            <Timer className="h-3.5 w-3.5 animate-pulse" />
            <span className="font-bold">90S_TEST_PROTOCOL</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 font-mono text-xs">
        
        {/* Search Input Container with Recent Searches */}
        <div ref={searchContainerRef} className="relative flex-1">
          <form onSubmit={handleSearchSubmit}>
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${
              isDarkMode ? 'text-zinc-500' : 'text-stone-400'
            }`} />
            <input
              type="text"
              id="input-search-solutions"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="> FILTER_BY_KEYWORD..."
              className={`w-full rounded-md border py-2.5 pl-10 pr-4 font-mono text-xs focus:border-orange-500 focus:outline-none transition ${
                isDarkMode
                  ? 'border-white/10 bg-[#0b0b0c] text-white placeholder-zinc-600'
                  : 'border-stone-200 bg-white text-stone-900 placeholder-stone-400 shadow-xs'
              }`}
            />
          </form>

          {/* Recent Searches Dropdown */}
          {isSearchFocused && recentSearches.length > 0 && (
            <div
              className={`absolute top-full left-0 right-0 mt-1.5 z-30 rounded-md border p-2 shadow-2xl backdrop-blur-md transition-all ${
                isDarkMode
                  ? 'bg-[#141416] border-white/10 text-zinc-200'
                  : 'bg-white border-stone-200 text-stone-800 shadow-stone-200'
              }`}
            >
              <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <History className="h-3 w-3 text-orange-500" />
                  RECENT_SEARCHES
                </span>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onClearRecentSearches();
                  }}
                  className="text-zinc-500 hover:text-white underline cursor-pointer text-[10px]"
                >
                  CLEAR
                </button>
              </div>
              <div className="mt-1 space-y-0.5">
                {recentSearches.map((item, idx) => (
                  <div
                    key={idx}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchQuery(item);
                      onAddRecentSearch(item);
                      setIsSearchFocused(false);
                    }}
                    className={`flex items-center justify-between px-3 py-1.5 rounded text-xs font-mono cursor-pointer transition ${
                      isDarkMode
                        ? 'hover:bg-white/5 text-zinc-300 hover:text-white'
                        : 'hover:bg-stone-100 text-stone-700 hover:text-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 opacity-50" />
                      <span>{item}</span>
                    </div>
                    <ArrowUpRight className="h-3 w-3 opacity-50" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div className={`flex items-center gap-1 rounded-md border p-1 transition ${
          isDarkMode
            ? 'border-white/10 bg-[#141416]'
            : 'border-stone-200 bg-white shadow-xs'
        }`}>
          <button
            onClick={() => setFilterType('all')}
            className={`rounded px-2.5 py-1 text-[11px] font-bold uppercase transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-orange-600 text-white'
                : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            ALL [{solutions.length}]
          </button>
          <button
            onClick={() => setFilterType('existing')}
            className={`rounded px-2.5 py-1 text-[11px] font-bold uppercase transition cursor-pointer ${
              filterType === 'existing'
                ? 'bg-orange-600 text-white'
                : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            EXISTING
          </button>
          <button
            onClick={() => setFilterType('would_build')}
            className={`rounded px-2.5 py-1 text-[11px] font-bold uppercase transition cursor-pointer ${
              filterType === 'would_build'
                ? 'bg-orange-600 text-white'
                : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            WOULD_BUILD
          </button>
        </div>

      </div>

      {/* Solutions Cards Single-Column Doomscroll Feed */}
      {filteredSolutions.length === 0 ? (
        <div className={`rounded-2xl border border-dashed p-12 text-center max-w-2xl mx-auto ${
          isDarkMode
            ? 'border-[#27272A] bg-[#121215]/50'
            : 'border-stone-300 bg-white/50'
        }`}>
          <Swords className="mx-auto h-10 w-10 text-stone-400 dark:text-zinc-600 mb-3" />
          <h3 className={`text-base font-semibold ${isDarkMode ? 'text-zinc-300' : 'text-stone-800'}`}>
            No solutions matched
          </h3>
          <p className={`text-xs mt-1 max-w-md mx-auto ${isDarkMode ? 'text-zinc-500' : 'text-stone-500'}`}>
            Try adjusting your search query or switching between existing tools and 'Would Build' pitches.
          </p>
        </div>
      ) : (
        <div className="w-full flex flex-col divide-y divide-white/10">
          {filteredSolutions.map((sol) => {
            const solverSolutionsCount = solutions.filter(
              (s) => s.solver_id === sol.solver_id
            ).length;
            const solverRank = calculateSolverRank(solverSolutionsCount);

            return (
              <div
                key={sol.id}
                className={`group relative flex flex-col sm:flex-row justify-between gap-6 py-6 transition-all duration-200 border-b ${
                  isDarkMode ? 'border-white/10' : 'border-stone-200'
                }`}
              >
                {/* Floating Solver Avatar/Logo Badge */}
                <div className="absolute -top-3 right-3 z-10 animate-float pointer-events-none">
                  <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 shadow-md border text-[11px] font-mono font-bold ${
                    isDarkMode
                      ? 'bg-[#141416] border-white/10 text-zinc-300 shadow-black/50'
                      : 'bg-white border-stone-200 text-stone-800 shadow-stone-200'
                  }`}>
                    <img
                      src={sol.solver?.avatar_url || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'}
                      alt={sol.app_name}
                      className="h-5 w-5 rounded-full object-cover border border-orange-500/40"
                    />
                    <span>{sol.app_name}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  
                  {/* Meta Line: Solver + Tool Type Badge + Solver Rank */}
                  <div className="flex items-center gap-2.5 font-sans">
                    {sol.is_existing_tool ? (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium tracking-wide px-2 py-0.5 rounded uppercase border ${
                        isDarkMode
                          ? 'bg-orange-950/60 text-orange-300 border-orange-800/50'
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        <CheckCircle2 className="h-3 w-3" />
                        EXISTING
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium tracking-wide px-2 py-0.5 rounded uppercase border ${
                        isDarkMode
                          ? 'bg-amber-950/60 text-amber-300 border-amber-800/50'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        <Hammer className="h-3 w-3" />
                        WOULD_BUILD
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-[12px] font-normal text-stone-400 dark:text-zinc-500">
                      <span>Pitched by <strong className="font-medium text-stone-700 dark:text-zinc-300">{sol.solver?.display_name || 'Anonymous Solver'}</strong></span>
                      <span className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border uppercase ${
                        isDarkMode ? solverRank.badgeClassDark : solverRank.badgeClassLight
                      }`}>
                        <Shield className="h-2.5 w-2.5" />
                        {solverRank.rank}
                      </span>
                    </span>
                  </div>

                {/* App Name & Pitch Quote */}
                <div className="space-y-1.5">
                  <h3 className="text-[17px] font-medium tracking-tight text-stone-900 dark:text-zinc-100 leading-snug">
                    {sol.app_name}
                  </h3>

                  {sol.problem_title && (
                    <button
                      onClick={() => onOpenProblemForSolution(sol.problem_id)}
                      className="text-left font-mono text-xs text-stone-400 dark:text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400 transition cursor-pointer"
                    >
                      &gt; SOLVES: "{sol.problem_title}"
                    </button>
                  )}

                  <div className={`mt-2 p-3 rounded border-l-2 border-orange-500 text-[14px] font-normal leading-relaxed italic ${
                    isDarkMode ? 'bg-[#0b0b0c] text-zinc-300' : 'bg-stone-100 text-stone-700'
                  }`}>
                    "{sol.pitch}"
                  </div>
                </div>

                {/* Rating + Link */}
                <div className="flex items-center gap-4 font-mono text-xs opacity-80 pt-1">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>{sol.avg_rating.toFixed(1)}</span>
                    <span className="opacity-50">({sol.reviews_count} reviews)</span>
                  </div>

                  {sol.link && (
                    <a
                      href={sol.link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      <span>DEMO_LINK</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  {!sol.is_existing_tool && sol.estimated_timeline && (
                    <span className={`flex items-center gap-1 ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
                      <Timer className="h-3 w-3" />
                      <span>ETA: {sol.estimated_timeline}</span>
                    </span>
                  )}
                </div>

                {!sol.is_existing_tool && sol.contact_note && (
                  <div className={`text-[11px] font-mono ${isDarkMode ? 'text-zinc-500' : 'text-stone-400'}`}>
                    Contact: {sol.contact_note}
                  </div>
                )}

              </div>

              {/* Right Column: CTA */}
              <div className="flex sm:flex-col justify-end items-end gap-3 shrink-0 sm:min-w-[140px]">
                <button
                  id={`btn-test-review-${sol.id}`}
                  onClick={() => onTestAndReview(sol)}
                  className="font-mono text-xs font-bold uppercase px-4 py-2.5 rounded bg-orange-600 hover:bg-orange-500 text-white shadow-sm transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Timer className="h-3.5 w-3.5" />
                  <span>TEST (90S)</span>
                </button>
              </div>

            </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
