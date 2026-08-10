import React, { useState } from 'react';
import { X, Swords, CheckCircle2, Hammer, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Problem, Solution, User } from '../types';

interface SubmitSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: Problem | null;
  onSubmitSolution: (newSolution: Partial<Solution>) => void;
  currentUser: User;
  isDarkMode?: boolean;
}

export const SubmitSolutionModal: React.FC<SubmitSolutionModalProps> = ({
  isOpen,
  onClose,
  problem,
  onSubmitSolution,
  currentUser,
  isDarkMode = true,
}) => {
  const [appName, setAppName] = useState('');
  const [pitch, setPitch] = useState('');
  const [link, setLink] = useState('');
  const [estimatedTimeline, setEstimatedTimeline] = useState('');
  const [contactNote, setContactNote] = useState('');
  const [isExistingTool, setIsExistingTool] = useState(true);
  const [error, setError] = useState('');

  if (!isOpen || !problem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) {
      setError(isExistingTool ? 'Please provide an App / Tool Name.' : 'Please name your proposed solution.');
      return;
    }
    if (!pitch.trim() || pitch.length < 15) {
      setError('Pitch must be at least 15 characters.');
      return;
    }
    if (pitch.length > 300) {
      setError('Pitch cannot exceed 300 characters.');
      return;
    }
    if (!isExistingTool && !estimatedTimeline) {
      setError('Please select an estimated timeline for your build.');
      return;
    }

    onSubmitSolution({
      problem_id: problem.id,
      problem_title: problem.title,
      app_name: appName.trim(),
      pitch: pitch.trim(),
      link: isExistingTool ? (link.trim() || undefined) : undefined,
      is_existing_tool: isExistingTool,
      estimated_timeline: isExistingTool ? undefined : estimatedTimeline,
      contact_note: isExistingTool ? undefined : (contactNote.trim() || undefined),
      solver_id: currentUser.id,
      solver: currentUser,
      claimed_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      reviews_count: 0,
      avg_rating: 5.0,
    });

    setAppName('');
    setPitch('');
    setLink('');
    setEstimatedTimeline('');
    setContactNote('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className={`relative w-full max-w-xl max-h-[88vh] overflow-y-auto custom-scrollbar rounded-lg border p-6 sm:p-8 shadow-2xl space-y-6 ${
        isDarkMode
          ? 'border-white/10 bg-[#141416] text-white'
          : 'border-stone-200 bg-white text-stone-900 shadow-stone-200'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded transition cursor-pointer ${
            isDarkMode
              ? 'text-zinc-400 hover:text-white hover:bg-white/10'
              : 'text-stone-400 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-orange-600 dark:text-orange-400">
            <Swords className="h-3.5 w-3.5" />
            <span>PROBLINX // SUBMIT_PITCH</span>
          </div>
          <h2 className="text-[17px] sm:text-xl font-medium tracking-tight text-stone-900 dark:text-zinc-100 leading-snug uppercase">
            PITCH SOLUTION FOR PROBLEM
          </h2>
          <p className={`text-[13px] font-normal leading-relaxed line-clamp-2 italic p-2.5 rounded border border-l-2 border-l-orange-500 ${
            isDarkMode
              ? 'bg-[#0b0b0c] border-white/10 text-zinc-300'
              : 'bg-stone-50 border-stone-200 text-stone-600'
          }`}>
            "{problem.title}"
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded bg-red-950/80 border border-red-800/60 p-3 text-xs font-mono text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Tool Type Toggle */}
          <div>
            <label className={`block text-[12px] font-semibold tracking-wider uppercase mb-1.5 ${
              isDarkMode ? 'text-zinc-400' : 'text-stone-500'
            }`}>
              SOLUTION_TYPE
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsExistingTool(true)}
                className={`flex items-center justify-center gap-2 rounded p-3 font-mono text-xs font-bold border transition cursor-pointer ${
                  isExistingTool
                    ? isDarkMode
                      ? 'bg-orange-950/60 border-orange-500 text-orange-300'
                      : 'bg-orange-50 border-orange-400 text-orange-800'
                    : isDarkMode
                      ? 'bg-[#0b0b0c] border-white/10 text-zinc-400 hover:text-white'
                      : 'bg-stone-100 border-stone-200 text-stone-600'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>EXISTING_TOOL</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExistingTool(false)}
                className={`flex items-center justify-center gap-2 rounded p-3 font-mono text-xs font-bold border transition cursor-pointer ${
                  !isExistingTool
                    ? isDarkMode
                      ? 'bg-amber-400/10 border-amber-400 text-amber-400'
                      : 'bg-amber-50 border-amber-500 text-amber-900'
                    : isDarkMode
                      ? 'bg-[#0b0b0c] border-white/10 text-zinc-400 hover:text-white'
                      : 'bg-stone-100 border-stone-200 text-stone-600'
                }`}
              >
                <Hammer className="h-4 w-4" />
                <span>WOULD_BUILD</span>
              </button>
            </div>
          </div>

          {/* App / Tool Name */}
          <div>
            <label className={`block text-[12px] font-semibold tracking-wider uppercase mb-1.5 ${
              isDarkMode ? 'text-zinc-400' : 'text-stone-500'
            }`}>
              {isExistingTool ? 'App / Tool Name' : 'Proposed Solution Name'} <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              id="input-solution-app-name"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder={isExistingTool ? 'e.g. EdgeGuard Alert or WhisperDesk' : 'e.g. "Auto-Archive Bot" (working title is fine)'}
              className={`w-full rounded border p-3 text-[14px] font-normal focus:border-orange-500 focus:outline-none ${
                isDarkMode
                  ? 'border-white/10 bg-[#0b0b0c] text-white placeholder-zinc-600'
                  : 'border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400'
              }`}
            />
          </div>

          {/* Pitch (Max 300 Chars) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-[12px] font-semibold tracking-wider uppercase ${
                isDarkMode ? 'text-zinc-400' : 'text-stone-500'
              }`}>
                {isExistingTool ? 'Short Pitch (Max 300 chars)' : 'Proposed Solution Concept (Max 300 chars)'} <span className="text-orange-500">*</span>
              </label>
              <span className={`text-[11px] font-mono ${pitch.length > 300 ? 'text-red-500 font-bold' : 'opacity-60'}`}>
                {pitch.length}/300
              </span>
            </div>
            <textarea
              id="input-solution-pitch"
              rows={3}
              maxLength={300}
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder={
                isExistingTool
                  ? 'Concise 2-sentence value proposition. Force clarity: how exactly does your tool solve this specific pain point?'
                  : 'How would you approach building this? What would the solution actually do?'
              }
              className={`w-full rounded border p-3 text-[14px] font-normal focus:border-orange-500 focus:outline-none resize-none ${
                isDarkMode
                  ? 'border-white/10 bg-[#0b0b0c] text-white placeholder-zinc-600'
                  : 'border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400'
              }`}
            />
          </div>

          {/* Branch: EXISTING gets a link field. WOULD_BUILD gets timeline + optional contact note instead. */}
          {isExistingTool ? (
            <div>
              <label className={`block text-[12px] font-semibold tracking-wider uppercase mb-1.5 ${
                isDarkMode ? 'text-zinc-400' : 'text-stone-500'
              }`}>
                External Link / Prototype URL
              </label>
              <div className="relative">
                <LinkIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                  isDarkMode ? 'text-zinc-500' : 'text-stone-400'
                }`} />
                <input
                  type="url"
                  id="input-solution-link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://yourtool.com or demo link"
                  className={`w-full rounded border py-2.5 pl-9 pr-3 text-[14px] font-normal focus:border-orange-500 focus:outline-none ${
                    isDarkMode
                      ? 'border-white/10 bg-[#0b0b0c] text-white placeholder-zinc-600'
                      : 'border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400'
                  }`}
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className={`block text-[12px] font-semibold tracking-wider uppercase mb-1.5 ${
                  isDarkMode ? 'text-zinc-400' : 'text-stone-500'
                }`}>
                  Estimated Timeline <span className="text-orange-500">*</span>
                </label>
                <select
                  id="input-solution-timeline"
                  value={estimatedTimeline}
                  onChange={(e) => setEstimatedTimeline(e.target.value)}
                  className={`w-full rounded border p-3 text-[14px] font-normal focus:border-orange-500 focus:outline-none cursor-pointer ${
                    isDarkMode
                      ? 'border-white/10 bg-[#0b0b0c] text-white'
                      : 'border-stone-200 bg-stone-50 text-stone-900'
                  }`}
                >
                  <option value="" disabled>Select a realistic timeframe...</option>
                  <option value="A few days">A few days</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="2-4 weeks">2-4 weeks</option>
                  <option value="1-2 months">1-2 months</option>
                  <option value="3+ months">3+ months</option>
                </select>
              </div>

              <div>
                <label className={`block text-[12px] font-semibold tracking-wider uppercase mb-1.5 ${
                  isDarkMode ? 'text-zinc-400' : 'text-stone-500'
                }`}>
                  Contact Note (optional)
                </label>
                <input
                  type="text"
                  id="input-solution-contact-note"
                  value={contactNote}
                  onChange={(e) => setContactNote(e.target.value)}
                  placeholder="How should interested posters reach you? e.g. a handle, Discord, etc."
                  maxLength={140}
                  className={`w-full rounded border p-3 text-[14px] font-normal focus:border-orange-500 focus:outline-none ${
                    isDarkMode
                      ? 'border-white/10 bg-[#0b0b0c] text-white placeholder-zinc-600'
                      : 'border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400'
                  }`}
                />
                <p className={`mt-1 text-[11px] ${isDarkMode ? 'text-zinc-500' : 'text-stone-400'}`}>
                  Your name and profile are already visible to posters — this is optional, only if you want to share another way to reach you.
                </p>
              </div>
            </>
          )}

          {/* Submit CTA */}
          <div className={`flex items-center justify-end gap-3 pt-4 border-t ${
            isDarkMode ? 'border-white/10' : 'border-stone-200'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`rounded border px-4 py-2 font-mono text-xs font-bold uppercase cursor-pointer ${
                isDarkMode
                  ? 'border-zinc-700 bg-transparent text-zinc-300 hover:bg-white/5'
                  : 'border-zinc-300 bg-transparent text-zinc-700 hover:bg-stone-100'
              }`}
            >
              CANCEL
            </button>
            <button
              type="submit"
              id="btn-submit-solution-form"
              className="rounded bg-orange-600 hover:bg-orange-500 px-5 py-2 font-mono text-xs font-bold uppercase text-white shadow-sm cursor-pointer active:scale-95 transition"
            >
              SUBMIT_PITCH
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
