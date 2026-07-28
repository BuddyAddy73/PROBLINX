import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ProblemWishlist } from './components/ProblemWishlist';
import { AppBattleground } from './components/AppBattleground';
import { PostProblemModal } from './components/PostProblemModal';
import { SubmitSolutionModal } from './components/SubmitSolutionModal';
import { TestReviewModal } from './components/TestReviewModal';
import { ProblemDetailModal } from './components/ProblemDetailModal';
import { ProfileModal } from './components/ProfileModal';

import { mockUsers } from './data/mockData';
import { ActiveFeedStream, Problem, Solution, Review, User } from './types';
import { Check, Sparkles, Flame, Swords, ShieldCheck } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuth } from './lib/AuthContext';
import { dbProblemToProblem, dbSolutionToSolution, dbReviewToReview } from './lib/adapters';

export default function App() {
  const { user: authUser, isLoading: isAuthLoading, isAnonymous, signInWithGoogle, signOut, refreshProfile } = useAuth();
  // Navigation stream state
  const [activeStream, setActiveStream] = useState<ActiveFeedStream>('problems');

  // Theme State: Day Mode (false) vs Night Mode (true)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Recent Searches State
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'AI agent',
    'Notion sync',
    'Chrome extension',
    'DevTools',
    'Figma plugin',
  ]);

  const handleAddRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => [
      trimmed,
      ...prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase()),
    ].slice(0, 6));
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
  };

  // Core Data State (now backed by live Supabase, not mock arrays)
  const [problems, setProblems] = useState<Problem[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState<boolean>(true);
  const [feedError, setFeedError] = useState<string | null>(null);

  // Current user, backed by real (anonymous, for now) Supabase auth.
  // Auth is now handled by AuthContext (see main.tsx / lib/AuthContext.tsx),
  // which manages anonymous-vs-Google sessions, profile creation, and
  // sign-in/sign-out. `authUser` is null only for the brief moment before
  // the very first session resolves — fall back to a placeholder display
  // value then so the UI doesn't render with undefined fields.
  const currentUser: User = authUser ?? mockUsers.currentUser;
  const isAuthReady = !isAuthLoading;

  // Which problems the current browser has already upvoted. Persisted to
  // localStorage so a refresh doesn't let someone spam the button again —
  // this is a client-side guard only; see handleUpvoteProblem for the caveat.
  const [upvotedProblemIds, setUpvotedProblemIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('solv-grid:upvoted-problem-ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem('solv-grid:upvoted-problem-ids', JSON.stringify(Array.from(upvotedProblemIds)));
  }, [upvotedProblemIds]);

  // ---- Fetch the full feed from Supabase ----
  const fetchFeed = useCallback(async () => {
    setIsLoadingFeed(true);
    setFeedError(null);
    try {
      const [problemsRes, solutionsRes, reviewsRes] = await Promise.all([
        supabase
          .from('problems')
          .select('*, profiles(*), solutions!solutions_problem_id_fkey(count)')
          .order('created_at', { ascending: false }),
        supabase
          .from('solutions')
          .select('*, profiles(*), problems!solutions_problem_id_fkey(title)')
          .order('created_at', { ascending: false }),
        supabase
          .from('reviews')
          .select('*, profiles(*)')
          .order('created_at', { ascending: false }),
      ]);

      if (problemsRes.error) throw problemsRes.error;
      if (solutionsRes.error) throw solutionsRes.error;
      if (reviewsRes.error) throw reviewsRes.error;

      setProblems((problemsRes.data ?? []).map(dbProblemToProblem));
      setSolutions((solutionsRes.data ?? []).map(dbSolutionToSolution));
      setReviews((reviewsRes.data ?? []).map(dbReviewToReview));
    } catch (err: any) {
      console.error('Failed to load feed:', err);
      setFeedError(err?.message ?? 'Failed to load data from Supabase.');
    } finally {
      setIsLoadingFeed(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthReady) {
      fetchFeed();
    }
  }, [isAuthReady, fetchFeed]);
  const [isPostProblemOpen, setIsPostProblemOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [solvingProblem, setSolvingProblem] = useState<Problem | null>(null);
  const [testingSolution, setTestingSolution] = useState<Solution | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Upvote Problem Handler — optimistic UI update, then real DB write.
  // Client-side guard only: localStorage stops accidental double-clicks and
  // survives refresh, but someone using incognito or clearing storage could
  // still upvote again. The real fix is a `upvotes` junction table in
  // Supabase with a unique(user_id, problem_id) constraint — worth doing
  // before this handles real traffic, flagging so it doesn't get forgotten.
  const handleUpvoteProblem = async (problemId: string) => {
    if (upvotedProblemIds.has(problemId)) {
      return; // already upvoted from this browser — no-op, no toast spam
    }

    const target = problems.find((p) => p.id === problemId);
    const nextCount = (target?.upvotes || 0) + 1;

    // Lock immediately (before the network call resolves) so a rapid
    // double-click can't sneak a second increment through.
    setUpvotedProblemIds((prev) => new Set(prev).add(problemId));

    // Optimistic update first, so the click feels instant
    setProblems((prev) =>
      prev.map((p) => (p.id === problemId ? { ...p, upvotes: nextCount } : p))
    );

    const { error } = await supabase
      .from('problems')
      .update({ upvotes_count: nextCount })
      .eq('id', problemId);

    if (error) {
      console.error('Upvote failed, reverting:', error.message);
      // Revert both the count and the lock on failure — let them try again
      setProblems((prev) =>
        prev.map((p) => (p.id === problemId ? { ...p, upvotes: target?.upvotes || 0 } : p))
      );
      setUpvotedProblemIds((prev) => {
        const next = new Set(prev);
        next.delete(problemId);
        return next;
      });
      showToast('Upvote failed — please try again.');
      return;
    }

    showToast('Upvoted problem wishlist item!');
  };

  // Create New Problem — inserts into Supabase, then refreshes from source of truth
  const handleCreateProblem = async (newProbData: Partial<Problem>) => {
    const { data, error } = await supabase
      .from('problems')
      .insert({
        user_id: currentUser.id,
        title: newProbData.title || 'Untitled Problem',
        overview: newProbData.description || '',
        what_they_tried: newProbData.attempted_solutions || '',
        tags: newProbData.tags || ['DevTools'],
        status: 'OPEN',
        source: 'organic',
        upvotes_count: 1,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to post problem:', error.message);
      showToast('Failed to post problem — please try again.');
      return;
    }

    await fetchFeed(); // re-pull from Supabase so joined poster/solution-count data is correct
    showToast('Successfully posted new problem to Wishlist!');
    return data;
  };

  // Create New Solution Pitch
  const handleCreateSolution = async (newSolData: Partial<Solution>) => {
    if (!solvingProblem) return;

    const { data: newSolution, error: insertError } = await supabase
      .from('solutions')
      .insert({
        problem_id: solvingProblem.id,
        solver_id: currentUser.id,
        app_name: newSolData.app_name || 'New Tool',
        pitch: newSolData.pitch || '',
        external_link: newSolData.link || null,
        estimated_timeline: newSolData.estimated_timeline || null,
        contact_note: newSolData.contact_note || null,
        solution_type: (newSolData.is_existing_tool ?? true) ? 'EXISTING' : 'WOULD_BUILD',
        rating_avg: 0,
        review_count: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to submit solution:', insertError.message);
      showToast('Failed to submit pitch — please try again.');
      return;
    }

    // Flip the problem to CLAIMED (only if it was still OPEN, matches original behavior)
    if (solvingProblem.status === 'open') {
      const { error: statusError } = await supabase
        .from('problems')
        .update({ status: 'CLAIMED' })
        .eq('id', solvingProblem.id);
      if (statusError) console.error('Failed to update problem status:', statusError.message);
    }

    await fetchFeed();
    showToast(`Pitch for "${newSolution.app_name}" added to App Battleground!`);
  };

  // Create New Review
  const handleCreateReview = async (newRevData: Partial<Review>) => {
    if (!testingSolution) return;

    const ratingValue = newRevData.vote_value || 5;

    const { error: reviewError } = await supabase.from('reviews').insert({
      solution_id: testingSolution.id,
      reviewer_id: currentUser.id,
      rating: ratingValue,
      feedback: newRevData.review_text || '',
      test_duration_seconds: newRevData.test_duration_seconds || 60,
    });

    if (reviewError) {
      console.error('Failed to submit review:', reviewError.message);
      showToast('Failed to submit review — please try again.');
      return;
    }

    // Recalculate rating_avg/review_count against the live DB row, not local
    // state, to avoid compounding drift if two people review around the same time.
    // NOTE: this read-then-write is still not race-proof under real concurrent
    // load — a Postgres function/trigger would be the correct long-term fix,
    // fine for a low-traffic pilot for now.
    const { data: currentSolution } = await supabase
      .from('solutions')
      .select('rating_avg, review_count')
      .eq('id', testingSolution.id)
      .single();

    if (currentSolution) {
      const newCount = (currentSolution.review_count || 0) + 1;
      const newAvg =
        ((currentSolution.rating_avg || 0) * (currentSolution.review_count || 0) + ratingValue) /
        newCount;

      const { error: updateError } = await supabase
        .from('solutions')
        .update({ review_count: newCount, rating_avg: parseFloat(newAvg.toFixed(2)) })
        .eq('id', testingSolution.id);

      if (updateError) console.error('Failed to update solution rating:', updateError.message);
    }

    // Move problem to IN_REVIEW, matching original behavior
    const { error: statusError } = await supabase
      .from('problems')
      .update({ status: 'IN_REVIEW' })
      .eq('id', testingSolution.problem_id);
    if (statusError) console.error('Failed to update problem status:', statusError.message);

    await fetchFeed();
    showToast('Verified review submitted to App Battleground!');
  };

  // Open Problem details for a specific solution link
  const handleOpenProblemForSolution = (problemId: string) => {
    const found = problems.find((p) => p.id === problemId);
    if (found) {
      setSelectedProblem(found);
    }
  };

  // Calculate current user's submitted solutions count for Solver Rank
  const currentUserSolutionsCount = solutions.filter(
    (s) => s.solver_id === currentUser.id
  ).length;

  return (
    <div className={`min-h-screen font-sans antialiased selection:bg-slate-700 selection:text-white flex flex-col transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold shadow-2xl animate-bounce ${
          isDarkMode
            ? 'border-white/10 bg-[#121824] text-white ring-1 ring-white/10'
            : 'border-slate-200 bg-white text-slate-900 shadow-slate-200'
        }`}>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
            <Check className="h-4 w-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Top Navigation Bar */}
      <Header
        activeStream={activeStream}
        setActiveStream={setActiveStream}
        currentUser={currentUser}
        currentUserSolutionsCount={currentUserSolutionsCount}
        onOpenPostProblem={() => setIsPostProblemOpen(true)}
        problemsCount={problems.length}
        solutionsCount={solutions.length}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        isAnonymous={isAnonymous}
        onSignInWithGoogle={signInWithGoogle}
        onSignOut={signOut}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Stream 1: Problem Wishlist */}
        {activeStream === 'problems' && (
          <ProblemWishlist
            problems={problems}
            onSolveProblem={(prob) => setSolvingProblem(prob)}
            onOpenDetail={(prob) => setSelectedProblem(prob)}
            onOpenPostProblem={() => setIsPostProblemOpen(true)}
            onUpvoteProblem={handleUpvoteProblem}
            upvotedProblemIds={upvotedProblemIds}
            isDarkMode={isDarkMode}
            recentSearches={recentSearches}
            onAddRecentSearch={handleAddRecentSearch}
            onClearRecentSearches={handleClearRecentSearches}
          />
        )}

        {/* Stream 2: App Battleground */}
        {activeStream === 'battleground' && (
          <AppBattleground
            solutions={solutions}
            onTestAndReview={(sol) => setTestingSolution(sol)}
            onOpenProblemForSolution={handleOpenProblemForSolution}
            isDarkMode={isDarkMode}
            recentSearches={recentSearches}
            onAddRecentSearch={handleAddRecentSearch}
            onClearRecentSearches={handleClearRecentSearches}
          />
        )}

      </main>

      {/* Footer */}
      <footer className={`h-12 border-t px-6 sm:px-8 flex items-center justify-between text-[11px] shrink-0 uppercase tracking-widest font-mono transition ${
        isDarkMode
          ? 'border-[#27272a] bg-[#121215] text-zinc-500'
          : 'border-stone-200 bg-white text-stone-500'
      }`}>
        <div className="flex items-center space-x-6 font-bold">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Grid Status: Operational
          </span>
          <span className="hidden sm:inline">Active Solvers: 1,204</span>
        </div>
        <div>© 2026 SOLV / GRID // V.1.0.4-BETA</div>
      </footer>

      {/* Modals */}
      <PostProblemModal
        isOpen={isPostProblemOpen}
        onClose={() => setIsPostProblemOpen(false)}
        onSubmitProblem={handleCreateProblem}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        onProfileUpdated={refreshProfile}
      />

      <SubmitSolutionModal
        isOpen={!!solvingProblem}
        onClose={() => setSolvingProblem(null)}
        problem={solvingProblem}
        onSubmitSolution={handleCreateSolution}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
      />

      <TestReviewModal
        isOpen={!!testingSolution}
        onClose={() => setTestingSolution(null)}
        solution={testingSolution}
        onSubmitReview={handleCreateReview}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
      />

      <ProblemDetailModal
        isOpen={!!selectedProblem}
        onClose={() => setSelectedProblem(null)}
        problem={selectedProblem}
        solutions={solutions}
        reviews={reviews}
        onSolveProblem={(prob) => setSolvingProblem(prob)}
        onTestAndReview={(sol) => setTestingSolution(sol)}
        isDarkMode={isDarkMode}
      />

    </div>
  );
}
