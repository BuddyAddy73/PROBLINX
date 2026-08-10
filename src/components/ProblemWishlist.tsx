import React, { useState, useRef } from 'react';
import { Search, Flame, Tag, CheckCircle2, Clock, ShieldAlert, ArrowUpRight, MessageSquare, Plus, User, History } from 'lucide-react';
import { Problem, ProblemStatus } from '../types';

interface ProblemWishlistProps {
  problems: Problem[];
  onSolveProblem: (problem: Problem) => void;
  onOpenDetail: (problem: Problem) => void;
  onOpenPostProblem: () => void;
  onUpvoteProblem: (problemId: string) => void;
  upvotedProblemIds: Set<string>;
  isDarkMode: boolean;
  recentSearches: string[];
  onAddRecentSearch: (query: string) => void;
  onClearRecentSearches: () => void;
}

export const ProblemWishlist: React.FC<ProblemWishlistProps> = ({
  problems,
  onSolveProblem,
  onOpenDetail,
  onOpenPostProblem,
  onUpvoteProblem,
  upvotedProblemIds,
  isDarkMode,
  recentSearches,
  onAddRecentSearch,
  onClearRecentSearches,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Featured and extracted tags for category filter
  const featuredTags = ['AI', 'DevTools', 'NoCode', 'Productivity', 'Serverless', 'Monitoring', 'Privacy'];
  const extractedTags = Array.from(new Set(problems.flatMap((p) => p.tags)));
  const allCategoryTags = Array.from(new Set([...featuredTags, ...extractedTags]));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onAddRecentSearch(searchQuery.trim());
      setIsSearchFocused(false);
    }
  };

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.attempted_solutions.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag ? p.tags.includes(selectedTag) : true;
    const matchesStatus = selectedStatus === 'all' ? true : p.status === selectedStatus;

    return matchesSearch && matchesTag && matchesStatus;
  });

  const getStatusBadge = (status: ProblemStatus) => {
    switch (status) {
      case 'open':
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium tracking-wide px-2 py-0.5 rounded uppercase border ${
            isDarkMode
              ? 'bg-orange-950/60 text-orange-300 border-orange-800/50'
              : 'bg-orange-50 text-orange-700 border-orange-200'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isDarkMode ? 'bg-orange-400' : 'bg-orange-600'}`}></span>
            Open
          </span>
        );
      case 'claimed':
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium tracking-wide px-2 py-0.5 rounded uppercase border ${
            isDarkMode
              ? 'bg-amber-950/60 text-amber-300 border-amber-800/50'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <Clock className="h-3 w-3" />
            Claimed
          </span>
        );
      case 'in_review':
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium tracking-wide px-2 py-0.5 rounded uppercase border ${
            isDarkMode
              ? 'bg-slate-800/80 text-slate-300 border-slate-700'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            <Flame className="h-3 w-3" />
            Review
          </span>
        );
      case 'solved':
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium tracking-wide px-2 py-0.5 rounded uppercase border ${
            isDarkMode
              ? 'bg-slate-800/80 text-slate-300 border-slate-700'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            <CheckCircle2 className="h-3 w-3" />
            Solved
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Banner Section */}
      <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b ${
        isDarkMode ? 'border-white/10' : 'border-stone-200'
      }`}>
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight uppercase">
            PROBLEM<br />WISHLIST
          </h1>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <p className="text-[14px] font-normal leading-relaxed text-stone-600 dark:text-zinc-400 max-w-xs sm:text-right uppercase">
            Verified software gaps & workflow pain points posted by users.
          </p>
          <button
            id="btn-post-problem-banner"
            onClick={onOpenPostProblem}
            className="font-mono text-xs font-extrabold uppercase px-4 py-2 rounded-md bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/20 transition cursor-pointer active:scale-95"
          >
            + POST NEW PAIN
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Search Input Container with Recent Searches Dropdown */}
          <div ref={searchContainerRef} className="relative flex-1">
            <form onSubmit={handleSearchSubmit}>
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${
                isDarkMode ? 'text-zinc-500' : 'text-stone-400'
              }`} />
              <input
                type="text"
                id="input-search-problems"
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

          {/* Status Filter Tabs */}
          <div className={`flex items-center gap-1 rounded-md border p-1 font-mono text-xs transition ${
            isDarkMode
              ? 'border-white/10 bg-[#141416]'
              : 'border-stone-200 bg-white shadow-xs'
          }`}>
            {['all', 'open', 'claimed', 'in_review', 'solved'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`rounded px-2.5 py-1 text-[11px] font-bold uppercase transition cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-orange-600 text-white'
                    : isDarkMode
                      ? 'text-zinc-400 hover:text-white'
                      : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {st === 'in_review' ? 'REVIEW' : st}
              </button>
            ))}
          </div>

        </div>

        {/* Category Tag Pills Filter */}
        <div className={`p-3 rounded-xl border ${
          isDarkMode ? 'bg-[#121215] border-white/10' : 'bg-stone-50 border-stone-200'
        }`}>
          <div className="flex items-center justify-between mb-2 px-0.5">
            <span className="text-[12px] font-semibold tracking-wider uppercase text-stone-500 dark:text-zinc-400 flex items-center gap-1.5 font-mono">
              <Tag className="h-3.5 w-3.5 text-orange-500" />
              CATEGORY FILTER
            </span>
            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="text-[11px] font-mono text-orange-600 dark:text-orange-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                CLEAR FILTER (#{selectedTag})
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
            {/* ALL Pill */}
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium tracking-wide transition cursor-pointer active:scale-95 ${
                selectedTag === null
                  ? 'bg-orange-600 text-white shadow-sm border border-orange-500 font-semibold'
                  : isDarkMode
                    ? 'bg-[#18181b] text-zinc-400 border border-white/10 hover:border-zinc-700 hover:text-zinc-200'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100 hover:text-stone-900 shadow-xs'
              }`}
            >
              <span>ALL</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                selectedTag === null
                  ? 'bg-white/20 text-white'
                  : isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-stone-200 text-stone-600'
              }`}>
                {problems.length}
              </span>
            </button>

            {/* Category Tag Pills */}
            {allCategoryTags.map((tag) => {
              const count = problems.filter((p) => p.tags.includes(tag)).length;
              const isActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(isActive ? null : tag)}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium tracking-wide transition cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-sm border border-orange-500 font-semibold'
                      : isDarkMode
                        ? 'bg-[#18181b] text-zinc-400 border border-white/10 hover:border-zinc-700 hover:text-zinc-200'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100 hover:text-stone-900 shadow-xs'
                  }`}
                >
                  <span>#{tag}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Problems Cards Single-Column Doomscroll Feed */}
      {filteredProblems.length === 0 ? (
        <div className={`rounded-2xl border border-dashed p-12 text-center max-w-2xl mx-auto ${
          isDarkMode
            ? 'border-[#27272A] bg-[#121215]/50'
            : 'border-stone-300 bg-white/50'
        }`}>
          <ShieldAlert className="mx-auto h-10 w-10 text-stone-400 dark:text-zinc-600 mb-3" />
          <h3 className={`text-base font-semibold ${isDarkMode ? 'text-zinc-300' : 'text-stone-800'}`}>
            No problems found
          </h3>
          <p className={`text-xs mt-1 max-w-md mx-auto ${isDarkMode ? 'text-zinc-500' : 'text-stone-500'}`}>
            Try adjusting your search criteria or tag filters to explore other community wishlist items.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedTag(null); setSelectedStatus('all'); }}
            className="mt-4 text-xs text-orange-600 dark:text-orange-400 hover:underline font-medium cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col divide-y divide-white/10">
          {filteredProblems.map((prob) => (
            <div
              key={prob.id}
              className={`group relative flex flex-col sm:flex-row justify-between gap-6 py-6 transition-all duration-200 border-b ${
                isDarkMode ? 'border-white/10' : 'border-stone-200'
              }`}
            >
              {/* Floating User/Logo Badge */}
              <div className="absolute -top-3 right-3 z-10 animate-float pointer-events-none">
                <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 shadow-md border text-[11px] font-mono font-bold ${
                  isDarkMode
                    ? 'bg-[#141416] border-white/10 text-zinc-300 shadow-black/50'
                    : 'bg-white border-stone-200 text-stone-800 shadow-stone-200'
                }`}>
                  <img
                    src={prob.poster?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={prob.poster?.display_name || 'User'}
                    className="h-5 w-5 rounded-full object-cover border border-orange-500/40"
                  />
                  <span>u/{prob.poster?.display_name?.split(' ')[0] || 'Member'}</span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                
                {/* Meta Line: Status + Problem ID + Poster // Tag in Monospace */}
                <div className="flex items-center gap-2.5 font-sans">
                  {getStatusBadge(prob.status)}
                  <span className="font-mono text-[11px] font-medium text-orange-600 dark:text-orange-400">
                    #{prob.id.slice(-4)}
                  </span>
                  <span className="text-[12px] font-normal text-stone-400 dark:text-zinc-500">
                    Posted by <strong className="font-medium text-stone-700 dark:text-zinc-300">{prob.poster?.display_name || 'Anonymous'}</strong> • #{prob.tags[0] || 'DevTools'}
                  </span>
                </div>

                {/* Problem Title & Body */}
                <div className="space-y-1.5">
                  <h3
                    onClick={() => onOpenDetail(prob)}
                    className="text-[17px] font-medium tracking-tight text-stone-900 dark:text-zinc-100 leading-snug transition cursor-pointer hover:text-orange-600 dark:hover:text-orange-400"
                  >
                    {prob.title}
                  </h3>
                  <p className="text-[14px] font-normal leading-relaxed text-stone-600 dark:text-zinc-400 max-w-2xl">
                    {prob.description}
                  </p>
                </div>

                {/* Tried Quote */}
                {prob.attempted_solutions && (
                  <div className={`mt-3 p-3 rounded border-l-2 border-orange-500 text-[13px] font-normal leading-relaxed italic ${
                    isDarkMode ? 'bg-[#0b0b0c] text-zinc-400' : 'bg-stone-100 text-stone-700'
                  }`}>
                    "{prob.attempted_solutions}"
                  </div>
                )}

                {/* Tags List */}
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                  {prob.tags.map((tag) => {
                    const isSelected = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTag(isSelected ? null : tag);
                        }}
                        className={`px-2 py-0.5 rounded border transition cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-orange-600 text-white border-orange-500 font-semibold'
                            : isDarkMode
                              ? 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                              : 'bg-stone-100 text-stone-600 border-stone-200/80 hover:bg-stone-200 hover:text-stone-900'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* Right/Bottom Column: Upvote counter & Pitch CTA */}
              <div className="flex sm:flex-col justify-between items-end gap-4 shrink-0 sm:min-w-[120px]">
                <div className="flex items-center gap-3 font-mono text-xs">
                  <button
                    onClick={() => onUpvoteProblem(prob.id)}
                    disabled={upvotedProblemIds.has(prob.id)}
                    className={`flex items-center gap-1.5 font-bold transition ${
                      upvotedProblemIds.has(prob.id)
                        ? 'text-orange-500 cursor-default'
                        : `cursor-pointer hover:text-orange-500 ${isDarkMode ? 'text-zinc-300' : 'text-stone-700'}`
                    }`}
                    title={upvotedProblemIds.has(prob.id) ? 'Already upvoted' : 'Upvote problem'}
                  >
                    <Flame
                      className={`shrink-0 ${upvotedProblemIds.has(prob.id) ? 'text-orange-500 fill-orange-500' : 'text-amber-500'}`}
                      style={{ width: '22px', height: '27px' }}
                    />
                    <span style={{ fontSize: '15px' }}>{prob.upvotes || 0} UP</span>
                  </button>

                  <button
                    onClick={() => onOpenDetail(prob)}
                    className={`flex items-center gap-1 text-[11px] opacity-60 hover:opacity-100 transition cursor-pointer ${
                      isDarkMode ? 'text-zinc-400' : 'text-stone-600'
                    }`}
                    title="View solutions"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>{prob.solution_count || 0}</span>
                  </button>
                </div>

                <button
                  id={`btn-solve-${prob.id}`}
                  onClick={() => onSolveProblem(prob)}
                  className="font-mono text-xs font-bold uppercase px-4 py-2 rounded bg-orange-600 hover:bg-orange-500 text-white shadow-sm transition cursor-pointer active:scale-95"
                >
                  PITCH
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
