import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Plus, Tag } from 'lucide-react';
import { Problem, User } from '../types';

interface PostProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitProblem: (newProblem: Partial<Problem>) => void;
  currentUser: User;
  isDarkMode?: boolean;
}

export const PostProblemModal: React.FC<PostProblemModalProps> = ({
  isOpen,
  onClose,
  onSubmitProblem,
  currentUser,
  isDarkMode = true,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attemptedSolutions, setAttemptedSolutions] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['DevTools', 'Productivity']);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().replace(/^#/, '');
    if (!tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.length < 10) {
      setError('Title must be at least 10 characters summarizing the core problem.');
      return;
    }
    if (!description.trim() || description.length < 20) {
      setError('Description must be at least 20 characters explaining the workflow pain.');
      return;
    }

    onSubmitProblem({
      title: title.trim(),
      description: description.trim(),
      attempted_solutions: attemptedSolutions.trim() || 'No prior tools attempted.',
      tags: tags.length > 0 ? tags : ['General'],
      status: 'open',
      source: 'organic',
    });

    // Reset and close
    setTitle('');
    setDescription('');
    setAttemptedSolutions('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className={`relative w-full max-w-2xl max-h-[88vh] overflow-y-auto custom-scrollbar rounded-lg border p-6 sm:p-8 shadow-2xl space-y-6 ${
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

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>PROBLINX // POST_PROBLEM</span>
          </div>
          <h2 className="text-[17px] sm:text-xl font-medium tracking-tight text-stone-900 dark:text-zinc-100 leading-snug uppercase">
            POST A PROBLEM WISHLIST ITEM
          </h2>
          <p className={`text-[14px] font-normal leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-stone-600'}`}>
            Be specific about what's broken in your current stack. Solvers will pitch working tools or offer to build a solution.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded bg-red-950/80 border border-red-800/60 p-3 text-xs font-mono text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className={`block text-[12px] font-semibold tracking-wider uppercase mb-1.5 ${
              isDarkMode ? 'text-zinc-400' : 'text-stone-500'
            }`}>
              Problem Title / Summary <span className="text-indigo-500">*</span>
            </label>
            <input
              type="text"
              id="input-problem-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Real-time API Rate Limit Spike Alerting for Next.js"
              className={`w-full rounded border p-3 text-[14px] font-normal focus:border-indigo-500 focus:outline-none ${
                isDarkMode
                  ? 'border-white/10 bg-[#0b0b0c] text-white placeholder-zinc-600'
                  : 'border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400'
              }`}
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-[12px] font-semibold tracking-wider uppercase mb-1.5 ${
              isDarkMode ? 'text-zinc-400' : 'text-stone-500'
            }`}>
              Detailed Workflow Pain <span className="text-indigo-500">*</span>
            </label>
            <textarea
              id="input-problem-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what triggers the problem, who it impacts, and why current workflows fail..."
              className={`w-full rounded border p-3 text-[14px] font-normal focus:border-indigo-500 focus:outline-none resize-none ${
                isDarkMode
                  ? 'border-white/10 bg-[#0b0b0c] text-white placeholder-zinc-600'
                  : 'border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400'
              }`}
            />
          </div>

          {/* What they tried */}
          <div>
            <label className={`block text-[12px] font-semibold tracking-wider uppercase mb-1.5 ${
              isDarkMode ? 'text-zinc-400' : 'text-stone-500'
            }`}>
              What have you tried so far? (Workarounds / Failed Tools)
            </label>
            <textarea
              id="input-problem-attempted"
              rows={2}
              value={attemptedSolutions}
              onChange={(e) => setAttemptedSolutions(e.target.value)}
              placeholder="e.g. Set up manual Datadog alerts ($300/mo) but latency missed microbursts..."
              className={`w-full rounded border p-3 text-[14px] font-normal focus:border-indigo-500 focus:outline-none resize-none ${
                isDarkMode
                  ? 'border-white/10 bg-[#0b0b0c] text-white placeholder-zinc-600'
                  : 'border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400'
              }`}
            />
          </div>

          {/* Tags */}
          <div>
            <label className={`block text-[12px] font-semibold tracking-wider uppercase mb-1.5 ${
              isDarkMode ? 'text-zinc-400' : 'text-stone-500'
            }`}>
              Category Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                placeholder="Type tag (e.g. DevTools) & press Enter"
                className={`flex-1 rounded border px-3 py-2 text-[14px] font-normal focus:border-indigo-500 focus:outline-none ${
                  isDarkMode
                    ? 'border-white/10 bg-[#0b0b0c] text-white placeholder-zinc-600'
                    : 'border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400'
                }`}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className={`rounded px-3 py-2 font-mono text-xs font-bold cursor-pointer uppercase ${
                  isDarkMode
                    ? 'bg-white/10 hover:bg-white/20 text-zinc-200'
                    : 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                }`}
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1 rounded border px-2.5 py-1 text-[11px] font-mono font-medium tracking-wide ${
                    isDarkMode
                      ? 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      : 'bg-stone-100 text-stone-600 border-stone-200/80'
                  }`}
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:opacity-75 ml-1 cursor-pointer font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Form Actions */}
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
              id="btn-submit-problem-form"
              className="rounded bg-indigo-600 hover:bg-indigo-500 px-5 py-2 font-mono text-xs font-bold uppercase text-white shadow-sm cursor-pointer active:scale-95 transition"
            >
              POST_TO_PROBLINX
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
