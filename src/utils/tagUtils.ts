import { UserTag } from '../types';

export const TAG_COOLDOWN_DAYS = 2;

export interface TagInfo {
  value: Exclude<UserTag, null>;
  label: string;
  description: string;
  badgeClassLight: string;
  badgeClassDark: string;
}

export const USER_TAGS: TagInfo[] = [
  {
    value: 'BUILDER',
    label: 'Builder',
    description: 'You pitch and build solutions for other people\'s problems.',
    badgeClassLight: 'bg-orange-50 text-orange-700 border-orange-200',
    badgeClassDark: 'bg-orange-950/80 text-orange-300 border-orange-800/60',
  },
  {
    value: 'SCOUT',
    label: 'Scout',
    description: 'You test and review other builders\' pitches — a solution finder.',
    badgeClassLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeClassDark: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
  },
  {
    value: 'SURFER',
    label: 'Surfer',
    description: 'Just browsing, commenting, and trying new tools — no commitment.',
    badgeClassLight: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeClassDark: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
  },
];

export function getTagInfo(tag: UserTag): TagInfo | null {
  return USER_TAGS.find((t) => t.value === tag) ?? null;
}

// Returns null if the user can change their tag right now, or the Date
// they'll next be allowed to, if still in the cooldown window.
export function getTagCooldownEnd(tagUpdatedAt: string | null | undefined): Date | null {
  if (!tagUpdatedAt) return null;
  const lastChange = new Date(tagUpdatedAt);
  const cooldownEnd = new Date(lastChange.getTime() + TAG_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
  return cooldownEnd > new Date() ? cooldownEnd : null;
}
