import React from 'react';
import { X, Flame, CheckCircle2, Clock, Lightbulb, MessageSquare, ArrowUpRight, Plus, ExternalLink, Star, ShieldCheck, User, Shield } from 'lucide-react';
import { Problem, Solution, Review } from '../types';
import { calculateSolverRank } from '../utils/rankUtils';

interface ProblemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: Problem | null;
  solutions: Solution[];
  reviews: Review[];
  onSolveProblem: (problem: Problem) => void;
  onTestAndReview: (solution: Solution) => void;
  onSelectWinningSolution?: (problemId: string, solutionId: string) => void;
  isDarkMode?: boolean;
}

export const ProblemDetailModal: React.FC<ProblemDetailModalProps> = ({
  isOpen,
  onClose,
  problem,
  solutions,
  reviews,
  onSolveProblem,
  onTestAndReview,
  onSelectWinningSolution,
  isDarkMode = true,
}) => {
  if (!isOpen || !problem) return null;

  const problemSolutions = solutions.filter((s) => s.problem_id === problem.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className={`relative w-full max-w-3xl max-h-[88vh] overflow-y-auto custom-scrollbar my-8 rounded-lg border p-6 sm:p-8 shadow-2xl space-y-6 ${
        isDarkMode
          ? 'border-white/10 bg-[#141416] text-white'
          : 'border-stone-200 bg-white text-stone-900 shadow-stone-200'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded transition cursor-pointer z-10 ${
            isDarkMode
              ? 'text-zinc-400 hover:text-white hover:bg-white/10'
              : 'text-stone-400 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Status Timeline */}
        <div className={`space-y-3 border-b pb-4 ${
          isDarkMode ? 'border-white/10' : 'border-stone-200'
        }`}>
          <div className="flex items-center justify-between gap-2 pr-8 font-mono text-xs">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">SOLV / GRID // PROBLEM_DETAIL #{problem.id.slice(-4)}</span>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium tracking-wide uppercase ${
                problem.status === 'open' ? (isDarkMode ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/50' : 'bg-indigo-50 text-indigo-700 border border-indigo-200') :
                problem.status === 'claimed' ? (isDarkMode ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50' : 'bg-amber-50 text-amber-800 border border-amber-200') :
                problem.status === 'in_review' ? (isDarkMode ? 'bg-slate-800/80 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200') :
                'bg-purple-950/60 text-purple-300 border border-purple-800/50'
              }`}>
                {problem.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <h2 className="text-[17px] font-medium tracking-tight text-stone-900 dark:text-zinc-100 leading-snug">
            {problem.title}
          </h2>

          <div className="flex items-center gap-3 text-[12px] font-normal text-stone-400 dark:text-zinc-500">
            <div className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-indigo-500" />
              <span>Posted by <strong className="font-medium text-stone-700 dark:text-zinc-300">{problem.poster?.display_name || 'Member'}</strong></span>
            </div>
            <span>•</span>
            <span>{new Date(problem.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Problem Description */}
        <div className="space-y-4">
          <div>
            <h3 className={`text-[12px] font-semibold tracking-wider uppercase mb-1.5 ${
              isDarkMode ? 'text-zinc-500' : 'text-stone-500'
            }`}>
              OVERVIEW
            </h3>
            <p className={`text-[14px] font-normal leading-relaxed rounded p-4 border ${
              isDarkMode
                ? 'bg-[#0b0b0c] border-white/10 text-zinc-200'
                : 'bg-stone-50 border-stone-200 text-stone-800'
            }`}>
              {problem.description}
            </p>
          </div>

          {/* What They Tried */}
          {problem.attempted_solutions && (
            <div className={`rounded border-l-2 border-l-indigo-500 border-white/10 p-3.5 space-y-1 ${
              isDarkMode ? 'bg-[#0b0b0c]' : 'bg-stone-50'
            }`}>
              <p className="text-[12px] font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
                ATTEMPTED_SOLUTIONS:
              </p>
              <p className={`text-[13px] font-normal leading-relaxed italic ${
                isDarkMode ? 'text-zinc-300' : 'text-stone-700'
              }`}>
                "{problem.attempted_solutions}"
              </p>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {problem.tags.map((tag) => (
              <span key={tag} className={`rounded px-2.5 py-1 text-[11px] font-mono font-medium tracking-wide border ${
                isDarkMode
                  ? 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  : 'bg-stone-100 text-stone-600 border-stone-200/80'
              }`}>
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Thread Section for Pitched Solutions & Discussion */}
        <div className={`space-y-5 pt-5 border-t ${
          isDarkMode ? 'border-white/10' : 'border-stone-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-500" />
              <h3 className="text-[12px] font-semibold tracking-wider text-stone-500 dark:text-zinc-500 uppercase">
                PITCHED SOLUTIONS ({problemSolutions.length})
              </h3>
            </div>

            <button
              onClick={() => onSolveProblem(problem)}
              className="flex items-center gap-1.5 rounded bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 font-mono text-xs font-bold uppercase text-white shadow-md transition cursor-pointer active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>PITCH_ALTERNATIVE</span>
            </button>
          </div>

          {problemSolutions.length === 0 ? (
            <div className={`rounded border border-dashed p-8 text-center space-y-2 font-mono ${
              isDarkMode
                ? 'border-white/10 bg-[#0b0b0c] text-zinc-400'
                : 'border-stone-300 bg-stone-50 text-stone-500'
            }`}>
              <p className="text-xs">No solutions or pitches posted yet in this thread.</p>
              <button
                onClick={() => onSolveProblem(problem)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer uppercase"
              >
                BE THE FIRST SOLVER TO CLAIM & PITCH!
              </button>
            </div>
          ) : (
            <div className={`relative pl-3 space-y-4 border-l-2 ${
              isDarkMode ? 'border-white/10' : 'border-stone-200'
            }`}>
              {problemSolutions.map((sol) => (
                <div
                  key={sol.id}
                  className="relative pl-4 space-y-3 font-mono text-xs"
                >
                  {/* Thread Node Connector Line Marker */}
                  <div className={`absolute -left-[17px] top-3 h-3 w-3 rounded-full border-2 border-indigo-500 ${
                    isDarkMode ? 'bg-[#0b0b0c]' : 'bg-white'
                  }`} />

                  <div className={`rounded border p-4 space-y-3 transition shadow-md ${
                    isDarkMode
                      ? 'border-white/10 bg-[#0b0b0c] hover:border-indigo-500/40'
                      : 'border-stone-200 bg-white hover:border-indigo-300'
                  }`}>
                    
                    {/* Thread Item Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={sol.solver?.avatar_url || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'}
                          alt={sol.solver?.display_name || 'Solver'}
                          className={`h-7 w-7 rounded-full object-cover border ${
                            isDarkMode ? 'border-white/10' : 'border-stone-200'
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[17px] font-medium tracking-tight text-stone-900 dark:text-zinc-100 leading-snug">{sol.app_name}</span>
                            <span className="text-[11px] font-medium tracking-wide text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.2 rounded uppercase">
                              SOLVER
                            </span>
                            <span className={`text-[11px] font-mono font-medium tracking-wide px-2 py-0.2 rounded border uppercase ${
                              sol.is_existing_tool
                                ? isDarkMode ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/50' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : isDarkMode ? 'bg-amber-950/60 text-amber-300 border-amber-800/50' : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {sol.is_existing_tool ? 'EXISTING_TOOL' : 'WOULD_BUILD'}
                            </span>
                          </div>
                          <div className={`text-[12px] font-normal flex items-center gap-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
                            <span>Posted by <strong className="text-indigo-600 dark:text-indigo-400 font-medium">{sol.solver?.display_name}</strong></span>
                            {(() => {
                              const count = solutions.filter((s) => s.solver_id === sol.solver_id).length;
                              const r = calculateSolverRank(count);
                              return (
                                <span className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-medium tracking-wide px-1.5 py-0.2 rounded border uppercase ${
                                  isDarkMode ? r.badgeClassDark : r.badgeClassLight
                                }`}>
                                  <Shield className="h-2.5 w-2.5" />
                                  {r.rank}
                                </span>
                              );
                            })()}
                            <span>• {new Date(sol.submitted_at || Date.now()).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Rating pill */}
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded font-mono">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span>{sol.avg_rating.toFixed(1)}</span>
                        <span className="opacity-60">({sol.reviews_count})</span>
                      </div>
                    </div>

                    {/* Pitch Content */}
                    <div className={`rounded border-l-2 border-l-indigo-500 border-white/10 p-3 space-y-1 ${
                      isDarkMode ? 'bg-[#141416]' : 'bg-stone-50'
                    }`}>
                      <p className={`text-[14px] font-normal leading-relaxed italic ${
                        isDarkMode ? 'text-zinc-200' : 'text-stone-800'
                      }`}>
                        "{sol.pitch}"
                      </p>
                    </div>

                    {/* Inline Vote & Action Controls */}
                    <div className={`flex items-center justify-between text-xs pt-1 border-t ${
                      isDarkMode ? 'border-white/10' : 'border-stone-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        {/* Vote Pill */}
                        <div className={`flex items-center rounded border px-2 py-1 gap-1.5 text-xs font-mono ${
                          isDarkMode
                            ? 'border-white/10 bg-[#141416] text-zinc-300'
                            : 'border-stone-200 bg-stone-100 text-stone-700'
                        }`}>
                          <button className="hover:text-indigo-500 transition cursor-pointer font-bold">▲</button>
                          <span className="font-bold">{sol.reviews_count * 3 + 1}</span>
                          <button className="hover:text-red-500 transition cursor-pointer font-bold">▼</button>
                        </div>

                        <button
                          onClick={() => { onClose(); onTestAndReview(sol); }}
                          className="flex items-center gap-1 text-xs transition cursor-pointer font-bold uppercase opacity-80 hover:opacity-100 hover:text-indigo-500"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
                          <span>REPLY / REVIEW</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {sol.link && (
                          <a
                            href={sol.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 font-mono hover:underline flex items-center gap-1 text-xs font-bold"
                          >
                            <span>DEMO_URL</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}

                        <button
                          onClick={() => { onClose(); onTestAndReview(sol); }}
                          className="rounded bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 font-mono text-xs font-bold uppercase text-white transition cursor-pointer active:scale-95 shadow-sm"
                        >
                          TEST & REVIEW
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
