import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StudyPlan {
  id: string;
  examName: string;
  examDate: Date;
  topics: PlanTopic[];
  createdAt: Date;
  status: 'active' | 'completed' | 'archived';
}

export interface PlanTopic {
  name: string;
  daysAllocated: number;
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  completionPercentage: number;
}

const STUDY_PLANS_KEY = 'study_plans';

/**
 * Generate a personalized study plan based on exam date and topics
 */
export function generateStudyPlan(
  examName: string,
  examDate: Date,
  topics: string[],
  currentMasteryLevels: Record<string, number> = {}
): StudyPlan {
  const today = new Date();
  const daysUntilExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExam <= 0) {
    throw new Error('Exam date must be in the future');
  }

  // Prioritize topics based on mastery level
  const prioritizedTopics = topics.map((topic) => {
    const masteryLevel = currentMasteryLevels[topic] || 0;
    let priority: 'high' | 'medium' | 'low';

    if (masteryLevel < 40) {
      priority = 'high';
    } else if (masteryLevel < 70) {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    return {
      name: topic,
      priority,
      masteryLevel,
    };
  });

  // Calculate study distribution
  const highPriorityCount = prioritizedTopics.filter((t) => t.priority === 'high').length;
  const mediumPriorityCount = prioritizedTopics.filter((t) => t.priority === 'medium').length;
  const lowPriorityCount = prioritizedTopics.filter((t) => t.priority === 'low').length;

  // Allocate days: 60% high, 30% medium, 10% low
  const highPriorityDays = Math.ceil(daysUntilExam * 0.6);
  const mediumPriorityDays = Math.ceil(daysUntilExam * 0.3);
  const lowPriorityDays = daysUntilExam - highPriorityDays - mediumPriorityDays;

  const planTopics: PlanTopic[] = prioritizedTopics.map((topic) => {
    let daysAllocated = 0;
    let estimatedHours = 0;

    if (topic.priority === 'high') {
      daysAllocated = Math.ceil(highPriorityDays / highPriorityCount);
      estimatedHours = daysAllocated * 2; // 2 hours per day for high priority
    } else if (topic.priority === 'medium') {
      daysAllocated = Math.ceil(mediumPriorityDays / mediumPriorityCount);
      estimatedHours = daysAllocated * 1.5; // 1.5 hours per day for medium
    } else {
      daysAllocated = Math.ceil(lowPriorityDays / lowPriorityCount);
      estimatedHours = daysAllocated * 1; // 1 hour per day for low
    }

    return {
      name: topic.name,
      daysAllocated,
      priority: topic.priority,
      estimatedHours,
      completionPercentage: 0,
    };
  });

  return {
    id: Date.now().toString(),
    examName,
    examDate,
    topics: planTopics,
    createdAt: today,
    status: 'active',
  };
}

/**
 * Save study plan to local storage
 */
export async function savePlan(plan: StudyPlan): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(STUDY_PLANS_KEY);
    const plans = existing ? JSON.parse(existing) : [];
    plans.push({
      ...plan,
      examDate: plan.examDate.toISOString(),
      createdAt: plan.createdAt.toISOString(),
    });
    await AsyncStorage.setItem(STUDY_PLANS_KEY, JSON.stringify(plans));
  } catch (error) {
    console.error('Error saving plan:', error);
  }
}

/**
 * Get all study plans
 */
export async function getPlans(): Promise<StudyPlan[]> {
  try {
    const stored = await AsyncStorage.getItem(STUDY_PLANS_KEY);
    if (!stored) return [];

    const plans = JSON.parse(stored);
    return plans.map((plan: any) => ({
      ...plan,
      examDate: new Date(plan.examDate),
      createdAt: new Date(plan.createdAt),
    }));
  } catch (error) {
    console.error('Error getting plans:', error);
    return [];
  }
}

/**
 * Calculate daily study recommendation
 */
export function getDailyRecommendation(plan: StudyPlan): PlanTopic | null {

  // Find topic that should be studied today based on schedule
  for (const topic of plan.topics) {
    if (topic.completionPercentage < 100) {
      return topic;
    }
  }

  return null;
}

/**
 * Calculate time remaining until exam
 */
export function getTimeRemaining(examDate: Date): {
  days: number;
  hours: number;
  minutes: number;
} {
  const now = new Date();
  const diff = examDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
  };
}
