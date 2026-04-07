import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StudyTopic {
  id: string;
  name: string;
  masteryLevel: number; // 0-100
  lastStudied: Date;
  totalTimeSpent: number; // in minutes
  sessionCount: number;
}

export interface UserProgress {
  totalTopicsStudied: number;
  averageMastery: number;
  studyStreak: number;
  totalTimeSpent: number;
  topics: StudyTopic[];
}

const STORAGE_KEY = 'study_progress';
const DEFAULT_PROGRESS: UserProgress = {
  totalTopicsStudied: 0,
  averageMastery: 0,
  studyStreak: 0,
  totalTimeSpent: 0,
  topics: [],
};

export function useStudyData() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);

  // Load progress from storage on mount
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsed.topics = parsed.topics.map((topic: any) => ({
          ...topic,
          lastStudied: new Date(topic.lastStudied),
        }));
        setProgress(parsed);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = useCallback(async (newProgress: UserProgress) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, []);

  const updateTopicProgress = useCallback(
    async (topicName: string, masteryLevel: number, timeSpent: number = 0) => {
      const updatedProgress = { ...progress };
      const topicIndex = updatedProgress.topics.findIndex(
        (t) => t.name.toLowerCase() === topicName.toLowerCase()
      );

      if (topicIndex >= 0) {
        // Update existing topic
        const topic = updatedProgress.topics[topicIndex];
        topic.masteryLevel = Math.max(topic.masteryLevel, masteryLevel);
        topic.lastStudied = new Date();
        topic.totalTimeSpent += timeSpent;
        topic.sessionCount += 1;
      } else {
        // Add new topic
        updatedProgress.topics.push({
          id: Date.now().toString(),
          name: topicName,
          masteryLevel,
          lastStudied: new Date(),
          totalTimeSpent: timeSpent,
          sessionCount: 1,
        });
        updatedProgress.totalTopicsStudied += 1;
      }

      // Recalculate average mastery
      if (updatedProgress.topics.length > 0) {
        updatedProgress.averageMastery =
          updatedProgress.topics.reduce((sum, t) => sum + t.masteryLevel, 0) /
          updatedProgress.topics.length;
      }

      updatedProgress.totalTimeSpent += timeSpent;

      await saveProgress(updatedProgress);
    },
    [progress, saveProgress]
  );

  const getWeakAreas = useCallback(() => {
    return progress.topics
      .filter((t) => t.masteryLevel < 70)
      .sort((a, b) => a.masteryLevel - b.masteryLevel);
  }, [progress]);

  const getStrongAreas = useCallback(() => {
    return progress.topics
      .filter((t) => t.masteryLevel >= 80)
      .sort((a, b) => b.masteryLevel - a.masteryLevel);
  }, [progress]);

  const resetProgress = useCallback(async () => {
    await saveProgress(DEFAULT_PROGRESS);
  }, [saveProgress]);

  return {
    progress,
    loading,
    updateTopicProgress,
    getWeakAreas,
    getStrongAreas,
    resetProgress,
  };
}
