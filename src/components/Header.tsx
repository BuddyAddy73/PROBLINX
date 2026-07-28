import React, { useState, useRef, useEffect } from 'react';
import { Flame, Swords, Plus, Sparkles, Sun, Moon, Shield, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { ActiveFeedStream, User } from '../types';
import { calculateSolverRank } from '../utils/rankUtils';

interface HeaderProps {
  activeStream: ActiveFeedStream;
  setActiveStream: (stream: ActiveFeedStream) => void;
  currentUser: User;
  currentUserSolutionsCount?: number;
  onOpenPostProblem: () => void;
  problemsCount: number;
  solutionsCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isAnonymous: boolean;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeStream,
  setActiveStream,
  currentUser,
  currentUserSolutionsCount = 0,
  onOpenPostProblem,
  problemsCount,
  solutionsCount,
  isDarkMode,
  onToggleTheme,
  isAnonymous,
  onSignInWithGoogle,
  onSignOut,
  onOpenProfile,
}) => {
  const solverRank = calculateSolverRank(currentUserSolutionsCount);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown on outside click
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header className={`sticky top-0 z-40 w-full border-b transition-colors duration-200 ${
      isDarkMode
        ? 'border-white/10 bg-[#0b0b0c]/90 text-white backdrop-blur-md'
        : 'border-stone-200 bg-white/90 text-stone-900 backdrop-blur-md shadow-xs'
    }`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand / Logo + System Sub */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-md font-mono font-bold text-xs transition ${
              isDarkMode
                ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400'
                : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
            }`}>
              SG
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight leading-none">
                SOLV<span className="text-indigo-600 dark:text-indigo-400">/</span>GRID
              </span>
              <span className="font-mono text-[10px] tracking-wider text-stone-400 dark:text-zinc-500 uppercase mt-0.5">
                MATCHMAKING_SYS
              </span>
            </div>
          </div>
        </div>

        {/* Center: Dual-Stream Nav Cluster */}
        <div className="flex items-center justify-center">
          <div className={`inline-flex rounded-lg p-1 border font-mono text-xs ${
            isDarkMode
              ? 'border-white/10 bg-[#141416]'
              : 'border-stone-200 bg-stone-100'
          }`}>
            <button
              id="toggle-problem-wishlist"
              onClick={() => setActiveStream('problems')}
              style={{ height: '40px', width: '200px' }}
              className={`flex items-center justify-center gap-1.5 rounded-md px-3 sm:px-4 py-1.5 font-semibold transition-all duration-200 cursor-pointer ${
                activeStream === 'problems'
                  ? isDarkMode
                    ? 'bg-indigo-600 text-white font-extrabold shadow-sm'
                    : 'bg-indigo-600 text-white font-bold'
                  : isDarkMode
                    ? 'text-zinc-400 hover:text-white hover:bg-white/5'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Flame className="w-[19px] h-[19px]" style={{ width: '19px', height: '19px', fontSize: '13px', lineHeight: '18px' }} />
              <span style={{ fontSize: '15px' }}>WISHLIST</span>
              <span className={`ml-0.5 rounded px-1.5 py-0.2 text-[10px] ${
                activeStream === 'problems'
                  ? 'bg-white/20 text-white'
                  : isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-stone-200 text-stone-700'
              }`}>
                [{problemsCount}]
              </span>
            </button>

            <button
              id="toggle-app-battleground"
              onClick={() => setActiveStream('battleground')}
              style={{ height: '40px', width: '200px' }}
              className={`flex items-center justify-center gap-1.5 rounded-md px-3 sm:px-4 py-1.5 font-semibold transition-all duration-200 cursor-pointer ${
                activeStream === 'battleground'
                  ? isDarkMode
                    ? 'bg-indigo-600 text-white font-extrabold shadow-sm'
                    : 'bg-indigo-600 text-white font-bold'
                  : isDarkMode
                    ? 'text-zinc-400 hover:text-white hover:bg-white/5'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Swords className="w-[19px] h-[19px]" style={{ width: '19px', height: '19px' }} />
              <span style={{ fontSize: '15px' }}>BATTLEGROUND</span>
              <span className={`ml-0.5 rounded px-1.5 py-0.2 text-[10px] ${
                activeStream === 'battleground'
                  ? 'bg-white/20 text-white'
                  : isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-stone-200 text-stone-700'
              }`}>
                [{solutionsCount}]
              </span>
            </button>
          </div>
        </div>

        {/* Right: Theme Toggle + Profile Chip + CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label="Toggle Light and Dark Mode"
            title={isDarkMode ? "Switch to Day Mode" : "Switch to Night Mode"}
            style={{ textAlign: 'center' }}
            className={`flex h-9 w-9 items-center justify-center rounded-md border transition cursor-pointer active:scale-95 ${
              isDarkMode
                ? 'border-white/10 bg-[#141416] text-amber-400 hover:bg-white/10'
                : 'border-stone-200 bg-stone-100 text-slate-700 hover:bg-stone-200'
            }`}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Auth: Sign-In Button (anonymous) vs. User Pill + Dropdown (authenticated) */}
          {isAnonymous ? (
            <button
              onClick={onSignInWithGoogle}
              className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-mono font-semibold transition cursor-pointer active:scale-95 ${
                isDarkMode
                  ? 'border-white/10 bg-[#141416] text-zinc-200 hover:bg-white/10'
                  : 'border-stone-200 bg-white text-stone-800 hover:bg-stone-50 shadow-xs'
              }`}
            >
              {/* Google "G" mark, inline SVG so no external asset dependency */}
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.89c2.27-2.09 3.58-5.17 3.58-8.84z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.89-3.02c-1.08.72-2.45 1.15-4.04 1.15-3.1 0-5.73-2.1-6.67-4.92H1.3v3.09C3.27 21.3 7.31 24 12 24z"/>
                <path fill="#FBBC05" d="M5.33 14.31A7.2 7.2 0 0 1 4.96 12c0-.8.14-1.58.37-2.31V6.6H1.3A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.3 5.4l4.03-3.09z"/>
                <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.6 4.6 1.8l3.45-3.45C17.94 1.19 15.24 0 12 0 7.31 0 3.27 2.7 1.3 6.6l4.03 3.09C6.27 6.87 8.9 4.77 12 4.77z"/>
              </svg>
              <span>Sign In</span>
            </button>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen((v) => !v)}
                className={`hidden lg:flex items-center gap-2 rounded-md border px-2.5 py-1 transition cursor-pointer ${
                  isDarkMode
                    ? 'border-white/10 bg-[#141416] hover:bg-white/5'
                    : 'border-stone-200 bg-stone-100 hover:bg-stone-200/60'
                }`}
              >
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.display_name}
                    className="h-5 w-5 rounded-full object-cover ring-1 ring-indigo-500/40"
                  />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center text-[9px] font-bold text-white">
                    {currentUser.display_name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <span className={`text-xs font-mono font-medium ${isDarkMode ? 'text-zinc-200' : 'text-stone-800'}`}>
                  {currentUser.display_name}
                </span>
                <span
                  title={`${currentUserSolutionsCount} solutions submitted`}
                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase border transition ${
                    isDarkMode ? solverRank.badgeClassDark : solverRank.badgeClassLight
                  }`}
                >
                  <Shield className="h-2.5 w-2.5" />
                  <span>{solverRank.rank}</span>
                </span>
                <ChevronDown className={`h-3 w-3 transition-transform ${isMenuOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-zinc-500' : 'text-stone-400'}`} />
              </button>

              {isMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-md border shadow-lg py-1 z-50 ${
                    isDarkMode
                      ? 'border-white/10 bg-[#141416] text-zinc-200'
                      : 'border-stone-200 bg-white text-stone-800'
                  }`}
                >
                  <button
                    onClick={() => { setIsMenuOpen(false); onOpenProfile(); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-left transition cursor-pointer ${
                      isDarkMode ? 'hover:bg-white/5' : 'hover:bg-stone-50'
                    }`}
                  >
                    <UserIcon className="h-3.5 w-3.5" />
                    My Profile
                  </button>
                  <div className={`my-1 border-t ${isDarkMode ? 'border-white/10' : 'border-stone-200'}`} />
                  <button
                    onClick={() => { setIsMenuOpen(false); onSignOut(); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-left transition cursor-pointer text-red-400 ${
                      isDarkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                    }`}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Post a Problem CTA */}
          <button
            id="btn-post-problem-header"
            onClick={onOpenPostProblem}
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 font-mono text-xs font-bold uppercase text-white shadow-md shadow-indigo-600/20 transition cursor-pointer active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ POST NEW PAIN</span>
          </button>
        </div>

      </div>
    </header>
  );
};
