import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Timer, Star, CheckCircle2, ShieldCheck, Play, AlertCircle, Sparkles } from 'lucide-react';
import { Solution, Review, User } from '../types';

interface TestReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  solution: Solution | null;
  onSubmitReview: (review: Partial<Review>) => void;
  currentUser: User;
  isDarkMode?: boolean;
}

export const TestReviewModal: React.FC<TestReviewModalProps> = ({
  isOpen,
  onClose,
  solution,
  onSubmitReview,
  currentUser,
  isDarkMode = true,
}) => {
  const TEST_DURATION_SECONDS = 60;
  const storageKey = solution ? `solv-grid:timer:${solution.id}` : null;

  const [testSeconds, setTestSeconds] = useState<number>(TEST_DURATION_SECONDS);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [timerComplete, setTimerComplete] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [hasLaunched, setHasLaunched] = useState<boolean>(false);

  // On open (or when the target solution changes), recover any in-progress
  // test from localStorage so a refresh mid-test doesn't reset the clock.
  // We store a start timestamp, not a countdown number, so elapsed time is
  // computed fresh on every load regardless of how long the tab was closed.
  useEffect(() => {
    if (!isOpen || !storageKey) return;

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const { startedAt, skipped } = JSON.parse(saved);
        if (skipped) {
          setHasLaunched(true);
          setTestSeconds(0);
          setTimerActive(false);
          setTimerComplete(true);
          return;
        }
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        const remaining = Math.max(TEST_DURATION_SECONDS - elapsed, 0);
        setHasLaunched(true);
        setTestSeconds(remaining);
        if (remaining <= 0) {
          setTimerActive(false);
          setTimerComplete(true);
        } else {
          setTimerActive(true);
          setTimerComplete(false);
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    } else {
      setHasLaunched(false);
      setTestSeconds(TEST_DURATION_SECONDS);
      setTimerActive(false);
      setTimerComplete(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, storageKey]);

  // Timer tick — always recomputes from the stored start timestamp rather
  // than just decrementing, so background-tab throttling can't drift the
  // displayed time out of sync with real elapsed seconds.
  useEffect(() => {
    if (!timerActive || !storageKey) return;

    const tick = () => {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;
      try {
        const { startedAt } = JSON.parse(saved);
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        const remaining = Math.max(TEST_DURATION_SECONDS - elapsed, 0);
        setTestSeconds(remaining);
        if (remaining <= 0) {
          setTimerActive(false);
          setTimerComplete(true);
        }
      } catch {
        // ignore
      }
    };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timerActive, storageKey]);

  // Warn on tab close/reload/URL-bar navigation while the test timer is
  // actively running — does not (and can't) stop clicks on other links
  // within the app itself; that's handled separately by disabling the
  // close button and this modal already blocking the background via its
  // full-screen backdrop.
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (timerActive) {
        e.preventDefault();
        e.returnValue = ''; // required for Chrome to show the confirmation prompt
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [timerActive]);

  if (!isOpen || !solution) return null;

  const handleLaunchAndStartTimer = () => {
    setHasLaunched(true);
    if (solution.link) {
      window.open(solution.link, '_blank', 'noopener,noreferrer');
    }
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify({ startedAt: Date.now(), skipped: false }));
    }
    setTestSeconds(TEST_DURATION_SECONDS);
    setTimerActive(true);
    setTimerComplete(false);
  };

  const handleSkipTimerDemo = () => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify({ startedAt: Date.now(), skipped: true }));
    }
    setTimerActive(false);
    setTestSeconds(0);
    setTimerComplete(true);
    setHasLaunched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || reviewText.trim().length < 15) {
      setError('Please provide at least 15 characters of honest feedback on what worked or what didn\'t.');
      return;
    }

    const durationLogged = 60 - testSeconds;

    onSubmitReview({
      solution_id: solution.id,
      voter_id: currentUser.id,
      voter_name: currentUser.display_name,
      review_text: reviewText.trim(),
      vote_value: rating,
      test_duration_seconds: durationLogged > 0 ? durationLogged : 60,
    });

    // Reset and close
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
    setReviewText('');
    setRating(5);
    setTimerActive(false);
    setTimerComplete(false);
    setHasLaunched(false);
    setError('');
    onClose();
  };

  const progressPercentage = ((60 - testSeconds) / 60) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className={`relative w-full max-w-xl max-h-[88vh] overflow-y-auto custom-scrollbar rounded-lg border p-6 sm:p-8 shadow-2xl space-y-6 ${
        isDarkMode
          ? 'border-white/10 bg-[#141416] text-white'
          : 'border-stone-200 bg-white text-stone-900 shadow-stone-200'
      }`}>
        
        {/* Close Button — disabled mid-test so the lock can't be casually clicked away */}
        <button
          onClick={timerActive ? undefined : onClose}
          disabled={timerActive}
          title={timerActive ? 'Test in progress — please wait for the timer to finish' : 'Close'}
          className={`absolute top-4 right-4 p-2 rounded transition ${
            timerActive
              ? 'opacity-30 cursor-not-allowed'
              : `cursor-pointer ${isDarkMode
                  ? 'text-zinc-400 hover:text-white hover:bg-white/10'
                  : 'text-stone-400 hover:text-stone-900 hover:bg-stone-100'}`
          }`}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400">
            <Timer className="h-3.5 w-3.5" />
            <span>PROBLINX // 90S_TEST_PROTOCOL</span>
          </div>
          <h2 className="text-[17px] sm:text-xl font-medium tracking-tight text-stone-900 dark:text-zinc-100 leading-snug uppercase">
            TESTING {solution.app_name}
          </h2>
          <p className={`text-[14px] font-normal leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-stone-600'}`}>
            Solvers require authentic feedback. Launch the external app, test for 60-90 seconds, and unlock the review form.
          </p>
        </div>

        {/* Pitch Summary Box */}
        <div className={`rounded border border-l-2 border-l-indigo-500 p-3.5 space-y-1 text-xs font-mono ${
          isDarkMode
            ? 'border-white/10 bg-[#0b0b0c] text-zinc-300'
            : 'border-stone-200 bg-stone-50 text-stone-700'
        }`}>
          <div className="text-[12px] font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">PITCH_SUMMARY:</div>
          <p className="text-[13px] font-normal leading-relaxed italic">"{solution.pitch}"</p>
        </div>

        {/* STEP 1: Launch & Timer state */}
        {!hasLaunched ? (
          <div className={`rounded border p-6 text-center space-y-4 text-xs ${
            isDarkMode
              ? 'border-indigo-500/30 bg-indigo-950/20'
              : 'border-indigo-200 bg-indigo-50/50'
          }`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 mx-auto border border-indigo-500/40">
              <Play className="h-6 w-6 ml-0.5" />
            </div>
            <div className="space-y-1">
              <h3 className={`text-[17px] font-medium tracking-tight uppercase ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                READY TO TEST THIS SOLUTION?
              </h3>
              <p className={`text-[14px] font-normal leading-relaxed max-w-sm mx-auto ${isDarkMode ? 'text-zinc-400' : 'text-stone-600'}`}>
                Clicking launch will open the solver's app link in a new tab and start the 60-second test countdown in this window.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                id="btn-launch-tool-timer"
                onClick={handleLaunchAndStartTimer}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded bg-indigo-600 hover:bg-indigo-500 px-6 py-3 font-mono text-xs font-bold uppercase text-white shadow-lg cursor-pointer active:scale-95 transition"
              >
                <span>LAUNCH APP & START 60S TIMER</span>
                <ExternalLink className="h-4 w-4" />
              </button>

              <button
                onClick={handleSkipTimerDemo}
                className="text-xs underline font-mono cursor-pointer opacity-60 hover:opacity-100"
              >
                [DEMO: SKIP TIMER]
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 font-mono text-xs">
            
            {/* Live Timer Counter */}
            <div className={`rounded border p-4 text-center transition-all ${
              timerComplete
                ? isDarkMode
                  ? 'border-indigo-500/50 bg-indigo-950/30'
                  : 'border-indigo-300 bg-indigo-50'
                : isDarkMode
                  ? 'border-amber-400/40 bg-amber-400/10'
                  : 'border-amber-300 bg-amber-50'
            }`}>
              <div className="flex items-center justify-center gap-2">
                <Timer className={`h-5 w-5 ${
                  timerComplete
                    ? 'text-indigo-400'
                    : 'text-amber-400 animate-pulse'
                }`} />
                <span className={`text-xs font-mono font-bold uppercase ${
                  isDarkMode ? 'text-zinc-300' : 'text-stone-700'
                }`}>
                  {timerComplete ? 'TESTING COMPLETE — REVIEW UNLOCKED' : 'TESTING ACTIVE — RETURN WHEN DONE'}
                </span>
              </div>

              <div className={`mt-2 text-2xl font-mono font-extrabold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                {timerComplete ? (
                  <span className="text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-6 w-6" /> VERIFIED
                  </span>
                ) : (
                  <span>00:{testSeconds < 10 ? `0${testSeconds}` : testSeconds}</span>
                )}
              </div>

              {/* Progress Bar */}
              <div className={`w-full rounded h-1.5 mt-3 overflow-hidden ${
                isDarkMode ? 'bg-zinc-800' : 'bg-stone-200'
              }`}>
                <div
                  className={`h-1.5 transition-all duration-1000 ${
                    timerComplete ? 'bg-indigo-600' : 'bg-amber-400'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {!timerComplete && (
                <button
                  onClick={handleSkipTimerDemo}
                  className="mt-2 text-[10px] text-amber-400 hover:underline font-mono cursor-pointer"
                >
                  FAST_FORWARD_TIMER [DEMO]
                </button>
              )}
            </div>

            {/* STEP 2: Review Input Form */}
            <form onSubmit={handleSubmit} className={`space-y-4 transition-opacity ${timerComplete ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              
              {error && (
                <div className="flex items-center gap-2 rounded bg-red-950/80 border border-red-800/60 p-3 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Rating Stars */}
              <div>
                <label className={`block text-[12px] font-semibold tracking-wider uppercase mb-1.5 ${
                  isDarkMode ? 'text-zinc-400' : 'text-stone-500'
                }`}>
                  RATING & VALUE SCORE
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none transition transform hover:scale-110 cursor-pointer"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          (hoverRating || rating) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : isDarkMode ? 'text-zinc-700' : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-mono font-bold text-amber-400">
                    {rating} / 5 STARS
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className={`block text-[12px] font-semibold tracking-wider uppercase mb-1.5 ${
                  isDarkMode ? 'text-zinc-400' : 'text-stone-500'
                }`}>
                  1-LINE FEEDBACK <span className="text-indigo-500">*</span>
                </label>
                <textarea
                  id="input-review-text"
                  rows={2}
                  disabled={!timerComplete}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="e.g. Tested on M2 Mac. Transcribed 45m call in 1 min. Diarization identified speakers accurately!"
                  className={`w-full rounded border p-3 text-[14px] font-normal focus:border-indigo-500 focus:outline-none resize-none ${
                    isDarkMode
                      ? 'border-white/10 bg-[#0b0b0c] text-white placeholder-zinc-600'
                      : 'border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400'
                  }`}
                />
              </div>

              {/* Submit Button */}
              <div className={`flex items-center justify-between pt-3 border-t ${
                isDarkMode ? 'border-white/10' : 'border-stone-200'
              }`}>
                <div className="text-[11px] font-mono flex items-center gap-1 opacity-60">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                  <span>1 VOTE PER VERIFIED TESTER</span>
                </div>

                <button
                  type="submit"
                  id="btn-submit-review"
                  disabled={!timerComplete}
                  className="rounded bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 px-5 py-2 font-mono text-xs font-bold uppercase text-white cursor-pointer active:scale-95 transition shadow-sm"
                >
                  SUBMIT_REVIEW
                </button>
              </div>

            </form>

          </div>
        )}

      </div>
    </div>
  );
};
