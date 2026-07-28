// Maps between Supabase's live column names (set by the schema Gemini already
// ran) and the frontend's existing TypeScript shapes in `types.ts`. Keeping
// this mapping in one place means none of the existing components need to
// change, even though the DB and frontend disagree on field names.

import { User, Problem, Solution, Review } from '../types';

// ---- DB row shapes (mirrors what's actually in Postgres right now) ----

export interface DbProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  user_type: 'member' | 'solver' | 'admin';
  is_seed_account: boolean;
  created_at: string;
}

export interface DbProblem {
  id: string;
  user_id: string;
  title: string;
  overview: string;
  what_they_tried: string | null;
  tags: string[];
  status: 'OPEN' | 'CLAIMED' | 'IN_REVIEW' | 'SOLVED';
  source: 'organic' | 'seeded';
  chosen_solution_id: string | null;
  upvotes_count: number;
  created_at: string;
  // joined data (fetched via Supabase's nested select)
  profiles?: DbProfile;
  solutions?: { count: number }[];
}

export interface DbSolution {
  id: string;
  problem_id: string;
  solver_id: string;
  app_name: string;
  pitch: string;
  solution_type: 'EXISTING' | 'WOULD_BUILD';
  external_link: string | null;
  rating_avg: number;
  review_count: number;
  created_at: string;
  profiles?: DbProfile;
  problems?: { title: string };
}

export interface DbReview {
  id: string;
  solution_id: string;
  reviewer_id: string;
  rating: number;
  feedback: string;
  test_duration_seconds: number;
  created_at: string;
  profiles?: DbProfile;
}

// ---- DB -> Frontend ----

export function profileToUser(p: DbProfile): User {
  return {
    id: p.id,
    email: '', // not exposed via anon key / unused in current UI
    display_name: p.username,
    role: p.user_type,
    is_seed_account: p.is_seed_account ?? false,
    created_at: p.created_at,
    avatar_url: p.avatar_url ?? undefined,
    reputation_score: 0, // not tracked in DB yet; safe default, unused in UI today
  };
}

export function dbProblemToProblem(p: DbProblem): Problem {
  return {
    id: p.id,
    poster_id: p.user_id,
    poster: p.profiles ? profileToUser(p.profiles) : ({} as User),
    title: p.title,
    description: p.overview,
    attempted_solutions: p.what_they_tried ?? '',
    tags: p.tags ?? [],
    status: p.status.toLowerCase() as Problem['status'],
    source: p.source,
    chosen_solution_id: p.chosen_solution_id,
    created_at: p.created_at,
    solution_count: p.solutions?.[0]?.count ?? 0,
    upvotes: p.upvotes_count,
  };
}

export function dbSolutionToSolution(s: DbSolution): Solution {
  return {
    id: s.id,
    problem_id: s.problem_id,
    problem_title: s.problems?.title,
    solver_id: s.solver_id,
    solver: s.profiles ? profileToUser(s.profiles) : ({} as User),
    app_name: s.app_name,
    pitch: s.pitch,
    link: s.external_link ?? undefined,
    is_existing_tool: s.solution_type === 'EXISTING',
    claimed_at: s.created_at,
    submitted_at: s.created_at,
    reviews_count: s.review_count,
    avg_rating: s.rating_avg,
  };
}

export function dbReviewToReview(r: DbReview): Review {
  return {
    id: r.id,
    solution_id: r.solution_id,
    voter_id: r.reviewer_id,
    voter_name: r.profiles?.username ?? 'Anonymous',
    review_text: r.feedback,
    vote_value: r.rating,
    test_duration_seconds: r.test_duration_seconds,
    created_at: r.created_at,
  };
}
