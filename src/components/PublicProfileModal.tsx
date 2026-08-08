import React, { useState, useEffect } from 'react';
import { X, Shield, FileText, Hammer, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getTagInfo } from '../utils/tagUtils';
import { UserTag } from '../types';

interface PublicProfileData {
  id: string;
  username: string;
  avatar_url: string | null;
  user_tag: UserTag;
  created_at: string;
}

interface PublicProblem {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface PublicSolution {
  id: string;
  app_name: string;
  pitch: string;
  solution_type: string;
  rating_avg: number;
  review_count: number;
  created_at: string;
}

interface PublicProfileModalProps {
  userId: string | null;
  onClose: () => void;
  isDarkMode: boolean;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({ userId, onClose, isDarkMode }) => {
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [problems, setProblems] = useState<PublicProblem[]>([]);
  const [solutions, setSolutions] = useState<PublicSolution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<'problems' | 'solutions'>('problems');

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function loadProfileData() {
      setIsLoading(true);
      const [profileRes, problemsRes, solutionsRes] = await Promise.all([
        supabase.from('profiles').select('id, username, avatar_url, user_tag, created_at').eq('id', userId).single(),
        supabase
          .from('problems')
          .select('id, title, status, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('solutions')
          .select('id, app_name, pitch, solution_type, rating_avg, review_count, created_at')
          .eq('solver_id', userId)
          .order('created_at', { ascending: false }),
      ]);

      if (cancelled) return;

      if (profileRes.error) {
        console.error('Failed to load public profile:', profileRes.error.message);
      } else {
        setProfile(profileRes.data);
      }
      setProblems(problemsRes.data ?? []);
      setSolutions(solutionsRes.data ?? []);
      setIsLoading(false);
    }

    loadProfileData();
    return () => { cancelled = true; };
  }, [userId]);

  if (!userId) return null;

  const tagInfo = profile?.user_tag ? getTagInfo(profile.user_tag) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg rounded-xl border p-6 ${
          isDarkMode ? 'bg-[#0b0b0c] border-white/10 text-zinc-200' : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded transition cursor-pointer ${
            isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-stone-400 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <X className="h-5 w-5" />
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className={`h-6 w-6 animate-spin ${isDarkMode ? 'text-zinc-500' : 'text-stone-400'}`} />
          </div>
        ) : !profile ? (
          <p className="text-center py-16 text-sm">Couldn't load this profile.</p>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} className="h-14 w-14 rounded-full object-cover ring-2 ring-indigo-500/40" />
              ) : (
                <div className="h-14 w-14 rounded-full bg-indigo-600 flex items-center justify-center text-lg font-bold text-white">
                  {profile.username?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <div>
                <div className="text-lg font-semibold leading-tight">{profile.username}</div>
                <div className={`text-xs font-mono ${isDarkMode ? 'text-zinc-500' : 'text-stone-400'}`}>
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {tagInfo && (
              <div className="mb-6">
                <span
                  title={tagInfo.description}
                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase border ${
                    isDarkMode ? tagInfo.badgeClassDark : tagInfo.badgeClassLight
                  }`}
                >
                  <Shield className="h-2.5 w-2.5" />
                  <span>{tagInfo.label}</span>
                </span>
              </div>
            )}

            {/* Tabs */}
            <div className={`flex gap-1 mb-3 border-b ${isDarkMode ? 'border-white/10' : 'border-stone-200'}`}>
              <button
                onClick={() => setTab('problems')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold uppercase border-b-2 transition cursor-pointer ${
                  tab === 'problems'
                    ? 'border-indigo-500 text-indigo-500'
                    : `border-transparent ${isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-stone-400 hover:text-stone-600'}`
                }`}
              >
                <FileText className="h-3 w-3" /> Problems ({problems.length})
              </button>
              <button
                onClick={() => setTab('solutions')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold uppercase border-b-2 transition cursor-pointer ${
                  tab === 'solutions'
                    ? 'border-indigo-500 text-indigo-500'
                    : `border-transparent ${isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-stone-400 hover:text-stone-600'}`
                }`}
              >
                <Hammer className="h-3 w-3" /> Solutions ({solutions.length})
              </button>
            </div>

            {/* Tab content */}
            <div className="max-h-[40vh] overflow-y-auto space-y-2">
              {tab === 'problems' && (
                problems.length === 0 ? (
                  <p className={`text-xs font-mono py-6 text-center ${isDarkMode ? 'text-zinc-600' : 'text-stone-400'}`}>
                    No problems posted yet.
                  </p>
                ) : (
                  problems.map((p) => (
                    <div key={p.id} className={`rounded-md border p-3 ${isDarkMode ? 'border-white/10 bg-[#141416]' : 'border-stone-200 bg-stone-50'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{p.title}</span>
                        <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                          isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-stone-200 text-stone-600'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))
                )
              )}

              {tab === 'solutions' && (
                solutions.length === 0 ? (
                  <p className={`text-xs font-mono py-6 text-center ${isDarkMode ? 'text-zinc-600' : 'text-stone-400'}`}>
                    No solutions pitched yet.
                  </p>
                ) : (
                  solutions.map((s) => (
                    <div key={s.id} className={`rounded-md border p-3 ${isDarkMode ? 'border-white/10 bg-[#141416]' : 'border-stone-200 bg-stone-50'}`}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-medium">{s.app_name}</span>
                        <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                          isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-stone-200 text-stone-600'
                        }`}>
                          {s.solution_type === 'EXISTING' ? 'Existing' : 'Would Build'}
                        </span>
                      </div>
                      <p className={`text-xs line-clamp-2 ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>{s.pitch}</p>
                      {s.review_count > 0 && (
                        <p className={`text-[10px] font-mono mt-1 ${isDarkMode ? 'text-zinc-500' : 'text-stone-400'}`}>
                          ★ {s.rating_avg.toFixed(1)} ({s.review_count} review{s.review_count !== 1 ? 's' : ''})
                        </p>
                      )}
                    </div>
                  ))
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
