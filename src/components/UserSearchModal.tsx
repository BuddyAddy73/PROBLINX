import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getTagInfo } from '../utils/tagUtils';
import { UserTag } from '../types';

interface SearchResultUser {
  id: string;
  username: string;
  avatar_url: string | null;
  user_tag: UserTag;
}

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
  isDarkMode: boolean;
}

export const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  isDarkMode,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Autofocus the input the moment the modal opens, and reset state on close
  // so reopening it doesn't show stale results from a previous search.
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Close on Escape, regardless of focus
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const runSearch = useCallback(async (searchTerm: string) => {
    if (searchTerm.trim().length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, user_tag')
      .ilike('username', `%${searchTerm.trim()}%`)
      .limit(15);

    setIsSearching(false);
    if (error) {
      console.error('User search failed:', error.message);
      setResults([]);
      return;
    }
    setResults(data ?? []);
  }, []);

  // Debounce: wait 300ms after the user stops typing before hitting Supabase
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden ${
          isDarkMode ? 'bg-[#0b0b0c] border-white/10' : 'bg-white border-stone-200'
        }`}
      >
        {/* Search input */}
        <div className={`flex items-center gap-3 px-4 py-3 border-b ${isDarkMode ? 'border-white/10' : 'border-stone-200'}`}>
          {isSearching ? (
            <Loader2 className={`h-4 w-4 shrink-0 animate-spin ${isDarkMode ? 'text-zinc-500' : 'text-stone-400'}`} />
          ) : (
            <Search className={`h-4 w-4 shrink-0 ${isDarkMode ? 'text-zinc-500' : 'text-stone-400'}`} />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username..."
            className={`flex-1 bg-transparent outline-none text-sm font-mono ${
              isDarkMode ? 'text-white placeholder-zinc-600' : 'text-stone-900 placeholder-stone-400'
            }`}
          />
          <button
            onClick={onClose}
            className={`p-1 rounded cursor-pointer ${isDarkMode ? 'hover:bg-white/10 text-zinc-500' : 'hover:bg-stone-100 text-stone-400'}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {query.trim().length > 0 && query.trim().length < 2 && (
            <p className={`px-4 py-6 text-center text-xs font-mono ${isDarkMode ? 'text-zinc-600' : 'text-stone-400'}`}>
              Keep typing — at least 2 characters
            </p>
          )}

          {query.trim().length >= 2 && !isSearching && results.length === 0 && (
            <p className={`px-4 py-6 text-center text-xs font-mono ${isDarkMode ? 'text-zinc-600' : 'text-stone-400'}`}>
              No users found matching "{query}"
            </p>
          )}

          {results.map((u) => {
            const tagInfo = u.user_tag ? getTagInfo(u.user_tag) : null;
            return (
              <button
                key={u.id}
                onClick={() => onSelectUser(u.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition cursor-pointer ${
                  isDarkMode ? 'hover:bg-white/5' : 'hover:bg-stone-50'
                }`}
              >
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt={u.username} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {u.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <span className={`text-sm font-medium flex-1 ${isDarkMode ? 'text-zinc-200' : 'text-stone-800'}`}>
                  {u.username}
                </span>
                {tagInfo && (
                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                    isDarkMode ? tagInfo.badgeClassDark : tagInfo.badgeClassLight
                  }`}>
                    {tagInfo.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
