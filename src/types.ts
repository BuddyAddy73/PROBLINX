export type UserRole = 'member' | 'solver' | 'admin';
export type UserTag = 'BUILDER' | 'SCOUT' | 'SURFER' | null;

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  is_seed_account: boolean;
  created_at: string;
  avatar_url?: string;
  reputation_score?: number;
  user_tag?: UserTag;
  tag_updated_at?: string | null;
}

export type ProblemStatus = 'open' | 'claimed' | 'in_review' | 'solved';
export type ProblemSource = 'organic' | 'seeded';

export interface Problem {
  id: string;
  poster_id: string;
  poster: User;
  title: string;
  description: string;
  attempted_solutions: string;
  tags: string[];
  status: ProblemStatus;
  source: ProblemSource;
  chosen_solution_id?: string | null;
  created_at: string;
  solution_count?: number;
  upvotes?: number;
}

export interface Solution {
  id: string;
  problem_id: string;
  problem_title?: string;
  solver_id: string;
  solver: User;
  app_name: string;
  pitch: string; // Max 300 chars
  link?: string; // External URL or live app — EXISTING_TOOL only
  is_existing_tool: boolean; // true = existing tool, false = "would build"
  estimated_timeline?: string; // WOULD_BUILD only
  contact_note?: string; // WOULD_BUILD only, solver-controlled optional contact hint
  claimed_at: string;
  submitted_at: string;
  reviews_count: number;
  avg_rating: number;
}

export interface Review {
  id: string;
  solution_id: string;
  voter_id: string;
  voter_name: string;
  review_text: string;
  vote_value: number; // 1-5 stars
  test_duration_seconds: number;
  created_at: string;
}

export type ActiveFeedStream = 'problems' | 'battleground';
