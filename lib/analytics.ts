import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LearningMetric {
  date: Date;
  topicsStudied: number;
  timeSpent: number; // in minutes
  quizzesCompleted: number;
  averageScore: number;
  sessionsCount: number;
}

export interface TopicAnalytics {
  name: string;
  masteryLevel: number;
  timeSpent: number; // in minutes
  sessionsCount: number;
  quizzesAttempted: number;
  averageQuizScore: number;
  lastStudied: Date;
  improvementRate: number; // percentage points per week
}

export interface LearningInsights {
  learningVelocity: number; // topics mastered per week
  estimatedTimeToMastery: Record<string, number>; // topic -> days
  strongTopics: string[];
  weakTopics: string[];
  optimalStudyTime: string; // time of day when user performs best
  recommendedFocusArea: string;
  predictedExamReadiness: number; // 0-100
}

const ANALYTICS_KEY = 'learning_analytics';

/**
 * Record a learning session
 */
export async function recordSession(
  topic: string,
  timeSpent: number,
  quizScore: number,
  masteryLevel: number
): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(ANALYTICS_KEY);
    const analytics = stored ? JSON.parse(stored) : [];

    analytics.push({
      topic,
      timeSpent,
      quizScore,
      masteryLevel,
      timestamp: new Date().toISOString(),
    });

    await AsyncStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  } catch (error) {
    console.error('Error recording session:', error);
  }
}

/**
 * Calculate learning velocity (topics mastered per week)
 */
export function calculateLearningVelocity(topicAnalytics: TopicAnalytics[]): number {
  const masterTopics = topicAnalytics.filter((t) => t.masteryLevel >= 80);
  const weeksSinceStart = 1; // Simplified; in production, calculate from first session

  return masterTopics.length / Math.max(weeksSinceStart, 1);
}

/**
 * Estimate time to mastery for a topic
 */
export function estimateTimeToMastery(
  currentMastery: number,
  averageImprovementRate: number,
  targetMastery: number = 80
): number {
  if (currentMastery >= targetMastery) return 0;

  const remainingPoints = targetMastery - currentMastery;
  const daysNeeded = Math.ceil(remainingPoints / Math.max(averageImprovementRate, 0.1));

  return Math.max(daysNeeded, 1);
}

/**
 * Calculate improvement rate for a topic
 */
export function calculateImprovementRate(
  sessions: { masteryLevel: number; date: Date }[]
): number {
  if (sessions.length < 2) return 0;

  const sortedSessions = sessions.sort((a, b) => a.date.getTime() - b.date.getTime());
  const firstSession = sortedSessions[0];
  const lastSession = sortedSessions[sortedSessions.length - 1];

  const masteryImprovement = lastSession.masteryLevel - firstSession.masteryLevel;
  const daysElapsed = Math.ceil(
    (lastSession.date.getTime() - firstSession.date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysElapsed === 0) return 0;

  // Return improvement per week
  return (masteryImprovement / daysElapsed) * 7;
}

/**
 * Generate comprehensive learning insights
 */
export function generateLearningInsights(
  topicAnalytics: TopicAnalytics[],
  examDate?: Date
): LearningInsights {
  const strongTopics = topicAnalytics
    .filter((t) => t.masteryLevel >= 80)
    .map((t) => t.name)
    .slice(0, 5);

  const weakTopics = topicAnalytics
    .filter((t) => t.masteryLevel < 60)
    .map((t) => t.name)
    .slice(0, 5);

  const learningVelocity = calculateLearningVelocity(topicAnalytics);

  const estimatedTimeToMasteryMap: Record<string, number> = {};
  topicAnalytics.forEach((topic) => {
    estimatedTimeToMasteryMap[topic.name] = estimateTimeToMastery(
      topic.masteryLevel,
      topic.improvementRate
    );
  });

  // Predict exam readiness
  const averageMastery = topicAnalytics.reduce((sum, t) => sum + t.masteryLevel, 0) / topicAnalytics.length;
  let predictedExamReadiness = averageMastery;

  if (examDate) {
    const daysUntilExam = Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const potentialImprovement = learningVelocity * (daysUntilExam / 7) * 10; // Rough estimate
    predictedExamReadiness = Math.min(100, averageMastery + potentialImprovement);
  }

  return {
    learningVelocity,
    estimatedTimeToMastery: estimatedTimeToMasteryMap,
    strongTopics,
    weakTopics,
    optimalStudyTime: '10:00 AM', // Placeholder; calculate from session data
    recommendedFocusArea: weakTopics[0] || 'General Review',
    predictedExamReadiness: Math.round(predictedExamReadiness),
  };
}

/**
 * Get daily learning metrics
 */
export async function getDailyMetrics(daysBack: number = 30): Promise<LearningMetric[]> {
  try {
    const stored = await AsyncStorage.getItem(ANALYTICS_KEY);
    if (!stored) return [];

    const sessions = JSON.parse(stored);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const dailyMetrics: Record<string, LearningMetric> = {};

    sessions.forEach((session: any) => {
      const sessionDate = new Date(session.timestamp);
      if (sessionDate < cutoffDate) return;

      const dateKey = sessionDate.toISOString().split('T')[0];

      if (!dailyMetrics[dateKey]) {
        dailyMetrics[dateKey] = {
          date: sessionDate,
          topicsStudied: 0,
          timeSpent: 0,
          quizzesCompleted: 0,
          averageScore: 0,
          sessionsCount: 0,
        };
      }

      const metric = dailyMetrics[dateKey];
      metric.topicsStudied += 1;
      metric.timeSpent += session.timeSpent || 0;
      metric.quizzesCompleted += 1;
      metric.averageScore = (metric.averageScore + (session.quizScore || 0)) / 2;
      metric.sessionsCount += 1;
    });

    return Object.values(dailyMetrics).sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (error) {
    console.error('Error getting daily metrics:', error);
    return [];
  }
}

/**
 * Calculate performance trends
 */
export function calculatePerformanceTrend(metrics: LearningMetric[]): 'improving' | 'stable' | 'declining' {
  if (metrics.length < 2) return 'stable';

  const recentMetrics = metrics.slice(-7); // Last week
  const previousMetrics = metrics.slice(-14, -7); // Previous week

  if (previousMetrics.length === 0) return 'stable';

  const recentAvg = recentMetrics.reduce((sum, m) => sum + m.averageScore, 0) / recentMetrics.length;
  const previousAvg = previousMetrics.reduce((sum, m) => sum + m.averageScore, 0) / previousMetrics.length;

  const improvement = recentAvg - previousAvg;

  if (improvement > 5) return 'improving';
  if (improvement < -5) return 'declining';
  return 'stable';
}

/**
 * Generate personalized recommendations
 */
export function generateRecommendations(insights: LearningInsights, metrics: LearningMetric[]): string[] {
  const recommendations: string[] = [];

  // Weak area recommendation
  if (insights.weakTopics.length > 0) {
    recommendations.push(`Focus on ${insights.weakTopics[0]} - it needs more practice.`);
  }

  // Study time recommendation
  if (metrics.length > 0) {
    const avgTimePerSession = metrics.reduce((sum, m) => sum + m.timeSpent, 0) / metrics.length;
    if (avgTimePerSession < 30) {
      recommendations.push('Try to study for at least 30 minutes per session for better retention.');
    }
  }

  // Exam readiness
  if (insights.predictedExamReadiness < 70) {
    recommendations.push('Increase study frequency to improve exam readiness.');
  }

  // Strong area
  if (insights.strongTopics.length > 0) {
    recommendations.push(`Great work on ${insights.strongTopics[0]}! Keep maintaining that level.`);
  }

  return recommendations;
}
