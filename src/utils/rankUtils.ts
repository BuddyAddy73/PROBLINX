export interface SolverRankInfo {
  rank: 'Novice' | 'Builder' | 'Pro' | 'Master';
  label: string;
  badgeClassLight: string;
  badgeClassDark: string;
}

export function calculateSolverRank(solutionsCount: number): SolverRankInfo {
  if (solutionsCount >= 4) {
    return {
      rank: 'Master',
      label: 'Master Solver',
      badgeClassLight: 'bg-purple-50 text-purple-700 border-purple-200',
      badgeClassDark: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
    };
  } else if (solutionsCount >= 2) {
    return {
      rank: 'Pro',
      label: 'Pro Solver',
      badgeClassLight: 'bg-blue-50 text-blue-700 border-blue-200',
      badgeClassDark: 'bg-blue-950/80 text-blue-300 border-blue-800/60',
    };
  } else if (solutionsCount === 1) {
    return {
      rank: 'Builder',
      label: 'Builder',
      badgeClassLight: 'bg-orange-50 text-orange-700 border-orange-200',
      badgeClassDark: 'bg-orange-950/80 text-orange-300 border-orange-800/60',
    };
  }
  return {
    rank: 'Novice',
    label: 'Novice Solver',
    badgeClassLight: 'bg-slate-100 text-slate-600 border-slate-200',
    badgeClassDark: 'bg-slate-800/80 text-slate-300 border-slate-700',
  };
}
