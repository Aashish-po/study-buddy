import AsyncStorage from '@react-native-async-storage/async-storage';

export type BadgeType =
  | 'first_steps'
  | 'quiz_master'
  | 'study_streak_7'
  | 'study_streak_30'
  | 'concept_expert'
  | 'speed_learner'
  | 'perfect_score'
  | 'comeback_kid'
  | 'knowledge_seeker'
  | 'consistency_champion';

export interface Badge {
  id: BadgeType;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number; // 0-100
}

export interface GamificationData {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date | null;
  badges: Badge[];
  totalQuizzesCompleted: number;
  perfectScores: number;
}

const GAMIFICATION_KEY = 'gamification_data';

const BADGE_DEFINITIONS: Record<BadgeType, Omit<Badge, 'unlockedAt' | 'progress'>> = {
  first_steps: {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first study session',
    icon: '👣',
  },
  quiz_master: {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Score 100% on 5 quizzes',
    icon: '🎯',
  },
  study_streak_7: {
    id: 'study_streak_7',
    name: '7-Day Streak',
    description: 'Study for 7 consecutive days',
    icon: '🔥',
  },
  study_streak_30: {
    id: 'study_streak_30',
    name: '30-Day Champion',
    description: 'Study for 30 consecutive days',
    icon: '👑',
  },
  concept_expert: {
    id: 'concept_expert',
    name: 'Concept Expert',
    description: 'Achieve 90%+ mastery on 10 topics',
    icon: '🧠',
  },
  speed_learner: {
    id: 'speed_learner',
    name: 'Speed Learner',
    description: 'Complete 5 quizzes in one day',
    icon: '⚡',
  },
  perfect_score: {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Get 100% on a quiz',
    icon: '💯',
  },
  comeback_kid: {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Improve a weak topic to 80%+ mastery',
    icon: '🚀',
  },
  knowledge_seeker: {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Study 20 different topics',
    icon: '📚',
  },
  consistency_champion: {
    id: 'consistency_champion',
    name: 'Consistency Champion',
    description: 'Maintain a 14-day study streak',
    icon: '⭐',
  },
};

export const DEFAULT_GAMIFICATION: GamificationData = {
  totalXP: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  badges: Object.values(BADGE_DEFINITIONS).map((badge) => ({
    ...badge,
    progress: 0,
  })),
  totalQuizzesCompleted: 0,
  perfectScores: 0,
};

/**
 * Load gamification data from storage
 */
export async function loadGamificationData(): Promise<GamificationData> {
  try {
    const stored = await AsyncStorage.getItem(GAMIFICATION_KEY);
    if (!stored) return DEFAULT_GAMIFICATION;

    const data = JSON.parse(stored);
    return {
      ...data,
      lastStudyDate: data.lastStudyDate ? new Date(data.lastStudyDate) : null,
      badges: data.badges.map((badge: any) => ({
        ...badge,
        unlockedAt: badge.unlockedAt ? new Date(badge.unlockedAt) : undefined,
      })),
    };
  } catch (error) {
    console.error('Error loading gamification data:', error);
    return DEFAULT_GAMIFICATION;
  }
}

/**
 * Save gamification data to storage
 */
export async function saveGamificationData(data: GamificationData): Promise<void> {
  try {
    const toStore = {
      ...data,
      lastStudyDate: data.lastStudyDate?.toISOString(),
      badges: data.badges.map((badge) => ({
        ...badge,
        unlockedAt: badge.unlockedAt?.toISOString(),
      })),
    };
    await AsyncStorage.setItem(GAMIFICATION_KEY, JSON.stringify(toStore));
  } catch (error) {
    console.error('Error saving gamification data:', error);
  }
}

/**
 * Add XP and calculate level
 */
export function addXP(currentXP: number, xpToAdd: number): { totalXP: number; levelUp: boolean; newLevel: number } {
  const totalXP = currentXP + xpToAdd;
  const newLevel = Math.floor(totalXP / 1000) + 1;
  const currentLevel = Math.floor(currentXP / 1000) + 1;
  const levelUp = newLevel > currentLevel;

  return { totalXP, levelUp, newLevel };
}

/**
 * Update study streak
 */
export function updateStreak(lastStudyDate: Date | null): { currentStreak: number; longestStreak: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!lastStudyDate) {
    return { currentStreak: 1, longestStreak: 1 };
  }

  const lastDate = new Date(lastStudyDate);
  lastDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    // Same day, no change
    return { currentStreak: 0, longestStreak: 0 };
  } else if (daysDiff === 1) {
    // Consecutive day, increment streak
    return { currentStreak: 1, longestStreak: 0 };
  } else {
    // Streak broken
    return { currentStreak: 1, longestStreak: 0 };
  }
}

/**
 * Check and unlock badges based on conditions
 */
export function checkBadgeUnlocks(
  data: GamificationData,
  stats: {
    topicsStudied?: number;
    perfectScores?: number;
    quizzesCompleted?: number;
    currentStreak?: number;
    topicsWithHighMastery?: number;
  }
): Badge[] {
  const unlockedBadges: Badge[] = [];

  // First Steps: Complete first study session
  if (stats.quizzesCompleted && stats.quizzesCompleted >= 1) {
    const badge = data.badges.find((b) => b.id === 'first_steps');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = new Date();
      badge.progress = 100;
      unlockedBadges.push(badge);
    }
  }

  // Perfect Score: Get 100% on a quiz
  if (stats.perfectScores && stats.perfectScores >= 1) {
    const badge = data.badges.find((b) => b.id === 'perfect_score');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = new Date();
      badge.progress = 100;
      unlockedBadges.push(badge);
    }
  }

  // Quiz Master: Score 100% on 5 quizzes
  if (stats.perfectScores && stats.perfectScores >= 5) {
    const badge = data.badges.find((b) => b.id === 'quiz_master');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = new Date();
      badge.progress = 100;
      unlockedBadges.push(badge);
    }
  }

  // Study Streak 7
  if (stats.currentStreak && stats.currentStreak >= 7) {
    const badge = data.badges.find((b) => b.id === 'study_streak_7');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = new Date();
      badge.progress = 100;
      unlockedBadges.push(badge);
    }
  }

  // Study Streak 30
  if (stats.currentStreak && stats.currentStreak >= 30) {
    const badge = data.badges.find((b) => b.id === 'study_streak_30');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = new Date();
      badge.progress = 100;
      unlockedBadges.push(badge);
    }
  }

  // Concept Expert: 90%+ mastery on 10 topics
  if (stats.topicsWithHighMastery && stats.topicsWithHighMastery >= 10) {
    const badge = data.badges.find((b) => b.id === 'concept_expert');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = new Date();
      badge.progress = 100;
      unlockedBadges.push(badge);
    }
  }

  // Knowledge Seeker: Study 20 different topics
  if (stats.topicsStudied && stats.topicsStudied >= 20) {
    const badge = data.badges.find((b) => b.id === 'knowledge_seeker');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = new Date();
      badge.progress = 100;
      unlockedBadges.push(badge);
    }
  }

  return unlockedBadges;
}

/**
 * Get badge progress percentage
 */
export function getBadgeProgress(badge: Badge, stats: any): number {
  switch (badge.id) {
    case 'quiz_master':
      return Math.min(100, (stats.perfectScores || 0) * 20);
    case 'study_streak_7':
      return Math.min(100, ((stats.currentStreak || 0) / 7) * 100);
    case 'study_streak_30':
      return Math.min(100, ((stats.currentStreak || 0) / 30) * 100);
    case 'concept_expert':
      return Math.min(100, ((stats.topicsWithHighMastery || 0) / 10) * 100);
    case 'knowledge_seeker':
      return Math.min(100, ((stats.topicsStudied || 0) / 20) * 100);
    default:
      return badge.progress;
  }
}
